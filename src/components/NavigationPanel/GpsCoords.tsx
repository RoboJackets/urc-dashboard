import { useEffect } from "react";
import ROSLIB from "roslib";
import { Coordinate } from "./CoordinateInterface";
interface GpsProps {
  coord: Coordinate;
  baseCoord: Coordinate;
  baseCoordActive: boolean;
  ROS: any;
  setCoord: Function;
  setBaseCoord: Function;
  setBaseCoordActive: Function;
}

export const GPS = (props: GpsProps) => {

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
        id: "R",
        lat: message.latitude,
        lng: message.longitude
      })
    });
  });
  return (
    <div className="card">
      <div className="card-subtitle">GPS Coordinates</div>
      <div className="whitespace-nowrap">{`Lat: ${props.coord.lat.toPrecision(5)},  Lng: ${props.coord.lng.toPrecision(5)}`}</div>
      <div className="whitespace-nowrap">{`Writing Base Coords: ${props.baseCoordActive ? "True" : "False"}`}</div>
      <button onClick={() => {
        baseTopic.publish(new ROSLIB.Message({
          data: !props.baseCoordActive
        }));
        props.setBaseCoord({id: "B", lat: props.coord.lat, lng: props.coord.lng});
        props.setBaseCoordActive(!props.baseCoordActive);
      }}>
        Toggle Base Coordinate Update
      </button>
    </div>
  );
};
