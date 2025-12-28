// src/components/algorithm/DetectionSettings.jsx
import { useState } from "react";
import { DEFAULT_SETTINGS, CLASS_FILTERS } from "../../constants/settings";

const DetectionSettings = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
      <h3 className="text-xl font-bold text-white mb-2">⚙️ Detection Settings</h3>
      <p className="text-gray-400 text-sm mb-6">These settings apply to all selected algorithms</p>

      <div className="space-y-6">
        {/* Confidence Threshold */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-white font-medium">Confidence Threshold</label>
            <span className="text-blue-400 font-mono text-sm">{settings.confidenceThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.confidenceThreshold}
            onChange={(e) => handleChange("confidenceThreshold", parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-gray-400 text-sm mt-2">
            Minimum confidence score to consider a detection valid (0-1)
          </p>
        </div>

        {/* NMS Threshold */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-white font-medium">NMS Threshold</label>
            <span className="text-blue-400 font-mono text-sm">{settings.nmsThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.nmsThreshold}
            onChange={(e) => handleChange("nmsThreshold", parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <p className="text-gray-400 text-sm mt-2">
            Non-Maximum Suppression threshold for removing overlapping boxes (0-1)
          </p>
        </div>

        {/* Class Filter */}
        <div>
          <label className="text-white font-medium mb-3 block">Filter by Class</label>
          <div className="flex flex-wrap gap-3">
            {CLASS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleChange("filterClass", filter.value)}
                className={`px-4 py-2 rounded-lg transition ${
                  settings.filterClass === filter.value
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-3">Filter detections to show only specific object classes</p>
        </div>
      </div>
    </div>
  );
};

export default DetectionSettings;
