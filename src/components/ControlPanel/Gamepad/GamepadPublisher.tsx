import ROSLIB from "roslib";

interface GamepadPublisherProps {
  ROS: ROSLIB.Ros;
  driverGamepadIdx: number;
  armGamepadIdx: number;
}

export const GamepadPublisher = (props: GamepadPublisherProps) => {
  const driverTopic: ROSLIB.Topic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/driverGamepad",
    messageType: "sensor_msgs/msg/Joy",
  });
  const armTopic: ROSLIB.Topic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/driverGamepad",
    messageType: "sensor_msgs/msg/Joy",
  });

  // Helper Functions
  const inputDeadzone = (num: number, deadzone: number) => {
    return Math.abs(num) < deadzone ? 0 : num;
  };

  const checkNonzero = (arr: readonly any[], deadzone: number) => {
    var nonzero = false;
    arr.forEach((element) => {
      if (typeof element == typeof 0.0) {
        if (inputDeadzone(element, deadzone) !== 0) {
          nonzero = true;
        }
      } else {
        if (inputDeadzone(element.value, deadzone) !== 0) {
          nonzero = true;
        }
      }
    });

    return nonzero;
  };

  // Publish Movement Method
  const publishMovementInput = (gamepad: Gamepad, topic: ROSLIB.Topic) => {
    let joy_msg = new ROSLIB.Message({
      axes: gamepad.axes.map((axis) => inputDeadzone(axis, 0.02)),
      buttons: gamepad.buttons.map((button) => button.pressed),
    });

    topic.publish(joy_msg);
  };

  setInterval(() => {
    const driveGamepad = navigator.getGamepads()[props.driverGamepadIdx];
    const armGamepad = navigator.getGamepads()[props.armGamepadIdx];
    if (
      driveGamepad &&
      (checkNonzero(driveGamepad.axes, 0.02) ||
        checkNonzero(driveGamepad.buttons, 0.02))
    ) {
      publishMovementInput(driveGamepad, driverTopic);
    }
    if (
      armGamepad &&
      (checkNonzero(armGamepad.axes, 0.02) ||
        checkNonzero(armGamepad.buttons, 0.02))
    ) {
      publishMovementInput(armGamepad, armTopic);
    }
  }, 100);

  return null;
};
