import { useState } from "react";
import { Map } from "./Map";
import { Waypoint } from "./Waypoint";
import { Coordinate } from "./CoordinateInterface";
import { GPS } from "./GpsCoords";
import ROSLIB from "roslib";
interface NavigationPanelPrpos {
  ROS: ROSLIB.Ros;
}
export const Navigation = (props: NavigationPanelPrpos) => {
  const [coord, setCoord] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: "R",
  });
  const [waypoint, setWaypoint] = useState<Coordinate>(coord);
  const [waypointActive, setWaypointActive] = useState(false);
  const [baseCoord, setBaseCoord] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: "B",
  });

  return (
    <div className="flex h-full flex-col card">
      <div className="card-title">Navigation Panel</div>
      <div className="flex gap-2 h-full">
        <Map
          waypoint={waypoint}
          waypointActive={waypointActive}
          coord={coord}
          baseCoord={baseCoord}
        />
      </div>
    </div>
  );
};
