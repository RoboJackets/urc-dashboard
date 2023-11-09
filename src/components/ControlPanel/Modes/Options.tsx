import { Option } from "./Option";
import ROSLIB from "roslib";
import { OptionState } from "./Modes";
import { useEffect } from "react";

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
  });

  const updateIdx = (idx: number) => {
    setCurIdx(idx);
    topic.publish(new ROSLIB.Message({ data: values[idx] }));
  };
  return (
    <div className="flex flex-col p-1 gap-1 border dark:border-neutral-700 rounded-md h-min">
      {values.map((value: string, idx: number) => (
        <Option
          key={idx}
          value={value}
          idx={idx}
          curIdx={curIdx}
          updateIdx={updateIdx}
        />
      ))}
    </div>
  );
};
