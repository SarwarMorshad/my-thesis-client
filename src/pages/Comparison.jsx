// src/pages/Comparison.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateBack, navigateToResults } from "../utils/navigation";
import { getAlgorithmsByIds } from "../constants/algorithms";
import PerformanceTable from "../components/comparison/PerformanceTable";
import DetectionOverlap from "../components/comparison/DetectionOverlap";
import ComparisonCharts from "../components/comparison/ComparisonCharts";
import InsightsPanel from "../components/comparison/InsightsPanel";
import SideBySideView from "../components/comparison/SideBySideView";

const Comparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState(null);
  const [algorithms, setAlgorithms] = useState([]);

  // Load results data
  useEffect(() => {
    // Try location state first
    if (location.state) {
      setResults(location.state);
      loadAlgorithms(location.state);
    } else {
      // Fallback to sessionStorage
      const data = sessionStorage.getItem("detectionResults");
      if (data) {
        const parsed = JSON.parse(data);
        setResults(parsed);
        loadAlgorithms(parsed);
      } else {
        navigateBack(navigate, "/results");
      }
    }
  }, [navigate, location.state]);

  const loadAlgorithms = (data) => {
    if (data.selectedAlgorithms && data.selectedAlgorithms.length > 1) {
      const algos = getAlgorithmsByIds(data.selectedAlgorithms);
      setAlgorithms(algos);
    } else {
      // If only 1 algorithm, redirect to results
      navigateBack(navigate, "/results");
    }
  };

  // USE REAL COMPARISON DATA
  const generateComparisonData = () => {
    const speed = {};
    const detections = {};
    const confidence = {};

    algorithms.forEach((algo) => {
      const algoResults = results.detectionResults?.[algo.id];

      if (algoResults) {
        // Real processing time
        const timeString = algoResults.processingTime || "0s";
        const timeMs = parseFloat(timeString) * 1000; // Convert seconds to ms
        speed[algo.id] = Math.round(timeMs);

        // Real detection count
        detections[algo.id] = algoResults.detections?.length || 0;

        // Real average confidence
        if (algoResults.detections && algoResults.detections.length > 0) {
          const avgConf =
            algoResults.detections.reduce((sum, det) => sum + det.confidence, 0) /
            algoResults.detections.length;
          confidence[algo.id] = Math.round(avgConf * 100);
        } else {
          confidence[algo.id] = 0;
        }
      } else {
        // Fallback if no results
        speed[algo.id] = 0;
        detections[algo.id] = 0;
        confidence[algo.id] = 0;
      }
    });

    console.log("Real comparison data:", { speed, detections, confidence });
    return { speed, detections, confidence };
  };

  // Generate metrics for performance table
  const generateMetrics = (data) => {
    const metrics = [
      {
        name: "Processing Speed",
        values: Object.fromEntries(Object.entries(data.speed).map(([id, speed]) => [id, `${speed}ms`])),
        winner: Object.entries(data.speed).reduce((min, curr) => (curr[1] < min[1] ? curr : min))[0],
      },
      {
        name: "Objects Detected",
        values: Object.fromEntries(Object.entries(data.detections).map(([id, count]) => [id, count])),
        winner: Object.entries(data.detections).reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0],
      },
      {
        name: "Avg Confidence",
        values: Object.fromEntries(Object.entries(data.confidence).map(([id, conf]) => [id, `${conf}%`])),
        winner: Object.entries(data.confidence).reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0],
      },
      {
        name: "Model Size",
        values: Object.fromEntries(algorithms.map((algo) => [algo.id, algo.specs.modelSize])),
        winner: algorithms.reduce((min, curr) =>
          parseFloat(curr.specs.modelSize) < parseFloat(min.specs.modelSize) ? curr : min
        ).id,
      },
    ];

    return metrics;
  };

  // Get real detections for overlap analysis
  const getAllDetections = () => {
    const allDetections = {};

    algorithms.forEach((algo) => {
      const algoResults = results.detectionResults?.[algo.id];
      if (algoResults && algoResults.detections) {
        allDetections[algo.id] = algoResults.detections;
      } else {
        allDetections[algo.id] = [];
      }
    });

    return allDetections;
  };

  if (!results || algorithms.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-white">Loading comparison...</p>
        </div>
      </div>
    );
  }

  const comparisonData = generateComparisonData();
  const metrics = generateMetrics(comparisonData);
  const allDetections = getAllDetections();

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
            <h1 className="text-2xl font-bold text-white">🔬 Algorithm Comparison</h1>
          </div>
          <div className="text-sm text-gray-400">
            File: <span className="text-white font-medium">{results.fileInfo?.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <p className="text-blue-200 text-sm flex items-center gap-2">
            <span>🔬</span>
            Comparing {algorithms.length} algorithms: {algorithms.map((a) => a.name).join(", ")}
          </p>
        </div>

        {/* Algorithms Being Compared */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {algorithms.map((algo) => {
            const algoDetections = allDetections[algo.id] || [];
            return (
              <div
                key={algo.id}
                className="border rounded-xl p-6"
                style={{
                  backgroundColor: `${algo.color}10`,
                  borderColor: `${algo.color}40`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${algo.color}20` }}
                  >
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{algo.name}</h3>
                    <p className="text-gray-400 text-sm">{algo.version}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3">{algo.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-gray-400 text-xs">Detected:</span>
                  <span className="text-white font-bold">{algoDetections.length} objects</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Comparison */}
        <div className="mb-8">
          <SideBySideView
            algorithms={algorithms}
            imageUrl={results.fileInfo?.url}
            detections={allDetections}
          />
        </div>

        {/* Performance Table */}
        <div className="mb-8">
          <PerformanceTable algorithms={algorithms} metrics={metrics} />
        </div>

        {/* Grid: Charts and Overlap */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <ComparisonCharts algorithms={algorithms} data={comparisonData} />
          <DetectionOverlap algorithms={algorithms} detections={allDetections} />
        </div>

        {/* Insights Panel */}
        <div className="mb-8">
          <InsightsPanel algorithms={algorithms} data={comparisonData} />
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
            onClick={() => {
              const exportData = {
                algorithms: algorithms.map((a) => ({
                  name: a.name,
                  detections: allDetections[a.id]?.length || 0,
                })),
                metrics,
                detections: allDetections,
                timestamp: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "algorithm_comparison.json";
              a.click();
            }}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition"
          >
            📄 Export Comparison Report
          </button>
        </div>
      </main>
    </div>
  );
};

export default Comparison;
