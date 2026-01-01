// src/pages/AlgorithmSelectionPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { algorithms, getAlgorithmsByIds } from "../constants/algorithms";
import AlgorithmCard from "../components/algorithm/AlgorithmCard";
import DetectionSettings from "../components/algorithm/DetectionSettings";

const AlgorithmSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [detectionSettings, setDetectionSettings] = useState(null);
  const [inputData, setInputData] = useState(null);

  useEffect(() => {
    if (location.state) {
      setInputData(location.state);
    } else {
      const data = sessionStorage.getItem("inputData");
      if (data) {
        setInputData(JSON.parse(data));
      } else {
        navigate("/input");
      }
    }
  }, [navigate, location.state]);

  const toggleAlgorithm = (algorithmId) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithmId) ? prev.filter((id) => id !== algorithmId) : [...prev, algorithmId]
    );
  };

  const handleStartProcessing = () => {
    if (selectedAlgorithms.length === 0) {
      alert("Please select at least one algorithm");
      return;
    }

    const processingData = {
      fileInfo: {
        name: inputData.fileInfo.name,
        type: inputData.fileInfo.type,
        size: inputData.fileInfo.size,
        resolution: inputData.fileInfo.resolution,
        width: inputData.fileInfo.width,
        height: inputData.fileInfo.height,
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
      sessionStorage.setItem("processingData", JSON.stringify(processingData));
    } catch (error) {
      console.warn("Could not store in sessionStorage:", error.message);
    }

    navigate("/processing", {
      state: {
        ...processingData,
        fileInfo: {
          ...processingData.fileInfo,
          url: inputData.fileInfo.url,
        },
      },
    });
  };

  const selectedAlgoObjects = getAlgorithmsByIds(selectedAlgorithms);

  return (
    <div className="min-h-screen bg-[#E6E6E6]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🎯 Select Detection Algorithms</h1>
              <p className="text-sm text-gray-600 mt-1">Choose one or more algorithms to run</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">File:</p>
              <p className="font-semibold text-gray-900">{inputData?.fileInfo?.name || "Loading..."}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 pb-32">
        {/* Selection Counter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#005F50] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{selectedAlgorithms.length}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {selectedAlgorithms.length} algorithm{selectedAlgorithms.length !== 1 && "s"} selected
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAlgorithms.length === 0 && "Select at least one algorithm to continue"}
                  {selectedAlgorithms.length === 1 && "Single algorithm mode"}
                  {selectedAlgorithms.length >= 2 && "Comparison mode enabled"}
                </p>
              </div>
            </div>

            {selectedAlgorithms.length > 0 && (
              <button
                onClick={() => setSelectedAlgorithms([])}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        {/* Selected Algorithms Preview */}
        {selectedAlgorithms.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
            <p className="text-sm font-bold text-blue-900 mb-2">Selected Algorithms:</p>
            <div className="flex flex-wrap gap-2">
              {selectedAlgoObjects.map((algo) => (
                <div
                  key={algo.id}
                  className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-300"
                >
                  <span className="text-sm font-medium text-gray-900">{algo.name}</span>
                  <button
                    onClick={() => toggleAlgorithm(algo.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Algorithm Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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
        {selectedAlgorithms.length > 0 && (
          <div className="mb-8">
            <DetectionSettings onSettingsChange={setDetectionSettings} />
          </div>
        )}
        {/* Fixed Bottom Action Bar */}
        {/* Continue Button Banner - When algorithms are selected */}
        {selectedAlgorithms.length > 0 && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-8 animate-bounce-once">
            <div className="flex items-center justify-between">
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
                  <p className="font-bold text-green-900">Ready to Process!</p>
                  <p className="text-sm text-green-700">
                    {selectedAlgorithms.length} algorithm{selectedAlgorithms.length !== 1 && "s"} selected
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartProcessing}
                className="px-8 py-3 bg-[#005F50] hover:bg-[#007A65] text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                Continue to Processing
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
        )}
      </main>
    </div>
  );
};

export default AlgorithmSelectionPage;
