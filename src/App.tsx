import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/Navigation/Navigation";
import { useState } from "react";
function App() {
  let ROS: any;

  const [link, setLink] = useState<string>("ws://10.52.158.40:9090");
  const [linkReceived, setLinkReceived] = useState(false);

  if (!linkReceived) {
    return (
      <div className="App w-screen h-screen p-2 flex gap-2 flex-col justify-center items-center">
        <div className="card">
          <div className="card-title">Input Rosbridge URL</div>
          <input
            placeholder="ws://10.52.158.40:9090"
            className="w-[200px] h-min"
            onChange={(e) => setLink(e.target.value)}
          />
          <button
            onClick={() => {
              if (link) {
                setLinkReceived(true);
              }
            }}
          >
            Set Rosbridge URL
          </button>
        </div>
      </div>
    );
  } else {
    ROS = new ROSLIB.Ros({ url: link });
  }

  return (
    <div className="App w-screen h-screen p-2 flex gap-2">
      <ControlPanel ROS={ROS} />
      <Navigation ROS={ROS} />
    </div>
  );
}

export default App;
