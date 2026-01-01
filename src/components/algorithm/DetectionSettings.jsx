// src/components/algorithm/DetectionSettings.jsx
import { useState } from "react";

const DetectionSettings = ({ onSettingsChange }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [nmsThreshold, setNmsThreshold] = useState(0.45);
  const [classFilter, setClassFilter] = useState("all");

  const handleChange = () => {
    onSettingsChange({
      confidenceThreshold,
      nmsThreshold,
      classFilter,
    });
  };

  const handleConfidenceChange = (e) => {
    setConfidenceThreshold(parseFloat(e.target.value));
    handleChange();
  };

  const handleNmsChange = (e) => {
    setNmsThreshold(parseFloat(e.target.value));
    handleChange();
  };

  const handleClassFilterChange = (filter) => {
    setClassFilter(filter);
    handleChange();
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#005F50] rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Detection Settings</h3>
          <p className="text-sm text-gray-600">Configure detection parameters</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Confidence Threshold */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-900">Confidence Threshold</label>
            <span className="text-lg font-bold text-[#005F50]">{confidenceThreshold.toFixed(2)}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidenceThreshold}
            onChange={handleConfidenceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #005F50 0%, #005F50 ${
                confidenceThreshold * 100
              }%, #e5e7eb ${confidenceThreshold * 100}%, #e5e7eb 100%)`,
            }}
          />

          <p className="text-xs text-gray-600 mt-2">
            Minimum confidence score to consider a detection valid (0-1)
          </p>

          {/* Visual indicators */}
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low (0.0)</span>
            <span>Medium (0.5)</span>
            <span>High (1.0)</span>
          </div>
        </div>

        {/* NMS Threshold */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-900">NMS Threshold</label>
            <span className="text-lg font-bold text-[#005F50]">{nmsThreshold.toFixed(2)}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={nmsThreshold}
            onChange={handleNmsChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #005F50 0%, #005F50 ${nmsThreshold * 100}%, #e5e7eb ${
                nmsThreshold * 100
              }%, #e5e7eb 100%)`,
            }}
          />

          <p className="text-xs text-gray-600 mt-2">
            Non-Maximum Suppression threshold for removing overlapping boxes (0-1)
          </p>

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Strict (0.0)</span>
            <span>Balanced (0.5)</span>
            <span>Loose (1.0)</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Filter by Class */}
        <div>
          <label className="text-sm font-bold text-gray-900 mb-3 block">Filter by Class</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleClassFilterChange("all")}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                classFilter === "all"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              All classes
            </button>

            <button
              onClick={() => handleClassFilterChange("people")}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                classFilter === "people"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              People only
            </button>

            <button
              onClick={() => handleClassFilterChange("vehicles")}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                classFilter === "vehicles"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Vehicles only
            </button>

            <button
              onClick={() => handleClassFilterChange("animals")}
              className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                classFilter === "animals"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              Animals only
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-3">Filter detections to show only specific object classes</p>
        </div>
      </div>
    </div>
  );
};

export default DetectionSettings;
