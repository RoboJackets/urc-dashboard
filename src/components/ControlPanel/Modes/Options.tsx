import ROSLIB from "roslib";
import { useEffect } from "react";
import { Box, Typography, Switch } from "@mui/material";
import { OptionState } from "./Modes";

interface OptionsProps {
  mode: OptionState;
  ROS: ROSLIB.Ros;
}

export const Options = (props: OptionsProps) => {
  const setCurIdx = props.mode.setIdx;
  const curIdx = props.mode.idx;
  const values = props.mode.values;
  const topicName = props.mode.topicName;
  const messageType = props.mode.messageType;

  // Mode Specific Topic
  let topic: any;

  useEffect(() => {
    topic = new ROSLIB.Topic({
      ros: props.ROS,
      name: topicName,
      messageType: messageType,
    });
  }, [props.ROS, topicName, messageType]);

  const updateIdx = (idx: number) => {
    setCurIdx(idx);
    topic.publish(new ROSLIB.Message({ data: values[idx] }));
  };

  return (
    <Box display="flex" flexDirection="column" p={1} gap={1} border={1} borderColor="grey.400" borderRadius={1}>
      {values.map((value: string, idx: number) => (
        <Box key={idx} display="flex" alignItems="center">
          <Switch
            checked={curIdx === idx}
            onChange={() => updateIdx(idx)}
            color="primary"
          />
          <Typography variant="body2">{value}</Typography>
        </Box>
      ))}
    </Box>
  );
};