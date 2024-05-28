import { useEffect, useState } from "react";
import { Status } from "../ControlPanel/Statuses/Status";
import { StatusColors } from "../ControlPanel/Statuses/Statuses";
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
    name: "/gps/data",
    messageType: "sensor_msgs/NavSatFix",
  });

  const baseTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/set_base",
    messageType: "std_msgs/Bool",
  });

  const [gpsStatus, setGpsStatus] = useState<StatusColors>(StatusColors.RED);
  const [lastSeen, setLastSeen] = useState<number>(Date.now() - 3000);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSeen > 1000) {
        setGpsStatus(StatusColors.RED);
      } else {
        setGpsStatus(StatusColors.GREEN);
      }
    }, 1000);

    gpsTopic.subscribe((message: any) => {
      setLastSeen(Date.now());
      setGpsStatus(StatusColors.GREEN);
      props.setCoord({
        id: "R",
        lat: message.latitude,
        lng: message.longitude,
      });
    });

    baseTopic.subscribe((message: any) => {
      if (message.data) {
        props.setBaseCoord({
          id: "B",
          lat: props.coord.lat,
          lng: props.coord.lng,
        });
      }
    });
    return () => clearInterval(interval);
  });

  return (
    <div className="card">
      <div className="card-subtitle">GPS Coordinates</div>
      <Status value="GPS Status" color={gpsStatus} />
      <div className="whitespace-nowrap">{`Lat: ${props.coord.lat.toPrecision(9)},  Lng: ${props.coord.lng.toPrecision(9)}`}</div>
      <button
        onClick={() => {
          props.setBaseCoord({
            id: "B",
            lat: props.coord.lat,
            lng: props.coord.lng,
          });
          baseTopic.publish(
            new ROSLIB.Message({
              data: true,
            }),
          );
          console.log(props.coord);
        }}
      >
        Set Base Station
      </button>
    </div>
  );
};
