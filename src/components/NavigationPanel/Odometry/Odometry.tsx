import { useEffect } from "react";
import { Coordinate } from "../CoordinateInterface";
import ROSLIB from "roslib";
interface OdometryProps {
  odometry: Coordinate;
  ROS: any;
  setOdometry: Function;
}

export const Odometry = (props: OdometryProps) => {
  const odometryTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/odometry",
    messageType: "nav_msgs/Odometry",
  });

  useEffect(() => {
    odometryTopic.subscribe((message: any) => {
      props.setOdometry(message);
    });
  });
  return (
    <div className="card">
      <div className="card-subtitle">Odometry</div>
      <div className="whitespace-nowrap">{`Lat: ${props.odometry.lat},  Lng: ${props.odometry.lng}`}</div>
    </div>
  );
};
