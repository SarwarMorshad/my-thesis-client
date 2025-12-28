// src/constants/algorithms.js

export const algorithms = [
  {
    id: "yolov8",
    name: "YOLOv8",
    version: "Ultralytics",
    badge: "Fast",
    description: "Latest version with state-of-the-art accuracy and performance",
    bestFor: "General object detection with high accuracy",
    color: "#10b981", // green
    specs: {
      modelSize: "6 MB",
      speed: "~45ms/image",
      fps: "20 FPS",
      classes: "80 (COCO)",
      accuracy: "mAP 53.9%",
      parameters: "3.2M",
    },
    features: ["Highest accuracy", "Fast inference", "Latest architecture", "Good for small objects"],
    modelPath: "/models/yolov8n.onnx",
    framework: "ONNX",
  },
  {
    id: "coco-ssd",
    name: "COCO-SSD",
    version: "TensorFlow.js",
    badge: "Light",
    description: "Lightweight and browser-optimized for web applications",
    bestFor: "Real-time web applications and mobile devices",
    color: "#3b82f6", // blue
    specs: {
      modelSize: "2.5 MB",
      speed: "~78ms/image",
      fps: "12 FPS",
      classes: "90 (COCO)",
      accuracy: "mAP 24%",
      parameters: "1.8M",
    },
    features: ["Smallest model size", "Browser-optimized", "Easy integration", "Low memory usage"],
    modelPath: "/models/coco-ssd",
    framework: "TensorFlow.js",
  },
  {
    id: "yolov5",
    name: "YOLOv5",
    version: "Ultralytics",
    badge: "Balanced",
    description: "Proven performance with wide adoption in production",
    bestFor: "Production deployments requiring stability",
    color: "#f59e0b", // orange
    specs: {
      modelSize: "7 MB",
      speed: "~52ms/image",
      fps: "18 FPS",
      classes: "80 (COCO)",
      accuracy: "mAP 50.7%",
      parameters: "7.2M",
    },
    features: ["Proven stability", "Good accuracy", "Wide community", "Production-ready"],
    modelPath: "/models/yolov5n.onnx",
    framework: "ONNX",
  },
  {
    id: "mobilenet-ssd",
    name: "MobileNet SSD",
    version: "TensorFlow",
    badge: "Mobile",
    description: "Optimized for mobile and edge devices",
    bestFor: "Resource-constrained environments",
    color: "#8b5cf6", // purple
    specs: {
      modelSize: "4.3 MB",
      speed: "~65ms/image",
      fps: "15 FPS",
      classes: "90 (COCO)",
      accuracy: "mAP 21%",
      parameters: "5.5M",
    },
    features: ["Mobile-optimized", "Low power consumption", "Edge-friendly", "Fast on mobile"],
    modelPath: "/models/mobilenet-ssd",
    framework: "TensorFlow.js",
  },
];

export const getAlgorithmById = (id) => {
  return algorithms.find((algo) => algo.id === id);
};

export const getAlgorithmsByIds = (ids) => {
  return algorithms.filter((algo) => ids.includes(algo.id));
};
