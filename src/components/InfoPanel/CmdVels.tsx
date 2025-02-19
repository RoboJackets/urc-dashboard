import { useEffect } from "react";
import ROSLIB from "roslib";

import { Card, CardHeader, CardContent, Typography } from "@mui/material";

interface CmdVelProps {
  linear: number;
  angular: number;
  ROS: any;
  setLinear: Function;
  setAngular: Function;
  isDark: boolean;
}

export const CmdVels = (props: CmdVelProps) => {
  const CmdVelTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/rover_drivetrain_controller/cmd_vel",
    messageType: "geometry_msgs/TwistStamped",
  });

  useEffect(() => {
    CmdVelTopic.subscribe((message: any) => {
      props.setLinear(message.twist.linear.x);  // linear x
      props.setAngular(message.twist.angular.z); // angular z
    });
  });

  return (
    // 3) Replace outer <div className="card"> with MUI Card
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
      }}
    >
      {/* 4) Use CardHeader for the title */}
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{ fontSize: "1rem", fontWeight: 500 }}
          >
            Cmd Vel
          </Typography>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />

      {/* 5) Wrap linear/angular text in CardContent */}
      <CardContent>
        <Typography variant="body2">
          {`Linear: ${props.linear.toPrecision(3)}, Angular: ${props.angular.toPrecision(3)}`}
        </Typography>
      </CardContent>
    </Card>
  );
};
