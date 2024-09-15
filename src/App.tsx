import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import { InfoPanel } from "./components/InfoPanel/InfoPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/NavigationPanel/NavigationPanel";
import { useState } from "react";
import { HostInput } from "./components/HostInput/HostInput";
import Header  from "./header.js"

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

  // const renderPanels = () => (
  //   <div className="App flex h-screen flex-col">
  //     <Navigation ROS={ROS} />
  //   </div>
  // );

  const renderPanels = () => (
    <>
    
      <Header/>
      <Box sx={{ flexGrow: 1 , height: "95vh", padding: "10px"}}>
        <Grid container spacing={2} sx={{height: "100%"}}>
          <Grid size={2} sx={{height: "100%"}}>
            <Stack spacing={2} sx={{height: "100%", justifyContent: "space-around"}}>
              <Paper elevation={3} style={{ height: "23%", width: "100%", marginTop: "1%", marginBottom: "1%"}}>
                Status Panel
              </Paper>
              <Paper elevation={3} style={{ height: "23%", width: "100%", marginTop: "1%", marginBottom: "1%"}}>
                IMU Visualization
              </Paper>
              <Paper elevation={3} style={{ height: "23%", width: "100%", marginTop: "1%", marginBottom: "1%"}}>
                Cmd Vel Visualization
              </Paper>
              <Paper elevation={3} style={{ height: "23%", width: "100%", marginTop: "1%", marginBottom: "1%"}}>
                Control Panel
              </Paper>
            </Stack>
          </Grid>
          <Grid size={5} sx={{height: "100%"}}>
            <Stack spacing={2}  sx={{height: "100%", justifyContent: "space-around"}}>
              <Paper elevation={3} style={{ height: "73%", width: "100%" , marginTop: "1%", marginBottom: "1%"}}>
                Camera Feed(s)
              </Paper>
              <Paper elevation={3} style={{ height: "23%", width: "100%" , marginTop: "1%", marginBottom: "1%"}}>
                NUC Stdout
              </Paper>
            </Stack>
          </Grid>
          <Grid size={5} sx={{height: "100%"}}>
            <Stack spacing={2}  sx={{height: "100%", justifyContent: "space-around"}}>
              <Paper elevation={3} style={{ height: "48%", width: "100%" , marginTop: "1%", marginBottom: "1%", minHeight: "300px"}}>
                <Navigation ROS={ROS} />
              </Paper>
              <Paper elevation={3} style={{ height: "8%", width: "100%" , marginTop: "1%", marginBottom: "1%"}}>
                Navigation Info (current lat/lon, altitude, navigation status)
              </Paper>
              <Paper elevation={3} style={{ height: "38%", width: "100%" , marginTop: "1%", marginBottom: "1%"}}>
                Waypoint panel
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div>{hostSet ? renderPanels() : renderHostInput()}</div>
    </ThemeProvider>
  );
}

export default App;
