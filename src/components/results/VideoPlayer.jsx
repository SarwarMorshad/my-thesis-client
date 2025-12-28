// src/components/results/VideoPlayer.jsx
import { useRef, useState, useEffect } from "react";

const VideoPlayer = ({ videoUrl, detections, showLabels, showConfidence }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  // Draw detections on canvas overlay
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    const drawFrame = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get detections for current frame
      const frameDetections = getDetectionsForFrame(currentTime);

      // Draw detections
      if (frameDetections && frameDetections.length > 0) {
        frameDetections.forEach((detection) => {
          drawDetection(ctx, detection, showLabels, showConfidence);
        });
      }

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawFrame);
      }
    };

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, detections, showLabels, showConfidence]);

  const getDetectionsForFrame = (time) => {
    // Get detections for current time/frame
    // This is simplified - in real implementation, you'd map time to frame number
    return detections || [];
  };

  const drawDetection = (ctx, detection, showLabels, showConfidence) => {
    const { x, y, width, height, class: className, confidence, color } = detection;

    ctx.strokeStyle = color || "#10b981";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    if (showLabels || showConfidence) {
      const label = `${showLabels ? className : ""}${showLabels && showConfidence ? " " : ""}${
        showConfidence ? (confidence * 100).toFixed(0) + "%" : ""
      }`;

      ctx.font = "bold 16px Inter";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = color || "#10b981";
      ctx.fillRect(x, y - 24, textWidth + 10, 24);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, x + 5, y - 6);
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    video.currentTime = percentage * duration;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      {/* Video Element */}
      <video ref={videoRef} src={videoUrl} className="w-full h-auto" />

      {/* Canvas Overlay for Detections */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress Bar */}
        <div
          onClick={handleSeek}
          className="w-full h-2 bg-white/20 rounded-full mb-3 cursor-pointer hover:h-3 transition-all"
        >
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button onClick={handlePlayPause} className="text-white hover:text-blue-400 transition">
            {isPlaying ? "⏸️" : "▶️"}
          </button>

          <div className="text-white text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
