import { useState } from "react";
import { Button, Card, CardContent, CardHeader, Stack, TextField, Typography } from "@mui/material";
import { logOps } from "../../ros/opsLog";

/**
 * Equipment Servicing launch key (rules 1.d.ii): 3-6 letters entered pre-mission,
 * typed autonomously by the rover. The arm/typing ROS interface is TBD — this
 * panel stages and logs the key until the interface exists.
 */
export const LaunchKeyPanel = () => {
  const [key, setKey] = useState("");
  const [staged, setStaged] = useState<string | null>(null);
  const valid = /^[A-Za-z]{3,6}$/.test(key);

  return (
    <Card sx={{ height: "100%" }}>
      <CardHeader
        title={<Typography variant="subtitle1" align="center" sx={{ fontSize: "1rem", fontWeight: 500 }}>Launch Key</Typography>}
        sx={{ backgroundColor: "grey.700", padding: "4px" }}
      />
      <CardContent sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small" label="3–6 letters" value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 6))}
            error={key !== "" && !valid}
            inputProps={{ style: { textTransform: "uppercase", letterSpacing: 2 } }}
          />
          <Button
            variant="contained" disabled={!valid}
            onClick={() => { setStaged(key); logOps("sys", `launch key staged: ${key}`); }}
            sx={{ textTransform: "none" }}
          >
            Stage
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {staged ? `staged: ${staged} (arm interface TBD)` : "typed autonomously — declare mode changes to judges"}
        </Typography>
      </CardContent>
    </Card>
  );
};
