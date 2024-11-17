import React, { useState } from "react";
import { TextField, IconButton, Button, Box, Grid } from "@mui/material";
import { Delete, Add, ArrowUpward, ArrowDownward } from "@mui/icons-material";

// Define the type for a waypoint
interface Waypoint {
  id: number;
  latitude: string;
  longitude: string;
}

export const WaypointsManager: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 1, latitude: "", longitude: "" },
  ]);

  // Add a new waypoint
  const addWaypoint = (): void => {
    const newWaypoint: Waypoint = { id: Date.now(), latitude: "", longitude: "" };
    setWaypoints([...waypoints, newWaypoint]);
  };

  // Remove a waypoint by ID
  const removeWaypoint = (id: number): void => {
    setWaypoints(waypoints.filter((waypoint) => waypoint.id !== id));
  };

  // Handle input changes for latitude and longitude
  const handleInputChange = (
    id: number,
    field: keyof Waypoint,
    value: string
  ): void => {
    setWaypoints(
      waypoints.map((waypoint) =>
        waypoint.id === id ? { ...waypoint, [field]: value } : waypoint
      )
    );
  };

  // Move a waypoint up or down in the list
  const moveWaypoint = (index: number, direction: number): void => {
    const newWaypoints = [...waypoints];
    const [movedWaypoint] = newWaypoints.splice(index, 1);
    newWaypoints.splice(index + direction, 0, movedWaypoint);
    setWaypoints(newWaypoints);
  };

  return (
    <Box sx={{ p: 2, bgcolor: "background.paper" }}>
      {waypoints.map((waypoint, index) => (
        <Grid container spacing={2} key={waypoint.id} alignItems="center">
          <Grid item xs={4}>
            <TextField
              label="Latitude"
              variant="outlined"
              fullWidth
              value={waypoint.latitude}
              onChange={(e) =>
                handleInputChange(waypoint.id, "latitude", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Longitude"
              variant="outlined"
              fullWidth
              value={waypoint.longitude}
              onChange={(e) =>
                handleInputChange(waypoint.id, "longitude", e.target.value)
              }
            />
          </Grid>
          <Grid item xs={4}>
            <IconButton
              disabled={index === 0}
              onClick={() => moveWaypoint(index, -1)}
            >
              <ArrowUpward />
            </IconButton>
            <IconButton
              disabled={index === waypoints.length - 1}
              onClick={() => moveWaypoint(index, 1)}
            >
              <ArrowDownward />
            </IconButton>
            <IconButton onClick={() => removeWaypoint(waypoint.id)}>
              <Delete />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={addWaypoint}
        sx={{ mt: 2 }}
      >
        Add Waypoint
      </Button>
    </Box>
  );
};
