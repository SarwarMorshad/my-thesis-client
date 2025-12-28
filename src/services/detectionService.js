// src/services/detectionService.js
import { detectWithCocoSsd, detectVideoWithCocoSsd } from "./cocoSsdDetector";
import { detectWithYolov8 } from "./yolov8Detector";

/**
 * Run detection based on algorithm
 */
export const runDetection = async (algorithmId, imageElement, options = {}) => {
  switch (algorithmId) {
    case "coco-ssd":
      return await detectWithCocoSsd(imageElement, options);
    case "yolov8":
      return await detectWithYolov8(imageElement, options);
    // Add more algorithms here
    default:
      throw new Error(`Unsupported algorithm: ${algorithmId}`);
  }
};

/**
 * Run video detection
 */
export const runVideoDetection = async (algorithmId, videoElement, options = {}) => {
  switch (algorithmId) {
    case "coco-ssd":
      return await detectVideoWithCocoSsd(videoElement, options);
    // Add YOLOv8 video detection when ready
    default:
      throw new Error(`Video detection not supported for: ${algorithmId}`);
  }
};
