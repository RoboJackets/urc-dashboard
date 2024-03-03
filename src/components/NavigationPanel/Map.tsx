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
  baseCoordActive: boolean;
}

export const Map = (props: MapProps) => {
  const [status, setStatus] = useState(true);

  const toggleStatus = () => {
    setStatus(!status);
  };

  const createCustomIcon = (point: Coordinate) => {
    return L.divIcon({
      className: "waypoint-marker",
      html: `<div class="marker-content">${point.id}</div>`,
    });
  };

  const robotMarker = L.divIcon({
    className: "robot-marker",
    html: `<div class="marker-content">R</div>`,
  });
  
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
            icon={createCustomIcon(props.waypoint)}
          />
        }
        {props.baseCoordActive &&
          <Marker
            key={props.baseCoord.id}
            position={[props.baseCoord.lat, props.baseCoord.lng]}
            icon={createCustomIcon(props.baseCoord)}
          />
        }
        <Marker
          position={[props.coord.lat, props.coord.lng]}
          icon={robotMarker}
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
