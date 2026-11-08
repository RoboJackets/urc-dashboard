import { useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { Coordinate } from "./CoordinateInterface";
import { Button, Box } from "@mui/material";
import { downloadFile } from "../../lib/download";

interface MapProps {
  /** active mission goal; null when no goal is in flight */
  waypoint: Coordinate | null;
  coord: Coordinate;
  baseCoord: Coordinate;
  extraMarkers?: Coordinate[];
  /** meters — arrival radius ring drawn around the active waypoint */
  arrivalRadius?: number;
}

interface Zone {
  id: number;
  lat: number;
  lng: number;
  radius: number;
}

const EXTRA_COLORS = ["bg-purple-500", "bg-orange-500", "bg-cyan-500"];

export const Map = (props: MapProps) => {
  const [status, setStatus] = useState(true);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneMode, setZoneMode] = useState(false);
  const [zoneRadius, setZoneRadius] = useState(10);
  const mapRef = useRef<any>(null);

  const toggleStatus = () => setStatus(!status);

  const createCustomIcon = (id: string, color: string) =>
    L.divIcon({ className: `waypoint-marker ${color}`, html: `<div class="marker-content">${id}</div>` });

  const centerToRover = () => {
    mapRef.current?.setView([props.coord.lat, props.coord.lng], mapRef.current.getZoom());
  };

  const centerToWaypoint = () => {
    if (mapRef.current && props.waypoint)
      mapRef.current.setView([props.waypoint.lat, props.waypoint.lng], mapRef.current.getZoom());
  };

  const ZoneClicker = () => {
    useMapEvents({
      click(e) {
        if (zoneMode)
          setZones((z) => [...z, { id: Date.now(), lat: e.latlng.lat, lng: e.latlng.lng, radius: zoneRadius }]);
      },
    });
    return null;
  };

  const exportZones = () =>
    downloadFile("stayout_zones.json", JSON.stringify({ zones }, null, 2), "application/json");

  return (
    <Box height="100%" width="100%">
      <MapContainer
        center={[props.coord.lat, props.coord.lng]}
        zoom={11}
        ref={mapRef}
        style={{ height: "395px", width: "750px" }}
      >
        <ZoneClicker />
        {props.waypoint && (
          <>
            <Marker
              key={props.waypoint.id}
              position={[props.waypoint.lat, props.waypoint.lng]}
              icon={createCustomIcon(props.waypoint.id, "bg-blue-500")}
            />
            {props.arrivalRadius !== undefined && props.arrivalRadius > 0 && (
              <Circle
                center={[props.waypoint.lat, props.waypoint.lng]}
                radius={props.arrivalRadius}
                pathOptions={{ color: "blue", dashArray: "6 6" }}
              />
            )}
          </>
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
        {(props.extraMarkers ?? []).map((m, i) => (
          <Marker
            key={`${m.id}-${i}`}
            position={[m.lat, m.lng]}
            icon={createCustomIcon(m.id, EXTRA_COLORS[i % EXTRA_COLORS.length])}
          />
        ))}
        {zones.map((z) => (
          <Circle
            key={z.id}
            center={[z.lat, z.lng]}
            radius={z.radius}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.15, dashArray: "4 4" }}
          />
        ))}

        {status ? (
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        ) : (
          <TileLayer url="/static/map/{z}/{x}/{y}.png" errorTileUrl="error" />
        )}
      </MapContainer>
      <div className="flex justify-center items-center gap-3" style={{ flexWrap: "wrap" }}>
        <Button variant="contained" onClick={centerToRover}>Center to Rover</Button>
        <Button variant="contained" onClick={centerToWaypoint}>Center to Waypoint</Button>
        <Button variant="outlined" onClick={toggleStatus}>{status ? "Online" : "Offline"}</Button>
        <Button
          variant={zoneMode ? "contained" : "outlined"}
          color="error"
          onClick={() => setZoneMode((z) => !z)}
        >
          {zoneMode ? "Zones: ON" : "Zones: OFF"}
        </Button>
        {zoneMode && (
          <>
            <input
              type="number"
              value={zoneRadius}
              onChange={(e) => setZoneRadius(Math.max(1, Number(e.target.value)))}
              style={{ width: 60 }}
              title="zone radius (m)"
            />
            <Button variant="outlined" size="small" onClick={() => setZones([])}>Clear</Button>
            <Button variant="outlined" size="small" onClick={exportZones}>Export</Button>
          </>
        )}
      </div>
    </Box>
  );
};
