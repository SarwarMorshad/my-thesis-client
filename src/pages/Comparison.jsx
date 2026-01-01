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
  LineChart,
  Line,
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

  // Algorithm-specific colors
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

  // Load image
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

  // Draw canvases
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || algorithms.length === 0) return;

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

        // Draw box
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Draw fill
        ctx.fillStyle = color + "20";
        ctx.fillRect(x, y, width, height);

        // Draw label
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
  }, [imageLoaded, algorithms, results]);

  const generateComparisonData = () => {
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
  const recommendations = getRecommendation(comparisonData);
  const winner = recommendations[0];

  // Prepare chart data
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

  // Combined comparison data for multi-bar chart
  const combinedData = algorithms.map((algo) => ({
    name: algo.name,
    speed: comparisonData.speed[algo.id],
    detections: comparisonData.detections[algo.id],
    confidence: comparisonData.confidence[algo.id],
  }));

  // Radar chart data (normalized)
  const maxSpeed = Math.max(...Object.values(comparisonData.speed));
  const maxDetections = Math.max(...Object.values(comparisonData.detections));
  const maxConfidence = Math.max(...Object.values(comparisonData.confidence));

  const radarData = algorithms.map((algo) => ({
    algorithm: algo.name,
    Speed: 100 - (comparisonData.speed[algo.id] / maxSpeed) * 100, // Invert (lower is better)
    Detections: (comparisonData.detections[algo.id] / maxDetections) * 100,
    Confidence: (comparisonData.confidence[algo.id] / maxConfidence) * 100,
    fullMark: 100,
  }));

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

        {/* Side-by-Side Visual Comparison */}
        <div className="mb-8">
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">📸 Side-by-Side Visual Comparison</h3>

            <div className={`grid gap-4 ${algorithms.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
              {algorithms.map((algo) => {
                const algoDetections = allDetections[algo.id] || [];
                const color = algorithmColors[algo.id] || algo.color;

                return (
                  <div key={algo.id} className="space-y-2">
                    <div
                      className="p-3 rounded-lg font-bold text-center"
                      style={{ backgroundColor: `${color}20`, color: color }}
                    >
                      {algo.name} ({algoDetections.length} objects)
                    </div>
                    <div className="bg-black rounded-lg overflow-hidden">
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
                    <span className="text-sm text-gray-300">{algo.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Table */}
        <div className="mb-8">
          <PerformanceTable algorithms={algorithms} metrics={metrics} />
        </div>

        {/* CHARTS SECTION */}
        <div className="mb-8">
          <div className="bg-white/5 rounded-xl p-6">
            <h3 className="text-white font-bold mb-6">📊 Performance Comparison Charts</h3>

            {/* Grouped Bar Chart */}
            <div className="mb-8">
              <h4 className="text-gray-300 font-medium mb-4">Multi-Metric Comparison</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
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
                <h4 className="text-gray-300 font-medium mb-3 text-center">Processing Speed (ms)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={speedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                      formatter={(value) => [`${value}ms`, "Speed"]}
                    />
                    <Bar dataKey="speed">
                      {speedChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center text-gray-400 mt-2">Lower is better</p>
              </div>

              {/* Detections Chart */}
              <div>
                <h4 className="text-gray-300 font-medium mb-3 text-center">Objects Detected</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={detectionsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                      formatter={(value) => [`${value}`, "Objects"]}
                    />
                    <Bar dataKey="detections">
                      {detectionsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center text-gray-400 mt-2">Higher is better</p>
              </div>

              {/* Confidence Chart */}
              <div>
                <h4 className="text-gray-300 font-medium mb-3 text-center">Avg Confidence (%)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={confidenceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                      formatter={(value) => [`${value}%`, "Confidence"]}
                    />
                    <Bar dataKey="confidence">
                      {confidenceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-center text-gray-400 mt-2">Higher is better</p>
              </div>
            </div>

            {/* Line Chart - Comparison Trend */}
            <div className="mb-8">
              <h4 className="text-gray-300 font-medium mb-4">Performance Metrics Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="speed" stroke="#ef4444" strokeWidth={3} name="Speed (ms)" />
                  <Line
                    type="monotone"
                    dataKey="detections"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Detections"
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Confidence (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart - Overall Performance */}
            <div>
              <h4 className="text-gray-300 font-medium mb-4 text-center">Overall Performance Radar</h4>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="algorithm" stroke="#9ca3af" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => `${value.toFixed(0)}%`}
                  />
                  <Legend />
                  {algorithms.map((algo, index) => (
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
              <p className="text-xs text-center text-gray-400 mt-2">
                Normalized performance metrics (0-100%). Larger area = better overall performance
              </p>
            </div>
          </div>
        </div>

        {/* Detection Overlap */}
        <div className="mb-8">
          <DetectionOverlap algorithms={algorithms} detections={allDetections} />
        </div>

        {/* Algorithm Recommendation */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              Algorithm Recommendation
            </h3>

            {/* Overall Winner */}
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm mb-2">Overall Best Performer:</p>
              <p className="text-white font-bold text-xl">{winner.algo.name}</p>
              <ul className="mt-2 space-y-1">
                {winner.strengths.map((strength, idx) => (
                  <li key={idx} className="text-green-300 text-sm">
                    ✓ {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Use Case Recommendations */}
            <div className="space-y-3">
              <p className="text-gray-300 font-medium mb-2">Best for specific use cases:</p>

              {recommendations[0].strengths.includes("Fastest processing") && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Real-time applications:</span>
                  <span className="text-white font-bold">{recommendations[0].algo.name}</span>
                </div>
              )}

              {recommendations.find((r) => r.strengths.includes("Highest confidence")) && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Maximum accuracy:</span>
                  <span className="text-white font-bold">
                    {recommendations.find((r) => r.strengths.includes("Highest confidence")).algo.name}
                  </span>
                </div>
              )}

              {recommendations.find((r) => r.strengths.includes("Most detections")) && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300 text-sm">Comprehensive detection:</span>
                  <span className="text-white font-bold">
                    {recommendations.find((r) => r.strengths.includes("Most detections")).algo.name}
                  </span>
                </div>
              )}
            </div>
          </div>
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
