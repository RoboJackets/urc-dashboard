import React, { useState } from "react";
import {
  TextField,
  IconButton,
  Button,
  Box,
  Grid,
  Card,
  Typography,
  CardHeader,
  CardContent,
  Tooltip,
} from "@mui/material";
import { Delete, Add, ArrowUpward, ArrowDownward, Send, Flag, Explore } from "@mui/icons-material";
import ROSLIB from "roslib";
import { useRos } from "./ros/RosContext";
import { useService } from "./ros/hooks";
import { SERVICES, TOPICS, TOPIC_TYPES } from "./ros/interfaces";
import { parseCoord } from "./lib/gnss";
import { distanceBearing, formatDistanceBearing } from "./lib/geo";
import { setGoalDraft } from "./ros/goalDraft";
import { logOps } from "./ros/opsLog";
import { hasFix, useRoverFix } from "./ros/roverFix";

interface Waypoint {
  id: number;
  latitude: string;
  longitude: string;
}

export const WaypointsManager: React.FC = () => {
  const { ros } = useRos();
  const fromLL = useService(SERVICES.fromLL, "robot_localization/srv/FromLL");
  const roverFix = useRoverFix();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 1, latitude: "", longitude: "" },
  ]);

  const isComplete = (w: Waypoint) =>
    parseCoord(w.latitude, true) !== null && parseCoord(w.longitude, false) !== null;

  const addWaypoint = (): void => {
    const last = waypoints[waypoints.length - 1];
    if (!isComplete(last)) return;
    setWaypoints([...waypoints, { id: Date.now(), latitude: "", longitude: "" }]);
  };

  const removeWaypoint = (id: number): void => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  const handleInputChange = (id: number, field: keyof Waypoint, value: string): void => {
    setWaypoints(waypoints.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const moveWaypoint = (index: number, direction: number): void => {
    const next = [...waypoints];
    const [moved] = next.splice(index, 1);
    next.splice(index + direction, 0, moved);
    setWaypoints(next);
  };

  const sendStandalone = (w: Waypoint): void => {
    if (!ros || !isComplete(w)) return;
    const lat = parseCoord(w.latitude, true)!.value;
    const lng = parseCoord(w.longitude, false)!.value;
    const t = new ROSLIB.Topic({ ros, name: TOPICS.gpsWaypoint, messageType: TOPIC_TYPES.gpsWaypoint });
    t.advertise();
    t.publish(new ROSLIB.Message({ latitude: lat, longitude: lng }));
    logOps("nav", `/waypoint sent @ ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setTimeout(() => t.unadvertise(), 500);
  };

  const sendAsMissionGoal = (w: Waypoint): void => {
    if (!isComplete(w)) return;
    setGoalDraft(`${w.latitude}, ${w.longitude}`);
    logOps("nav", `waypoint handed to Mission Control`);
  };

  const sendMapFrame = async (w: Waypoint): Promise<void> => {
    if (!ros || !isComplete(w)) return;
    const lat = parseCoord(w.latitude, true)!.value;
    const lng = parseCoord(w.longitude, false)!.value;
    const res = await fromLL({ ll_point: { latitude: lat, longitude: lng, altitude: 0.0 } });
    const t = new ROSLIB.Topic({ ros, name: TOPICS.mapWaypoint, messageType: TOPIC_TYPES.mapWaypoint });
    t.advertise();
    t.publish(new ROSLIB.Message({
      header: { frame_id: "map", stamp: { sec: 0, nanosec: 0 } },
      pose: {
        position: { x: res.map_point.x, y: res.map_point.y, z: res.map_point.z },
        orientation: { x: 0, y: 0, z: 0, w: 1 },
      },
    }));
    logOps("nav", `/nav/waypoint sent @ ${lat.toFixed(6)}, ${lng.toFixed(6)} (map ${res.map_point.x.toFixed(1)}, ${res.map_point.y.toFixed(1)})`);
    setTimeout(() => t.unadvertise(), 500);
  };

  const latErr = (w: Waypoint) => w.latitude !== "" && parseCoord(w.latitude, true) === null;
  const lngErr = (w: Waypoint) => w.longitude !== "" && parseCoord(w.longitude, false) === null;

  const rangeFromRover = (w: Waypoint): string | null => {
    if (!isComplete(w) || !hasFix(roverFix.msg)) return null;
    const range = distanceBearing(
      roverFix.msg.latitude,
      roverFix.msg.longitude,
      parseCoord(w.latitude, true)!.value,
      parseCoord(w.longitude, false)!.value,
    );
    return `${formatDistanceBearing(range)} from rover${roverFix.stale ? " (GPS stale)" : ""}`;
  };

  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontSize: "1rem", fontWeight: 500 }}>
            Waypoints Manager
          </Typography>
        }
        sx={{ backgroundColor: "grey.700", padding: "4px" }}
      />
      <CardContent sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ p: 1, bgcolor: "background.paper" }}>
          {waypoints.map((waypoint, index) => {
            const range = rangeFromRover(waypoint);
            return (
              <Grid container spacing={1} key={waypoint.id} alignItems="center" sx={{ mb: 1 }}>
                <Grid item xs={3.5}>
                  <TextField
                    label="Latitude" variant="outlined" fullWidth size="small"
                    value={waypoint.latitude}
                    error={latErr(waypoint)}
                    onChange={(e) => handleInputChange(waypoint.id, "latitude", e.target.value)}
                  />
                </Grid>
                <Grid item xs={3.5}>
                  <TextField
                    label="Longitude" variant="outlined" fullWidth size="small"
                    value={waypoint.longitude}
                    error={lngErr(waypoint)}
                    onChange={(e) => handleInputChange(waypoint.id, "longitude", e.target.value)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Tooltip title="Send as standalone GPS waypoint (/waypoint)">
                    <span>
                      <IconButton disabled={!isComplete(waypoint)} onClick={() => sendStandalone(waypoint)}>
                        <Send />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Use as mission goal">
                    <span>
                      <IconButton disabled={!isComplete(waypoint)} onClick={() => sendAsMissionGoal(waypoint)}>
                        <Flag />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Send as map-frame nav waypoint (/nav/waypoint)">
                    <span>
                      <IconButton disabled={!isComplete(waypoint)} onClick={() => sendMapFrame(waypoint)}>
                        <Explore />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <IconButton disabled={index === 0} onClick={() => moveWaypoint(index, -1)}>
                    <ArrowUpward />
                  </IconButton>
                  <IconButton disabled={index === waypoints.length - 1} onClick={() => moveWaypoint(index, 1)}>
                    <ArrowDownward />
                  </IconButton>
                  <IconButton onClick={() => removeWaypoint(waypoint.id)}>
                    <Delete />
                  </IconButton>
                </Grid>
                {range && (
                  <Grid item xs={12} sx={{ pt: "0 !important" }}>
                    <Typography variant="caption" color="text.secondary">
                      {range}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            );
          })}
          <Button
            variant="contained" startIcon={<Add />} onClick={addWaypoint}
            sx={{ mt: 1, bgcolor: "#B3A300", "&:hover": { backgroundColor: "yellow" }, textTransform: "none" }}
          >
            Add Waypoint
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
