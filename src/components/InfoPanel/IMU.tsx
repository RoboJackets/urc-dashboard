import { useEffect } from "react";
import ROSLIB from "roslib";

interface IMUProps {
  rho: number,
  ROS: any,
  setRho: Function
}

export const IMU = (props: IMUProps) => {
  const IMUTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/imu/data",
    messageType: "sensor_msgs/Imu",
  });

  useEffect(() => {
    IMUTopic.subscribe((message: any) => {
      const [x, y, z, w]: number[] = message.quaternion;
      const [sqx, sqy, sqz, sqw]: number[] = message.quaternion.map((x: number) => {
        return x * x;
      })
      const unit = sqx + sqy + sqz + sqw;
      let eulerZ: number;

      const test = x * y * z * w;
      if (test > 0.499 * unit) { // singularity at north pole
          eulerZ = 0;
      } else if (test < -0.499 * unit) { // singularity at south pole
          eulerZ = 0;
      } else {
          eulerZ = Math.atan2(2 * x * w - 2 * y * z, -sqx + sqy - sqz + sqw);
      }
      props.setRho(eulerZ);
    });
  });

  return (
    <div className="card">
      <div className="card-subtitle">Rho (IMU Direction)</div>
      <div className="whitespace-nowrap">{`Rho: ${props.rho}`}</div>
    </div>
  )
}