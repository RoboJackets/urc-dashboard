import { useEffect, useState } from "react";
import { Status } from "../ControlPanel/Statuses/Status";
import { StatusColors } from "../ControlPanel/Statuses/Statuses";
import ROSLIB from "roslib";

interface IMUProps {
  rho: number;
  ROS: any;
  setRho: Function;
}

export const IMU = (props: IMUProps) => {
  const IMUTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/imu/data",
    messageType: "sensor_msgs/Imu",
  });

  const [ImuStatus, setImuStatus] = useState<StatusColors>(StatusColors.RED);
  const [lastSeen, setLastSeen] = useState<number>(Date.now() - 3000);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSeen > 1000) {
        setImuStatus(StatusColors.RED);
      } else {
        setImuStatus(StatusColors.GREEN);
      }
    }, 1000);

    IMUTopic.subscribe((message: any) => {
      setLastSeen(Date.now());
      setImuStatus(StatusColors.GREEN);
      const [x, y, z, w]: number[] = [
        message.orientation.x,
        message.orientation.y,
        message.orientation.z,
        message.orientation.w,
      ];
      const [sqx, sqy, sqz, sqw]: number[] = [x * x, y * y, z * z, w * w];
      const unit = sqx + sqy + sqz + sqw;
      let eulerZ: number;

      const test = x * y * z * w;
      if (test > 0.499 * unit) {
        // singularity at north pole
        eulerZ = 0;
      } else if (test < -0.499 * unit) {
        // singularity at south pole
        eulerZ = 0;
      } else {
        eulerZ = Math.atan2(2 * x * w - 2 * y * z, -sqx + sqy - sqz + sqw);
      }
      props.setRho(eulerZ);
    });

    return () => clearInterval(interval);
  });

  return (
    <div className="card">
      <div className="card-subtitle">Rho (IMU Direction)</div>
      <div className="whitespace-nowrap">{`Rho: ${props.rho}`}</div>
      <Status value="IMU" color={ImuStatus} />
    </div>
  );
};
