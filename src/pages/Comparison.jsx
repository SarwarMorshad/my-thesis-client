// src/pages/Comparison.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateBack, navigateToResults } from "../utils/navigation";
import { getAlgorithmsByIds } from "../constants/algorithms";
import PerformanceTable from "../components/comparison/PerformanceTable";
import DetectionOverlap from "../components/comparison/DetectionOverlap";
import InsightsPanel from "../components/comparison/InsightsPanel";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";

const Comparison = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [results, setResults] = useState(null);
  const [algorithms, setAlgorithms] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const canvasRefs = useRef({});

  const algorithmColors = {
    "coco-ssd": "#10b981",
    yolov8: "#3b82f6",
    yolov5: "#f59e0b",
    "mobilenet-ssd": "#8b5cf6",
  };

  useEffect(() => {
    if (location.state) {
      setResults(location.state);
      loadAlgorithms(location.state);
    } else {
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
      navigateBack(navigate, "/results");
    }
  };

  useEffect(() => {
    if (!results?.fileInfo?.url) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };

    img.src = results.fileInfo.url;
  }, [results?.fileInfo?.url]);

  useEffect(() => {
    if (!imageLoaded || !imageRef.current || algorithms.length === 0 || !results) return;

    algorithms.forEach((algo) => {
      const canvas = canvasRefs.current[algo.id];
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const algoDetections = results.detectionResults?.[algo.id]?.detections || [];
      const color = algorithmColors[algo.id] || algo.color;

      algoDetections.forEach((det) => {
        const x = det.bbox?.x || det.x || 0;
        const y = det.bbox?.y || det.y || 0;
        const width = det.bbox?.width || det.width || 0;
        const height = det.bbox?.height || det.height || 0;

        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = color + "20";
        ctx.fillRect(x, y, width, height);

        const label = `${det.class} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 16px Arial";
        ctx.textBaseline = "top";

        const textMetrics = ctx.measureText(label);
        const padding = 8;

        let labelX = x;
        let labelY = y - 26;
        if (labelY < 0) labelY = y + 5;

        ctx.fillStyle = color;
        ctx.fillRect(labelX, labelY, textMetrics.width + padding * 2, 26);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, labelX + padding, labelY + 5);
      });
    });
  }, [imageLoaded, algorithms, results, algorithmColors]);

  const generateComparisonData = () => {
    if (!results) return { speed: {}, detections: {}, confidence: {} };

    const speed = {};
    const detections = {};
    const confidence = {};

    algorithms.forEach((algo) => {
      const algoResults = results.detectionResults?.[algo.id];

      if (algoResults) {
        const timeString = algoResults.processingTime || "0s";
        const timeMs = parseFloat(timeString) * 1000;
        speed[algo.id] = Math.round(timeMs);

        detections[algo.id] = algoResults.detections?.length || 0;

        if (algoResults.detections && algoResults.detections.length > 0) {
          const avgConf =
            algoResults.detections.reduce((sum, det) => sum + det.confidence, 0) /
            algoResults.detections.length;
          confidence[algo.id] = Math.round(avgConf * 100);
        } else {
          confidence[algo.id] = 0;
        }
      } else {
        speed[algo.id] = 0;
        detections[algo.id] = 0;
        confidence[algo.id] = 0;
      }
    });

    return { speed, detections, confidence };
  };

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

  const getAllDetections = () => {
    if (!results) return {};

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

  const getRecommendation = (data) => {
    const { speed, detections, confidence } = data;

    const fastest = Object.entries(speed).reduce((min, curr) => (curr[1] < min[1] ? curr : min))[0];
    const mostDetections = Object.entries(detections).reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    )[0];
    const highestConfidence = Object.entries(confidence).reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    )[0];

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

    scores.sort((a, b) => b.score - a.score);

    return scores;
  };

  // Loading state
  if (!results || algorithms.length < 2) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-700 font-medium">Loading comparison...</p>
        </div>
      </div>
    );
  }

  const comparisonData = generateComparisonData();
  const metrics = generateMetrics(comparisonData);
  const allDetections = getAllDetections();
  const recommendations = getRecommendation(comparisonData);
  const winner = recommendations[0];

  const speedChartData = algorithms.map((algo) => ({
    name: algo.name,
    speed: comparisonData.speed[algo.id],
    fill: algorithmColors[algo.id] || algo.color,
  }));

  const detectionsChartData = algorithms.map((algo) => ({
    name: algo.name,
    detections: comparisonData.detections[algo.id],
    fill: algorithmColors[algo.id] || algo.color,
  }));

  const confidenceChartData = algorithms.map((algo) => ({
    name: algo.name,
    confidence: comparisonData.confidence[algo.id],
    fill: algorithmColors[algo.id] || algo.color,
  }));

  const combinedData = algorithms.map((algo) => ({
    name: algo.name,
    speed: comparisonData.speed[algo.id],
    detections: comparisonData.detections[algo.id],
    confidence: comparisonData.confidence[algo.id],
  }));

  const maxSpeed = Math.max(...Object.values(comparisonData.speed), 1);
  const maxDetections = Math.max(...Object.values(comparisonData.detections), 1);
  const maxConfidence = Math.max(...Object.values(comparisonData.confidence), 1);

  const radarData = algorithms.map((algo) => ({
    algorithm: algo.name,
    Speed: 100 - (comparisonData.speed[algo.id] / maxSpeed) * 100,
    Detections: (comparisonData.detections[algo.id] / maxDetections) * 100,
    Confidence: (comparisonData.confidence[algo.id] / maxConfidence) * 100,
    fullMark: 100,
  }));

  return (
    <div className="min-h-screen bg-[#E6E6E6] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#005F50] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Algorithm Comparison</h1>
                <p className="text-sm text-gray-600">
                  Compare performance across {algorithms.length} algorithms
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">File:</p>
              <p className="font-semibold text-gray-900 text-sm">{results.fileInfo?.name || "N/A"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-blue-900 font-medium">
              Comparing {algorithms.length} algorithms: {algorithms.map((a) => a.name).join(", ")}
            </p>
          </div>
        </div>

        {/* Algorithm Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {algorithms.map((algo) => {
            const algoDetections = allDetections[algo.id] || [];
            const color = algorithmColors[algo.id] || algo.color;
            return (
              <div
                key={algo.id}
                className="bg-white rounded-xl shadow-sm border-2 p-6"
                style={{ borderColor: color }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: color + "20" }}
                  >
                    <span className="text-2xl font-bold" style={{ color }}>
                      {algo.name.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold">{algo.name}</h3>
                    <p className="text-gray-600 text-sm">{algo.version}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3">{algo.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">Detected:</span>
                  <span className="text-gray-900 font-bold">{algoDetections.length} objects</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Side-by-Side Visual Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Visual Comparison</h3>

          <div className={`grid gap-4 ${algorithms.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {algorithms.map((algo) => {
              const algoDetections = allDetections[algo.id] || [];
              const color = algorithmColors[algo.id] || algo.color;

              return (
                <div key={algo.id} className="space-y-2">
                  <div
                    className="p-3 rounded-lg font-bold text-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    {algo.name} ({algoDetections.length} objects)
                  </div>
                  <div
                    className="bg-gray-900 rounded-lg overflow-hidden border-2"
                    style={{ borderColor: color }}
                  >
                    <canvas ref={(el) => (canvasRefs.current[algo.id] = el)} className="w-full h-auto" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {algorithms.map((algo) => {
              const color = algorithmColors[algo.id] || algo.color;
              return (
                <div key={algo.id} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                  <span className="text-sm text-gray-700 font-medium">{algo.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Table */}
        <div className="mb-6">
          <PerformanceTable algorithms={algorithms} metrics={metrics} />
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Performance Charts</h3>

          {/* Grouped Bar Chart */}
          <div className="mb-8">
            <h4 className="text-gray-700 font-medium mb-4">Multi-Metric Comparison</h4>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="speed" fill="#ef4444" name="Speed (ms)" />
                <Bar dataKey="detections" fill="#10b981" name="Detections" />
                <Bar dataKey="confidence" fill="#3b82f6" name="Confidence (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Individual Metric Charts */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Speed Chart */}
            <div>
              <h4 className="text-gray-700 font-medium mb-3 text-center">Processing Speed</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={speedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #e5e7eb" }}
                    formatter={(value) => [`${value}ms`, "Speed"]}
                  />
                  <Bar dataKey="speed">
                    {speedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-500 mt-2">⬇️ Lower is better</p>
            </div>

            {/* Detections Chart */}
            <div>
              <h4 className="text-gray-700 font-medium mb-3 text-center">Objects Detected</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={detectionsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #e5e7eb" }}
                    formatter={(value) => [`${value}`, "Objects"]}
                  />
                  <Bar dataKey="detections">
                    {detectionsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-500 mt-2">⬆️ Higher is better</p>
            </div>

            {/* Confidence Chart */}
            <div>
              <h4 className="text-gray-700 font-medium mb-3 text-center">Avg Confidence</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={confidenceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #e5e7eb" }}
                    formatter={(value) => [`${value}%`, "Confidence"]}
                  />
                  <Bar dataKey="confidence">
                    {confidenceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-center text-gray-500 mt-2">⬆️ Higher is better</p>
            </div>
          </div>

          {/* Radar Chart */}
          <div>
            <h4 className="text-gray-700 font-medium mb-4 text-center">Overall Performance Radar</h4>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="algorithm" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${value.toFixed(0)}%`}
                />
                <Legend />
                {algorithms.map((algo) => (
                  <Radar
                    key={algo.id}
                    name={algo.name}
                    dataKey={algo.name}
                    stroke={algorithmColors[algo.id] || algo.color}
                    fill={algorithmColors[algo.id] || algo.color}
                    fillOpacity={0.3}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-gray-600 mt-2">Larger area = better overall performance</p>
          </div>
        </div>

        {/* Detection Overlap */}
        <div className="mb-6">
          <DetectionOverlap algorithms={algorithms} detections={allDetections} />
        </div>

        {/* Algorithm Recommendation */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-500 p-6 mb-6">
          <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-lg">
            <span className="text-2xl">🏆</span>
            Algorithm Recommendation
          </h3>

          {/* Overall Winner */}
          <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-300">
            <p className="text-green-700 text-sm font-medium mb-2">Overall Best Performer:</p>
            <p className="text-gray-900 font-bold text-xl mb-2">{winner.algo.name}</p>
            <ul className="space-y-1">
              {winner.strengths.map((strength, idx) => (
                <li key={idx} className="text-green-700 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Use Case Recommendations */}
          <div className="space-y-3">
            <p className="text-gray-700 font-bold mb-2">Best for specific use cases:</p>

            {recommendations[0].strengths.includes("Fastest processing") && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300">
                <span className="text-gray-700 text-sm font-medium">Real-time applications:</span>
                <span className="text-gray-900 font-bold">{recommendations[0].algo.name}</span>
              </div>
            )}

            {recommendations.find((r) => r.strengths.includes("Highest confidence")) && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300">
                <span className="text-gray-700 text-sm font-medium">Maximum accuracy:</span>
                <span className="text-gray-900 font-bold">
                  {recommendations.find((r) => r.strengths.includes("Highest confidence")).algo.name}
                </span>
              </div>
            )}

            {recommendations.find((r) => r.strengths.includes("Most detections")) && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-300">
                <span className="text-gray-700 text-sm font-medium">Comprehensive detection:</span>
                <span className="text-gray-900 font-bold">
                  {recommendations.find((r) => r.strengths.includes("Most detections")).algo.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="mb-6">
          <InsightsPanel algorithms={algorithms} data={comparisonData} />
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigateToResults(navigate, results)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg border border-gray-300 transition"
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
                    recommendation: winner.algo.name,
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
                  URL.revokeObjectURL(url);
                }}
                className="px-6 py-3 bg-[#005F50] hover:bg-[#007A65] text-white font-bold rounded-lg transition"
              >
                📄 Export Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Comparison;
