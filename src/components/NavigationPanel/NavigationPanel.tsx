import { useState } from "react";
import { useEffect } from "react";
import { Map } from "./Map";
import { Coordinate } from "./CoordinateInterface";
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

  const gpsTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/fix",
    messageType: "sensor_msgs/NavSatFix",
  });

  const baseTopic = new ROSLIB.Topic({
      ros: props.ROS,
      name: "/set_base",
      messageType: "std_msgs/Bool",
    });
  
   useEffect(() => {
      gpsTopic.subscribe((message: any) => {
        setCoord({
          id: "R",
          lat: message.latitude,
          lng: message.longitude
        });
      });
  
      baseTopic.subscribe((message: any) => {
        if (message.data) {
          setBaseCoord({
            id: "B",
            lat: coord.lat,
            lng: coord.lng
          });
        }
      });
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
