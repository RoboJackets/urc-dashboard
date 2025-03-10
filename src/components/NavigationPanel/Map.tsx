import { useRef } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useState } from "react";
import { Coordinate } from "./CoordinateInterface";
import { Button, Box } from "@mui/material";

interface MapProps {
  waypoint: Coordinate;
  waypointActive: boolean;
  coord: Coordinate;
  baseCoord: Coordinate;
}

export const Map = (props: MapProps) => {
  const [status, setStatus] = useState(true);
  const mapRef = useRef<any>(null);

  const toggleStatus = () => {
    setStatus(!status);
  };

  const createCustomIcon = (id: string, color: string) => {
    return L.divIcon({
      className: `waypoint-marker ${color}`,
      html: `<div class="marker-content">${id}</div>`,
    });
  };

  const centerToRover = () => {
    if (mapRef.current) {
      mapRef.current.setView(
        [props.coord.lat, props.coord.lng],
        mapRef.current.getZoom(),
      );
    }
  };

  const centerToWaypoint = () => {
    if (mapRef.current && props.waypointActive) {
      mapRef.current.setView(
        [props.waypoint.lat, props.waypoint.lng],
        mapRef.current.getZoom(),
      );
    }
  };

  return (
    <Box height="100%" width="100%">
      <MapContainer
        center={[props.coord.lat, props.coord.lng]}
        zoom={11}
        ref={mapRef}
        style={{ height: "450px", width: "750px" }}
      >
        {props.waypointActive && (
          <Marker
            key={props.waypoint.id}
            position={[props.waypoint.lat, props.waypoint.lng]}
            icon={createCustomIcon(props.waypoint.id, "bg-blue-500")}
          />
        )}
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
      <div className="flex justify-center items-center gap-3">
        <Button variant="contained" onClick={centerToRover}>
          Center to Rover
        </Button>
        <Button variant="contained" onClick={centerToWaypoint}>
          Center to Waypoint
        </Button>
        <Button variant="outlined" onClick={toggleStatus}>
          {status ? "Online" : "Offline"}
        </Button>
      </div>
    </Box>
  );
};
