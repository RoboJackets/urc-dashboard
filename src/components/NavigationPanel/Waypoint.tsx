import { useState } from "react";
import { useEffect } from "react";
import { Coordinate } from "./CoordinateInterface";
import ROSLIB from "roslib";

interface WaypointProps {
  waypoint: Coordinate;
  waypointActive: boolean,
  setWaypoint: Function;
  setWaypointActive: Function;
  ROS: any;
}

export const Waypoint = (props: WaypointProps) => {
  const [lat, setLat] = useState<number>(props.waypoint.lat);
  const [lng, setLng] = useState<number>(props.waypoint.lng);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const WaypointTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/waypoint",
    messageType: "urc_msgs/Waypoint",
  });

  const WaypointStatusTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/current_navigation_state",
    messageType: "urc_msgs/NavigationStatus",
  });

  useEffect(() => {
    WaypointTopic.subscribe((message: any) => {
      props.setWaypoint({
        id: 1,
        lat: message.latitude,
        lng: message.longitude,
      })
      props.setWaypointActive(true);
    });
    
    WaypointStatusTopic.subscribe((message: any) => {
      setStatusMessage(message.message);
      if (message.message === "NoWaypoint") {
        props.setWaypointActive(false);
      }
    });
  });

  return (
    <div className="p-4 card">
      <div className="card-subtitle">Waypoint</div>
      <div className="whitespace-nowrap">{`Status: ${statusMessage}`}</div>
      <div className="whitespace-nowrap">{`Lat: ${props.waypoint.lat}, Lng: ${props.waypoint.lng}`}</div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(Number(e.target.value))}
        />
        <input
          type="text"
          placeholder="Longitude"
          value={lng}
          onChange={(e) => setLng(Number(e.target.value))}
        />
      </div>
      <button onClick={() => {
        props.setWaypoint({
          id: 1,
          lat: lat,
          lng: lng
        });
        WaypointTopic.publish(new ROSLIB.Message({
          latitude: lat,
          longitude: lng,
        }));
        props.setWaypointActive(true);
      }}>Set Waypoint</button>

      <button onClick={() => {
        props.setWaypointActive(false);
      }}>Remove Waypoint</button>

    </div>
  );
}