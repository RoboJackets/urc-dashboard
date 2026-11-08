import { ControlPanel } from "./components/ControlPanel/ControlPanel";
import ROSLIB from "roslib";
import { Navigation } from "./components/NavigationPanel/NavigationPanel";
import { useEffect, useMemo, useState } from "react";
import { HostInput } from "./components/HostInput/HostInput";
import Header from "./header.js";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { StatusPanel } from "./components/StatusPanel/StatusPanel";
import VideoPanel from "./components/VideoPanel";

import { WaypointsManager } from "./WaypointsManager";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { IMU } from "./components/InfoPanel/IMU";
import { CmdVels } from "./components/InfoPanel/CmdVels";
import { ConsoleOut } from "./components/InfoPanel/ConsoleOut";
import { MissionPanel } from "./components/MissionPanel/MissionPanel";
import { CommandsPanel } from "./components/CommandsPanel/CommandsPanel";
import { OpsPanel } from "./components/OpsPanel/OpsPanel";
import { BatteryPanel } from "./components/BatteryPanel/BatteryPanel";
import { LaunchKeyPanel } from "./components/LaunchKeyPanel/LaunchKeyPanel";

import { RosProvider, useRos, ConnectionState } from "./ros/RosContext";

const DEFAULT_PORT = 9090;
const HEADER_HEIGHT = 60; // keep in sync with .rootContainer in header.css

// Panels share column height by weight but never shrink below their content.
const Panel = ({
  weight,
  minHeight,
  children,
}: {
  weight: number;
  minHeight?: number;
  children: React.ReactNode;
}) => (
  <Paper elevation={3} sx={{ flex: `${weight} 1 0`, width: "100%", minHeight }}>
    {children}
  </Paper>
);

function parseTarget(input: string): { host: string; port: number } {
  const trimmed = input.trim();
  const m = trimmed.match(/^(.+):(\d+)$/);
  if (m) return { host: m[1], port: Number(m[2]) };
  return { host: trimmed, port: DEFAULT_PORT };
}

const ConnectingScreen = ({ state }: { state: ConnectionState }) => (
  <>
    <Header />
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height={`calc(100vh - ${HEADER_HEIGHT}px)`}
      flexDirection="column"
      gap={1}
    >
      <Typography variant="h6">
        {state === "lost"
          ? "Connection lost — retrying…"
          : "Connecting to rosbridge…"}
      </Typography>
      {state === "lost" && (
        <Typography variant="body2" color="text.secondary">
          Check the link, or change IP to connect elsewhere.
        </Typography>
      )}
    </Box>
  </>
);

function Dashboard() {
  let defaultHost = "10.52.158.40";
  let storedTarget = localStorage.getItem("ip");
  const [host, setHost] = useState<string>(
    storedTarget == null ? defaultHost : storedTarget,
  );
  const [hostSet, toggleHostSet] = useState(storedTarget != null);

  const [isDark, toggleIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const { ros, connectionState, connect, disconnect } = useRos();
  const theme = useMemo(
    () => createTheme({ palette: { mode: isDark ? "dark" : "light" } }),
    [isDark],
  );

  useEffect(() => {
    if (hostSet) {
      localStorage.setItem("ip", host);
      const { host: h, port } = parseTarget(host);
      connect(h, port);
    } else {
      disconnect();
    }
  }, [hostSet]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderHostInput = () => (
    <HostInput
      host={host}
      setHost={setHost}
      toggleHostSet={toggleHostSet}
      defaultHost={defaultHost}
    />
  );

  const renderPanels = (ROS: ROSLIB.Ros) => (
    <>
      <Header />
      <Box sx={{ height: `calc(100vh - ${HEADER_HEIGHT}px)`, overflow: "auto", p: "10px" }}>
        <Grid container spacing={2} sx={{ minHeight: "100%" }}>
          <Grid size={2} sx={{ display: "flex" }}>
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Panel weight={23}>
                <StatusPanel ROS={ROS} isDark={isDark} />
              </Panel>
              <Panel weight={23}>
                <IMU ROS={ROS} isDark={true} />
              </Panel>
              <Panel weight={23}>
                <CmdVels ROS={ROS} isDark={isDark} />
              </Panel>
              <Panel weight={18}>
                <ControlPanel
                  ROS={ROS}
                  toggleHostSet={toggleHostSet}
                  setHost={setHost}
                  defaultHost={defaultHost}
                  isDark={isDark}
                  toggleIsDark={toggleIsDark}
                />
              </Panel>
              <Panel weight={12}>
                <BatteryPanel isDark={isDark} />
              </Panel>
              <Panel weight={10}>
                <LaunchKeyPanel />
              </Panel>
            </Stack>
          </Grid>

          <Grid size={5} sx={{ display: "flex" }}>
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Panel weight={30}>
                <MissionPanel />
              </Panel>
              <Panel weight={30}>
                <Stack direction="row" spacing={1} sx={{ height: "100%" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}><CommandsPanel /></Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}><OpsPanel /></Box>
                </Stack>
              </Panel>
              <Panel weight={17}>
                <ConsoleOut ROS={ROS} isDark={isDark} />
              </Panel>
              <Panel weight={17}>
                <VideoPanel />
              </Panel>
            </Stack>
          </Grid>

          <Grid size={5} sx={{ display: "flex" }}>
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Panel weight={48} minHeight={300}>
                <Navigation ROS={ROS} isDark={isDark} />
              </Panel>
              <Panel weight={38}>
                <WaypointsManager />
              </Panel>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </>
  );

  if (!hostSet) return renderHostInput();
  if (connectionState !== "connected" || !ros)
    return <ConnectingScreen state={connectionState} />;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {renderPanels(ros)}
    </ThemeProvider>
  );
}

function App() {
  return (
    <RosProvider>
      <Dashboard />
    </RosProvider>
  );
}

export default App;
