import { useState } from "react";
import { GamepadOptions } from "./GamepadOptions";
import { GamepadPublisher } from "./GamepadPublisher";

interface GamepadProps {
  ROS: ROSLIB.Ros;
}

export const Gamepad = (props: GamepadProps) => {
  const [driverGamepadIdx, setDriverGamepadIdx] = useState<number>(-1);
  const [armGamepadIdx, setArmGamepadIdx] = useState<number>(-1);
  const [gamepadCounter, setGamepadCounter] = useState<number>(0);

  window.addEventListener("gamepadconnected", () => {
    setGamepadCounter(gamepadCounter + 1);
  });

  window.addEventListener("gamepaddisconnected", () => {
    setGamepadCounter(gamepadCounter - 1);
  });

  if (gamepadCounter === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-subtitle">Gamepads</div>
      <GamepadOptions operatorType={"Drive"} setState={setDriverGamepadIdx} />
      <GamepadOptions operatorType={"Arm"} setState={setArmGamepadIdx} />
      <GamepadPublisher
        ROS={props.ROS}
        driverGamepadIdx={driverGamepadIdx}
        armGamepadIdx={armGamepadIdx}
      />
    </div>
  );
};
