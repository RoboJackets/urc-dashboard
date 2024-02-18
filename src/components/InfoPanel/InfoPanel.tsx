import { useState } from "react";
import { CmdVels } from "./CmdVels";

interface InfoPanelProps {
  ROS: ROSLIB.Ros;
}

export const InfoPanel = (props: InfoPanelProps) => {
  const [linear, setLinear] = useState<number>(0);
  const [angular, setAngular] = useState<number>(0);

  return (
    <div className="card">
      <div className="card-title text-lg">Control Panel</div>
      <CmdVels
        ROS={props.ROS}
        linear={linear}
        setLinear={setLinear}
        angular={angular}
        setAngular={setAngular}
      />
    </div>
  );
}