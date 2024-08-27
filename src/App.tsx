import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import { InfoPanel } from "./components/InfoPanel/InfoPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/NavigationPanel/NavigationPanel";
import { useState } from "react";
import { HostInput } from "./components/HostInput/HostInput";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  let ROS: ROSLIB.Ros;
  let defaultHost = "10.52.158.40";
  let storedHost = localStorage.getItem("ip");
  const [host, setHost] = useState<string>(
    storedHost == null ? defaultHost : storedHost,
  );
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

  // const renderPanels = () => (
  //   <div className="App flex h-screen flex-col">
  //     <div className="App w-screen p-2 flex gap-2">
  //       <ControlPanel
  //         ROS={ROS}
  //         toggleHostSet={toggleHostSet}
  //         setHost={setHost}
  //         defaultHost={defaultHost}
  //       />
  //       <InfoPanel ROS={ROS} />
  //     </div>
  //     <Navigation ROS={ROS} />
  //   </div>
  // );

  const renderPanels = () => (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid size={2}>
          <Stack spacing={2}>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Status Panel
            </Paper>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              IMU Visualization
            </Paper>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Cmd Vel Visualization
            </Paper>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Control Panel
            </Paper>
          </Stack>
        </Grid>
        <Grid size={5}>
          <Stack spacing={2}>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Camera Feed(s)
            </Paper>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              NUC Stdout
            </Paper>
          </Stack>
        </Grid>
        <Grid size={5}>
          <Stack spacing={2}>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Map
            </Paper>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Navigation Info (current lat/lon, altitude, navigation status)
            </Paper>
            <Paper elevation={3} style={{ height: "100px", width: "100%" }}>
              Waypoint panel
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div>{hostSet ? renderPanels() : renderHostInput()}</div>
    </ThemeProvider>
  );
}

export default App;
