import { useCallback, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { CheckCircle, Error as ErrorIcon, Warning } from "@mui/icons-material";
import { useRos } from "../../ros/RosContext";
import { CheckResult, CheckStatus, runPreflight } from "../../ros/preflight";
import { logOps } from "../../ros/opsLog";

const STATUS_ICON: Record<CheckStatus, JSX.Element> = {
  pass: <CheckCircle color="success" />,
  warn: <Warning color="warning" />,
  fail: <ErrorIcon color="error" />,
};

/** Header button + dialog running the C2 setup checklist (rule 1.a.ii: ready within 15 min). */
export const Preflight = () => {
  const { ros, connectionState, lastMsgAge } = useRos();
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CheckResult[] | null>(null);

  const run = useCallback(async () => {
    if (!ros) return;
    setRunning(true);
    const r = await runPreflight(ros, lastMsgAge());
    setResults(r);
    setRunning(false);
    const count = (s: CheckStatus) => r.filter((c) => c.status === s).length;
    const failed = r.filter((c) => c.status === "fail").map((c) => c.label);
    logOps("sys", `preflight: ${count("pass")} pass, ${count("warn")} warn, ${count("fail")} fail${failed.length ? ` (${failed.join("; ")})` : ""}`);
  }, [ros, lastMsgAge]);

  const openAndRun = () => {
    setOpen(true);
    run();
  };

  if (connectionState !== "connected") return null;

  return (
    <>
      <Button variant="outlined" onClick={openAndRun} sx={{ textTransform: "none", color: "white", borderColor: "white", ml: 2 }}>
        Preflight
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Preflight checks</DialogTitle>
        <DialogContent dividers>
          {running && <LinearProgress sx={{ mb: 1 }} />}
          {results ? (
            <List dense disablePadding>
              {results.map((c) => (
                <ListItem key={c.label} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>{STATUS_ICON[c.status]}</ListItemIcon>
                  <ListItemText primary={c.label} secondary={c.detail} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">Running checks…</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={run} disabled={running} sx={{ textTransform: "none" }}>Re-run</Button>
          <Button onClick={() => setOpen(false)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
