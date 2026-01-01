// src/pages/Statistics.jsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { navigateBack, navigateToResults, navigateToComparison } from "../utils/navigation";
import { getAlgorithmById, getAlgorithmsByIds } from "../constants/algorithms";
import { exportAsJSON, exportAsCSV } from "../utils/dataExport";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const Statistics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { algorithmId } = useParams();

  const [results, setResults] = useState(null);
  const [currentAlgorithmId, setCurrentAlgorithmId] = useState(algorithmId);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const algorithm = useMemo(() => {
    return currentAlgorithmId ? getAlgorithmById(currentAlgorithmId) : null;
  }, [currentAlgorithmId]);

  const allAlgorithms = useMemo(() => {
    if (!results?.selectedAlgorithms) return [];
    return getAlgorithmsByIds(results.selectedAlgorithms);
  }, [results]);

  const realDetections = useMemo(() => {
    if (!results || !currentAlgorithmId) return [];

    const detectionResult = results.detectionResults?.[currentAlgorithmId];
    if (!detectionResult?.detections) return [];

    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

    return detectionResult.detections.map((det, index) => {
      let x, y, width, height;

      if (det.bbox && typeof det.bbox === "object") {
        x = det.bbox.x;
        y = det.bbox.y;
        width = det.bbox.width;
        height = det.bbox.height;
      } else {
        x = det.x;
        y = det.y;
        width = det.width;
        height = det.height;
      }

      return {
        id: det.id || index,
        class: det.class,
        confidence: det.confidence,
        x: Number(x),
        y: Number(y),
        width: Number(width),
        height: Number(height),
        color: colors[index % colors.length],
      };
    });
  }, [results, currentAlgorithmId]);

  const sortedDetections = useMemo(() => {
    if (!sortConfig.key) return realDetections;

    const sorted = [...realDetections].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "class") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [realDetections, sortConfig]);

  useEffect(() => {
    let data = null;

    if (location.state) {
      data = location.state;
    } else {
      const stored = sessionStorage.getItem("detectionResults");
      if (stored) {
        data = JSON.parse(stored);
      }
    }

    if (data) {
      setResults(data);

      if (!currentAlgorithmId && data.selectedAlgorithms?.[0]) {
        setCurrentAlgorithmId(data.selectedAlgorithms[0]);
      }
    } else {
      navigateBack(navigate, "/results");
    }
  }, [location.state, navigate, currentAlgorithmId]);

  const calculateStats = () => {
    if (realDetections.length === 0) {
      return {
        totalDetections: 0,
        avgConfidence: "N/A",
        uniqueClasses: 0,
        processingTime: results?.detectionResults?.[currentAlgorithmId]?.processingTime || "N/A",
      };
    }

    const avgConfidence = realDetections.reduce((sum, d) => sum + d.confidence, 0) / realDetections.length;
    const uniqueClasses = new Set(realDetections.map((d) => d.class)).size;
    const processingTime = results?.detectionResults?.[currentAlgorithmId]?.processingTime || "N/A";

    return {
      totalDetections: realDetections.length,
      avgConfidence: (avgConfidence * 100).toFixed(0) + "%",
      uniqueClasses,
      processingTime,
    };
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleAlgorithmChange = (algoId) => {
    setCurrentAlgorithmId(algoId);
    setSortConfig({ key: null, direction: "asc" });
    window.history.replaceState(null, "", `/statistics/${algoId}`);
  };

  const handleDownloadImage = () => {
    if (!results?.fileInfo?.url || realDetections.length === 0) {
      alert("No image or detections available to download");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      realDetections.forEach((det) => {
        const { x, y, width, height, color, class: className, confidence } = det;

        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = color + "25";
        ctx.fillRect(x, y, width, height);

        const label = `${className} ${(confidence * 100).toFixed(0)}%`;
        ctx.font = "bold 18px Arial";
        ctx.textBaseline = "top";

        const textMetrics = ctx.measureText(label);
        const padding = 10;

        let labelX = x;
        let labelY = y - 28;
        if (labelY < 0) labelY = y + 5;

        ctx.fillStyle = color;
        ctx.fillRect(labelX, labelY, textMetrics.width + padding * 2, 28);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, labelX + padding, labelY + 5);
      });

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

  const handleExportJSON = () => {
    if (!results || !algorithm) return;

    const exportData = {
      algorithm: algorithm.name,
      timestamp: new Date().toISOString(),
      fileInfo: results.fileInfo,
      detections: realDetections,
      stats: calculateStats(),
    };

    exportAsJSON(exportData, `${algorithm.id}_statistics.json`);
  };

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

  if (!results || !algorithm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-700">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  // Prepare chart data
  const confidenceChartData = realDetections.map((det, index) => ({
    name: `${det.class} ${index + 1}`,
    confidence: Math.round(det.confidence * 100),
    fill: det.color,
  }));

  const classCounts = realDetections.reduce((acc, det) => {
    acc[det.class] = (acc[det.class] || 0) + 1;
    return acc;
  }, {});

  const classDistributionData = Object.entries(classCounts).map(([className, count]) => ({
    name: className,
    count: count,
    percentage: ((count / realDetections.length) * 100).toFixed(1),
  }));

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  // Scatter plot data (Position vs Size)
  const scatterData = realDetections.map((det, index) => ({
    x: det.x + det.width / 2, // Center X
    y: det.y + det.height / 2, // Center Y
    z: det.width * det.height, // Size
    class: det.class,
    confidence: Math.round(det.confidence * 100),
  }));

  // Size distribution data
  const sizeDistributionData = realDetections.map((det, index) => ({
    name: `${det.class} ${index + 1}`,
    size: Math.round(det.width * det.height),
    fill: det.color,
  }));

  const highestConfidence =
    realDetections.length > 0
      ? realDetections.reduce((max, d) => (d.confidence > max.confidence ? d : max))
      : null;

  const lowestConfidence =
    realDetections.length > 0
      ? realDetections.reduce((min, d) => (d.confidence < min.confidence ? d : min))
      : null;

  // Spatial distribution
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-100 border-b-2 border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h1 className="text-xl font-bold text-gray-800">{algorithm.name} - Detailed Analysis (Image)</h1>
          </div>
          <button
            onClick={() => navigateBack(navigate)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded border border-gray-400 transition"
          >
            [← Back]
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Algorithm Selector */}
        {allAlgorithms.length > 1 && (
          <div className="mb-8 p-4 bg-gray-50 border-2 border-gray-300 rounded">
            <p className="text-sm font-bold text-gray-700 mb-3">Switch Algorithm:</p>
            <div className="flex gap-3">
              {allAlgorithms.map((algo) => {
                const isActive = algo.id === currentAlgorithmId;
                const algoDetections = results.detectionResults?.[algo.id]?.detections?.length || 0;
                return (
                  <button
                    key={algo.id}
                    onClick={() => handleAlgorithmChange(algo.id)}
                    className={`px-4 py-2 rounded border-2 font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-800"
                        : "bg-white text-gray-700 border-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    <div>
                      <p className="font-bold">{algo.name}</p>
                      <p className="text-xs opacity-80">{algoDetections} objects</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Info */}
        <div className="mb-8">
          <p className="text-gray-700 font-mono text-sm">
            <strong>Input:</strong> {results.fileInfo?.name} ({results.fileInfo?.width}×
            {results.fileInfo?.height})
          </p>
        </div>

        {/* Detection Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
            DETECTION SUMMARY
          </h2>
          <div className="border-2 border-gray-800 p-6 bg-gray-50 font-mono text-sm space-y-1">
            <p>
              Total Objects: <strong>{stats.totalDetections}</strong>
            </p>
            <p>
              Processing Time: <strong>{stats.processingTime}</strong>
            </p>
            <p>
              Average Confidence: <strong>{stats.avgConfidence}</strong>
            </p>
            <p>
              Model:{" "}
              <strong>
                {algorithm.name} ({algorithm.specs.modelSize})
              </strong>
            </p>
            <p>
              Input Resolution:{" "}
              <strong>
                {results.fileInfo?.width}×{results.fileInfo?.height} → 640×640 (resized)
              </strong>
            </p>
          </div>
        </div>

        {/* Charts Section */}
        {realDetections.length > 0 && (
          <>
            {/* Confidence Bar Chart */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
                CONFIDENCE DISTRIBUTION CHART
              </h2>
              <div className="border-2 border-gray-800 p-6 bg-white">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={confidenceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: "Confidence (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="confidence" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="font-mono text-sm space-y-1 pt-4 border-t border-gray-300 mt-4">
                  {highestConfidence && (
                    <p>
                      Highest:{" "}
                      <strong className="capitalize">
                        {highestConfidence.class} ({(highestConfidence.confidence * 100).toFixed(0)}%)
                      </strong>
                    </p>
                  )}
                  {lowestConfidence && (
                    <p>
                      Lowest:{" "}
                      <strong className="capitalize">
                        {lowestConfidence.class} ({(lowestConfidence.confidence * 100).toFixed(0)}%)
                      </strong>
                    </p>
                  )}
                  <p>
                    Average: <strong>{stats.avgConfidence}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Class Distribution Pie Chart */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
                CLASS DISTRIBUTION PIE CHART
              </h2>
              <div className="border-2 border-gray-800 p-6 bg-white">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={classDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {classDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Object Size Bar Chart */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
                OBJECT SIZE DISTRIBUTION
              </h2>
              <div className="border-2 border-gray-800 p-6 bg-white">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sizeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: "Size (pixels²)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} px²`} />
                    <Bar dataKey="size" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter Plot - Position Distribution */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
                SPATIAL POSITION SCATTER PLOT
              </h2>
              <div className="border-2 border-gray-800 p-6 bg-white">
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="X Position"
                      label={{ value: "X Position (pixels)", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Y Position"
                      label={{ value: "Y Position (pixels)", angle: -90, position: "insideLeft" }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 400]} name="Size" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border-2 border-gray-800 p-2 font-mono text-xs">
                              <p>
                                <strong>Class:</strong> {data.class}
                              </p>
                              <p>
                                <strong>Position:</strong> ({Math.round(data.x)}, {Math.round(data.y)})
                              </p>
                              <p>
                                <strong>Size:</strong> {data.z.toLocaleString()} px²
                              </p>
                              <p>
                                <strong>Confidence:</strong> {data.confidence}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Objects" data={scatterData} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-600 text-center mt-2 font-mono">
                  Bubble size represents object size. Hover over bubbles for details.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Detection Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
            DETECTED OBJECTS TABLE
          </h2>
          <div className="border-2 border-gray-800 overflow-hidden">
            <table className="w-full font-mono text-sm">
              <thead className="bg-gray-100">
                <tr className="border-b-2 border-gray-800">
                  <th className="py-2 px-3 text-left font-bold">
                    <button
                      onClick={() => handleSort("id")}
                      className="hover:text-blue-600 transition w-full text-left"
                    >
                      ID {getSortIcon("id")}
                    </button>
                  </th>
                  <th className="py-2 px-3 text-left font-bold">
                    <button
                      onClick={() => handleSort("class")}
                      className="hover:text-blue-600 transition w-full text-left"
                    >
                      Class {getSortIcon("class")}
                    </button>
                  </th>
                  <th className="py-2 px-3 text-left font-bold">
                    <button
                      onClick={() => handleSort("confidence")}
                      className="hover:text-blue-600 transition w-full text-left"
                    >
                      Conf {getSortIcon("confidence")}
                    </button>
                  </th>
                  <th className="py-2 px-3 text-left font-bold">Box (x,y,w,h)</th>
                  <th className="py-2 px-3 text-left font-bold">
                    <button
                      onClick={() => handleSort("width")}
                      className="hover:text-blue-600 transition w-full text-left"
                    >
                      Size {getSortIcon("width")}
                    </button>
                  </th>
                  <th className="py-2 px-3 text-left font-bold">Color</th>
                </tr>
              </thead>
              <tbody>
                {sortedDetections.map((det, index) => (
                  <tr key={index} className="border-b border-gray-300 bg-white hover:bg-gray-50 transition">
                    <td className="py-2 px-3">{det.id}</td>
                    <td className="py-2 px-3 capitalize font-semibold">{det.class}</td>
                    <td className="py-2 px-3">{(det.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2 px-3">
                      {Math.round(det.x)},{Math.round(det.y)},{Math.round(det.width)},{Math.round(det.height)}
                    </td>
                    <td className="py-2 px-3">{Math.round(det.width * det.height)}px</td>
                    <td className="py-2 px-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-800 inline-block"
                        style={{ backgroundColor: det.color }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2 font-mono">💡 Click column headers to sort</p>
        </div>

        {/* Spatial Distribution Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-800">
            SPATIAL DISTRIBUTION GRID
          </h2>
          <div className="border-2 border-gray-800 p-6 bg-white">
            <p className="font-mono text-sm mb-4">Image Regions:</p>

            <div className="mb-4">
              <table className="w-full border-2 border-gray-800 font-mono text-sm">
                <tbody>
                  {spatialGrid.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => {
                        const classCounts = cell.reduce((acc, item) => {
                          acc[item.class] = (acc[item.class] || 0) + 1;
                          return acc;
                        }, {});

                        return (
                          <td
                            key={colIndex}
                            className="border-2 border-gray-800 p-4 text-center align-top h-32"
                          >
                            {cell.length > 0 ? (
                              <div>
                                {Object.entries(classCounts).map(([className, count]) => (
                                  <div key={className} className="mb-1">
                                    <p className="font-bold capitalize text-sm">{className}</p>
                                    <p className="text-2xl font-bold">{count}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-3xl font-bold text-gray-300">0</p>
                            )}
                          </td>
                        );
                      })}
                      <td className="pl-4 text-sm text-gray-600 align-middle">
                        {rowIndex === 0 && "Top Row"}
                        {rowIndex === 1 && "Middle Row"}
                        {rowIndex === 2 && "Bottom Row"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="font-mono text-sm text-center text-gray-600">
              {(() => {
                const filledCells = spatialGrid.flat().filter((cell) => cell.length > 0).length;
                const totalObjects = spatialGrid.flat().reduce((sum, cell) => sum + cell.length, 0);
                return `${totalObjects} object${
                  totalObjects !== 1 ? "s" : ""
                } distributed across ${filledCells} region${filledCells !== 1 ? "s" : ""}`;
              })()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <button
            onClick={() => navigateToResults(navigate, results)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded border-2 border-blue-800 transition"
          >
            ← Back to Results
          </button>
          <button
            onClick={handleDownloadImage}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded border-2 border-teal-800 transition"
          >
            🖼️ Download Image
          </button>
          <button
            onClick={handleExportJSON}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded border-2 border-green-800 transition"
          >
            📄 Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded border-2 border-purple-800 transition"
          >
            📊 Export CSV
          </button>
          {allAlgorithms.length > 1 && (
            <button
              onClick={() => navigateToComparison(navigate, results)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded border-2 border-orange-800 transition"
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
