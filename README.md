# Deep Learning Object Detection Platform - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [Algorithm Implementation](#algorithm-implementation)
5. [Detection Process](#detection-process)
6. [Data Comparison](#data-comparison)
7. [Statistical Analysis](#statistical-analysis)
8. [File Structure](#file-structure)
9. [Component Details](#component-details)
10. [API Reference](#api-reference)

---

## 1. Project Overview

### 1.1 Purpose

A web-based platform for comparing multiple object detection algorithms (YOLOv8, COCO-SSD, YOLOv5, MobileNet-SSD) on images and videos. The platform allows users to:

- Upload images/videos or capture from webcam
- Select multiple detection algorithms
- Configure detection parameters
- Compare results visually and statistically
- Export detailed analysis reports

### 1.2 Technology Stack

- **Frontend Framework**: React 18.3
- **Routing**: React Router DOM 6.28
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.15
- **AI Libraries**:
  - TensorFlow.js 4.22
  - ONNX Runtime Web 1.20
- **Build Tool**: Vite 6.0

### 1.3 Key Features

- Multi-algorithm comparison
- Real-time webcam detection
- Video frame-by-frame processing
- Detailed statistical analysis
- Visual comparison with bounding boxes
- Export capabilities (JSON, CSV, Images)

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│  (React Components, Routing, State Management)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Business Logic Layer                       │
│  (Detection Service, Data Processing, Utilities)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   AI/ML Integration Layer                    │
│  (TensorFlow.js, ONNX Runtime, Model Loading)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                      Data Storage Layer                      │
│  (SessionStorage, State, File System)                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy

```
App
├── HomePage
├── InputPage
│   ├── FileUpload
│   ├── WebcamCapture
│   ├── MediaPreview
│   └── SampleSelection
├── AlgorithmSelectionPage
│   ├── AlgorithmCard
│   └── DetectionSettings
├── Processing
│   └── ProgressTracking
├── Results
│   ├── DetectionCanvas
│   ├── VideoPlayer
│   ├── QuickStats
│   ├── ViewControls
│   └── DetectionList
├── Statistics
│   └── Charts (Recharts)
└── Comparison
    ├── PerformanceTable
    ├── ComparisonCharts
    ├── DetectionOverlap
    └── InsightsPanel
```

---

## 3. Data Flow

### 3.1 Overall Data Flow Diagram

```
User Input (Image/Video)
        ↓
Upload/Capture Handler
        ↓
File Processing & Validation
        ↓
Store in State & SessionStorage
        ↓
Algorithm Selection
        ↓
Detection Settings Configuration
        ↓
Processing Queue
        ↓
┌───────────────────────┐
│  For Each Algorithm:  │
│  1. Load Model        │
│  2. Preprocess Image  │
│  3. Run Inference     │
│  4. Post-process      │
│  5. Extract Results   │
└───────────────────────┘
        ↓
Aggregate Results
        ↓
Statistical Analysis
        ↓
Visual Comparison
        ↓
Export Options
```

### 3.2 Detailed Data Flow by Page

#### 3.2.1 HomePage → InputPage

**Data Transferred:**

```javascript
{
  inputType: "image" | "video";
}
```

**Flow:**

1. User clicks "Image Analysis" or "Video Analysis"
2. Navigate to `/input/:type`
3. Type parameter stored in URL and component state

#### 3.2.2 InputPage → AlgorithmSelectionPage

**Data Transferred:**

```javascript
{
  inputType: "image" | "video",
  fileInfo: {
    name: string,
    size: number,
    type: string,
    url: string (blob URL),
    width: number,
    height: number,
    duration?: number (for video),
    fps?: number (for video),
    resolution: string (e.g., "1920×1080")
  },
  uploadMethod: "file" | "webcam" | "sample"
}
```

**Flow:**

1. User uploads/captures media
2. File validated (size, type, dimensions)
3. Blob URL created for preview
4. Metadata extracted (dimensions, duration, fps)
5. Navigate to `/algorithm-selection` with state
6. Data also stored in `sessionStorage` as backup

**Code Location:** `src/pages/InputPage.jsx`

```javascript
const handleContinue = () => {
  const dataToPass = {
    inputType,
    fileInfo: {
      name: fileInfo.name,
      size: fileInfo.size,
      type: fileInfo.type,
      url: fileInfo.url,
      width: fileInfo.width,
      height: fileInfo.height,
      duration: fileInfo.duration,
      fps: fileInfo.fps,
      resolution: fileInfo.resolution,
    },
    uploadMethod,
  };

  sessionStorage.setItem("inputData", JSON.stringify(dataToPass));
  navigate("/algorithm-selection", { state: dataToPass });
};
```

#### 3.2.3 AlgorithmSelectionPage → Processing

**Data Transferred:**

```javascript
{
  inputType: "image" | "video",
  fileInfo: { /* same as above */ },
  uploadMethod: string,
  selectedAlgorithms: ["coco-ssd", "yolov8", ...],
  detectionSettings: {
    confidenceThreshold: number (0-1),
    nmsThreshold: number (0-1),
    classFilter: "all" | "people" | "vehicles" | "animals"
  }
}
```

**Flow:**

1. User selects algorithms (1-4 algorithms)
2. User configures detection settings
3. Validation: At least one algorithm must be selected
4. Navigate to `/processing` with complete state
5. Data stored in `sessionStorage` as `processingData`

**Code Location:** `src/pages/AlgorithmSelectionPage.jsx`

#### 3.2.4 Processing → Results

**Data Transferred:**

```javascript
{
  inputType: string,
  fileInfo: { /* same as above */ },
  uploadMethod: string,
  selectedAlgorithms: string[],
  detectionSettings: { /* same as above */ },
  algorithmStates: {
    "coco-ssd": {
      status: "completed" | "processing" | "error" | "queued",
      progress: number (0-100),
      stats: {
        processingTime: string,
        objectsDetected: number
      }
    },
    // ... for each algorithm
  },
  detectionResults: {
    "coco-ssd": {
      processingTime: string (e.g., "0.09s"),
      detections: [
        {
          id: number,
          class: string,
          confidence: number (0-1),
          bbox: {
            x: number,
            y: number,
            width: number,
            height: number
          }
        },
        // ... more detections
      ]
    },
    // ... for each algorithm
  },
  timestamp: string (ISO 8601)
}
```

**Flow:**

1. Processing page iterates through selected algorithms
2. Each algorithm processes the image/video
3. Results collected and aggregated
4. Navigate to `/results` with complete results
5. Results stored in `sessionStorage` as `detectionResults`

**Code Location:** `src/pages/Processing.jsx`

---

## 4. Algorithm Implementation

### 4.1 Supported Algorithms

| Algorithm     | Model Type    | Size  | Speed     | Accuracy | Classes |
| ------------- | ------------- | ----- | --------- | -------- | ------- |
| COCO-SSD      | TensorFlow.js | ~12MB | Fast      | Medium   | 80      |
| YOLOv8        | ONNX          | ~6MB  | Very Fast | High     | 80      |
| YOLOv5        | ONNX          | ~15MB | Fast      | High     | 80      |
| MobileNet-SSD | TensorFlow.js | ~8MB  | Very Fast | Medium   | 90      |

### 4.2 Detection Service Architecture

**File:** `src/services/detectionService.js`

```javascript
// Main detection function
export const runDetection = async (algorithmId, imageElement, settings) => {
  const startTime = performance.now();

  // 1. Select appropriate detector
  const detector = getDetector(algorithmId);

  // 2. Load model (cached after first load)
  await detector.load();

  // 3. Preprocess image
  const processedImage = preprocessImage(imageElement);

  // 4. Run inference
  const rawDetections = await detector.detect(processedImage);

  // 5. Post-process results
  const detections = postProcessDetections(
    rawDetections,
    settings.confidenceThreshold,
    settings.nmsThreshold,
    settings.classFilter
  );

  // 6. Calculate metrics
  const endTime = performance.now();
  const processingTime = ((endTime - startTime) / 1000).toFixed(2) + "s";

  return {
    processingTime,
    detections,
  };
};
```

### 4.3 Algorithm-Specific Implementation

#### 4.3.1 COCO-SSD (TensorFlow.js)

**Model Loading:**

```javascript
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let model = null;

const loadModel = async () => {
  if (!model) {
    model = await cocoSsd.load({
      base: "lite_mobilenet_v2", // or 'mobilenet_v1', 'mobilenet_v2'
    });
  }
  return model;
};
```

**Detection Process:**

```javascript
const detect = async (imageElement) => {
  const model = await loadModel();

  // COCO-SSD returns predictions directly
  const predictions = await model.detect(imageElement);

  // Format: [{ bbox: [x, y, width, height], class, score }]
  return predictions.map((pred, index) => ({
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
};
```

**Data Format:**

- Input: HTML Image Element
- Output: Array of detections
- Bbox Format: `[x, y, width, height]` (absolute pixels)
- Confidence: Float (0-1)

#### 4.3.2 YOLOv8 (ONNX)

**Model Loading:**

```javascript
import * as ort from "onnxruntime-web";

let session = null;

const loadModel = async () => {
  if (!session) {
    session = await ort.InferenceSession.create("/models/yolov8n.onnx", {
      executionProviders: ["wasm"],
    });
  }
  return session;
};
```

**Image Preprocessing:**

```javascript
const preprocessImage = (imageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // YOLOv8 expects 640×640 input
  canvas.width = 640;
  canvas.height = 640;

  // Draw and resize image
  ctx.drawImage(imageElement, 0, 0, 640, 640);

  // Get image data
  const imageData = ctx.getImageData(0, 0, 640, 640);
  const pixels = imageData.data;

  // Convert to CHW format (Channels, Height, Width)
  // Normalize to [0, 1]
  const red = [];
  const green = [];
  const blue = [];

  for (let i = 0; i < pixels.length; i += 4) {
    red.push(pixels[i] / 255.0);
    green.push(pixels[i + 1] / 255.0);
    blue.push(pixels[i + 2] / 255.0);
  }

  // Combine into single array [R, G, B]
  const input = Float32Array.from([...red, ...green, ...blue]);

  return new ort.Tensor("float32", input, [1, 3, 640, 640]);
};
```

**Inference:**

```javascript
const detect = async (imageElement) => {
  const session = await loadModel();
  const tensor = preprocessImage(imageElement);

  // Run inference
  const outputs = await session.run({ images: tensor });
  const output = outputs.output0.data;

  // YOLOv8 output format: [batch, 84, 8400]
  // 84 = 4 (bbox) + 80 (classes)
  // 8400 = number of predictions

  return postProcessYOLOv8(output, imageElement);
};
```

**Post-Processing:**

```javascript
const postProcessYOLOv8 = (output, imageElement) => {
  const detections = [];
  const numPredictions = 8400;
  const numClasses = 80;

  // Calculate scale factors
  const scaleX = imageElement.width / 640;
  const scaleY = imageElement.height / 640;

  for (let i = 0; i < numPredictions; i++) {
    // Extract bbox (center_x, center_y, width, height)
    const cx = output[i] * scaleX;
    const cy = output[numPredictions + i] * scaleY;
    const w = output[2 * numPredictions + i] * scaleX;
    const h = output[3 * numPredictions + i] * scaleY;

    // Find class with highest confidence
    let maxConf = 0;
    let classId = 0;

    for (let c = 0; c < numClasses; c++) {
      const conf = output[(4 + c) * numPredictions + i];
      if (conf > maxConf) {
        maxConf = conf;
        classId = c;
      }
    }

    // Filter by confidence threshold
    if (maxConf > 0.5) {
      detections.push({
        id: detections.length,
        class: COCO_CLASSES[classId],
        confidence: maxConf,
        bbox: {
          x: cx - w / 2, // Convert center to top-left
          y: cy - h / 2,
          width: w,
          height: h,
        },
      });
    }
  }

  // Apply Non-Maximum Suppression
  return applyNMS(detections, 0.45);
};
```

**Data Format:**

- Input: Tensor [1, 3, 640, 640]
- Output: Tensor [1, 84, 8400]
- Bbox Format: Center-based → Converted to top-left corner
- Confidence: Per-class scores

#### 4.3.3 Non-Maximum Suppression (NMS)

**Purpose:** Remove overlapping bounding boxes

```javascript
const applyNMS = (detections, iouThreshold) => {
  // Sort by confidence (descending)
  detections.sort((a, b) => b.confidence - a.confidence);

  const keep = [];
  const suppressed = new Set();

  for (let i = 0; i < detections.length; i++) {
    if (suppressed.has(i)) continue;

    keep.push(detections[i]);

    // Compare with remaining boxes
    for (let j = i + 1; j < detections.length; j++) {
      if (suppressed.has(j)) continue;

      const iou = calculateIOU(detections[i].bbox, detections[j].bbox);

      // Suppress if IoU is high and same class
      if (iou > iouThreshold && detections[i].class === detections[j].class) {
        suppressed.add(j);
      }
    }
  }

  return keep;
};

const calculateIOU = (box1, box2) => {
  // Calculate intersection
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);

  // Calculate union
  const box1Area = box1.width * box1.height;
  const box2Area = box2.width * box2.height;
  const unionArea = box1Area + box2Area - intersectionArea;

  // Return IoU
  return intersectionArea / unionArea;
};
```

---

## 5. Detection Process

### 5.1 Processing Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Start Processing                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│  Step 1: Load Image                                          │
│  - Create Image object                                       │
│  - Set crossOrigin for blob URLs                             │
│  - Wait for image.onload                                     │
│  - Store in imageElementRef                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│  Step 2: For Each Selected Algorithm                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  2.1 Update UI State (status: "processing")            │ │
│  │  2.2 Load Model (cached after first time)              │ │
│  │  2.3 Preprocess Image (resize, normalize, format)      │ │
│  │  2.4 Run Inference                                      │ │
│  │  2.5 Post-process Results (NMS, filtering)             │ │
│  │  2.6 Store Results                                      │ │
│  │  2.7 Update UI (status: "completed", show stats)       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│  Step 3: Calculate Overall Progress                          │
│  - Average progress across all algorithms                    │
│  - Update progress bar                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│  Step 4: Complete                                            │
│  - Set isCompleted = true                                    │
│  - Show "View Results" button                                │
│  - Store results in sessionStorage                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│  Step 5: Navigate to Results                                 │
│  - Pass complete results object                              │
│  - Include file URL for visualization                        │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Processing Page Code Flow

**File:** `src/pages/Processing.jsx`

```javascript
const Processing = () => {
  // State management
  const [processingData, setProcessingData] = useState(null);
  const [algorithmStates, setAlgorithmStates] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [detectionResults, setDetectionResults] = useState({});

  const imageElementRef = useRef(null);

  // Initialize processing
  useEffect(() => {
    if (location.state) {
      setProcessingData(location.state);
      initializeProcessing(location.state);
    }
  }, []);

  const initializeProcessing = (data) => {
    // 1. Setup algorithm states
    const algorithms = getAlgorithmsByIds(data.selectedAlgorithms);
    const initialStates = {};

    algorithms.forEach((algo) => {
      initialStates[algo.id] = {
        status: "queued",
        progress: 0,
        stats: {}
      };
    });

    setAlgorithmStates(initialStates);

    // 2. Load image
    loadImage(data.fileInfo.url);

    // 3. Start processing
    setTimeout(() => startProcessing(algorithms, data), 1000);
  };

  const loadImage = (imageUrl) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imageElementRef.current = img;
      addLog("success", "✅ Image loaded successfully");
    };

    img.onerror = () => {
      addLog("error", "❌ Failed to load image");
    };

    img.src = imageUrl;
  };

  const startProcessing = async (algorithms, data) => {
    // Process each algorithm sequentially
    for (let i = 0; i < algorithms.length; i++) {
      const algo = algorithms[i];

      addLog("info", `⚡ Starting ${algo.name}...`);

      updateAlgorithmState(algo.id, {
        status: "processing",
        progress: 0
      });

      try {
        // Wait for image to be loaded
        while (!imageElementRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Run detection
        const result = await runDetection(
          algo.id,
          imageElementRef.current,
          {
            confidenceThreshold: data.detectionSettings?.confidenceThreshold || 0.5,
            nmsThreshold: data.detectionSettings?.nmsThreshold || 0.45,
            onProgress: (progressData) => {
              // Update progress during detection
              updateAlgorithmState(algo.id, {
                status: "processing",
                progress: progressData.progress || 50
              });
            }
          }
        );

        // Store results
        setDetectionResults(prev => ({
          ...prev,
          [algo.id]: result
        }));

        // Update state
        updateAlgorithmState(algo.id, {
          status: "completed",
          progress: 100,
          stats: {
            processingTime: result.processingTime,
            objectsDetected: result.detections.length
          }
        });

        addLog("success", `✅ ${algo.name} completed`);

      } catch (error) {
        console.error(`Error with ${algo.name}:`, error);

        updateAlgorithmState(algo.id, {
          status: "error",
          progress: 0,
          stats: {}
        });

        addLog("error", `❌ ${algo.name} failed: ${error.message}`);
      }
    }

    // All done
    setIsCompleted(true);
    addLog("success", "🎉 All algorithms completed!");
  };

  // Calculate overall progress
  useEffect(() => {
    if (Object.keys(algorithmStates).length === 0) return;

    const total = Object.values(algorithmStates)
      .reduce((sum, state) => sum + state.progress, 0);

    const avg = Math.floor(total / Object.keys(algorithmStates).length);

    setOverallProgress(avg);
  }, [algorithmStates]);

  return (
    // UI rendering...
  );
};
```

### 5.3 Progress Tracking

**Progress States:**

```javascript
{
  "coco-ssd": {
    status: "queued",      // → "processing" → "completed"/"error"
    progress: 0,           // 0-100
    stats: {
      processingTime: "0.09s",
      objectsDetected: 12
    }
  }
}
```

**Overall Progress Calculation:**

```javascript
overallProgress = (
  sum of all algorithm progress values
) / (
  number of algorithms
)
```

**Example:**

- COCO-SSD: 100% (completed)
- YOLOv8: 50% (processing)
- Overall: (100 + 50) / 2 = 75%

---

## 6. Data Comparison

### 6.1 Comparison Architecture

```
Results Data
     ↓
┌─────────────────────────────────────┐
│  Extract Metrics for Each Algorithm │
│  - Processing Time                  │
│  - Objects Detected                 │
│  - Average Confidence               │
│  - Model Size                       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Calculate Comparative Metrics      │
│  - Speed Ranking                    │
│  - Detection Count Ranking          │
│  - Confidence Ranking               │
│  - Overall Score                    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Analyze Detection Overlap          │
│  - Common Detections                │
│  - Unique Detections                │
│  - Partial Agreement                │
│  - Agreement Rate                   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  Generate Insights & Recommendations│
└─────────────────────────────────────┘
```

### 6.2 Metrics Extraction

**File:** `src/pages/Comparison.jsx`

```javascript
const generateComparisonData = () => {
  const speed = {};
  const detections = {};
  const confidence = {};

  algorithms.forEach((algo) => {
    const algoResults = results.detectionResults?.[algo.id];

    if (algoResults) {
      // Extract processing time (convert to ms)
      const timeString = algoResults.processingTime || "0s";
      const timeMs = parseFloat(timeString) * 1000;
      speed[algo.id] = Math.round(timeMs);

      // Count detections
      detections[algo.id] = algoResults.detections?.length || 0;

      // Calculate average confidence
      if (algoResults.detections && algoResults.detections.length > 0) {
        const avgConf =
          algoResults.detections.reduce((sum, det) => sum + det.confidence, 0) /
          algoResults.detections.length;

        confidence[algo.id] = Math.round(avgConf * 100);
      } else {
        confidence[algo.id] = 0;
      }
    }
  });

  return { speed, detections, confidence };
};
```

**Example Output:**

```javascript
{
  speed: {
    "coco-ssd": 90,    // ms
    "yolov8": 45       // ms
  },
  detections: {
    "coco-ssd": 12,    // count
    "yolov8": 15       // count
  },
  confidence: {
    "coco-ssd": 66,    // percentage
    "yolov8": 71       // percentage
  }
}
```

### 6.3 Detection Overlap Analysis

**Purpose:** Identify which objects were detected by all, some, or only one algorithm.

```javascript
const analyzeOverlap = () => {
  // 1. Collect all unique classes
  const allClasses = new Set();
  Object.values(detections).forEach((dets) => {
    dets.forEach((det) => allClasses.add(det.class));
  });

  const allDetected = []; // Detected by ALL algorithms
  const partialDetected = []; // Detected by SOME algorithms
  const uniqueDetections = {}; // Unique to each algorithm

  // 2. Analyze each class
  allClasses.forEach((className) => {
    const detectedBy = [];
    const confidences = {};

    // Check which algorithms detected this class
    algorithms.forEach((algo) => {
      const algoDetections = detections[algo.id] || [];
      const hasClass = algoDetections.some((det) => det.class === className);

      if (hasClass) {
        detectedBy.push(algo.name);

        // Calculate average confidence for this class
        const classDetections = algoDetections.filter((det) => det.class === className);
        const avgConf =
          classDetections.reduce((sum, det) => sum + det.confidence, 0) / classDetections.length;

        confidences[algo.name] = avgConf;
      }
    });

    // 3. Categorize
    if (detectedBy.length === algorithms.length) {
      // All algorithms detected it
      allDetected.push({
        class: className,
        algorithms: algorithms.map((a) => ({
          name: a.name,
          confidence: confidences[a.name] || 0,
        })),
      });
    } else if (detectedBy.length > 0) {
      // Only some detected it
      const missedBy = algorithms.filter((a) => !detectedBy.includes(a.name)).map((a) => a.name);

      partialDetected.push({
        class: className,
        detectedBy,
        missedBy,
      });

      // Count as unique for those who detected it
      detectedBy.forEach((algoName) => {
        const algo = algorithms.find((a) => a.name === algoName);
        if (algo && missedBy.length > 0) {
          uniqueDetections[algo.id]++;
        }
      });
    }
  });

  // 4. Calculate agreement rate
  const agreementRate = allClasses.size > 0 ? ((allDetected.length / allClasses.size) * 100).toFixed(0) : 0;

  return {
    allDetected,
    partialDetected,
    uniqueDetections,
    agreementRate,
  };
};
```

**Example Output:**

```javascript
{
  allDetected: [
    {
      class: "car",
      algorithms: [
        { name: "COCO-SSD", confidence: 0.85 },
        { name: "YOLOv8", confidence: 0.92 }
      ]
    }
  ],
  partialDetected: [
    {
      class: "bus",
      detectedBy: ["YOLOv8"],
      missedBy: ["COCO-SSD"]
    }
  ],
  uniqueDetections: {
    "coco-ssd": 2,
    "yolov8": 5
  },
  agreementRate: 50  // percentage
}
```

### 6.4 Performance Ranking

```javascript
const getRecommendation = (data) => {
  const { speed, detections, confidence } = data;

  // Find winners for each metric
  const fastest = Object.entries(speed).reduce((min, curr) => (curr[1] < min[1] ? curr : min))[0];

  const mostDetections = Object.entries(detections).reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];

  const highestConfidence = Object.entries(confidence).reduce((max, curr) =>
    curr[1] > max[1] ? curr : max
  )[0];

  // Calculate overall scores
  const scores = algorithms.map((algo) => {
    let score = 0;
    let strengths = [];

    if (algo.id === fastest) {
      score += 3;
      strengths.push("Fastest processing");
    }

    if (algo.id === mostDetections) {
      score += 2;
      strengths.push("Most detections");
    }

    if (algo.id === highestConfidence) {
      score += 2;
      strengths.push("Highest confidence");
    }

    return { algo, score, strengths };
  });

  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);

  return scores;
};
```

**Scoring System:**

- Fastest: +3 points
- Most detections: +2 points
- Highest confidence: +2 points
- **Maximum possible: 7 points**

**Example:**

```javascript
[
  {
    algo: { id: "yolov8", name: "YOLOv8" },
    score: 7,
    strengths: ["Fastest processing", "Most detections", "Highest confidence"],
  },
  {
    algo: { id: "coco-ssd", name: "COCO-SSD" },
    score: 0,
    strengths: [],
  },
];
```

---

## 7. Statistical Analysis

### 7.1 Statistics Page Data

**File:** `src/pages/Statistics.jsx`

```javascript
const calculateStats = () => {
  if (realDetections.length === 0) {
    return {
      totalDetections: 0,
      avgConfidence: "N/A",
      uniqueClasses: 0,
      processingTime: "N/A",
    };
  }

  // Average confidence
  const avgConfidence = realDetections.reduce((sum, d) => sum + d.confidence, 0) / realDetections.length;

  // Unique classes
  const uniqueClasses = new Set(realDetections.map((d) => d.class)).size;

  // Processing time from results
  const processingTime = results?.detectionResults?.[currentAlgorithmId]?.processingTime || "N/A";

  return {
    totalDetections: realDetections.length,
    avgConfidence: (avgConfidence * 100).toFixed(0) + "%",
    uniqueClasses,
    processingTime,
  };
};
```

### 7.2 Chart Data Generation

#### 7.2.1 Confidence Distribution

```javascript
const confidenceChartData = realDetections.map((det, index) => ({
  name: `${det.class} ${index + 1}`,
  confidence: Math.round(det.confidence * 100),
  fill: det.color,
}));
```

#### 7.2.2 Class Distribution

```javascript
// Count occurrences of each class
const classCounts = realDetections.reduce((acc, det) => {
  acc[det.class] = (acc[det.class] || 0) + 1;
  return acc;
}, {});

// Convert to chart format
const classDistributionData = Object.entries(classCounts).map(([className, count]) => ({
  name: className,
  count: count,
  percentage: ((count / realDetections.length) * 100).toFixed(1),
}));
```

#### 7.2.3 Size Distribution

```javascript
const sizeDistributionData = realDetections.map((det, index) => ({
  name: `${det.class} ${index + 1}`,
  size: Math.round(det.width * det.height),
  fill: det.color,
}));
```

#### 7.2.4 Spatial Distribution

```javascript
// Create 3×3 grid
const spatialGrid = Array(3)
  .fill(0)
  .map(() =>
    Array(3)
      .fill(0)
      .map(() => [])
  );

const imgWidth = results.fileInfo?.width || 640;
const imgHeight = results.fileInfo?.height || 480;
const cellWidth = imgWidth / 3;
const cellHeight = imgHeight / 3;

// Place each detection in appropriate cell
realDetections.forEach((det) => {
  const centerX = det.x + det.width / 2;
  const centerY = det.y + det.height / 2;

  const col = Math.min(Math.max(Math.floor(centerX / cellWidth), 0), 2);
  const row = Math.min(Math.max(Math.floor(centerY / cellHeight), 0), 2);

  spatialGrid[row][col].push({
    class: det.class,
    id: det.id,
  });
});
```

**Grid Layout:**

```
┌─────────┬─────────┬─────────┐
│ Top L   │ Top M   │ Top R   │
│ [0,0]   │ [0,1]   │ [0,2]   │
├─────────┼─────────┼─────────┤
│ Mid L   │ Mid M   │ Mid R   │
│ [1,0]   │ [1,1]   │ [1,2]   │
├─────────┼─────────┼─────────┤
│ Bot L   │ Bot M   │ Bot R   │
│ [2,0]   │ [2,1]   │ [2,2]   │
└─────────┴─────────┴─────────┘
```

### 7.3 Scatter Plot Data

```javascript
const scatterData = realDetections.map((det) => ({
  x: det.x + det.width / 2, // Center X
  y: det.y + det.height / 2, // Center Y
  z: det.width * det.height, // Size (for bubble)
  class: det.class,
  confidence: Math.round(det.confidence * 100),
}));
```

### 7.4 Export Functions

#### 7.4.1 JSON Export

```javascript
const handleExportJSON = () => {
  const exportData = {
    algorithm: algorithm.name,
    timestamp: new Date().toISOString(),
    fileInfo: results.fileInfo,
    detections: realDetections,
    stats: calculateStats(),
  };

  exportAsJSON(exportData, `${algorithm.id}_statistics.json`);
};
```

#### 7.4.2 CSV Export

```javascript
const handleExportCSV = () => {
  const csvData = realDetections.map((d, index) => ({
    ID: d.id || index + 1,
    Class: d.class,
    Confidence: (d.confidence * 100).toFixed(2) + "%",
    "Box X": Math.round(d.x),
    "Box Y": Math.round(d.y),
    "Box Width": Math.round(d.width),
    "Box Height": Math.round(d.height),
    Size: Math.round(d.width * d.height) + "px",
  }));

  exportAsCSV(csvData, `${algorithm.id}_detections.csv`);
};
```

#### 7.4.3 Image Download

```javascript
const handleDownloadImage = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.crossOrigin = "anonymous";

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw each detection
    realDetections.forEach((det) => {
      const { x, y, width, height, color, class: className, confidence } = det;

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.strokeRect(x, y, width, height);

      // Draw filled background
      ctx.fillStyle = color + "25";
      ctx.fillRect(x, y, width, height);

      // Draw label
      const label = `${className} ${(confidence * 100).toFixed(0)}%`;
      ctx.font = "bold 18px Arial";

      const textMetrics = ctx.measureText(label);
      const padding = 10;

      let labelX = x;
      let labelY = y - 28;
      if (labelY < 0) labelY = y + 5;

      // Label background
      ctx.fillStyle = color;
      ctx.fillRect(labelX, labelY, textMetrics.width + padding * 2, 28);

      // Label text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, labelX + padding, labelY + 5);
    });

    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${algorithm.id}_detections_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  img.src = results.fileInfo.url;
};
```

---

## 8. File Structure

```
src/
├── main.jsx                          # Entry point
├── App.jsx                           # Main app component
├── index.css                         # Global styles
│
├── pages/                            # Page components
│   ├── HomePage.jsx                  # Landing page
│   ├── InputPage.jsx                 # File upload/capture
│   ├── AlgorithmSelectionPage.jsx    # Algorithm selection
│   ├── Processing.jsx                # Detection processing
│   ├── Results.jsx                   # Results display
│   ├── Statistics.jsx                # Detailed statistics
│   └── Comparison.jsx                # Algorithm comparison
│
├── components/                       # Reusable components
│   ├── common/
│   │   └── BottomNav.jsx            # Navigation bar
│   │
│   ├── input/
│   │   ├── FileUpload.jsx           # File upload component
│   │   ├── WebcamCapture.jsx        # Webcam capture
│   │   └── MediaPreview.jsx         # Media preview
│   │
│   ├── algorithm/
│   │   ├── AlgorithmCard.jsx        # Algorithm selection card
│   │   └── DetectionSettings.jsx    # Settings configuration
│   │
│   ├── results/
│   │   ├── DetectionCanvas.jsx      # Canvas for image detection
│   │   ├── VideoPlayer.jsx          # Video player with detections
│   │   ├── QuickStats.jsx           # Quick statistics cards
│   │   ├── ViewControls.jsx         # View options controls
│   │   └── DetectionList.jsx        # List of detections
│   │
│   └── comparison/
│       ├── PerformanceTable.jsx     # Performance comparison table
│       ├── ComparisonCharts.jsx     # Comparison charts
│       ├── DetectionOverlap.jsx     # Overlap analysis
│       └── InsightsPanel.jsx        # Insights and recommendations
│
├── services/
│   └── detectionService.js          # Detection logic
│
├── utils/
│   ├── navigation.js                # Navigation utilities
│   └── dataExport.js                # Export utilities
│
└── constants/
    └── algorithms.js                # Algorithm definitions
```

---

## 9. Component Details

### 9.1 Detection Canvas Component

**File:** `src/components/results/DetectionCanvas.jsx`

**Purpose:** Display image with drawn bounding boxes

**Props:**

```javascript
{
  imageUrl: string,           // Blob URL of image
  detections: Array<{         // Array of detections
    id: number,
    class: string,
    confidence: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  }>,
  showLabels: boolean,        // Show class labels
  showConfidence: boolean     // Show confidence scores
}
```

**Implementation:**

```javascript
const DetectionCanvas = ({ imageUrl, detections, showLabels, showConfidence }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Draw detections
      detections.forEach((det) => {
        // Draw bounding box
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(det.x, det.y, det.width, det.height);

        // Draw semi-transparent fill
        ctx.fillStyle = det.color + "20";
        ctx.fillRect(det.x, det.y, det.width, det.height);

        // Draw label
        if (showLabels) {
          let label = det.class;
          if (showConfidence) {
            label += ` ${(det.confidence * 100).toFixed(0)}%`;
          }

          ctx.font = "bold 14px Arial";
          const textMetrics = ctx.measureText(label);
          const padding = 6;

          let labelX = det.x;
          let labelY = det.y - 22;
          if (labelY < 0) labelY = det.y + 5;

          // Label background
          ctx.fillStyle = det.color;
          ctx.fillRect(labelX, labelY, textMetrics.width + padding * 2, 22);

          // Label text
          ctx.fillStyle = "#ffffff";
          ctx.fillText(label, labelX + padding, labelY + 16);
        }
      });
    };

    img.src = imageUrl;
  }, [imageUrl, detections, showLabels, showConfidence]);

  return <canvas ref={canvasRef} className="w-full h-auto" />;
};
```

### 9.2 Quick Stats Component

**File:** `src/components/results/QuickStats.jsx`

**Props:**

```javascript
{
  stats: {
    objectsDetected: number,
    processingTime: string,
    avgConfidence: string,
    classesFound: number
  }
}
```

**Displays:**

- Objects Detected: Total count
- Processing Time: Time taken (e.g., "0.09s")
- Avg Confidence: Average confidence percentage
- Classes Found: Number of unique classes

### 9.3 View Controls Component

**File:** `src/components/results/ViewControls.jsx`

**Controls:**

- Show Labels (toggle)
- Show Confidence (toggle)
- Show Bounding Boxes (toggle)

**State Management:**

```javascript
const [settings, setSettings] = useState({
  showLabels: true,
  showConfidence: true,
  showBoxes: true,
});

const handleToggle = (key) => {
  setSettings((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};
```

---

## 10. API Reference

### 10.1 Detection Service API

**File:** `src/services/detectionService.js`

#### Function: `runDetection`

**Signature:**

```javascript
async runDetection(
  algorithmId: string,
  imageElement: HTMLImageElement,
  settings: {
    confidenceThreshold: number,
    nmsThreshold: number,
    classFilter: string,
    onProgress?: (data: ProgressData) => void
  }
): Promise<DetectionResult>
```

**Parameters:**

- `algorithmId`: One of `"coco-ssd"`, `"yolov8"`, `"yolov5"`, `"mobilenet-ssd"`
- `imageElement`: HTML Image element containing the image to analyze
- `settings`:
  - `confidenceThreshold`: Minimum confidence (0-1) to include detection
  - `nmsThreshold`: IoU threshold for NMS (0-1)
  - `classFilter`: `"all"` | `"people"` | `"vehicles"` | `"animals"`
  - `onProgress`: Optional callback for progress updates

**Returns:**

```javascript
{
  processingTime: string,  // e.g., "0.09s"
  detections: Array<{
    id: number,
    class: string,
    confidence: number,  // 0-1
    bbox: {
      x: number,
      y: number,
      width: number,
      height: number
    }
  }>
}
```

**Example Usage:**

```javascript
const result = await runDetection("yolov8", imageElement, {
  confidenceThreshold: 0.5,
  nmsThreshold: 0.45,
  classFilter: "all",
  onProgress: (data) => {
    console.log(`Progress: ${data.progress}%`);
  },
});

console.log(`Found ${result.detections.length} objects`);
console.log(`Took ${result.processingTime}`);
```

### 10.2 Navigation Utilities

**File:** `src/utils/navigation.js`

#### Function: `navigateToResults`

```javascript
navigateToResults(navigate, results);
```

Navigates to results page with detection results.

#### Function: `navigateToStatistics`

```javascript
navigateToStatistics(navigate, algorithmId, results);
```

Navigates to statistics page for specific algorithm.

#### Function: `navigateToComparison`

```javascript
navigateToComparison(navigate, results);
```

Navigates to comparison page.

### 10.3 Export Utilities

**File:** `src/utils/dataExport.js`

#### Function: `exportAsJSON`

```javascript
exportAsJSON(data: object, filename: string): void
```

Downloads data as JSON file.

#### Function: `exportAsCSV`

```javascript
exportAsCSV(data: Array<object>, filename: string): void
```

Converts array of objects to CSV and downloads.

---

## Appendix A: COCO Classes

**80 Classes supported by COCO-SSD, YOLOv8, and YOLOv5:**

```javascript
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
```

---

## Appendix B: Data Storage

### SessionStorage Keys

| Key                | Description                | Data Type |
| ------------------ | -------------------------- | --------- |
| `inputData`        | Input file information     | Object    |
| `processingData`   | Processing configuration   | Object    |
| `detectionResults` | Complete detection results | Object    |

### Sample SessionStorage Data

```javascript
// inputData
{
  "inputType": "image",
  "fileInfo": {
    "name": "sample.jpg",
    "size": 1048576,
    "type": "image/jpeg",
    "url": "blob:http://localhost:5173/...",
    "width": 1920,
    "height": 1080,
    "resolution": "1920×1080"
  },
  "uploadMethod": "file"
}

// processingData
{
  "inputType": "image",
  "fileInfo": { /* ... */ },
  "selectedAlgorithms": ["coco-ssd", "yolov8"],
  "detectionSettings": {
    "confidenceThreshold": 0.5,
    "nmsThreshold": 0.45,
    "classFilter": "all"
  }
}

// detectionResults
{
  "inputType": "image",
  "fileInfo": { /* ... */ },
  "selectedAlgorithms": ["coco-ssd", "yolov8"],
  "detectionSettings": { /* ... */ },
  "algorithmStates": {
    "coco-ssd": {
      "status": "completed",
      "progress": 100,
      "stats": {
        "processingTime": "0.09s",
        "objectsDetected": 12
      }
    }
  },
  "detectionResults": {
    "coco-ssd": {
      "processingTime": "0.09s",
      "detections": [
        {
          "id": 0,
          "class": "car",
          "confidence": 0.85,
          "bbox": {
            "x": 100,
            "y": 200,
            "width": 150,
            "height": 100
          }
        }
      ]
    }
  },
  "timestamp": "2025-01-04T12:00:00.000Z"
}
```

---

## Appendix C: Performance Benchmarks

### Average Processing Times (640×640 image)

| Algorithm     | Model Size | Load Time | Inference Time | Total Time |
| ------------- | ---------- | --------- | -------------- | ---------- |
| COCO-SSD      | ~12MB      | ~2s       | ~90ms          | ~2.09s     |
| YOLOv8        | ~6MB       | ~1s       | ~45ms          | ~1.05s     |
| YOLOv5        | ~15MB      | ~3s       | ~60ms          | ~3.06s     |
| MobileNet-SSD | ~8MB       | ~1.5s     | ~70ms          | ~1.57s     |

**Note:** Times vary based on:

- Device hardware (CPU/GPU)
- Browser (Chrome, Firefox, Safari)
- Image complexity
- Number of objects

---

## Appendix D: Browser Compatibility

### Supported Browsers

| Browser | Version | Support         |
| ------- | ------- | --------------- |
| Chrome  | 90+     | ✅ Full         |
| Firefox | 88+     | ✅ Full         |
| Safari  | 14+     | ⚠️ Limited ONNX |
| Edge    | 90+     | ✅ Full         |

### Known Issues

1. **Safari**: ONNX Runtime has limited WebAssembly support
2. **Mobile Browsers**: Performance may be slower
3. **Firefox**: May require CORS headers for blob URLs

---

## Appendix E: Troubleshooting

### Common Issues

#### 1. Model Loading Fails

**Symptom:** "Failed to load model" error

**Solution:**

- Check network connection
- Verify model files in `/public/models/`
- Clear browser cache

#### 2. Image Not Displaying

**Symptom:** Blank canvas or "No image" error

**Solution:**

- Check blob URL is valid
- Verify image dimensions
- Check CORS settings

#### 3. Low Detection Count

**Symptom:** Fewer objects detected than expected

**Solution:**

- Lower confidence threshold
- Check image quality
- Verify objects are in COCO classes

#### 4. Slow Processing

**Symptom:** Processing takes too long

**Solution:**

- Close other browser tabs
- Use smaller images (resize to 640×640)
- Select fewer algorithms

---

## Appendix F: Future Enhancements

### Planned Features

1. **Video Support**

   - Frame-by-frame processing
   - Object tracking across frames
   - Video export with annotations

2. **Additional Algorithms**

   - Faster R-CNN
   - EfficientDet
   - Custom trained models

3. **Advanced Analytics**

   - Heatmaps
   - Temporal analysis
   - Custom metrics

4. **Export Options**

   - PDF reports
   - Excel spreadsheets
   - Annotated videos

5. **Cloud Integration**
   - Save results to cloud
   - Share comparisons
   - Collaborative analysis

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Author:** Sarwar Morshad
