import { useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useService, useTopic } from "../../ros/hooks";
import { SERVICES, TOPICS, TOPIC_TYPES } from "../../ros/interfaces";
import { logOps } from "../../ros/opsLog";

// urc_msgs/msg/AstronautCommand
const COMMAND_NAMES: Record<number, string> = {
  1: "FOLLOW",
  2: "STAY",
  3: "FETCH",
  4: "COME",
  5: "GIVE",
  6: "ABORT",
  7: "RESUME",
};
const SOURCE_NAMES: Record<number, string> = { 1: "GESTURE", 2: "REMOTE", 3: "OPERATOR" };

interface AstronautCommand {
  stamp: { sec: number; nanosec: number };
  command: number;
  source: number;
}

export const CommandsPanel = () => {
  const abort = useService(SERVICES.abortMission, "std_srvs/srv/Trigger");
  const resume = useService(SERVICES.resumeMission, "std_srvs/srv/Trigger");
  const [note, setNote] = useState<string | null>(null);

  const lastCmd = useTopic<AstronautCommand>(TOPICS.command, TOPIC_TYPES.command, {
    staleAfterMs: 4000,
  });

  const call = useCallback(
    async (svc: typeof abort, label: string) => {
      setNote(null);
      try {
        const res = await svc({});
        const text = `${label}: ${res.success ? "ok" : "rejected"}${res.message ? ` — ${res.message}` : ""}`;
        setNote(text);
        logOps("cmd", text);
      } catch (e) {
        setNote(`${label} failed: ${e}`);
        logOps("cmd", `${label} failed: ${e}`);
      }
    },
    [],
  );

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={<Typography variant="subtitle1" align="center" sx={{ fontSize: "1rem", fontWeight: 500 }}>Mission Commands</Typography>}
        sx={{ backgroundColor: "grey.700", padding: "4px" }}
      />
      <CardContent sx={{ flex: 1, p: 1.5 }}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained" color="warning" onClick={() => call(abort, "ABORT")}
              sx={{ flex: 1, textTransform: "none" }}
            >
              Abort (teleop)
            </Button>
            <Button
              variant="contained" color="success" onClick={() => call(resume, "RESUME")}
              sx={{ flex: 1, textTransform: "none" }}
            >
              Resume
            </Button>
          </Stack>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Last command
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                variant={lastCmd.stale ? "outlined" : "filled"}
                color={lastCmd.stale ? "default" : "primary"}
                label={lastCmd.msg ? COMMAND_NAMES[lastCmd.msg.command] ?? `cmd ${lastCmd.msg.command}` : "none"}
              />
              {lastCmd.msg && (
                <Typography variant="caption" color="text.secondary">
                  {SOURCE_NAMES[lastCmd.msg.source] ?? `src ${lastCmd.msg.source}`}
                  {lastCmd.stamp ? ` · ${(lastCmd.ageMs / 1000).toFixed(1)}s ago` : ""}
                  {lastCmd.stale ? " (stale)" : ""}
                </Typography>
              )}
            </Stack>
          </Box>

          {note && (
            <Typography variant="caption" color="text.secondary">{note}</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
