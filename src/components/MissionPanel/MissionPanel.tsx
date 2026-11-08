import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAction, useParam, useService, useTopic } from "../../ros/hooks";
import {
  ACTIONS,
  ACTION_TYPES,
  NAV_COORDINATOR_NODE,
  NAV_COORDINATOR_PARAMS,
  SERVICES,
  TOPICS,
  TOPIC_TYPES,
} from "../../ros/interfaces";
import { parseLatLng } from "../../lib/gnss";
import { distanceBearing, formatDistanceBearing } from "../../lib/geo";
import { hasFix, useRoverFix } from "../../ros/roverFix";
import { logOps } from "../../ros/opsLog";
import { useGoalDraft, clearGoalDraft } from "../../ros/goalDraft";
import { setArucoPin } from "../../ros/arucoPin";
import { setActiveGoal } from "../../ros/activeGoal";

type MissionKind = "route" | "astronaut";

const ERRORS: Record<number, { label: string; color: "success" | "error" | "warning" | "info" }> = {
  0: { label: "SUCCESS", color: "success" },
  1: { label: "NAVIGATION_FAILED", color: "error" },
  2: { label: "TARGET_LOST", color: "error" },
  3: { label: "TOOL_FAILED", color: "error" },
  4: { label: "CANCELED", color: "warning" },
  5: { label: "TIMEOUT", color: "error" },
};

interface Feedback {
  state: string;
  distance: number | null;
  extra: string;
}

const knownDistance = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

