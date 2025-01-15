import { useState } from "react";
import { TeleoperationSwitch } from "./TeleoperationSwitch";
import { EnableSwitch } from "./EnableSwitch"; 
import { Box } from "@mui/material";
import ROSLIB from "roslib";

interface SwitchesProps {
  ROS: ROSLIB.Ros;
}

export const Switches = (props: SwitchesProps) => {
  const [teleopEnabled, setTeleopEnabled] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(true);

  const handleTeleopToggle = (checked: boolean) => {
    setTeleopEnabled(checked);
    const TeleopTopic = new ROSLIB.Topic({
      ros: props.ROS,
      name: "/cmd_vel_mode",
      messageType: "std_msgs/String",
    });
    TeleopTopic.publish(new ROSLIB.Message({ data: checked ? "teleop" : "autonomous" }));
  };

  const handleEnableToggle = (checked: boolean) => {
    setEnabled(checked);
    const EnableTopic = new ROSLIB.Topic({
      ros: props.ROS,
      name: "/cmd_vel_enabled",
      messageType: "std_msgs/Bool",
    });
    EnableTopic.publish(new ROSLIB.Message({ data: checked })); // True if enabled, False if not, boolean message
  };

  return (
    <Box display="flex" flexDirection="column" gap={0.1}>
      <TeleoperationSwitch checked={teleopEnabled} onToggle={handleTeleopToggle} disabled = {!enabled}/>
      <EnableSwitch checked={enabled} onToggle={handleEnableToggle} />
    </Box>
  );
};