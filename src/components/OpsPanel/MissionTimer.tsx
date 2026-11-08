import { useEffect, useRef, useState } from "react";
import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { logOps } from "../../ros/opsLog";

interface Preset {
  key: string;
  label: string;
  minutes: number | null;
}

// Fixed limits from the URC 2027 rules. Astrobiology (20–30 min, 1.b.ii) and
// Delivery (30–60 min staged, 1.c.i) are set by the judges — use Custom.
const PRESETS: Preset[] = [
  { key: "stopwatch", label: "Stopwatch", minutes: null },
  { key: "setup", label: "C2 setup · 15 min", minutes: 15 },
  { key: "teardown", label: "Teardown · 10 min", minutes: 10 },
  { key: "autonomy", label: "Autonomy · 40 min", minutes: 40 },
  { key: "servicing", label: "Equip. servicing · 30 min", minutes: 30 },
  { key: "custom", label: "Custom…", minutes: null },
];

const WARN_REMAINING_MS = 5 * 60_000;
const CRITICAL_REMAINING_MS = 60_000;
const TICK_MS = 250;

const fmtClock = (ms: number) => {
  const s = Math.floor(Math.abs(ms) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export const MissionTimer = () => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [presetKey, setPresetKey] = useState("stopwatch");
  const [customMinutes, setCustomMinutes] = useState(30);
  const startRef = useRef(0);
  const expiredLogged = useRef(false);

  const preset = PRESETS.find((p) => p.key === presetKey)!;
  const limitMinutes = preset.key === "custom" ? customMinutes : preset.minutes;
  const limitMs = limitMinutes ? limitMinutes * 60_000 : null;
  const remaining = limitMs === null ? null : limitMs - elapsed;
  const timerName = preset.key === "custom" ? `Custom · ${customMinutes} min` : preset.label;

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now() - elapsed;
    const t = setInterval(() => setElapsed(Date.now() - startRef.current), TICK_MS);
    return () => clearInterval(t);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (remaining === null || remaining > 0 || expiredLogged.current) return;
    expiredLogged.current = true;
    logOps("sys", `timer expired: ${timerName}`);
  }, [remaining, timerName]);

  const toggle = () => {
    if (!running) logOps("sys", `timer ${elapsed ? "resumed" : "started"}: ${timerName}`);
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    expiredLogged.current = false;
  };

  const color =
    remaining === null ? "text.primary"
      : remaining <= CRITICAL_REMAINING_MS ? "error.main"
        : remaining <= WARN_REMAINING_MS ? "warning.main"
          : "text.primary";
  const display = remaining === null ? fmtClock(elapsed) : `${remaining < 0 ? "+" : ""}${fmtClock(remaining)}`;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6" sx={{ fontFamily: "monospace", minWidth: 72, color }}>
          {display}
        </Typography>
        <Button size="small" variant="outlined" onClick={toggle} sx={{ textTransform: "none" }}>
          {running ? "Pause" : "Start"}
        </Button>
        <Button size="small" variant="outlined" onClick={reset} sx={{ textTransform: "none" }}>
          Reset
        </Button>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select size="small" label="Timer" value={presetKey}
          onChange={(e) => {
            setPresetKey(e.target.value);
            reset();
          }}
          disabled={running}
          sx={{ flex: 1 }}
        >
          {PRESETS.map((p) => (
            <MenuItem key={p.key} value={p.key}>{p.label}</MenuItem>
          ))}
        </TextField>
        {preset.key === "custom" && (
          <TextField
            size="small" type="number" label="min" value={customMinutes}
            onChange={(e) => setCustomMinutes(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            disabled={running}
            sx={{ width: 72 }}
          />
        )}
      </Stack>
    </Stack>
  );
};
