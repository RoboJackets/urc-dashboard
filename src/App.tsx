import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import { InfoPanel } from "./components/InfoPanel/InfoPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/NavigationPanel/NavigationPanel";
import { useState } from "react";
import { HostInput } from "./components/HostInput/HostInput";
function App() {
  let ROS: ROSLIB.Ros;
  let defaultHost = "10.52.158.40";
  const [host, setHost] = useState<string>(defaultHost);
  const [hostSet, toggleHostSet] = useState(false);

  if (hostSet) {
    ROS = new ROSLIB.Ros({ url: "ws://" + host + ":9090" });
  }

  const renderHostInput = () => (
    <HostInput
      host={host}
      setHost={setHost}
      toggleHostSet={toggleHostSet}
      defaultHost={defaultHost}
    />
  );

  const renderPanels = () => (
    <div className="App flex h-screen flex-col">
      <div className="App w-screen p-2 flex gap-2">
        <ControlPanel ROS={ROS} />
        <InfoPanel ROS={ROS} />
      </div>
      <Navigation ROS={ROS} />
    </div>
  );

  return <div>{hostSet ? renderPanels() : renderHostInput()}</div>;
}

export default App;
