import { Card, CardContent, CardHeader, Stack, Typography, LinearProgress } from "@mui/material";
import { useTopic } from "../../ros/hooks";
import { TOPICS, TOPIC_TYPES } from "../../ros/interfaces";
import { StaleBadge } from "../StaleBadge/StaleBadge";

interface BatteryInfo {
  cell_voltage: number;
  cell_charge_percentage: number;
  cell_discharge_current: number;
  cell_temperature: number;
  cell_voltages: number[];
}

export const BatteryPanel = ({ isDark }: { isDark: boolean }) => {
  const batt = useTopic<BatteryInfo>(TOPICS.battery, TOPIC_TYPES.battery, { staleAfterMs: 5000 });
  const m = batt.msg;

  return (
    <Card sx={{ backgroundColor: isDark ? "grey.800" : "white", color: isDark ? "white" : "black", height: "100%" }}>
      <CardHeader
        title={
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", fontWeight: 500 }}>Battery</Typography>
            <StaleBadge ageMs={batt.ageMs} stale={batt.stale} />
          </Stack>
        }
        sx={{ backgroundColor: isDark ? "grey.700" : "grey.300", padding: "4px" }}
      />
      <CardContent sx={{ p: 1 }}>
        {m ? (
          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">{m.cell_charge_percentage.toFixed(0)}%</Typography>
              <Typography variant="body2">{m.cell_voltage.toFixed(1)} V</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, m.cell_charge_percentage)}
              color={m.cell_charge_percentage > 40 ? "success" : m.cell_charge_percentage > 20 ? "warning" : "error"}
            />
            <Typography variant="caption" color="text.secondary">
              {m.cell_discharge_current.toFixed(1)} A · {m.cell_temperature.toFixed(0)}°C
            </Typography>
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">no BMS data</Typography>
        )}
      </CardContent>
    </Card>
  );
};
