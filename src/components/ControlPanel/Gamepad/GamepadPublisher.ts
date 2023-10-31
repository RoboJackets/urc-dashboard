import ROSLIB from "roslib";

class GamepadPublisher {
  private ROS: any;
  private driverGamepadIndex: any;
  private armGamepadIndex: any;
  private driverTopic: any;
  private armTopic: any;

  constructor(ROS: any, driverGamepadIndex: any, armGamepadIndex: any) {
    this.ROS = ROS;
    this.driverGamepadIndex = driverGamepadIndex;
    this.armGamepadIndex = armGamepadIndex;

    this.driverTopic = new ROSLIB.Topic({
      ros: this.ROS,
      name: "/driverGamepad",
      messageType: "sensor_msgs/msg/Joy",
    });

    this.armTopic = new ROSLIB.Topic({
      ros: this.ROS,
      name: "/driverGamepad",
      messageType: "sensor_msgs/msg/Joy",
    });
  }

  static inputDeadzone(num: number, deadzone: number): number {
    return Math.abs(num) < deadzone ? 0 : num;
  }

  checkNonzero(arr: readonly any[], deadzone: number): boolean {
    var nonzero = false;
    arr.forEach((element) => {
      if (typeof element == typeof 0.0) {
        if (GamepadPublisher.inputDeadzone(element, deadzone) !== 0) {
          nonzero = true;
        }
      } else {
        if (GamepadPublisher.inputDeadzone(element.value, deadzone) !== 0) {
          nonzero = true;
        }
      }
    });

    return nonzero;
  }
}
