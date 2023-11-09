import { useEffect, useState } from "react";
import ROSLIB from "roslib";
import { StatusColors } from "./Statuses";

interface HeartbeatSubscriberProps {
  ROS: ROSLIB.Ros;
  setRobotStatus: Function;
}

export const HeartbeatSubscriber = (props: HeartbeatSubscriberProps) => {
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const heartbeatTopic: ROSLIB.Topic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/heartbeat",
    messageType: "std_msgs/msg/Header",
  });

  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    heartbeatTopic.subscribe((message: any) => {
      // we have a 2 second threshold for the heartbeat + whatever clock difference there is
      if (threshold === 0) {
        setThreshold(Date.now() / 1000 - message.stamp.sec + 2);
      }
      setLastTimestamp(message.stamp.sec);
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() / 1000 - lastTimestamp > threshold) {
        props.setRobotStatus(StatusColors.RED);
      } else {
        props.setRobotStatus(StatusColors.GREEN);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  return null;
};
