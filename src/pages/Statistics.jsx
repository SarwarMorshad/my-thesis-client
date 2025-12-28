// src/pages/Statistics.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { navigateBack, navigateToResults, navigateToComparison } from "../utils/navigation";
import { getAlgorithmById } from "../constants/algorithms";
import ConfidenceChart from "../components/statistics/ConfidenceChart";
import ClassDistribution from "../components/statistics/ClassDistribution";
import DetectionTable from "../components/statistics/DetectionTable";
import SpatialDistribution from "../components/statistics/SpatialDistribution";
import { exportAsJSON, exportAsCSV } from "../utils/dataExport";

const Statistics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { algorithmId } = useParams();
  const [results, setResults] = useState(null);
  const [algorithm, setAlgorithm] = useState(null);
  const [realDetections, setRealDetections] = useState([]); // Changed from mockDetections

  // Load results data
  useEffect(() => {
    // Try location state first
    if (location.state) {
      setResults(location.state);
      loadAlgorithmData(location.state);
    } else {
      // Fallback to sessionStorage
      const data = sessionStorage.getItem("detectionResults");
      if (data) {
        const parsed = JSON.parse(data);
        setResults(parsed);
        loadAlgorithmData(parsed);
      } else {
        navigateBack(navigate, "/results");
      }
    }
  }, [navigate, location.state, algorithmId]);

  const loadAlgorithmData = (data) => {
    const algo = getAlgorithmById(algorithmId);
    setAlgorithm(algo);

    // Load REAL detections instead of generating mock data
    loadRealDetections(data, algorithmId);
  };

  // Load real detections from detection results
  const loadRealDetections = (resultsData, algoId) => {
    const detectionResult = resultsData.detectionResults?.[algoId];

    if (detectionResult && detectionResult.detections) {
      // Add colors to detections for visualization
      const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

      const detectionsWithColors = detectionResult.detections.map((det, index) => ({
        id: det.id || index,
        class: det.class,
        confidence: det.confidence,
        x: det.bbox?.x || det.x || 0,
        y: det.bbox?.y || det.y || 0,
        width: det.bbox?.width || det.width || 0,
        height: det.bbox?.height || det.height || 0,
        color: colors[index % colors.length],
      }));

      setRealDetections(detectionsWithColors);
      console.log("Loaded real detections:", detectionsWithColors);
    } else {
      console.warn("No detection results found for algorithm:", algoId);
      setRealDetections([]);
    }
  };

  const handleExportJSON = () => {
    if (!results || !algorithm) return;

    const detectionResult = results.detectionResults?.[algorithmId];

    const exportData = {
      algorithm: algorithm.name,
      timestamp: new Date().toISOString(),
      fileInfo: {
        name: results.fileInfo?.name,
        resolution: results.fileInfo?.resolution,
        size: results.fileInfo?.size,
      },
      detections: realDetections.map((d) => ({
        id: d.id,
        class: d.class,
        confidence: d.confidence,
        bbox: { x: d.x, y: d.y, width: d.width, height: d.height },
      })),
      stats: calculateStats(),
      processingTime: detectionResult?.processingTime,
    };

    exportAsJSON(exportData, `${algorithm.id}_statistics.json`);
  };

  const handleExportCSV = () => {
    const csvData = realDetections.map((d, index) => ({
      ID: d.id || index + 1,
      Class: d.class,
      Confidence: (d.confidence * 100).toFixed(2) + "%",
      X: Math.round(d.x),
      Y: Math.round(d.y),
      Width: Math.round(d.width),
      Height: Math.round(d.height),
      Area: Math.round(d.width * d.height),
    }));

    exportAsCSV(csvData, `${algorithm.id}_detections.csv`);
  };

  const calculateStats = () => {
    if (realDetections.length === 0) {
      return {
        totalDetections: 0,
        avgConfidence: "N/A",
        uniqueClasses: 0,
        processingTime: results?.detectionResults?.[algorithmId]?.processingTime || "N/A",
      };
    }

    const avgConfidence = realDetections.reduce((sum, d) => sum + d.confidence, 0) / realDetections.length;
    const uniqueClasses = new Set(realDetections.map((d) => d.class)).size;
    const processingTime = results?.detectionResults?.[algorithmId]?.processingTime || "N/A";

    return {
      totalDetections: realDetections.length,
      avgConfidence: (avgConfidence * 100).toFixed(1) + "%",
      uniqueClasses,
      processingTime,
    };
  };

  if (!results || !algorithm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-white">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

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
            <h1 className="text-2xl font-bold text-white">📊 Detailed Statistics</h1>
          </div>
          <div className="text-sm text-gray-400">
            File: <span className="text-white font-medium">{results.fileInfo?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Algorithm Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${algorithm.color}20` }}
            >
              <span className="text-3xl">📊</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{algorithm.name} Analysis</h2>
              <p className="text-gray-400">{algorithm.description}</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-6">
            <p className="text-green-400 text-sm mb-1">Total Detections</p>
            <p className="text-white font-bold text-3xl">{stats.totalDetections}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-6">
            <p className="text-blue-400 text-sm mb-1">Avg Confidence</p>
            <p className="text-white font-bold text-3xl">{stats.avgConfidence}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6">
            <p className="text-purple-400 text-sm mb-1">Unique Classes</p>
            <p className="text-white font-bold text-3xl">{stats.uniqueClasses}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 rounded-xl p-6">
            <p className="text-orange-400 text-sm mb-1">Processing Time</p>
            <p className="text-white font-bold text-3xl">{stats.processingTime}</p>
          </div>
        </div>

        {/* No Detections Warning */}
        {realDetections.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <p className="text-yellow-200 text-sm flex items-center gap-2">
              <span>⚠️</span>
              No objects were detected in this image. Try adjusting the confidence threshold or using a
              different algorithm.
            </p>
          </div>
        )}

        {/* Charts Grid */}
        {realDetections.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <ConfidenceChart detections={realDetections} />
              <ClassDistribution detections={realDetections} />
            </div>

            {/* Spatial Distribution */}
            <div className="mb-8">
              <SpatialDistribution
                detections={realDetections}
                imageWidth={results.fileInfo?.width || 640}
                imageHeight={results.fileInfo?.height || 480}
              />
            </div>

            {/* Detection Table */}
            <div className="mb-8">
              <DetectionTable detections={realDetections} />
            </div>
          </>
        )}

        {/* Model Information */}
        <div className="bg-white/5 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold mb-4">⚙️ Model Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Model Name</p>
              <p className="text-white font-medium">{algorithm.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Version</p>
              <p className="text-white font-medium">{algorithm.version}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Model Size</p>
              <p className="text-white font-medium">{algorithm.specs.modelSize}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Processing Speed</p>
              <p className="text-white font-medium">{algorithm.specs.speed}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Classes Supported</p>
              <p className="text-white font-medium">{algorithm.specs.classes}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Accuracy (mAP)</p>
              <p className="text-white font-medium">{algorithm.specs.accuracy}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigateToResults(navigate, results)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition"
          >
            ← Back to Results
          </button>
          <button
            onClick={handleExportJSON}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition"
          >
            📄 Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition"
          >
            📊 Export CSV
          </button>
          {results.selectedAlgorithms && results.selectedAlgorithms.length > 1 && (
            <button
              onClick={() => navigateToComparison(navigate, results)}
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

export default Statistics;