export const MissionPanel = () => {
  const [kind, setKind] = useState<MissionKind>("route");
  const [goalInput, setGoalInput] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [result, setResult] = useState<{ code: number; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const fromLL = useService(SERVICES.fromLL, "robot_localization/srv/FromLL");
  const toLL = useService(SERVICES.toLL, "robot_localization/srv/ToLL");
  const coordState = useTopic<{ data: string }>(TOPICS.coordinatorState, TOPIC_TYPES.coordinatorState);
  const cmdVel = useTopic<{ linear: { x: number }; angular: { z: number } }>(
    TOPICS.cmdVel, TOPIC_TYPES.cmdVel, { staleAfterMs: 1500 },
  );
  // Rule 1.e.iii: programming (incl. goal entry) is only allowed while stopped.
  const roverMoving =
    !cmdVel.stale &&
    cmdVel.msg != null &&
    Math.abs(cmdVel.msg.linear.x) + Math.abs(cmdVel.msg.angular.z) > 0.02;
  const draft = useGoalDraft();
  const roverFix = useRoverFix();
  // URC arrival thresholds (rules 1.e): route targets 1 m, astronaut tasks 3 m.
  const { routeArrivalRadius, astronautArrivalRadius } = NAV_COORDINATOR_PARAMS;
  const routeRadius = useParam(NAV_COORDINATOR_NODE, routeArrivalRadius.name, routeArrivalRadius.fallback);
  const astronautRadius = useParam(NAV_COORDINATOR_NODE, astronautArrivalRadius.name, astronautArrivalRadius.fallback);
  const radius = kind === "route" ? routeRadius : astronautRadius;

  useEffect(() => {
    if (draft) {
      setGoalInput(draft);
      clearGoalDraft();
    }
  }, [draft]);

  const action = kind === "route" ? ACTIONS.executeAutonomousMission : ACTIONS.executeAstronautMission;
  const actionType = kind === "route" ? ACTION_TYPES.executeAutonomousMission : ACTION_TYPES.executeAstronautMission;

  const { sendGoal, cancelGoal, goalId } = useAction(action, actionType, {
    onFeedback: (v) => {
      setFeedback({
        state: v.state ?? "?",
        distance: knownDistance(kind === "route" ? v.distance_to_goal : v.distance_to_astronaut),
        extra: kind === "route" ? `replans: ${v.replan_count ?? 0}` : v.tool_placeholder_enabled ? "simulated tools" : "",
      });
    },
    onResult: (r) => {
      const code = r.values?.error_code ?? -1;
      const message = r.values?.message ?? (r.result ? "" : String(r.values));
      setResult({ code, message });
      setBusy(false);
      setActiveGoal(null);
      logOps("mission", `${action} → ${ERRORS[code]?.label ?? `code ${code}`}${message ? `: ${message}` : ""}`);
      // Route missions return a refined ArUco pose on success — pin it on the map.
      if (r.values?.has_aruco_pose && r.values?.aruco_pose?.pose?.position) {
        const p = r.values.aruco_pose.pose.position;
        toLL({ map_point: { x: p.x, y: p.y, z: p.z ?? 0 } })
          .then((res) => {
            if (res?.ll_point) {
              setArucoPin({ id: "M", lat: res.ll_point.latitude, lng: res.ll_point.longitude });
              logOps("mission", `ArUco refined pose pinned @ ${res.ll_point.latitude.toFixed(6)}, ${res.ll_point.longitude.toFixed(6)}`);
            }
          })
          .catch(() => {});
      }
    },
    onLost: () => {
      setBusy(false);
      logOps("mission", "goal lost (connection dropped)");
    },
  });

  const send = useCallback(async () => {
    const parsed = parseLatLng(goalInput);
    if (!parsed) {
      setInputError("Unrecognized coordinates — try DD, DDM, or DMS");
      return;
    }
    setInputError(null);
    setResult(null);
    setFeedback(null);
    setBusy(true);
    try {
      const res = await fromLL({ ll_point: { latitude: parsed.lat, longitude: parsed.lng, altitude: 0.0 } });
      sendGoal({
        waypoint: {
          header: { frame_id: "map", stamp: { sec: 0, nanosec: 0 } },
          pose: {
            position: { x: res.map_point.x, y: res.map_point.y, z: res.map_point.z },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
        },
      });
      setActiveGoal({ lat: parsed.lat, lng: parsed.lng, radius });
      logOps("mission", `${action} goal sent @ ${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)} (map ${res.map_point.x.toFixed(1)}, ${res.map_point.y.toFixed(1)})`);
    } catch (e) {
      setBusy(false);
      setResult({ code: -1, message: `fromLL failed: ${e}` });
    }
  }, [goalInput, fromLL, sendGoal, action, radius]);

  const within = feedback?.distance != null && feedback.distance <= radius;
  const parsedGoal = parseLatLng(goalInput);
  const goalRange =
    parsedGoal && hasFix(roverFix.msg)
      ? `${formatDistanceBearing(
          distanceBearing(roverFix.msg.latitude, roverFix.msg.longitude, parsedGoal.lat, parsedGoal.lng),
        )} from rover${roverFix.stale ? " (GPS stale)" : ""}`
      : null;
  const err = result ? ERRORS[result.code] : null;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={<Typography variant="subtitle1" align="center" sx={{ fontSize: "1rem", fontWeight: 500 }}>Mission Control</Typography>}
        sx={{ backgroundColor: "grey.700", padding: "4px" }}
      />
      <CardContent sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
        <Stack spacing={1}>
          <TextField
            select size="small" label="Mission" value={kind}
            onChange={(e) => setKind(e.target.value as MissionKind)}
            disabled={busy}
          >
            <MenuItem value="route">Route (Autonomous)</MenuItem>
            <MenuItem value="astronaut">Astronaut</MenuItem>
          </TextField>

          <TextField
            size="small" label="GNSS target (DD / DDM / DMS)"
            placeholder="38.411, -110.786"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            error={!!inputError} helperText={inputError ?? (roverMoving ? "edits locked while rover is moving" : goalRange ?? undefined)}
            disabled={busy || roverMoving}
          />

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={send} disabled={busy || roverMoving || !goalInput.trim()} sx={{ flex: 1, textTransform: "none" }}>
              Send Goal
            </Button>
            <Button variant="outlined" color="error" onClick={cancelGoal} disabled={!goalId} sx={{ flex: 1, textTransform: "none" }}>
              Cancel
            </Button>
          </Stack>

          {feedback && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip size="small" label={feedback.state} color={feedback.state === "PAUSED" ? "warning" : "primary"} />
                <Typography variant="body2" color={within ? "success.main" : "text.secondary"}>
                  {feedback.distance == null
                    ? `distance unknown (arrival ${radius} m)`
                    : `${feedback.distance.toFixed(1)} m ${within ? `— within ${radius} m` : `of ${radius} m`}`}
                </Typography>
              </Stack>
              {feedback.extra && <Typography variant="caption" color="text.secondary">{feedback.extra}</Typography>}
            </Box>
          )}

          {result && (
            <Chip
              size="small"
              color={err?.color ?? "default"}
              label={err ? `${err.label}${result.message ? `: ${result.message}` : ""}` : result.message}
            />
          )}

          <Typography variant="caption" color="text.secondary">
            FSM: {coordState.msg?.data ?? "—"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
