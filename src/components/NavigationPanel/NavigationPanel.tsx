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
    <div className="flex flex-col card">
      <div className="card-title">Navigation Panel</div>
      <div className="flex gap-2">
        <Map
          waypoint={waypoint}
          waypointActive={waypointActive}
          coord={coord}
          baseCoord={baseCoord}
        />

        <GPS
          coord={coord}
          baseCoord={baseCoord}
          ROS={props.ROS}
          setCoord={setCoord}
          setBaseCoord={setBaseCoord}
        />
        
        <Waypoint
          waypoint={waypoint}
          setWaypoint={setWaypoint}
          waypointActive={waypointActive}
          setWaypointActive={setWaypointActive}
          ROS={props.ROS}
        />
      </div>
    </div>
  );
};
