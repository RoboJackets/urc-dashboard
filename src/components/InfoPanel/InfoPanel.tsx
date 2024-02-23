import { useState } from "react";
import { CmdVels } from "./CmdVels";
import { IMU } from "./IMU";

interface InfoPanelProps {
  ROS: ROSLIB.Ros;
}

export const InfoPanel = (props: InfoPanelProps) => {
  const [linear, setLinear] = useState<number>(0);
  const [angular, setAngular] = useState<number>(0);
  const [rho, setRho] = useState<number>(0);

  return (
    <div className="card">
      <div className="card-title text-lg">Info Panel</div>
      <CmdVels
        ROS={props.ROS}
        linear={linear}
        setLinear={setLinear}
        angular={angular}
        setAngular={setAngular}
      />
      <IMU
        ROS={props.ROS}
        rho={rho}
        setRho={setRho}
      />
    </div>
  );
}