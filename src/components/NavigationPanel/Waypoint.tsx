import { useState } from "react";
import { Coordinate } from "./CoordinateInterface";

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

  return (
    <div className="p-4 card">
      <div className="card-subtitle">Waypoint</div>
      <div className="whitespace-nowrap">{`Status: ${props.waypointActive ? "Waypoint Set" : "No Waypoint Set"}`}</div>
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
        props.setWaypointActive(true);
      }}>Set Waypoint</button>
      <button onClick={() => {
        props.setWaypointActive(false);
      }}>Remove Waypoint</button>

    </div>
  );
}