import { useState } from "react";
import { Status } from "./Status";
import ROSLIB from "roslib";
import { HeartbeatSubscriber } from "./HeartbeatSubscriber";

interface StatusesProps {
  ROS: ROSLIB.Ros;
}

export enum StatusColors {
  RED = "bg-red-500",
  GREEN = "bg-green-500",
}

export const Statuses = (props: StatusesProps) => {
  const [bridgeStatus, setBridgeStatus] = useState<StatusColors>(
    StatusColors.RED
  );
  const [robotStatus, setRobotStatus] = useState<StatusColors>(
    StatusColors.RED
  );
  // Rosbridge Status
  props.ROS.on("connection", () => setBridgeStatus(StatusColors.GREEN));
  props.ROS.on("error", (e) => {
    console.error("WebSocket connection error:", e);
  });
  props.ROS.on("close", () => setBridgeStatus(StatusColors.RED));

  return (
    <div className="card">
      <div className="card-subtitle">Status</div>
      <Status value="Rosbridge" color={bridgeStatus} />
      <Status value="Robot" color={robotStatus} />
      <HeartbeatSubscriber ROS={props.ROS} setRobotStatus={setRobotStatus} />
    </div>
  );
};
