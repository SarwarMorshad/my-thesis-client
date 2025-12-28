// src/utils/modelLoading.js
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";

// Model loading status
const modelStatus = {
  "coco-ssd": { loaded: false, model: null },
};

/**
 * Load COCO-SSD model
 */
export const loadCocoSsdModel = async (onProgress) => {
  try {
    if (modelStatus["coco-ssd"].loaded) {
      return modelStatus["coco-ssd"].model;
    }

    onProgress?.({ status: "loading", message: "Loading COCO-SSD model..." });

    // Load TensorFlow.js backend
    await tf.ready();

    // Load COCO-SSD model
    const model = await cocoSsd.load({
      base: "lite_mobilenet_v2",
    });

    modelStatus["coco-ssd"].loaded = true;
    modelStatus["coco-ssd"].model = model;

    onProgress?.({ status: "ready", message: "COCO-SSD model loaded successfully" });

    return model;
  } catch (error) {
    console.error("Error loading COCO-SSD:", error);
    onProgress?.({ status: "error", message: `Failed to load COCO-SSD: ${error.message}` });
    throw error;
  }
};

/**
 * Load model based on algorithm ID
 */
export const loadModel = async (algorithmId, onProgress) => {
  switch (algorithmId) {
    case "coco-ssd":
      return await loadCocoSsdModel(onProgress);
    // YOLOv8 loads its own model internally
    default:
      throw new Error(`Unknown algorithm: ${algorithmId}`);
  }
};

/**
 * Unload all models to free memory
 */
export const unloadAllModels = () => {
  Object.keys(modelStatus).forEach((key) => {
    if (modelStatus[key].model) {
      if (modelStatus[key].model.dispose) {
        modelStatus[key].model.dispose();
      }
      modelStatus[key].loaded = false;
      modelStatus[key].model = null;
    }
  });
};
