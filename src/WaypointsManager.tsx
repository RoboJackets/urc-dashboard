import ROSLIB from "roslib";
import React, { useState } from "react";
import {
  TextField,
  IconButton,
  Button,
  Box,
  Grid,
  Card,
  Typography,
  CardHeader,
  CardContent,
} from "@mui/material";
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
    const lastWaypoint = waypoints[waypoints.length - 1];
    if (lastWaypoint.longitude === "" || lastWaypoint.latitude === "") {
    } else {
      const newWaypoint: Waypoint = {
        id: Date.now(),
        latitude: "",
        longitude: "",
      };
      setWaypoints([...waypoints, newWaypoint]);
    }
  

    const addWaypointService = new ROSLIB.Service({
      ros: ros,
      name: '/add_waypoint',
      serviceType: 'package/AddWaypoint',
    });
    
    const addWaypointRequest = new ROSLIB.ServiceRequest({
      latitude: lastWaypoint.latitude,
      longitude: lastWaypoint.longitude
    })

    addWaypointService.callService(addWaypointRequest, (result: any) => {
      console.log("Waypoint added: " + result);
    })

  };


  // Remove a waypoint by ID
  const removeWaypoint = (id: number): void => {
    setWaypoints(waypoints.filter((waypoint) => waypoint.id !== id));

    const removeWaypointService = new ROSLIB.Service({
      ros: ros,
      name: '/remove_waypoint',
      serviceType: 'package/RemoveWaypoint',
    });

    const removeWaypointRequest = new ROSLIB.ServiceRequest({
      id: id,
    });

    removeWaypointService.callService(removeWaypointRequest, (result: any) => {
      console.log("Waypoint removed: " + result);
    })
  };





  // Handle input changes for latitude and longitude
  const handleInputChange = (
    id: number,
    field: keyof Waypoint,
    value: string,
  ): void => {
    setWaypoints(
      waypoints.map((waypoint) =>
        waypoint.id === id ? { ...waypoint, [field]: value } : waypoint,
      ),
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
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{ fontSize: "1rem", fontWeight: 500 }}
          >
            Waypoints Manager
          </Typography>
        }
        sx={{
          backgroundColor: "grey.700",
          padding: "4px",
        }}
      />
      <CardContent>
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
            sx={{
              mt: 2,
              bgcolor: "#B3A300",
              "&:hover": {
                backgroundColor: "yellow",
              },
              textTransform: "none",
            }}
          >
            Add Waypoint
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
