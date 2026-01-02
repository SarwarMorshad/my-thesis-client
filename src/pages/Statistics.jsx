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
    if (sortConfig.key !== key) {
      return (
        <svg className="w-4 h-4 inline-block ml-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
        </svg>
      );
    }
    return sortConfig.direction === "asc" ? (
      <svg className="w-4 h-4 inline-block ml-1 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg className="w-4 h-4 inline-block ml-1 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
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
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-700 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  // Chart data preparation
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

  const scatterData = realDetections.map((det) => ({
    x: det.x + det.width / 2,
    y: det.y + det.height / 2,
    z: det.width * det.height,
    class: det.class,
    confidence: Math.round(det.confidence * 100),
  }));

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

  // Spatial distribution grid
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
    <div className="min-h-screen bg-[#E6E6E6] pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#005F50] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{algorithm.name} - Detailed Statistics</h1>
                <p className="text-sm text-gray-600">{results.fileInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Algorithm Selector */}
        {allAlgorithms.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <p className="text-sm font-bold text-gray-900 mb-3">Switch Algorithm:</p>
            <div className="flex flex-wrap gap-3">
              {allAlgorithms.map((algo) => {
                const isActive = algo.id === currentAlgorithmId;
                const algoDetections = results.detectionResults?.[algo.id]?.detections?.length || 0;
                return (
                  <button
                    key={algo.id}
                    onClick={() => handleAlgorithmChange(algo.id)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                      isActive
                        ? "bg-[#005F50] text-white border-[#005F50] shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <p className="font-bold">{algo.name}</p>
                    <p className="text-xs opacity-80">{algoDetections} objects</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Total Objects</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDetections}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Processing Time</p>
            <p className="text-3xl font-bold text-gray-900">{stats.processingTime}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Avg Confidence</p>
            <p className="text-3xl font-bold text-gray-900">{stats.avgConfidence}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Unique Classes</p>
            <p className="text-3xl font-bold text-gray-900">{stats.uniqueClasses}</p>
          </div>
        </div>

        {/* Charts */}
        {realDetections.length > 0 && (
          <>
            {/* Confidence Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Confidence Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confidenceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: "Confidence (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="confidence" />
                </BarChart>
              </ResponsiveContainer>
              {highestConfidence && lowestConfidence && (
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 font-medium mb-1">Highest</p>
                    <p className="text-gray-900 font-bold capitalize">
                      {highestConfidence.class} ({(highestConfidence.confidence * 100).toFixed(0)}%)
                    </p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-orange-700 font-medium mb-1">Lowest</p>
                    <p className="text-gray-900 font-bold capitalize">
                      {lowestConfidence.class} ({(lowestConfidence.confidence * 100).toFixed(0)}%)
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-700 font-medium mb-1">Average</p>
                    <p className="text-gray-900 font-bold">{stats.avgConfidence}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Class Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Class Distribution</h2>
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

            {/* Object Size Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Object Size Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sizeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis label={{ value: "Size (pixels²)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} px²`} />
                  <Bar dataKey="size" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Spatial Position Scatter Plot */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Spatial Position Distribution</h2>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
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
                          <div className="bg-white border-2 border-gray-300 rounded-lg p-3 shadow-lg">
                            <p className="text-sm">
                              <strong>Class:</strong> {data.class}
                            </p>
                            <p className="text-sm">
                              <strong>Position:</strong> ({Math.round(data.x)}, {Math.round(data.y)})
                            </p>
                            <p className="text-sm">
                              <strong>Size:</strong> {data.z.toLocaleString()} px²
                            </p>
                            <p className="text-sm">
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
              <p className="text-xs text-gray-600 text-center mt-2">
                Bubble size represents object size. Hover for details.
              </p>
            </div>
          </>
        )}

        {/* Detection Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Detected Objects</h2>
            <p className="text-sm text-gray-600 mt-1">Click column headers to sort</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort("id")}
                      className="hover:text-[#005F50] transition font-bold text-gray-700 flex items-center"
                    >
                      ID {getSortIcon("id")}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort("class")}
                      className="hover:text-[#005F50] transition font-bold text-gray-700 flex items-center"
                    >
                      Class {getSortIcon("class")}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort("confidence")}
                      className="hover:text-[#005F50] transition font-bold text-gray-700 flex items-center"
                    >
                      Confidence {getSortIcon("confidence")}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-gray-700">Position</th>
                  <th className="py-3 px-4 text-left">
                    <button
                      onClick={() => handleSort("width")}
                      className="hover:text-[#005F50] transition font-bold text-gray-700 flex items-center"
                    >
                      Size {getSortIcon("width")}
                    </button>
                  </th>
                  <th className="py-3 px-4 text-left font-bold text-gray-700">Color</th>
                </tr>
              </thead>
              <tbody>
                {sortedDetections.map((det, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-900">{det.id}</td>
                    <td className="py-3 px-4 capitalize font-semibold text-gray-900">{det.class}</td>
                    <td className="py-3 px-4 text-gray-900">{(det.confidence * 100).toFixed(0)}%</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      ({Math.round(det.x)}, {Math.round(det.y)}) • {Math.round(det.width)}×
                      {Math.round(det.height)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{Math.round(det.width * det.height)} px²</td>
                    <td className="py-3 px-4">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-gray-300"
                        style={{ backgroundColor: det.color }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Spatial Distribution Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Spatial Distribution Grid</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-2 border-gray-300">
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
                          className="border-2 border-gray-300 p-6 text-center align-top h-32 bg-gray-50"
                        >
                          {cell.length > 0 ? (
                            <div>
                              {Object.entries(classCounts).map(([className, count]) => (
                                <div key={className} className="mb-2">
                                  <p className="font-bold capitalize text-sm text-gray-700">{className}</p>
                                  <p className="text-2xl font-bold text-gray-900">{count}</p>
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
          <p className="text-sm text-center text-gray-600 mt-4">
            {(() => {
              const filledCells = spatialGrid.flat().filter((cell) => cell.length > 0).length;
              const totalObjects = spatialGrid.flat().reduce((sum, cell) => sum + cell.length, 0);
              return `${totalObjects} object${
                totalObjects !== 1 ? "s" : ""
              } distributed across ${filledCells} region${filledCells !== 1 ? "s" : ""}`;
            })()}
          </p>
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
                onClick={handleDownloadImage}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition"
              >
                🖼️ Download Image
              </button>
              <button
                onClick={handleExportJSON}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition"
              >
                📄 Export JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition"
              >
                📊 Export CSV
              </button>
              {allAlgorithms.length > 1 && (
                <button
                  onClick={() => navigateToComparison(navigate, results)}
                  className="px-6 py-3 bg-[#005F50] hover:bg-[#007A65] text-white font-bold rounded-lg transition"
                >
                  🔬 Compare Algorithms
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
