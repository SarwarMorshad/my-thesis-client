// src/pages/AlgorithmSelectionPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { algorithms, getAlgorithmsByIds } from "../constants/algorithms";
import AlgorithmCard from "../components/algorithm/AlgorithmCard";
import DetectionSettings from "../components/algorithm/DetectionSettings";
import AlgorithmComparison from "../components/algorithm/AlgorithmComparison";
import SelectedAlgorithmsSummary from "../components/algorithm/SelectedAlgorithmsSummary";

const AlgorithmSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [detectionSettings, setDetectionSettings] = useState(null);
  const [inputData, setInputData] = useState(null);

  // Load input data from sessionStorage or location state
  useEffect(() => {
    // Try to get from location state first (from navigation)
    if (location.state) {
      setInputData(location.state);
    } else {
      // Fallback to sessionStorage
      const data = sessionStorage.getItem("inputData");
      if (data) {
        setInputData(JSON.parse(data));
      } else {
        // If no input data, redirect back to input page
        navigate("/input");
      }
    }
  }, [navigate, location.state]);

  // Toggle algorithm selection
  const toggleAlgorithm = (algorithmId) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmId) ? prev.filter((id) => id !== algorithmId) : [...prev, algorithmId]
    );
  };

  // Remove algorithm from selection
  const removeAlgorithm = (algorithmId) => {
    setSelectedAlgorithms((prev) => prev.filter((id) => id !== algorithmId));
  };

  // Handle start processing
  const handleStartProcessing = () => {
    if (selectedAlgorithms.length === 0) {
      alert("Please select at least one algorithm");
      return;
    }

    // Create minimal data object WITHOUT the base64 image URL
    const processingData = {
      fileInfo: {
        name: inputData.fileInfo.name,
        type: inputData.fileInfo.type,
        size: inputData.fileInfo.size,
        resolution: inputData.fileInfo.resolution,
        width: inputData.fileInfo.width,
        height: inputData.fileInfo.height,
        // DON'T include url - it's too large for sessionStorage
        ...(inputData.inputType === "video" && {
          duration: inputData.fileInfo.duration,
          durationSeconds: inputData.fileInfo.durationSeconds,
          fps: inputData.fileInfo.fps,
          totalFrames: inputData.fileInfo.totalFrames,
        }),
      },
      inputType: inputData.inputType,
      videoSettings: inputData.videoSettings,
      selectedAlgorithms: selectedAlgorithms,
      detectionSettings: detectionSettings,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try to store in sessionStorage (without the URL)
      sessionStorage.setItem("processingData", JSON.stringify(processingData));
      console.log("Processing data stored successfully");
    } catch (error) {
      console.warn("Could not store in sessionStorage:", error.message);
      // Continue anyway - we'll use location.state
    }

    // Navigate with full data including URL in location.state
    navigate("/processing", {
      state: {
        ...processingData,
        fileInfo: {
          ...processingData.fileInfo,
          url: inputData.fileInfo.url, // Include URL in navigation state only
        },
      },
    });
  };

  const selectedAlgoObjects = getAlgorithmsByIds(selectedAlgorithms);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 border-b border-white/10 sticky top-0 bg-slate-900/80 backdrop-blur-lg z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition flex items-center gap-2"
            >
              <span>←</span> Back
            </button>
            <h1 className="text-2xl font-bold text-white">🔬 Algorithm Selection</h1>
          </div>
          <div className="text-sm text-gray-400">
            Input: <span className="text-white font-medium">{inputData?.fileInfo?.name || "Loading..."}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
          <p className="text-blue-200 text-sm flex items-center gap-2">
            <span>💡</span>
            Select multiple algorithms to enable comparison mode and analyze performance differences
          </p>
        </div>

        {/* Selection Info */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Select Detection Algorithm(s)</h2>
            <div className="text-gray-300">
              Selected:{" "}
              <span
                className={`font-bold ${selectedAlgorithms.length > 0 ? "text-blue-400" : "text-gray-400"}`}
              >
                {selectedAlgorithms.length}
              </span>{" "}
              algorithm{selectedAlgorithms.length !== 1 && "s"}
            </div>
          </div>

          {/* Selected Algorithms Summary */}
          {selectedAlgorithms.length > 0 && (
            <SelectedAlgorithmsSummary algorithms={selectedAlgoObjects} onRemove={removeAlgorithm} />
          )}
        </div>

        {/* Comparison Mode Info */}
        {selectedAlgorithms.length >= 2 && (
          <div className="mb-8">
            <AlgorithmComparison selectedAlgorithms={selectedAlgorithms} />
          </div>
        )}

        {/* Algorithm Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {algorithms.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.id}
              algorithm={algorithm}
              isSelected={selectedAlgorithms.includes(algorithm.id)}
              onToggle={() => toggleAlgorithm(algorithm.id)}
            />
          ))}
        </div>

        {/* Detection Settings */}
        <div className="mb-12">
          <DetectionSettings onSettingsChange={setDetectionSettings} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center sticky bottom-6 bg-slate-900/95 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition flex items-center gap-2"
          >
            <span>←</span> Back to Input
          </button>

          <div className="flex items-center gap-4">
            {selectedAlgorithms.length > 0 && (
              <div className="text-sm text-gray-400">
                Ready to process with {selectedAlgorithms.length} algorithm
                {selectedAlgorithms.length !== 1 && "s"}
              </div>
            )}
            <button
              onClick={handleStartProcessing}
              disabled={selectedAlgorithms.length === 0}
              className={`px-8 py-4 rounded-xl font-medium transition flex items-center gap-2 ${
                selectedAlgorithms.length === 0
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Start Processing
              <span>→</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlgorithmSelectionPage;
