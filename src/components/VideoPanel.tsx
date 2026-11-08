import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Box, IconButton, MenuItem, Select, TextField } from "@mui/material";
import { Settings } from "@mui/icons-material";

const SOURCES = [
  { key: "rover", label: "Rover" },
  { key: "astronaut", label: "Astronaut" },
  { key: "drone", label: "Drone" },
] as const;

const DEFAULT_URL =
  "http://127.0.0.1:8083/stream/97238fcf-f406-41f8-bb30-b151758ed23a/channel/0/hls/live/index.m3u8";

const urlFor = (key: string) =>
  localStorage.getItem(`video:${key}`) ?? (key === "rover" ? DEFAULT_URL : "");

const VideoPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string>("rover");
  const [url, setUrl] = useState(urlFor("rover"));
  const [editing, setEditing] = useState(false);

  const switchSource = (key: string) => {
    setSource(key);
    setUrl(urlFor(key));
    setEditing(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [url]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 0.5 }}>
        <Select size="small" value={source} onChange={(e) => switchSource(e.target.value)} sx={{ height: 26, fontSize: "0.8rem" }}>
          {SOURCES.map((s) => (
            <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>
          ))}
        </Select>
        <IconButton size="small" onClick={() => setEditing((e) => !e)}>
          <Settings fontSize="small" />
        </IconButton>
      </Box>
      {editing && (
        <TextField
          size="small" fullWidth label="stream URL" value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            localStorage.setItem(`video:${source}`, e.target.value);
          }}
          sx={{ mt: 0.5 }}
        />
      )}
      <Box sx={{ flex: 1, minHeight: 0, bgcolor: "black" }}>
        {url ? (
          <video ref={videoRef} autoPlay controls muted style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <Box sx={{ color: "grey.600", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "0.8rem" }}>
            no stream configured (click ⚙)
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VideoPanel;
