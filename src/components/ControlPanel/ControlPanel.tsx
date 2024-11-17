import { Card, Box, CardContent, CardHeader, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { Modes } from "./Modes/Modes";
import { Statuses } from "./Statuses/Statuses";
import { Gamepad } from "./Gamepad/Gamepad";
import { ToggleTheme } from "./ToggleTheme";
import { ChangeIP } from "./ChangeIP/ChangeIP"

interface ControlPanelProps {
  ROS: ROSLIB.Ros;
	toggleHostSet: Function;
	setHost: Function;
	defaultHost: string;
  isDark: boolean;
  toggleIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ControlPanel = (props: ControlPanelProps) => {
  return (
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
      }}
    >

      <CardHeader
        title={
          <Typography variant="subtitle1" align="center" gutterBottom
                      sx={{ fontSize: '1rem', fontWeight: 500 }}>
            Control Panel
          </Typography>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding :'4px',
        }}
      />
      <CardContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={0.7}>
          <Typography variant="subtitle1" component="div" textAlign="center">
            {localStorage.getItem("ip")}
          </Typography>

          <Box display="flex" flexDirection="row" gap={2} justifyContent="center">
            <ChangeIP
              toggleHostSet={props.toggleHostSet}
              setHost={props.setHost}
              defaultHost={props.defaultHost}
              isDark={props.isDark}
            />
            <ToggleTheme isDark={props.isDark} toggleIsDark={props.toggleIsDark}/>
          </Box>

          <Box display="flex" gap={2} justifyContent="center" mt={2}>
            <Modes ROS={props.ROS} />
            <Gamepad ROS={props.ROS} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
