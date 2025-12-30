// src/pages/Results.jsx - Update the useEffect and rendering

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateBack, navigateToStatistics, navigateToComparison } from "../utils/navigation";
import { getAlgorithmsByIds } from "../constants/algorithms";
import DetectionCanvas from "../components/results/DetectionCanvas";
import VideoPlayer from "../components/results/VideoPlayer";
import DetectionList from "../components/results/DetectionList";
import QuickStats from "../components/results/QuickStats";
import ViewControls from "../components/results/ViewControls";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [viewSettings, setViewSettings] = useState({
    showLabels: true,
    showConfidence: true,
    showBoxes: true,
  });
  const [currentDetections, setCurrentDetections] = useState([]);

  // Load results data
  useEffect(() => {
    if (location.state) {
      setResults(location.state);
      if (location.state.selectedAlgorithms && location.state.selectedAlgorithms.length > 0) {
        const firstAlgo = location.state.selectedAlgorithms[0];
        setSelectedAlgorithm(firstAlgo);
        loadDetectionsForAlgorithm(location.state, firstAlgo);
      }
    } else {
      const data = sessionStorage.getItem("detectionResults");
      if (data) {
        const parsed = JSON.parse(data);
        setResults(parsed);
        if (parsed.selectedAlgorithms && parsed.selectedAlgorithms.length > 0) {
          const firstAlgo = parsed.selectedAlgorithms[0];
          setSelectedAlgorithm(firstAlgo);
          loadDetectionsForAlgorithm(parsed, firstAlgo);
        }
      } else {
        navigateBack(navigate, "/processing");
      }
    }
  }, [navigate, location.state]);

  // Update detections when algorithm changes
  useEffect(() => {
    if (results && selectedAlgorithm) {
      loadDetectionsForAlgorithm(results, selectedAlgorithm);
    }
  }, [selectedAlgorithm]);

  const loadDetectionsForAlgorithm = (resultsData, algoId) => {
    const detectionResult = resultsData.detectionResults?.[algoId];

    console.log("=== Loading Detections ===");
    console.log("Algorithm:", algoId);
    console.log("Detection result:", detectionResult);

    if (detectionResult && detectionResult.detections) {
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

      const detectionsWithColors = detectionResult.detections
        .map((det, index) => {
          // CRITICAL FIX: Extract bbox correctly
          let x, y, width, height;

          if (det.bbox && typeof det.bbox === "object") {
            // YOLOv8 format: { bbox: { x, y, width, height } }
            x = det.bbox.x;
            y = det.bbox.y;
            width = det.bbox.width;
            height = det.bbox.height;
          } else if (det.x !== undefined) {
            // Alternative format: { x, y, width, height }
            x = det.x;
            y = det.y;
            width = det.width;
            height = det.height;
          } else {
            console.error("Invalid detection format:", det);
            return null;
          }

          const detection = {
            id: det.id ?? index,
            class: det.class,
            confidence: det.confidence,
            x: Number(x),
            y: Number(y),
            width: Number(width),
            height: Number(height),
            color: colors[index % colors.length],
          };

          console.log(`Detection ${index} (${detection.class}):`, {
            x: detection.x,
            y: detection.y,
            width: detection.width,
            height: detection.height,
          });

          // Validate
          if (detection.width <= 0 || detection.height <= 0) {
            console.error(`❌ Invalid detection ${index}:`, detection);
          }

          return detection;
        })
        .filter((d) => d !== null); // Remove any null detections

      console.log("Final detections:", detectionsWithColors);
      setCurrentDetections(detectionsWithColors);
    } else {
      console.warn("No detections found for algorithm:", algoId);
      setCurrentDetections([]);
    }
  };

  const handleDownload = () => {
    alert("Download functionality will be implemented with actual detection results");
  };

  const handleExportData = () => {
    if (results && selectedAlgorithm) {
      const detectionResult = results.detectionResults?.[selectedAlgorithm];
      if (detectionResult) {
        const dataStr = JSON.stringify(detectionResult, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedAlgorithm}_detections.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleViewStatistics = () => {
    if (selectedAlgorithm) {
      navigateToStatistics(navigate, selectedAlgorithm, results);
    }
  };

  const handleCompare = () => {
    navigateToComparison(navigate, results);
  };

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-white">Loading results...</p>
        </div>
      </div>
    );
  }

  const algorithms = getAlgorithmsByIds(results.selectedAlgorithms);
  const currentAlgo = algorithms.find((a) => a.id === selectedAlgorithm);
  const isVideo = results.inputType === "video";

  // Calculate stats from real detections
  const stats = {
    objectsDetected: currentDetections.length,
    processingTime: results.detectionResults?.[selectedAlgorithm]?.processingTime || "N/A",
    avgConfidence:
      currentDetections.length > 0
        ? (
            (currentDetections.reduce((sum, d) => sum + d.confidence, 0) / currentDetections.length) *
            100
          ).toFixed(0) + "%"
        : "N/A",
    classesFound: new Set(currentDetections.map((d) => d.class)).size,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 border-b border-white/10 sticky top-0 bg-slate-900/80 backdrop-blur-lg z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateBack(navigate)}
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
            <h1 className="text-2xl font-bold text-white">📊 Detection Results</h1>
          </div>
          <div className="text-sm text-gray-400">
            File: <span className="text-white font-medium">{results.fileInfo.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8">
          <p className="text-green-200 text-sm flex items-center gap-2">
            <span>✓</span>
            Processing completed successfully with {algorithms.length} algorithm(s)
          </p>
        </div>
        {/* Algorithm Selector (if multiple) */}
        {algorithms.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Select Algorithm to View</h2>
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                🔬 Compare All Algorithms
              </button>
            </div>
            <div className="flex gap-3">
              {algorithms.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    selectedAlgorithm === algo.id
                      ? "bg-blue-500 text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                  style={selectedAlgorithm === algo.id ? { backgroundColor: algo.color } : undefined}
                >
                  {algo.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Current Algorithm Display */}
        {currentAlgo && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${currentAlgo.color}20` }}
              >
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentAlgo.name} Results</h2>
                <p className="text-gray-400">{currentAlgo.description}</p>
              </div>
            </div>
          </div>
        )}
        {/* Quick Stats */}
        <div className="mb-8">
          <QuickStats stats={stats} />
        </div>
        {/* Main Content */}
        <div className="space-y-8 mb-8">
          {/* Images Section - Side by Side - Full Width */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">
              Detection Results - {isVideo ? "Video" : "Image"}
            </h3>

            {/* Side by Side Images */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-gray-400 text-sm font-medium">Original Image</p>
                  <p className="text-gray-400 text-xs">{results.fileInfo?.resolution}</p>
                </div>
                <div className="bg-black rounded-xl overflow-hidden border border-white/10">
                  {isVideo ? (
                    <video src={results.fileInfo.url} controls className="w-full h-auto" />
                  ) : (
                    <img src={results.fileInfo.url} alt="Original" className="w-full h-auto object-contain" />
                  )}
                </div>
              </div>

              {/* Processed Image with Detections */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-gray-400 text-sm font-medium">With Detections - {currentAlgo?.name}</p>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full">
                      <span className="text-green-400 text-xs font-bold">
                        {currentDetections.length} objects
                      </span>
                    </span>
                    <p className="text-gray-400 text-xs">{stats.processingTime}</p>
                  </div>
                </div>
                <div className="bg-black rounded-xl overflow-hidden border-2 border-green-500/30">
                  {isVideo ? (
                    <VideoPlayer
                      videoUrl={results.fileInfo.url}
                      detections={currentDetections}
                      showLabels={viewSettings.showLabels}
                      showConfidence={viewSettings.showConfidence}
                    />
                  ) : (
                    <DetectionCanvas
                      imageUrl={results.fileInfo.url}
                      detections={currentDetections}
                      showLabels={viewSettings.showLabels}
                      showConfidence={viewSettings.showConfidence}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Detection Legend - Below Images */}
            {currentDetections.length > 0 && (
              <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-medium text-sm mb-3">Detected Objects:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(currentDetections.map((d) => d.class))).map((className, index) => {
                    const count = currentDetections.filter((d) => d.class === className).length;
                    const detection = currentDetections.find((d) => d.class === className);
                    const avgConfidence =
                      currentDetections
                        .filter((d) => d.class === className)
                        .reduce((sum, d) => sum + d.confidence, 0) / count;

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition"
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white/50"
                          style={{ backgroundColor: detection?.color || "#10b981" }}
                        />
                        <span className="text-white text-sm font-medium capitalize">{className}</span>
                        <span className="text-gray-400 text-sm">×{count}</span>
                        <span className="text-gray-500 text-xs">({(avgConfidence * 100).toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Controls and Detection List - Bottom Section */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* View Controls */}
            <div className="md:col-span-1">
              <ViewControls settings={viewSettings} onSettingsChange={setViewSettings} />
            </div>

            {/* Detection List */}
            <div className="md:col-span-2">
              <DetectionList detections={currentDetections} />
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleViewStatistics}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition"
          >
            📊 View Detailed Statistics
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition"
          >
            💾 Download Processed {isVideo ? "Video" : "Image"}
          </button>
          <button
            onClick={handleExportData}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition"
          >
            📄 Export Detection Data
          </button>
          {algorithms.length > 1 && (
            <button
              onClick={handleCompare}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition"
            >
              🔬 Compare Algorithms
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Results;
