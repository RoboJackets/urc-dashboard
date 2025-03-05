import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Replace {STREAM_ID} and {CHANNEL_ID} with your actual stream and channel IDs.
    const hlsUrl =
      "http://127.0.0.1:8083/stream/97238fcf-f406-41f8-bb30-b151758ed23a/channel/0/hls/live/index.m3u8";

    // Check for native HLS support
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      // Cleanup hls instance on component unmount
      return () => {
        hls.destroy();
      };
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      controls
      style={{ width: "100%", height: "auto" }}
    />
  );
};

export default VideoPanel;
