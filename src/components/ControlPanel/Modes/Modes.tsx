import { Options } from "./Options";
import { useState } from "react";
import { TeleoperationSwitch } from "./TeleoperationSwitch";
import { EnableSwitch } from "./EnableSwitch"; 
import { Box, Typography, Card, CardContent } from "@mui/material";
import ROSLIB from "roslib";


interface ModesProps {
  ROS: ROSLIB.Ros;
}

export interface OptionState {
  values: string[];
  idx: number;
  setIdx: React.Dispatch<React.SetStateAction<number>>;
  topicName: string;
  messageType: string;
}

export const Modes = (props: ModesProps) => {
  const [controlIdx, setControlIdx] = useState<number>(0);
  const [toggleIdx, setToggleIdx] = useState<number>(1);
  const [teleopEnabled, setTeleopEnabled] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);

  const modes: Record<string, OptionState> = {
    controls: {
      values: ["Teleop", "Auto", "Test"],
      idx: controlIdx,
      setIdx: setControlIdx,
      topicName: "/mode",
      messageType: "std_msgs/String",
    },
    toggle: {
      values: ["Enable", "Disable"],
      idx: toggleIdx,
      setIdx: setToggleIdx,
      topicName: "/enabled",
      messageType: "std_msgs/Bool",
    },
  };

  const handleTeleopToggle = (checked: boolean) => {
    setTeleopEnabled(checked);
    const topic = new ROSLIB.Topic({
      ros: props.ROS,
      name: modes.controls.topicName,
      messageType: modes.controls.messageType,
    });
    topic.publish(new ROSLIB.Message({ data: checked ? "Teleop" : "Auto" }));
  };

  const handleEnableToggle = (checked: boolean) => {
    setEnabled(checked);
    const topic = new ROSLIB.Topic({
      ros: props.ROS,
      name: modes.toggle.topicName,
      messageType: modes.toggle.messageType,
    });
    topic.publish(new ROSLIB.Message({ data: checked }));
  };

  return (
    <Box display="flex" flexDirection="column" gap={0.1}>
      <TeleoperationSwitch checked={teleopEnabled} onToggle={handleTeleopToggle} />
      <EnableSwitch checked={enabled} onToggle={handleEnableToggle} />
    </Box>
  );
};