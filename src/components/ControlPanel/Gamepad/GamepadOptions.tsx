export interface GamepadOptionsProps {
  setState: React.Dispatch<React.SetStateAction<number>>;
  operatorType: String;
}

export const GamepadOptions = (props: GamepadOptionsProps) => {
  // TODO: Add more gamepad aliases
  const gamepadAlias: Record<string, string> = {
    "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)":
      "PS5 Controller",
    "Xbox Series X Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b12)":
      "Xbox X Controller",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="pr-1">{props.operatorType}</div>
      <select
        className="bg-neutral-800 rounded-sm pr-1 w-min"
        onChange={(event) => props.setState(Number(event.target.value))}
      >
        <option key={-1} value={-1}></option>
        {navigator.getGamepads().map((gamepad, idx) => {
          return gamepad ? (
            <option key={idx} value={idx}>
              {gamepadAlias[gamepad.id] || gamepad.id}
            </option>
          ) : null;
        })}
      </select>
    </div>
  );
};
