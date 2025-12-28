// src/components/results/DetectionCanvas.jsx
import { useEffect, useRef, useState } from "react";

const DetectionCanvas = ({ imageUrl, detections, showLabels, showConfidence }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load image once
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      console.log("Image loaded and cached");
    };

    img.onerror = (error) => {
      console.error("Error loading image:", error);
    };

    img.src = imageUrl;

    return () => {
      imageRef.current = null;
      setImageLoaded(false);
    };
  }, [imageUrl]);

  // Draw canvas when image is loaded or detections change
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, 0, 0);

    console.log("Canvas drawn, detections:", detections?.length);

    // Draw detections
    if (detections && detections.length > 0) {
      detections.forEach((detection, index) => {
        drawDetection(ctx, detection, showLabels, showConfidence, index);
      });
      console.log(`✅ Drew ${detections.length} bounding boxes`);
    }
  }, [imageLoaded, detections, showLabels, showConfidence]);

  const drawDetection = (ctx, detection, showLabels, showConfidence, index) => {
    // Get coordinates
    const x = detection.x || detection.bbox?.x || 0;
    const y = detection.y || detection.bbox?.y || 0;
    const width = detection.width || detection.bbox?.width || 0;
    const height = detection.height || detection.bbox?.height || 0;
    const className = detection.class;
    const confidence = detection.confidence;
    const color = detection.color || "#10b981";

    // Validate
    if (width <= 0 || height <= 0) {
      console.warn(`⚠️ Invalid dimensions for ${className}:`, { width, height });
      return;
    }

    console.log(
      `📦 Drawing ${className} at (${Math.round(x)}, ${Math.round(y)}) [${Math.round(width)}×${Math.round(
        height
      )}]`
    );

    // Save state
    ctx.save();

    // Draw bounding box with thicker line
    ctx.strokeStyle = color;
    ctx.lineWidth = 5; // Thicker for visibility
    ctx.strokeRect(x, y, width, height);

    // Draw semi-transparent fill
    ctx.fillStyle = color + "25"; // 25 = ~15% opacity
    ctx.fillRect(x, y, width, height);

    // Draw corners for extra visibility
    const cornerSize = 20;
    ctx.lineWidth = 6;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(x, y + cornerSize);
    ctx.lineTo(x, y);
    ctx.lineTo(x + cornerSize, y);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(x + width - cornerSize, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + cornerSize);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(x + width, y + height - cornerSize);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - cornerSize, y + height);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(x + cornerSize, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + height - cornerSize);
    ctx.stroke();

    // Draw label
    if (showLabels || showConfidence) {
      let label = "";

      if (showLabels && showConfidence) {
        label = `${className} ${(confidence * 100).toFixed(0)}%`;
      } else if (showLabels) {
        label = className;
      } else if (showConfidence) {
        label = `${(confidence * 100).toFixed(0)}%`;
      }

      // Font settings
      ctx.font = "bold 18px Arial, sans-serif";
      ctx.textBaseline = "top";

      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = 24;
      const padding = 10;

      // Label position
      let labelX = x;
      let labelY = y - textHeight - padding - 5;

      // Keep inside canvas
      if (labelY < 0) {
        labelY = y + 5;
      }
      if (labelX + textWidth + padding * 2 > ctx.canvas.width) {
        labelX = ctx.canvas.width - textWidth - padding * 2;
      }
      if (labelX < 0) {
        labelX = 5;
      }

      // Draw label background with border
      ctx.fillStyle = color;
      ctx.fillRect(labelX - 2, labelY - 2, textWidth + padding * 2 + 4, textHeight + padding + 4);

      // White border around label
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(labelX - 2, labelY - 2, textWidth + padding * 2 + 4, textHeight + padding + 4);

      // Draw text
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 3;
      ctx.fillText(label, labelX + padding, labelY + padding / 2);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading canvas...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-auto"
        style={{ display: imageLoaded ? "block" : "none", maxWidth: "100%" }}
      />
    </div>
  );
};

export default DetectionCanvas;
