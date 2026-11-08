import { Typography } from "@mui/material";

/** Small "Xs ago / stale" tag shown on telemetry cards. */
export const StaleBadge = ({ ageMs, stale }: { ageMs: number; stale: boolean }) => (
  <Typography
    variant="caption"
    sx={{ color: stale ? "warning.main" : "text.disabled", fontSize: "0.65rem" }}
  >
    {stale ? "stale" : `${(ageMs / 1000).toFixed(1)}s`}
  </Typography>
);
