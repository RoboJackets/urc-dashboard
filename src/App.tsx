import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/NavigationPanel/NavigationPanel";
import { useState } from "react";
import { HostInput } from "./components/HostInput/HostInput";
function App() {
  let ROS: ROSLIB.Ros;
  let defaultHost = "10.52.158.40";
  let storedHost = localStorage.getItem("ip");
  const [host, setHost] = useState<string>(storedHost == null ? defaultHost : storedHost);
	const [hostSet, toggleHostSet] = useState(storedHost != null);

  if (hostSet) {
    localStorage.setItem("ip", host);
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
    <div className="App w-screen h-screen p-2 flex gap-2">
      <ControlPanel
				ROS={ROS}
				toggleHostSet={toggleHostSet}
				setHost={setHost}
				defaultHost={defaultHost}
			/>
      <Navigation ROS={ROS} />
    </div>
  );

  return <div>{hostSet ? renderPanels() : renderHostInput()}</div>;
}

export default App;
