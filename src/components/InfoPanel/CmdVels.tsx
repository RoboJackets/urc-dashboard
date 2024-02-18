import { useEffect } from "react";
import ROSLIB from "roslib";

interface CmdVelProps {
  linear: number;
  angular: number;
  ROS: any;
  setLinear: Function;
  setAngular: Function;
}

export const CmdVels = (props: CmdVelProps) => {
  const CmdVelTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/rover_drivetrain_controller/cmd_vel",
    messageType: "geometry_msgs/TwistStamped",
  });

  useEffect(() => {
    CmdVelTopic.subscribe((message: any) => {
      props.setLinear(message.twist.linear[0]); // linear x
      props.setAngular(message.twist.angular[2]); // angular z
    });
  });
  return (
    <div className="card">
      <div className="card-subtitle">Cmd Vel</div>
      <div className="whitespace-nowrap">{`Linear: ${props.linear},  Angular: ${props.angular}`}</div>
    </div>
  );
};
