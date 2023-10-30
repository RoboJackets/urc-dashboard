import { useEffect, useState } from "react";
import ROSLIB from "roslib";
import { StatusColors } from "./Statuses";

interface HeartbeatPublisherProps {
  ROS: ROSLIB.Ros;
  setRobotStatus: any;
}

export const HeartbeatPublisher = (props: HeartbeatPublisherProps) => {
  const [lastTimestamp, setLastTimestamp] = useState(0);
  useEffect(() => {
    const heartbeatTopic = new ROSLIB.Topic({
      ros: props.ROS,
      name: "/heartbeat",
      messageType: "builtin_interfaces/msg/Time",
    });

    heartbeatTopic.subscribe((message: any) => {
      setLastTimestamp(message.stamp.sec);
    });
  });

  setInterval(() => {
    if (Date.now() / 1000 - lastTimestamp > 1) {
      props.setRobotStatus(StatusColors.RED);
    } else {
      props.setRobotStatus(StatusColors.GREEN);
    }
  });
  return null;
};
