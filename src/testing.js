import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Header from "./header.js"

export default function testing() {

    return <>
        <Header/>
        <Box sx={{ flexGrow: 1 }} m={2}>
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

    </>
}