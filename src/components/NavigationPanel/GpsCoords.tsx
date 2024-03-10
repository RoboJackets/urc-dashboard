import { useEffect } from "react";
import ROSLIB from "roslib";
import { Coordinate } from "./CoordinateInterface";

interface GpsProps {
  coord: Coordinate;
  baseCoord: Coordinate;
  ROS: any;
  setCoord: Function;
  setBaseCoord: Function;
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
      });
    });

    baseTopic.subscribe((message: any) => {
      if (message.data) {
        props.setBaseCoord({
          id: "B",
          lat: props.coord.lat,
          lng: props.coord.lng
        });
      }
    });
  });
  return (
    <div className="card">
      <div className="card-subtitle">GPS Coordinates</div>
      <div className="whitespace-nowrap">{`Lat: ${props.coord.lat.toPrecision(5)},  Lng: ${props.coord.lng.toPrecision(5)}`}</div>
      <button onClick={() => {
        props.setBaseCoord({id: "B", lat: props.coord.lat, lng: props.coord.lng});
        baseTopic.publish(new ROSLIB.Message({
          data: true
        }));
        console.log(props.coord);
      }}>
        Update Base Coordinates
      </button>
    </div>
  );
};
