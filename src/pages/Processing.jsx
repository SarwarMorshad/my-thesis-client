// src/pages/Processing.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateToResults, navigateBack } from "../utils/navigation";
import { getAlgorithmsByIds } from "../constants/algorithms";
import { runDetection } from "../services/detectionService";
import AlgorithmProgress from "../components/processing/AlgorithmProgress";
import ProcessingStats from "../components/processing/ProcessingStats";
import ProcessingLog from "../components/processing/ProcessingLog";

const Processing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processingData, setProcessingData] = useState(null);
  const [algorithmStates, setAlgorithmStates] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [detectionResults, setDetectionResults] = useState({});
  const pausedRef = useRef(false);
  const imageElementRef = useRef(null);

  // Load processing data
  useEffect(() => {
    if (location.state) {
      setProcessingData(location.state);
      initializeProcessing(location.state);
    } else {
      const data = sessionStorage.getItem("processingData");
      if (data) {
        const parsed = JSON.parse(data);
        setProcessingData(parsed);
        initializeProcessing(parsed);
      } else {
        navigateBack(navigate, "/algorithm-selection");
      }
    }
  }, [navigate, location.state]);

  // Update pausedRef when isPaused changes
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Initialize processing
  const initializeProcessing = (data) => {
    const algorithms = getAlgorithmsByIds(data.selectedAlgorithms);
    const initialStates = {};

    algorithms.forEach((algo) => {
      initialStates[algo.id] = {
        status: "queued",
        progress: 0,
        stats: {},
      };
    });

    setAlgorithmStates(initialStates);
    addLog("info", "Initialization complete");
    addLog("info", `Processing ${data.fileInfo.name} with ${algorithms.length} algorithm(s)`);

    // Load image into memory
    loadImage(data.fileInfo.url);

    // Start processing
    setTimeout(() => startProcessing(algorithms, data), 1000);
  };

  // Load image element
  const loadImage = (imageUrl) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      addLog("success", "Image loaded successfully");
    };
    img.onerror = () => {
      addLog("error", "Failed to load image");
    };
    img.src = imageUrl;
  };

  // Add log entry
  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { type, message, timestamp }]);
  };

  // Start real processing
  const startProcessing = async (algorithms, data) => {
    const isVideo = data.inputType === "video";

    for (let i = 0; i < algorithms.length; i++) {
      // Check if paused
      while (pausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const algo = algorithms[i];
      addLog("info", `Starting ${algo.name}...`);
      addLog("info", `Loading ${algo.name} model...`);

      // Update to processing
      updateAlgorithmState(algo.id, { status: "processing", progress: 0 });

      try {
        // Wait for image to load
        while (!imageElementRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Run real detection
        const result = await runDetection(algo.id, imageElementRef.current, {
          confidenceThreshold: data.detectionSettings?.confidenceThreshold || 0.5,
          nmsThreshold: data.detectionSettings?.nmsThreshold || 0.45,
          onProgress: (progressData) => {
            // Update progress based on detection status
            let progress = 0;
            if (progressData.status === "loading") {
              progress = 20;
              addLog("info", progressData.message);
            } else if (progressData.status === "preprocessing") {
              progress = 40;
            } else if (progressData.status === "detecting") {
              progress = 70;
            } else if (progressData.status === "complete") {
              progress = 100;
            } else if (progressData.status === "error") {
              addLog("error", progressData.message);
            }

            updateAlgorithmState(algo.id, {
              status: "processing",
              progress: progress,
              stats: {
                speed: "...",
              },
            });
          },
        });

        // Store detection results
        setDetectionResults((prev) => ({
          ...prev,
          [algo.id]: result,
        }));

        // Mark as completed
        updateAlgorithmState(algo.id, {
          status: "completed",
          progress: 100,
          stats: {
            processingTime: result.processingTime,
            objectsDetected: result.detections.length,
          },
        });

        addLog("success", `${algo.name} completed in ${result.processingTime}`);
        addLog("success", `Detected ${result.detections.length} objects`);
      } catch (error) {
        console.error(`Error processing with ${algo.name}:`, error);
        addLog("error", `${algo.name} failed: ${error.message}`);

        updateAlgorithmState(algo.id, {
          status: "error",
          progress: 0,
          stats: {},
        });
      }
    }

    // All completed
    setIsCompleted(true);
    addLog("success", "All algorithms completed successfully!");
  };

  // Update algorithm state
  const updateAlgorithmState = (algoId, updates) => {
    setAlgorithmStates((prev) => ({
      ...prev,
      [algoId]: {
        ...prev[algoId],
        ...updates,
      },
    }));
  };

  // Calculate overall progress
  useEffect(() => {
    if (Object.keys(algorithmStates).length === 0) return;

    const total = Object.values(algorithmStates).reduce((sum, state) => sum + state.progress, 0);
    const avg = Math.floor(total / Object.keys(algorithmStates).length);
    setOverallProgress(avg);
  }, [algorithmStates]);

  // Handle pause/resume
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    addLog("info", isPaused ? "Processing resumed" : "Processing paused");
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel processing?")) {
      addLog("warning", "Processing cancelled by user");
      setTimeout(() => navigateBack(navigate), 1000);
    }
  };

  // Handle view results
  const handleViewResults = () => {
    // Combine processing data with detection results
    const results = {
      ...processingData,
      algorithmStates,
      detectionResults, // Real detection results
      timestamp: new Date().toISOString(),
    };

    try {
      // Store results without URL
      const resultsForStorage = {
        ...results,
        fileInfo: {
          ...results.fileInfo,
          url: undefined,
        },
      };
      sessionStorage.setItem("detectionResults", JSON.stringify(resultsForStorage));
    } catch (error) {
      console.warn("Could not store results:", error.message);
    }

    // Navigate with full data including URL
    navigate("/results", {
      state: {
        ...results,
        fileInfo: {
          ...processingData.fileInfo,
          url: processingData.fileInfo.url,
        },
      },
    });
  };

  if (!processingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const algorithms = getAlgorithmsByIds(processingData.selectedAlgorithms);
  const stats = {
    completed: Object.values(algorithmStates).filter((s) => s.status === "completed").length,
    processing: Object.values(algorithmStates).filter((s) => s.status === "processing").length,
    queued: Object.values(algorithmStates).filter((s) => s.status === "queued").length,
    estimatedTimeRemaining: isCompleted ? null : "Calculating...",
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">⏳ Processing</h1>
          </div>
          <div className="text-sm text-gray-400">
            File: <span className="text-white font-medium">{processingData.fileInfo.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overall Progress Stats */}
        <div className="mb-8">
          <ProcessingStats overallProgress={overallProgress} stats={stats} />
        </div>

        {/* Info Message */}
        {!isCompleted && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
            <p className="text-blue-200 text-sm flex items-center gap-2">
              <span>💡</span>
              Real object detection in progress. First run may take longer as models are downloaded.
            </p>
          </div>
        )}

        {/* Paused Message */}
        {isPaused && !isCompleted && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <p className="text-yellow-200 text-sm flex items-center gap-2">
              <span>⏸️</span>
              Processing is paused. Click Resume to continue.
            </p>
          </div>
        )}

        {/* Success Message */}
        {isCompleted && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8">
            <p className="text-green-200 text-sm flex items-center gap-2">
              <span>✓</span>
              Processing completed successfully! View your results below.
            </p>
          </div>
        )}

        {/* Algorithm Progress Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {algorithms.map((algo) => (
            <AlgorithmProgress
              key={algo.id}
              algorithm={algo}
              status={algorithmStates[algo.id]?.status}
              progress={algorithmStates[algo.id]?.progress || 0}
              stats={algorithmStates[algo.id]?.stats}
            />
          ))}
        </div>

        {/* Processing Log */}
        <div className="mb-8">
          <ProcessingLog logs={logs} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {!isCompleted ? (
            <>
              <button
                onClick={handlePauseResume}
                disabled={true} // Disable pause for now (hard to implement with async)
                className="px-6 py-3 bg-gray-600 text-gray-400 cursor-not-allowed font-medium rounded-xl transition"
              >
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition"
              >
                ❌ Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleViewResults}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition flex items-center gap-2"
            >
              View Results
              <span>→</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Processing;
