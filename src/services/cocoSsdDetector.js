// src/services/cocoSsdDetector.js
import { loadCocoSsdModel } from "../utils/modelLoading";

/**
 * Run COCO-SSD detection on image
 */
export const detectWithCocoSsd = async (imageElement, options = {}) => {
  const { confidenceThreshold = 0.5, maxDetections = 20, onProgress } = options;

  try {
    // Load model
    const model = await loadCocoSsdModel(onProgress);

    onProgress?.({ status: "detecting", message: "Running detection..." });

    // Run detection
    const startTime = performance.now();
    const predictions = await model.detect(imageElement, maxDetections);
    const endTime = performance.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    // Filter by confidence threshold
    const filteredPredictions = predictions.filter((pred) => pred.score >= confidenceThreshold);

    // Format detections
    const detections = filteredPredictions.map((pred, index) => ({
      id: index,
      class: pred.class,
      confidence: pred.score,
      bbox: {
        x: pred.bbox[0],
        y: pred.bbox[1],
        width: pred.bbox[2],
        height: pred.bbox[3],
      },
    }));

    onProgress?.({ status: "complete", message: "Detection complete" });

    return {
      detections,
      processingTime: processingTime + "s",
      algorithm: "coco-ssd",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("COCO-SSD detection error:", error);
    onProgress?.({ status: "error", message: error.message });
    throw error;
  }
};

/**
 * Run COCO-SSD detection on video (frame by frame)
 */
export const detectVideoWithCocoSsd = async (videoElement, options = {}) => {
  const {
    confidenceThreshold = 0.5,
    frameSampling = 5, // Process every Nth frame
    onFrameDetection,
    onProgress,
  } = options;

  try {
    const model = await loadCocoSsdModel(onProgress);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const fps = 30; // Assume 30 FPS
    const duration = videoElement.duration;
    const totalFrames = Math.floor(fps * duration);
    const framesToProcess = Math.floor(totalFrames / frameSampling);

    const allDetections = [];
    let processedFrames = 0;

    // Process frames
    for (let i = 0; i < totalFrames; i += frameSampling) {
      const time = i / fps;
      videoElement.currentTime = time;

      // Wait for video to seek
      await new Promise((resolve) => {
        videoElement.onseeked = resolve;
      });

      // Draw frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Run detection
      const predictions = await model.detect(canvas);
      const filteredPredictions = predictions.filter((pred) => pred.score >= confidenceThreshold);

      const frameDetections = filteredPredictions.map((pred, index) => ({
        frame: i,
        time: time.toFixed(2),
        id: index,
        class: pred.class,
        confidence: pred.score,
        bbox: {
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3],
        },
      }));

      allDetections.push(...frameDetections);
      processedFrames++;

      // Report progress
      const progress = Math.floor((processedFrames / framesToProcess) * 100);
      onProgress?.({
        status: "detecting",
        progress,
        currentFrame: i,
        totalFrames,
      });

      onFrameDetection?.({
        frame: i,
        detections: frameDetections,
      });
    }

    return {
      detections: allDetections,
      totalFrames,
      processedFrames,
      algorithm: "coco-ssd",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Video detection error:", error);
    throw error;
  }
};
