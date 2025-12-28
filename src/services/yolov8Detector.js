// src/services/yolov8Detector.js
import * as ort from "onnxruntime-web";

// COCO class names (80 classes)
const COCO_CLASSES = [
  "person",
  "bicycle",
  "car",
  "motorcycle",
  "airplane",
  "bus",
  "train",
  "truck",
  "boat",
  "traffic light",
  "fire hydrant",
  "stop sign",
  "parking meter",
  "bench",
  "bird",
  "cat",
  "dog",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
  "backpack",
  "umbrella",
  "handbag",
  "tie",
  "suitcase",
  "frisbee",
  "skis",
  "snowboard",
  "sports ball",
  "kite",
  "baseball bat",
  "baseball glove",
  "skateboard",
  "surfboard",
  "tennis racket",
  "bottle",
  "wine glass",
  "cup",
  "fork",
  "knife",
  "spoon",
  "bowl",
  "banana",
  "apple",
  "sandwich",
  "orange",
  "broccoli",
  "carrot",
  "hot dog",
  "pizza",
  "donut",
  "cake",
  "chair",
  "couch",
  "potted plant",
  "bed",
  "dining table",
  "toilet",
  "tv",
  "laptop",
  "mouse",
  "remote",
  "keyboard",
  "cell phone",
  "microwave",
  "oven",
  "toaster",
  "sink",
  "refrigerator",
  "book",
  "clock",
  "vase",
  "scissors",
  "teddy bear",
  "hair drier",
  "toothbrush",
];

// Model cache
let yolov8Session = null;

/**
 * Load YOLOv8 ONNX model
 */
const loadYolov8Model = async (onProgress) => {
  try {
    if (yolov8Session) {
      return yolov8Session;
    }

    onProgress?.({ status: "loading", message: "Loading YOLOv8 model..." });

    // Set WASM paths
    ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/";

    // Load ONNX model
    const session = await ort.InferenceSession.create("/models/yolov8n.onnx", {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });

    yolov8Session = session;

    onProgress?.({ status: "ready", message: "YOLOv8 model loaded successfully" });

    console.log("YOLOv8 model loaded:", {
      inputNames: session.inputNames,
      outputNames: session.outputNames,
    });

    return session;
  } catch (error) {
    console.error("Error loading YOLOv8:", error);
    onProgress?.({ status: "error", message: `Failed to load YOLOv8: ${error.message}` });
    throw error;
  }
};

/**
 * Preprocess image for YOLOv8
 */
const preprocessImage = (imageElement, targetSize = 640) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // YOLOv8 expects square input
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Draw and resize image
  ctx.drawImage(imageElement, 0, 0, targetSize, targetSize);

  // Get image data
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const pixels = imageData.data;

  // Convert to Float32Array and normalize to [0, 1]
  const float32Data = new Float32Array(3 * targetSize * targetSize);

  for (let i = 0; i < pixels.length / 4; i++) {
    float32Data[i] = pixels[i * 4] / 255.0; // R
    float32Data[targetSize * targetSize + i] = pixels[i * 4 + 1] / 255.0; // G
    float32Data[2 * targetSize * targetSize + i] = pixels[i * 4 + 2] / 255.0; // B
  }

  return {
    data: float32Data,
    width: imageElement.width,
    height: imageElement.height,
    inputSize: targetSize,
  };
};

/**
 * Non-Maximum Suppression
 */
const nms = (boxes, iouThreshold = 0.45) => {
  if (boxes.length === 0) return [];

  // Sort by confidence (descending)
  boxes.sort((a, b) => b.confidence - a.confidence);

  const selected = [];

  while (boxes.length > 0) {
    const current = boxes.shift();
    selected.push(current);

    boxes = boxes.filter((box) => {
      const iou = calculateIoU(current.bbox, box.bbox);
      return iou < iouThreshold;
    });
  }

  return selected;
};

/**
 * Calculate Intersection over Union
 */
