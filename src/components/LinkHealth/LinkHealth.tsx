import { useEffect, useState } from "react";
import { Chip, Tooltip } from "@mui/material";
import { useRos } from "../../ros/RosContext";

// Age of the newest websocket frame from rosbridge. Telemetry (IMU, cmd_vel,
// GPS) arrives several times a second, so silence means the radio link is
// degrading even while the TCP socket still looks open.
const HEALTHY_MS = 1000;
const DEGRADED_MS = 3000;
const POLL_MS = 250;

export const LinkHealth = () => {
  const { connectionState, lastMsgAge } = useRos();
  const [ageMs, setAgeMs] = useState(-1);

  useEffect(() => {
    const t = setInterval(() => setAgeMs(lastMsgAge()), POLL_MS);
    return () => clearInterval(t);
  }, [lastMsgAge]);

  const connected = connectionState === "connected";
  const color = !connected || ageMs < 0 || ageMs >= DEGRADED_MS ? "error" : ageMs >= HEALTHY_MS ? "warning" : "success";
  const label = !connected
    ? `link: ${connectionState}`
    : ageMs < 0
      ? "link: no data"
      : `link ${(ageMs / 1000).toFixed(1)}s`;

  return (
    <Tooltip title={`Time since the last message from rosbridge (amber ≥ ${HEALTHY_MS / 1000}s, red ≥ ${DEGRADED_MS / 1000}s)`}>
      <Chip size="small" color={color} label={label} sx={{ fontFamily: "monospace", minWidth: 96 }} />
    </Tooltip>
  );
};
