// src/pages/Results.jsx
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

  useEffect(() => {
    if (results && selectedAlgorithm) {
      loadDetectionsForAlgorithm(results, selectedAlgorithm);
    }
  }, [selectedAlgorithm]);

  const loadDetectionsForAlgorithm = (resultsData, algoId) => {
    const detectionResult = resultsData.detectionResults?.[algoId];

    if (detectionResult && detectionResult.detections) {
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

      const detectionsWithColors = detectionResult.detections
        .map((det, index) => {
          let x, y, width, height;

          if (det.bbox && typeof det.bbox === "object") {
            x = det.bbox.x;
            y = det.bbox.y;
            width = det.bbox.width;
            height = det.bbox.height;
          } else if (det.x !== undefined) {
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

          if (detection.width <= 0 || detection.height <= 0) {
            console.error(`Invalid detection ${index}:`, detection);
          }

          return detection;
        })
        .filter((d) => d !== null);

      setCurrentDetections(detectionsWithColors);
    } else {
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
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-700 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const algorithms = getAlgorithmsByIds(results.selectedAlgorithms);
  const currentAlgo = algorithms.find((a) => a.id === selectedAlgorithm);
  const isVideo = results.inputType === "video";

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
    <div className="min-h-screen bg-[#E6E6E6] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#005F50] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detection Results</h1>
                <p className="text-sm text-gray-600">View and analyze your detections</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">File:</p>
              <p className="font-semibold text-gray-900 text-sm">{results.fileInfo.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Banner */}
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-900 font-medium">
              Processing completed successfully with {algorithms.length} algorithm
              {algorithms.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Algorithm Selector */}
        {algorithms.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Select Algorithm</h2>
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-[#005F50] hover:bg-[#007A65] text-white font-medium rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Compare All
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {algorithms.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition border-2 ${
                    selectedAlgorithm === algo.id
                      ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {algo.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Algorithm Info */}
        {currentAlgo && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#005F50]/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-[#005F50]">{currentAlgo.name.slice(0, 2)}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{currentAlgo.name}</h2>
                <p className="text-sm text-gray-600">{currentAlgo.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mb-6">
          <QuickStats stats={stats} />
        </div>

        {/* Detection Images - Side by Side */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Detection Visualization</h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-700">Original {isVideo ? "Video" : "Image"}</p>
                <span className="text-xs text-gray-500">{results.fileInfo?.resolution}</span>
              </div>
              <div className="bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200">
                {isVideo ? (
                  <video src={results.fileInfo.url} controls className="w-full h-auto" />
                ) : (
                  <img src={results.fileInfo.url} alt="Original" className="w-full h-auto" />
                )}
              </div>
            </div>

            {/* With Detections */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-gray-700">With Detections</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-100 border border-green-300 rounded-full text-xs font-bold text-green-700">
                    {currentDetections.length} objects
                  </span>
                  <span className="text-xs text-gray-500">{stats.processingTime}</span>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl overflow-hidden border-2 border-green-500">
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

          {/* Detection Legend */}
          {currentDetections.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-bold text-gray-900 mb-3">Detected Objects:</p>
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
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: detection?.color || "#10b981" }}
                      />
                      <span className="text-sm font-medium text-gray-900 capitalize">{className}</span>
                      <span className="text-sm text-gray-600">×{count}</span>
                      <span className="text-xs text-gray-500">({(avgConfidence * 100).toFixed(0)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Controls and Detection List */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <ViewControls settings={viewSettings} onSettingsChange={setViewSettings} />
          </div>
          <div className="md:col-span-2">
            <DetectionList detections={currentDetections} />
          </div>
        </div>

        {/* Action Buttons */}
        {/* Action Buttons - Centered */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Centered container */}
          <div className="flex justify-center">
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl">
              <button
                onClick={handleViewStatistics}
                className="group px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Statistics
              </button>

              <button
                onClick={handleDownload}
                className="group px-6 py-4 bg-white border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download
              </button>

              <button
                onClick={handleExportData}
                className="group px-6 py-4 bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                    clipRule="evenodd"
                  />
                </svg>
                Export Data
              </button>

              {algorithms.length > 1 && (
                <button
                  onClick={handleCompare}
                  className="group px-6 py-4 bg-white border-2 border-[#005F50] text-[#005F50] hover:bg-[#005F50] hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Compare
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
