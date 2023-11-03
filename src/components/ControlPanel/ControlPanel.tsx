import { Modes } from "./Modes/Modes";
import { Statuses } from "./Statuses/Statuses";
import { Gamepad } from "./Gamepad/Gamepad";

interface ControlPanelProps {
  ROS: ROSLIB.Ros;
}

export const ControlPanel = (props: ControlPanelProps) => {
  return (
    <div className="card">
      <div className="card-title text-lg">Control Panel</div>
      <div className="flex gap-2">
        <Modes ROS={props.ROS} />
        <Statuses ROS={props.ROS} />
        <Gamepad ROS={props.ROS} />
      </div>
    </div>
  );
};
