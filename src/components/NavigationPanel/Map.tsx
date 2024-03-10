import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useState } from "react";
import { Coordinate } from "./CoordinateInterface";

interface MapProps {
  waypoint: Coordinate;
  waypointActive: boolean;
  coord: Coordinate;
  baseCoord: Coordinate;
}

export const Map = (props: MapProps) => {
  const [status, setStatus] = useState(true);

  const toggleStatus = () => {
    setStatus(!status);
  };

  const createCustomIcon = (id: string, color: string) => {
    return L.divIcon({
      className: `waypoint-marker ${color}`,
      html: `<div class="marker-content">${id}</div>`,
    });
  };
  
  return (
    <div className="card">
      <MapContainer
        center={[props.coord.lat, props.coord.lng]}
        zoom={11}
      >
        {props.waypointActive &&
          <Marker
            key={props.waypoint.id}
            position={[props.waypoint.lat, props.waypoint.lng]}
            icon={createCustomIcon(props.waypoint.id, "bg-blue-500")}
          />
        }
        <Marker
          key={props.baseCoord.id}
          position={[props.baseCoord.lat, props.baseCoord.lng]}
          icon={createCustomIcon(props.baseCoord.id, "bg-red-500")}
        />
        <Marker
          position={[props.coord.lat, props.coord.lng]}
          icon={createCustomIcon(props.coord.id, "bg-green-500")}
        />

        {status ? (
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        ) : (
          <TileLayer url="/static/map/{z}/{x}/{y}.png" errorTileUrl="error" />
        )}
      </MapContainer>
      <button className={status ? "" : "bg-neutral-500"} onClick={toggleStatus}>
        {status ? "Online" : "Offline"}
      </button>
    </div>
  );
};
