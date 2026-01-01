// src/pages/Processing.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateToResults, navigateBack } from "../utils/navigation";
import { getAlgorithmsByIds } from "../constants/algorithms";
import { runDetection } from "../services/detectionService";

const Processing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processingData, setProcessingData] = useState(null);
  const [algorithmStates, setAlgorithmStates] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [detectionResults, setDetectionResults] = useState({});
  const imageElementRef = useRef(null);
  const logsEndRef = useRef(null);

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

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

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
    addLog("info", "🚀 Initialization complete");
    addLog("info", `📁 Processing ${data.fileInfo.name} with ${algorithms.length} algorithm(s)`);

    loadImage(data.fileInfo.url);
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

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { type, message, timestamp }]);
  };

  const startProcessing = async (algorithms, data) => {
    for (let i = 0; i < algorithms.length; i++) {
      const algo = algorithms[i];
      addLog("info", `⚡ Starting ${algo.name}...`);
      addLog("info", `📥 Loading ${algo.name} model...`);

      updateAlgorithmState(algo.id, { status: "processing", progress: 0 });

      try {
        while (!imageElementRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const result = await runDetection(algo.id, imageElementRef.current, {
          confidenceThreshold: data.detectionSettings?.confidenceThreshold || 0.5,
          nmsThreshold: data.detectionSettings?.nmsThreshold || 0.45,
          onProgress: (progressData) => {
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
              stats: { speed: "..." },
            });
          },
        });

        setDetectionResults((prev) => ({
          ...prev,
          [algo.id]: result,
        }));

        updateAlgorithmState(algo.id, {
          status: "completed",
          progress: 100,
          stats: {
            processingTime: result.processingTime,
            objectsDetected: result.detections.length,
          },
        });

        addLog("success", `✅ ${algo.name} completed in ${result.processingTime}`);
        addLog("success", `🎯 Detected ${result.detections.length} objects`);
      } catch (error) {
        console.error(`Error processing with ${algo.name}:`, error);
        addLog("error", `❌ ${algo.name} failed: ${error.message}`);

        updateAlgorithmState(algo.id, {
          status: "error",
          progress: 0,
          stats: {},
        });
      }
    }

    setIsCompleted(true);
    addLog("success", "🎉 All algorithms completed successfully!");
  };

  const updateAlgorithmState = (algoId, updates) => {
    setAlgorithmStates((prev) => ({
      ...prev,
      [algoId]: {
        ...prev[algoId],
        ...updates,
      },
    }));
  };

  useEffect(() => {
    if (Object.keys(algorithmStates).length === 0) return;

    const total = Object.values(algorithmStates).reduce((sum, state) => sum + state.progress, 0);
    const avg = Math.floor(total / Object.keys(algorithmStates).length);
    setOverallProgress(avg);
  }, [algorithmStates]);

  const handleViewResults = () => {
    const results = {
      ...processingData,
      algorithmStates,
      detectionResults,
      timestamp: new Date().toISOString(),
    };

    try {
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
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const algorithms = getAlgorithmsByIds(processingData.selectedAlgorithms);
  const stats = {
    completed: Object.values(algorithmStates).filter((s) => s.status === "completed").length,
    processing: Object.values(algorithmStates).filter((s) => s.status === "processing").length,
    queued: Object.values(algorithmStates).filter((s) => s.status === "queued").length,
  };

  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E6E6] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#005F50] rounded-xl flex items-center justify-center">
                <div className="animate-spin">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Processing Detection</h1>
                <p className="text-sm text-gray-600">Running AI algorithms</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">File:</p>
              <p className="font-semibold text-gray-900 text-sm">{processingData.fileInfo.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Overall Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Overall Progress</h2>
            <span className="text-2xl font-bold text-[#005F50]">{overallProgress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-gradient-to-r from-[#005F50] to-[#00B084] h-4 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
              <p className="text-sm text-gray-600">Processing</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-3xl font-bold text-gray-600">{stats.queued}</p>
              <p className="text-sm text-gray-600">Queued</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {isCompleted ? (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-green-900">Processing Complete!</p>
                <p className="text-sm text-green-700">
                  All algorithms finished. Click "View Results" to see detections.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-pulse w-3 h-3 bg-blue-600 rounded-full"></div>
              <p className="text-sm font-medium text-blue-900">Processing in progress... Please wait.</p>
            </div>
          </div>
        )}

        {/* Algorithm Progress Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {algorithms.map((algo) => {
            const state = algorithmStates[algo.id];
            const isActive = state?.status === "processing";
            const isDone = state?.status === "completed";
            const hasError = state?.status === "error";

            return (
              <div
                key={algo.id}
                className={`bg-white rounded-xl border-2 p-5 transition-all ${
                  isActive
                    ? "border-blue-500 shadow-lg"
                    : isDone
                    ? "border-green-500"
                    : hasError
                    ? "border-red-500"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-500 text-white"
                          : hasError
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isDone ? "✓" : isActive ? "⚡" : hasError ? "✕" : algo.name.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{algo.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{state?.status || "queued"}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{state?.progress || 0}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isDone
                        ? "bg-green-500"
                        : isActive
                        ? "bg-blue-500"
                        : hasError
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                    style={{ width: `${state?.progress || 0}%` }}
                  />
                </div>

                {state?.stats?.objectsDetected !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Objects detected:</span>
                    <span className="font-bold text-gray-900">{state.stats.objectsDetected}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Processing Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gray-800 px-5 py-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-bold text-white">Processing Log</h3>
          </div>

          <div className="bg-gray-900 p-4 font-mono text-sm max-h-80 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 mb-2 hover:bg-gray-800 px-2 py-1 rounded">
                <span className="text-gray-500 text-xs">{log.timestamp}</span>
                <span className={getLogColor(log.type)}>{getLogIcon(log.type)}</span>
                <span className="text-gray-300 flex-1">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      {/* View Results Button - Compact Design */}
      {isCompleted && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-500 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">All Processing Complete!</p>
                  <p className="text-sm text-gray-600">Ready to view your detection results</p>
                </div>
              </div>

              <button
                onClick={handleViewResults}
                className="px-8 py-3 bg-[#005F50] hover:bg-[#007A65] text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 flex-shrink-0"
              >
                View Results
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Processing;
