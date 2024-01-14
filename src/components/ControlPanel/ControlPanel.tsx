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
}

export const ControlPanel = (props: ControlPanelProps) => {
  return (
    <div className="card">
      <div className="card-title text-lg">Control Panel</div>
      <ChangeIP
				toggleHostSet={props.toggleHostSet}
				setHost={props.setHost}
				defaultHost={props.defaultHost}
			/>
      <ToggleTheme />
      <div className="flex gap-2">
        <Modes ROS={props.ROS} />
        <Statuses ROS={props.ROS} />
        <Gamepad ROS={props.ROS} />
      </div>
    </div>
  );
};
