import { useState } from "react";
import { useEffect } from "react";
import { Map } from "./Map";
import { Coordinate } from "./CoordinateInterface";
import ROSLIB from "roslib";
import { Card, CardContent, CardHeader, Box } from "@mui/material";

import { Typography } from "@mui/material";
interface NavigationPanelPrpos {
  ROS: ROSLIB.Ros;
  isDark: boolean;
}
export const Navigation = (props: NavigationPanelPrpos) => {
  const [coord, setCoord] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: "R",
  });

  const gpsTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/gps/data",
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
        lng: message.longitude,
      });
    });

    baseTopic.subscribe((message: any) => {
      if (message.data) {
        setBaseCoord({
          id: "B",
          lat: coord.lat,
          lng: coord.lng,
        });
      }
    });
  }, []);

  const [waypoint, setWaypoint] = useState<Coordinate>(coord);
  const [waypointActive, setWaypointActive] = useState(false);
  const [baseCoord, setBaseCoord] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: "B",
  });

  return (
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{ fontsize: "1rem", fontWeight: 500 }}
          >
            Navigation Panel
          </Typography>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={0.7}
          width="100%"
          height="100%"
        >
          <Map
            waypoint={waypoint}
            waypointActive={waypointActive}
            coord={coord}
            baseCoord={baseCoord}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
