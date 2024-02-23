import { useEffect } from "react";
import ROSLIB from "roslib";
import { Coordinate } from "./CoordinateInterface";
interface GpsProps {
  coord: Coordinate;
  ROS: any;
  setCoord: Function;
}

export const GPS = (props: GpsProps) => {
  const gpsTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/gps/data",
    messageType: "sensor_msgs/NavSatFix",
  });

  useEffect(() => {
    gpsTopic.subscribe((message: any) => {
      props.setCoord({
        lat: message.latitude,
        lng: message.longitude
      })
    });
  });
  return (
    <div className="card">
      <div className="card-subtitle">GPS Coordinates</div>
      <div className="whitespace-nowrap">{`Lat: ${props.coord.lat.toPrecision(5)},  Lng: ${props.coord.lng.toPrecision(5)}`}</div>
    </div>
  );
};
