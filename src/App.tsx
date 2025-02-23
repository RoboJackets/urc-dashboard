import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/NavigationPanel/NavigationPanel";
import { useState } from "react";
import { HostInput } from "./components/HostInput/HostInput";
import Header from "./header.js";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import { StatusPanel } from "./components/StatusPanel/StatusPanel";

import { WaypointsManager } from "./WaypointsManager";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// 1) Import CmdVels
import { IMU } from "./components/InfoPanel/IMU";
import { CmdVels } from "./components/InfoPanel/CmdVels"; // adjust path as needed

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

  const [isDark, toggleIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

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
    <>
      <Header />
      <Box sx={{ flexGrow: 1, height: "95vh", padding: "10px" }}>
        <Grid container spacing={2}>
          <Grid size={2} sx={{ height: "100%" }}>
            <Stack
              spacing={2}
              sx={{ height: "100%", justifyContent: "space-around" }}
            >
              <Paper
                elevation={3}
                style={{
                  height: "23%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                <StatusPanel ROS={ROS} isDark={isDark} />
              </Paper>

              <Paper
                elevation={3}
                style={{
                  height: "23%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                <IMU ROS={ROS} isDark={true} />
              </Paper>

              {/* 3) Replace "Cmd Vel Visualization" with CmdVels */}
              <Paper
                elevation={3}
                style={{
                  height: "23%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                <CmdVels ROS={ROS} isDark={isDark} />
              </Paper>

              <Paper
                elevation={3}
                style={{
                  height: "23%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                <ControlPanel
                  ROS={ROS}
                  toggleHostSet={toggleHostSet}
                  setHost={setHost}
                  defaultHost={defaultHost}
                  isDark={isDark}
                  toggleIsDark={toggleIsDark}
                />
              </Paper>
            </Stack>
          </Grid>

          <Grid size={5} sx={{ height: "100%" }}>
            <Stack
              spacing={2}
              sx={{ height: "100%", justifyContent: "space-around" }}
            >
              <Paper
                elevation={3}
                style={{
                  height: "73%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                Camera Feed(s)
              </Paper>
              <Paper
                elevation={3}
                style={{
                  height: "23%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                NUC Stdout
              </Paper>
            </Stack>
          </Grid>

          <Grid size={5} sx={{ height: "100%" }}>
            <Stack
              spacing={2}
              sx={{ height: "100%", justifyContent: "space-around" }}
            >
              <Paper
                elevation={3}
                style={{
                  height: "48%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                  minHeight: "300px",
                }}
              >
                <Navigation ROS={ROS} isDark={isDark} />
              </Paper>
              <Paper
                elevation={3}
                style={{
                  height: "38%",
                  width: "100%",
                  marginTop: "1%",
                  marginBottom: "1%",
                }}
              >
                <WaypointsManager />
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
