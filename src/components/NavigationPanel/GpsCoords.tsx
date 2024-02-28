import { useEffect, useState } from "react";
import ROSLIB from "roslib";
import { Coordinate } from "./CoordinateInterface";
interface GpsProps {
  coord: Coordinate;
  ROS: any;
  setCoord: Function;
}

export const GPS = (props: GpsProps) => {
  const [baseCoord, setBaseCoord] = useState<boolean>(false);

  const gpsTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/fix",
    messageType: "sensor_msgs/NavSatFix",
  });

  const baseTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/set_base",
    messageType: "std_msgs/Bool",
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
      <div className="whitespace-nowrap">{`Writing Base Coords: ${baseCoord ? "True" : "False"}`}</div>
      <button onClick={() => {
        baseTopic.publish(new ROSLIB.Message({
          data: !baseCoord
        }));
        setBaseCoord(!baseCoord);
      }}>
        Toggle Base Coordinate Update
      </button>
    </div>
  );
};
