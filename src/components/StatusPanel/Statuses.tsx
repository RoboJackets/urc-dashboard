import { useState } from "react";
import ROSLIB from "roslib";
import { HeartbeatSubscriber } from "./HeartbeatSubscriber";
import { ControllerSubscriber } from "./ControllerSubscriber";
import { Chip, Stack }  from '@mui/material';

interface StatusesProps {
  ROS: ROSLIB.Ros;
  isDark: boolean;
}

export enum StatusColors {
  RED = "error",
  GREEN = "success",
}

export const Statuses = (props: StatusesProps) => {
  const [bridgeStatus, setBridgeStatus] = useState<StatusColors>(StatusColors.RED);
  const [robotStatus, setRobotStatus] = useState<StatusColors>(StatusColors.RED);
  const [controllerStatus, setControllerStatus] = useState<StatusColors>(StatusColors.RED);

  // Rosbridge Status
  props.ROS.on("connection", () => setBridgeStatus(StatusColors.GREEN));
  props.ROS.on("error", (e) => {
    console.error("WebSocket connection error:", e);
  });
  props.ROS.on("close", () => setBridgeStatus(StatusColors.RED));

  // shows the rosbridge chip (was already updated with ROS earlier)
  // updates the robot status with the heartbeat subscriber + shows the robot chip
  // updates the controller status with the controller subscriber + shows the controller chip
  return (
    <Stack spacing={1} sx={{ alignItems: 'center' }}>
      <Stack direction="row" spacing={1}>
        <Chip label="Rosbridge" color={bridgeStatus} />

        <HeartbeatSubscriber ROS={props.ROS} setRobotStatus={setRobotStatus} />
        <Chip label="Robot" color={robotStatus} />
        
        <ControllerSubscriber ROS={props.ROS} setStatus={setControllerStatus} />
        <Chip label="Controller" color={controllerStatus} />
      </Stack>
    </Stack>
  );
};
