import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useOpsLog, logOps, clearOpsLog, opsLogToCsv } from "../../ros/opsLog";
import { downloadFile, fileTimestamp } from "../../lib/download";
import { MissionTimer } from "./MissionTimer";

/**
 * Scoring aids for competition ops:
 * - mission timer with rule presets (1.a.ii setup/teardown, 1.d.i, 1.e.i)
 * - penalty tracker: abort 20% / teleop 50% per task, capped at 50% (1.e.xi/xviii)
 * - intervention counter: 20% each (3.e.viii)
 * - ops log: timestamped event strip for debrief, persisted and exportable
 */
export const OpsPanel = () => {
  const entries = useOpsLog();

  const [aborts, setAborts] = useState(0);
  const [teleops, setTeleops] = useState(0);
  const [interventions, setInterventions] = useState(0);

  const exportLog = () => downloadFile(`ops_log_${fileTimestamp()}.csv`, opsLogToCsv(entries), "text/csv");
  const clearLog = () => {
    if (window.confirm("Clear the ops log? Export it first if you need it for the debrief.")) clearOpsLog();
  };

  // exit-autonomy penalty: each abort costs 20%, teleop 50%, capped at 50% total
  const taskPenalty = Math.min(50, aborts * 20 + teleops * 50);
  // intervention penalty is separate and uncapped
  const interventionPenalty = interventions * 20;
  const scoreMultiplier = Math.max(0, 1 - (taskPenalty + interventionPenalty) / 100);

  const bump = (fn: React.Dispatch<React.SetStateAction<number>>, d: number, label: string) => {
    fn((v) => Math.max(0, v + d));
    if (d > 0) logOps("sys", `${label} +1`);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={<Typography variant="subtitle1" align="center" sx={{ fontSize: "1rem", fontWeight: 500 }}>Ops & Scoring</Typography>}
        sx={{ backgroundColor: "grey.700", padding: "4px" }}
      />
      <CardContent sx={{ flex: 1, overflow: "auto", p: 1.5 }}>
        <Stack spacing={1}>
          <MissionTimer />

          <Divider />

          {([
            ["Abort (20%)", aborts, setAborts],
            ["Teleop (50%)", teleops, setTeleops],
            ["Intervention (20%)", interventions, setInterventions],
          ] as const).map(([label, count, set]) => (
            <Stack key={label} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ flex: 1 }}>{label}</Typography>
              <IconButton size="small" onClick={() => bump(set, -1, label)}><Remove fontSize="small" /></IconButton>
              <Typography variant="body2" sx={{ minWidth: 16, textAlign: "center" }}>{count}</Typography>
              <IconButton size="small" onClick={() => bump(set, 1, label)}><Add fontSize="small" /></IconButton>
            </Stack>
          ))}

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={`autonomy penalty: ${taskPenalty}%`} color={taskPenalty >= 50 ? "error" : taskPenalty > 0 ? "warning" : "default"} />
            <Chip size="small" label={`≈×${scoreMultiplier.toFixed(2)}`} variant="outlined" />
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
              Ops log ({entries.length})
            </Typography>
            <Button size="small" onClick={exportLog} disabled={!entries.length} sx={{ textTransform: "none", minWidth: 0 }}>
              Export
            </Button>
            <Button size="small" color="error" onClick={clearLog} disabled={!entries.length} sx={{ textTransform: "none", minWidth: 0 }}>
              Clear
            </Button>
          </Stack>
          <Box sx={{ maxHeight: 110, overflow: "auto", fontFamily: "monospace", fontSize: "0.72rem" }}>
            {[...entries].reverse().map((e, i) => (
              <Typography key={i} variant="caption" display="block" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                {new Date(e.stamp).toLocaleTimeString()} [{e.tag}] {e.text}
              </Typography>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
