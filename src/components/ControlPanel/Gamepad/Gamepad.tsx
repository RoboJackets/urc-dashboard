import { useState } from "react";
import { GamepadPublisher } from "./GamepadPublisher";
import { GamepadOptions } from "./GamepadOptions";

interface GamepadProps {
  ROS: ROSLIB.Ros;
}

export const Gamepad = (props: GamepadProps) => {
  const [driverGamepadIdx, setDriverGamepadIdx] = useState<number>(0);
  const [armGamepadIdx, setArmGamepadIdx] = useState<number>(0);
  const [gamepadCounter, setGamepadCounter] = useState<number>(0);
  const [gamepadPublisher, setGamepadPublisher] = useState<GamepadPublisher>(
    new GamepadPublisher(props.ROS)
  );

  setInterval(() => {
    gamepadPublisher.publishDriverGamepad(driverGamepadIdx);
    gamepadPublisher.publicArmGamepad(armGamepadIdx);
  }, 100);

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
    </div>
  );
};
