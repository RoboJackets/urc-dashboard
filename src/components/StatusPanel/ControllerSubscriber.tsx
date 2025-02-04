import { useEffect, useState } from "react";
import ROSLIB from "roslib";
import { StatusColors } from "./Statuses";

interface ControllerSubscriberProps {
  ROS: ROSLIB.Ros;
  setStatus: Function;
}

export const ControllerSubscriber = (props: ControllerSubscriberProps) => {
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const controllerTopic: ROSLIB.Topic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/driver/joy",
    messageType: "sensor_msgs/msg/Joy",
  });

  const [threshold, setThreshold] = useState(0);

  useEffect(() => {
    controllerTopic.subscribe((message: any) => {
      // we have a 2 second threshold for the controller + whatever clock difference there is
      if (threshold === 0) {
        setThreshold(Date.now() / 1000 - message.header.stamp.sec + 2);
      }
      setLastTimestamp(message.header.stamp.sec);
    });
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() / 1000 - lastTimestamp > threshold) {
        props.setStatus(StatusColors.RED);
      } else {
        props.setStatus(StatusColors.GREEN);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  return null;
};
