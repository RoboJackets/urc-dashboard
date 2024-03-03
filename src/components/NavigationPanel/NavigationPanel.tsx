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
    id: 0,
  });
  const [waypoint, setWaypoint] = useState<Coordinate>(coord);
  const [waypointActive, setWaypointActive] = useState(false);

  return (
    <div className="flex flex-col card">
      <div className="card-title">Navigation Panel</div>
      <div className="flex gap-2">
        <Map waypoint={waypoint} waypointActive={waypointActive} coord={coord} />

        <GPS
          coord={coord}
          setCoord={setCoord}
          ROS={props.ROS}
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
