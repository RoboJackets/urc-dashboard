import { useEffect, useState } from "react";
import ROSLIB from "roslib";
import { Chip, Stack } from "@mui/material";
import { useTopic } from "../../ros/hooks";
import { TOPICS, TOPIC_TYPES } from "../../ros/interfaces";

interface StatusesProps {
  ROS: ROSLIB.Ros;
  isDark: boolean;
}

export enum StatusColors {
  RED = "error",
  GREEN = "success",
}

interface StrMsg {
  data: string;
}
interface StatusLight {
  color: number; // 0 BLUE, 1 GREEN, 2 RED
  state: number; // 0 OFF, 1 ON, 2 BLINK
}

const MODE_COLORS: Record<string, "success" | "warning" | "error" | "default"> = {
  autonomous: "success",
  teleop: "warning",
  disabled: "error",
};
const LIGHT_COLORS = ["#2196f3", "#4caf50", "#f44336"]; // BLUE GREEN RED

export const Statuses = (props: StatusesProps) => {
  // Panels mount after connect, so seed from the socket's live state rather
  // than waiting for a 'connection' event that already fired.
  const [bridgeStatus, setBridgeStatus] = useState<StatusColors>(
    (props.ROS as any).isConnected ? StatusColors.GREEN : StatusColors.RED,
  );

  // Freshness = arrival-wall-clock age (handles sim-time + zero stamps).
  const hb = useTopic(TOPICS.heartbeat, TOPIC_TYPES.heartbeat, { staleAfterMs: 2500 });
  const joy = useTopic(TOPICS.driverJoy, TOPIC_TYPES.driverJoy, { staleAfterMs: 2500 });
  const driveMode = useTopic<StrMsg>(TOPICS.driveMode, TOPIC_TYPES.driveMode, { staleAfterMs: 4000 });
  const light = useTopic<StatusLight>(TOPICS.statusLight, TOPIC_TYPES.statusLight, { staleAfterMs: 4000 });

  useEffect(() => {
    const onConn = () => setBridgeStatus(StatusColors.GREEN);
    const onClose = () => setBridgeStatus(StatusColors.RED);
    props.ROS.on("connection", onConn);
    props.ROS.on("close", onClose);
    return () => {
      props.ROS.off("connection", onConn);
      props.ROS.off("close", onClose);
    };
  }, [props.ROS]);

  const robotStatus = hb.stale ? StatusColors.RED : StatusColors.GREEN;
  const controllerStatus = joy.stale ? StatusColors.RED : StatusColors.GREEN;
  const mode = driveMode.msg?.data;
  const lightHex = light.msg ? LIGHT_COLORS[light.msg.color] ?? "#999" : "#555";
  const blink = light.msg?.state === 2;

  return (
    <Stack spacing={1} sx={{ alignItems: "center" }}>
      <Stack direction="row" spacing={1}>
        <Chip label="Rosbridge" color={bridgeStatus} />
        <Chip label="Robot" color={robotStatus} />
        <Chip label="Controller" color={controllerStatus} />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          size="small"
          label={mode ? `mode: ${mode}` : "mode: —"}
          color={mode ? MODE_COLORS[mode] ?? "default" : "default"}
          variant={driveMode.stale ? "outlined" : "filled"}
        />
        <Chip
          size="small"
          label="light"
          variant="outlined"
          icon={
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: lightHex,
                opacity: blink ? undefined : light.msg?.state === 0 ? 0.3 : 1,
                animation: blink ? "blink 1s step-start infinite" : undefined,
              }}
            />
          }
        />
      </Stack>
    </Stack>
  );
};
