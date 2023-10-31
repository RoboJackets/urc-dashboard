import ROSLIB from "roslib";
export class GamepadPublisher {
  ROS: ROSLIB.Ros;
  driverTopic: ROSLIB.Topic;
  armTopic: ROSLIB.Topic;

  constructor(ROS: ROSLIB.Ros) {
    this.ROS = ROS;

    this.driverTopic = new ROSLIB.Topic({
      ros: this.ROS,
      name: "/driverGamepad",
      messageType: "sensor_msgs/msg/Joy",
    });

    this.armTopic = new ROSLIB.Topic({
      ros: this.ROS,
      name: "/armGamepad",
      messageType: "sensor_msgs/msg/Joy",
    });
  }

  static inputDeadzone(num: number, deadzone: number): number {
    return Math.abs(num) < deadzone ? 0 : num;
  }

  static checkNonzero(arr: readonly any[], deadzone: number): boolean {
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

  private publishGamepad(gamepadIdx: number, topic: ROSLIB.Topic): void {
    const gamepad = navigator.getGamepads()[gamepadIdx];

    if (
      gamepad &&
      GamepadPublisher.checkNonzero(gamepad.axes, 0.02) &&
      GamepadPublisher.checkNonzero(gamepad.buttons, 0.02)
    ) {
      let joy_msg = new ROSLIB.Message({
        axes: [
          0.0,
          GamepadPublisher.inputDeadzone(gamepad.axes[1], 0.02),
          0.0,
          0.0,
          GamepadPublisher.inputDeadzone(gamepad.axes[3], 0.02),
        ],
        buttons: [
          gamepad.buttons[0].pressed ? 1 : 0,
          gamepad.buttons[1].pressed ? 1 : 0,
          gamepad.buttons[2].pressed ? 1 : 0,
          gamepad.buttons[3].pressed ? 1 : 0,
        ],
      });

      topic.publish(joy_msg);
    }
  }

  public publishDriverGamepad(gamepadIdx: number): void {
    this.publishGamepad(gamepadIdx, this.driverTopic);
  }
  public publicArmGamepad(gamepadIdx: number): void {
    this.publishGamepad(gamepadIdx, this.armTopic);
  }
}
