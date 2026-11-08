import { useMemo } from "react";
import { TeleoperationSwitch } from "./TeleoperationSwitch";
import { EnableSwitch } from "./EnableSwitch";
import { Box } from "@mui/material";
import ROSLIB from "roslib";
import { useTopic } from "../../../ros/hooks";
import { TOPICS, TOPIC_TYPES } from "../../../ros/interfaces";

interface SwitchesProps {
  ROS: ROSLIB.Ros;
}

// Switch positions mirror the twist mux's retained /drive_mode state
// ("teleop" | "autonomous" | "disabled"); toggles only send requests.
// Before the first state arrives, show the mux's startup state (enabled, teleop).
export const Switches = (props: SwitchesProps) => {
  const driveMode = useTopic<{ data: string }>(TOPICS.driveMode, TOPIC_TYPES.driveMode);
  const mode = driveMode.msg?.data ?? "teleop";
  const enabled = mode !== "disabled";
  const teleopEnabled = mode !== "autonomous";

  const modeTopic = useMemo(
    () => new ROSLIB.Topic({ ros: props.ROS, name: TOPICS.cmdVelMode, messageType: TOPIC_TYPES.cmdVelMode }),
    [props.ROS],
  );
  const enableTopic = useMemo(
    () => new ROSLIB.Topic({ ros: props.ROS, name: TOPICS.cmdVelEnabled, messageType: TOPIC_TYPES.cmdVelEnabled }),
    [props.ROS],
  );

  const handleTeleopToggle = (checked: boolean) =>
    modeTopic.publish(new ROSLIB.Message({ data: checked ? "teleop" : "autonomous" }));

  const handleEnableToggle = (checked: boolean) =>
    enableTopic.publish(new ROSLIB.Message({ data: checked }));

  return (
    <Box display="flex" flexDirection="column" gap={0.1}>
      <TeleoperationSwitch
        checked={teleopEnabled}
        onToggle={handleTeleopToggle}
        disabled={!enabled}
      />
      <EnableSwitch checked={enabled} onToggle={handleEnableToggle} />
    </Box>
  );
};
