import ROSLIB from "roslib";
import { StatusColors } from "./Statuses";

export class HeartbeatSubscriber {
  ROS: ROSLIB.Ros;
  setRobotStatus: Function;
  heartbeatTopic: ROSLIB.Topic;
  lastTimestamp: number = 0;
  constructor(ROS: ROSLIB.Ros, setRobotStatus: Function) {
    this.ROS = ROS;
    this.setRobotStatus = setRobotStatus;
    this.heartbeatTopic = new ROSLIB.Topic({
      ros: this.ROS,
      name: "/heartbeat",
      messageType: "std_msgs/msg/Header",
    });

    this.heartbeatTopic.subscribe((message: any) => {
      if (message.stamp.sec - this.lastTimestamp < 100) {
        this.setRobotStatus(StatusColors.GREEN);
      }
      this.lastTimestamp = message.stamp.sec;
    });
  }

  checkHeartbeat(): void {
    if (Date.now() - this.lastTimestamp > 2000) {
      this.setRobotStatus(StatusColors.RED);
    }
  }
}
