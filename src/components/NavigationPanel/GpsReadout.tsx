import { Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { formatHemisphere } from "../../lib/gnss";
import { FIX_STATUS_LABELS, NavSatFix, fixAccuracy, hasFix } from "../../ros/roverFix";
import { StaleBadge } from "../StaleBadge/StaleBadge";

interface GpsReadoutProps {
  fix: NavSatFix | null;
  ageMs: number;
  stale: boolean;
}

/** Rover GNSS fix as text: position, altitude, fix type and accuracy (rules 1.b.iii, 1.c.iv). */
export const GpsReadout = ({ fix, ageMs, stale }: GpsReadoutProps) => {
  if (!fix) {
    return (
      <Typography variant="caption" color="text.secondary">
        GNSS: no data on /gps
      </Typography>
    );
  }

  const fixed = hasFix(fix);
  const accuracy = fixAccuracy(fix);
  const status = FIX_STATUS_LABELS[fix.status.status] ?? `status ${fix.status.status}`;
  const copyText = `${fix.latitude.toFixed(7)}, ${fix.longitude.toFixed(7)}`;

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
      <Chip
        size="small"
        label={status}
        color={stale ? "default" : fixed ? "success" : "error"}
        variant={stale ? "outlined" : "filled"}
      />
      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
        {formatHemisphere(fix.latitude, true, 7)}, {formatHemisphere(fix.longitude, false, 7)}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        alt {fix.altitude.toFixed(1)} m ·{" "}
        {accuracy ? `±${accuracy.horizontal.toFixed(2)} m H / ±${accuracy.vertical.toFixed(2)} m V` : "accuracy unknown"}
      </Typography>
      <Tooltip title="Copy lat, lng">
        <IconButton size="small" onClick={() => navigator.clipboard?.writeText(copyText)}>
          <ContentCopy fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <StaleBadge ageMs={ageMs} stale={stale} />
    </Stack>
  );
};
