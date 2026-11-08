import { useEffect, useState } from "react";
import { Map } from "./Map";
import { Coordinate } from "./CoordinateInterface";
import ROSLIB from "roslib";
import { Card, CardContent, CardHeader, Box } from "@mui/material";
import { Typography } from "@mui/material";
import { useTopic } from "../../ros/hooks";
import { useMapToLL } from "../../ros/toLL";
import { useArucoPin } from "../../ros/arucoPin";
import { useActiveGoal } from "../../ros/activeGoal";
import { TOPICS, TOPIC_TYPES } from "../../ros/interfaces";
import { hasFix, useRoverFix } from "../../ros/roverFix";
import { GpsReadout } from "./GpsReadout";

interface NavigationPanelPrpos {
  ROS: ROSLIB.Ros;
  isDark: boolean;
}

interface PoseStamped {
  pose: { position: { x: number; y: number; z: number } };
}

interface ArucoDetection {
  marker_id: number;
  pose: PoseStamped;
}

export const Navigation = (props: NavigationPanelPrpos) => {
  const [coord, setCoord] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: "R",
  });
  const [baseCoord, setBaseCoord] = useState<Coordinate>({
    lat: 38.409,
    lng: -110.7917,
    id: "B",
  });
  const [astronaut, setAstronaut] = useState<Coordinate | null>(null);
  const [aruco, setAruco] = useState<Coordinate | null>(null);

  const gps = useRoverFix();
  const base = useTopic<{ data: boolean }>(TOPICS.setBase, TOPIC_TYPES.setBase);
  const astroPose = useTopic<PoseStamped>(TOPICS.astronautPose, TOPIC_TYPES.astronautPose, {
    staleAfterMs: 4000,
  });
  const arucoDet = useTopic<ArucoDetection>(TOPICS.arucoDetections, TOPIC_TYPES.arucoDetections, {
    staleAfterMs: 4000,
  });
  const convert = useMapToLL(1000);
  const arucoPin = useArucoPin();
  const activeGoal = useActiveGoal();

  useEffect(() => {
    if (hasFix(gps.msg)) setCoord({ id: "R", lat: gps.msg.latitude, lng: gps.msg.longitude });
  }, [gps.msg]);

  useEffect(() => {
    if (base.msg?.data) setBaseCoord({ id: "B", lat: coord.lat, lng: coord.lng });
  }, [base.msg]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (astroPose.msg && !astroPose.stale)
      convert(astroPose.msg.pose.position, (c) => setAstronaut(c && { ...c, id: "A" }));
    else if (astroPose.stale) setAstronaut(null);
  }, [astroPose.msg, astroPose.stale, convert]);

  useEffect(() => {
    if (arucoDet.msg && !arucoDet.stale) {
      convert(arucoDet.msg.pose.pose.position, (c) => setAruco(c && { ...c, id: `#${arucoDet.msg!.marker_id}` }));
    } else if (arucoDet.stale) setAruco(null);
  }, [arucoDet.msg, arucoDet.stale, convert]);

  const extraMarkers: Coordinate[] = [
    ...(astronaut ? [{ ...astronaut, id: "A" }] : []),
    ...(aruco ? [aruco] : []),
    ...(arucoPin ? [arucoPin] : []),
  ];

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
          <GpsReadout fix={gps.msg} ageMs={gps.ageMs} stale={gps.stale} />
          <Map
            waypoint={activeGoal && { id: "G", lat: activeGoal.lat, lng: activeGoal.lng }}
            arrivalRadius={activeGoal?.radius}
            coord={coord}
            baseCoord={baseCoord}
            extraMarkers={extraMarkers}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
