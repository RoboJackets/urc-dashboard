import { useState } from "react";
import { Map } from "./Map";
import { Waypoints } from "./Waypoints/Waypoints";
import { Coordinate } from "./CoordinateInterface";
import { Odometry } from "./Odometry/Odometry";
import ROSLIB from "roslib";
interface NavigationPrpos {
  ROS: ROSLIB.Ros;
}
export const Navigation = (props: NavigationPrpos) => {
  const [waypoints, setWaypoints] = useState<Coordinate[]>([]);
  const [odometry, setOdometry] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: -1,
  });

  const addWaypoint = (newWaypoint: Coordinate) => {
    setWaypoints((prevWaypoints) => [...prevWaypoints, newWaypoint]);
  };

  const deleteWaypoint = (id: number) => {
    setWaypoints((setWaypoints) => setWaypoints.filter((wp) => wp.id !== id));
  };

  return (
    <div className="flex flex-col card">
      <div className="card-title">Navigation</div>
      <div className="flex gap-2">
        <Map waypoints={waypoints} odometry={odometry} />

        <Waypoints
          waypoints={waypoints}
          addWaypoint={addWaypoint}
          deleteWaypoint={deleteWaypoint}
        />

        <Odometry
          odometry={odometry}
          setOdometry={setOdometry}
          ROS={props.ROS}
        />
      </div>
    </div>
  );
};
