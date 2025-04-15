import React, { useState } from "react";
import {
  TextField,
  IconButton,
  Button,
  Box,
  Grid,
  Card,
  Typography,
  CardContent,
  CardHeader,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid";

enum GoalType {
  GNSS_ONLY,
  GNSS_WITH_ARUCO,
  GNSS_WITH_MALLET,
  GNSS_WITH_BOTTLE,
}

interface GNSSCoordinate {
  latitude: number;
  longitude: number;
}
interface Goal {
  id: string;
  gnss_coordinate: GNSSCoordinate;
  goal_type: GoalType;
}

export const GoalQueue: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  /* string inputs for coordinates */
  const [latStr, setLatStr] = useState("");
  const [lonStr, setLonStr] = useState("");
  const [type, setType] = useState<GoalType>(GoalType.GNSS_ONLY);

  const coordRegex = /^-?\d*\.?\d*$/;
  const handleLat = (v: string) => coordRegex.test(v) && setLatStr(v);
  const handleLon = (v: string) => coordRegex.test(v) && setLonStr(v);

  const latNum = parseFloat(latStr);
  const lonNum = parseFloat(lonStr);
  const coordsValid = !isNaN(latNum) && !isNaN(lonNum);

  const enqueueGoal = () => {
    if (!coordsValid) return;
    setGoals((g) => [
      ...g,
      {
        id: uuidv4(),
        gnss_coordinate: { latitude: latNum, longitude: lonNum },
        goal_type: type,
      },
    ]);
    setLatStr("");
    setLonStr("");
  };
  const removeGoal = (id: string) =>
    setGoals((g) => g.filter((goal) => goal.id !== id));

  /* ───────────────────────────────── UI ───────────────────────────────── */
  return (
    <Card
      sx={{
        backgroundColor: "grey.800",
        color: "white",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{ fontsize: "1rem", fontWeight: 500 }}
          >
            Goal Queue
          </Typography>
        }
        sx={{
          backgroundColor: "grey.700",
          padding: "4px",
        }}
      />
      <CardContent>
        <Box display="flex" flexDirection="column" gap={3}>
          <Grid container spacing={2} sx={{ fontWeight: "bold", px: 1 }}>
            <Grid item xs={1}>
              #
            </Grid>
            <Grid item xs={3}>
              Latitude
            </Grid>
            <Grid item xs={3}>
              Longitude
            </Grid>
            <Grid item xs={3}>
              Type
            </Grid>
            <Grid item xs={2}>
              Actions
            </Grid>
          </Grid>

          {goals.map((g, idx) => (
            <Card key={g.id}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={1}>
                    {idx + 1}
                  </Grid>
                  <Grid item xs={3}>
                    {g.gnss_coordinate.latitude}
                  </Grid>
                  <Grid item xs={3}>
                    {g.gnss_coordinate.longitude}
                  </Grid>
                  <Grid item xs={3}>
                    {GoalType[g.goal_type]}
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => removeGoal(g.id)}>
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          {goals.length === 0 && (
            <Typography color="text.secondary">No goals queued yet!</Typography>
          )}

          <Card variant="outlined">
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <TextField
                    label="Latitude"
                    size="small"
                    fullWidth
                    value={latStr}
                    onChange={(e) => handleLat(e.target.value)}
                    inputProps={{
                      inputMode: "decimal",
                      pattern: coordRegex.source,
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Longitude"
                    size="small"
                    fullWidth
                    value={lonStr}
                    onChange={(e) => handleLon(e.target.value)}
                    inputProps={{
                      inputMode: "decimal",
                      pattern: coordRegex.source,
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    select
                    label="Goal Type"
                    size="small"
                    fullWidth
                    value={type}
                    onChange={(e) => setType(Number(e.target.value))}
                    SelectProps={{ native: true }}
                  >
                    {Object.keys(GoalType)
                      .filter((k) => isNaN(Number(k)))
                      .map((name) => (
                        <option
                          key={name}
                          value={GoalType[name as keyof typeof GoalType]}
                        >
                          {name}
                        </option>
                      ))}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={!coordsValid}
                    onClick={enqueueGoal}
                  >
                    Add Goal
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};