const calculateIoU = (box1, box2) => {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;

  return intersection / union;
};

/**
 * Process YOLOv8 output
 */
const processOutput = (output, originalWidth, originalHeight, inputSize, confidenceThreshold = 0.25) => {
  const detections = [];
  const data = output.data;

  // YOLOv8 output shape: [1, 84, 8400]
  // First 4 values are bbox (x_center, y_center, width, height)
  // Next 80 values are class probabilities
  const numDetections = 8400;
  const numClasses = 80;

  console.log("Processing YOLOv8 output:", {
    shape: output.dims,
    dataLength: data.length,
    numDetections,
  });

  for (let i = 0; i < numDetections; i++) {
    // Get bbox coordinates (center format)
    const xCenter = data[i];
    const yCenter = data[numDetections + i];
    const width = data[2 * numDetections + i];
    const height = data[3 * numDetections + i];

    // Get class scores (starting from index 4 * numDetections)
    let maxScore = 0;
    let maxClass = 0;

    for (let c = 0; c < numClasses; c++) {
      const score = data[(4 + c) * numDetections + i];
      if (score > maxScore) {
        maxScore = score;
        maxClass = c;
      }
    }

    // Filter by confidence
    if (maxScore >= confidenceThreshold) {
      // Scale coordinates back to original image size
      const scaleX = originalWidth / inputSize;
      const scaleY = originalHeight / inputSize;

      // Convert from center format to corner format
      const x = (xCenter - width / 2) * scaleX;
      const y = (yCenter - height / 2) * scaleY;
      const w = width * scaleX;
      const h = height * scaleY;

      detections.push({
        class: COCO_CLASSES[maxClass],
        confidence: maxScore,
        bbox: {
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.max(0, w),
          height: Math.max(0, h),
        },
      });
    }
  }

  console.log(`YOLOv8 raw detections before NMS: ${detections.length}`);
  return detections;
};

/**
 * Run YOLOv8 detection on image
 */
export const detectWithYolov8 = async (imageElement, options = {}) => {
  const { confidenceThreshold = 0.25, nmsThreshold = 0.45, onProgress } = options;

  try {
    // Load model
    const session = await loadYolov8Model(onProgress);

    onProgress?.({ status: "preprocessing", message: "Preprocessing image..." });

    // Preprocess image
    const { data, width, height, inputSize } = preprocessImage(imageElement);

    // Create tensor
    const tensor = new ort.Tensor("float32", data, [1, 3, inputSize, inputSize]);

    onProgress?.({ status: "detecting", message: "Running detection..." });

    // Run inference
    const startTime = performance.now();
    const outputs = await session.run({ images: tensor });
    const endTime = performance.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log("YOLOv8 inference complete:", {
      processingTime,
      outputKeys: Object.keys(outputs),
    });

    // Get output tensor
    const outputName = session.outputNames[0];
    const output = outputs[outputName];

    console.log("YOLOv8 output tensor:", {
      name: outputName,
      shape: output.dims,
      type: output.type,
    });

    // Process output
    let detections = processOutput(output, width, height, inputSize, confidenceThreshold);

    console.log(`Detections before NMS: ${detections.length}`);

    // Apply NMS
    detections = nms(detections, nmsThreshold);

    console.log(`Detections after NMS: ${detections.length}`);

    // Add IDs and ensure bbox format
    detections = detections.map((det, index) => ({
      id: index,
      class: det.class,
      confidence: det.confidence,
      bbox: det.bbox,
      // Also add x, y, width, height at top level for compatibility
      x: det.bbox.x,
      y: det.bbox.y,
      width: det.bbox.width,
      height: det.bbox.height,
    }));

    console.log("Final YOLOv8 detections:", detections);

    onProgress?.({ status: "complete", message: "Detection complete" });

    return {
      detections,
      processingTime: processingTime + "s",
      algorithm: "yolov8",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("YOLOv8 detection error:", error);
    onProgress?.({ status: "error", message: error.message });
    throw error;
  }
};
