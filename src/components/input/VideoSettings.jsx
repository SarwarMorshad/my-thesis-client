// src/components/input/VideoSettings.jsx
import { useState } from "react";
import { VIDEO_SETTINGS } from "../../constants/settings";

const VideoSettings = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    sampling: "5",
    tracking: true,
    timeline: true,
  });

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  return (
    <div className="bg-white/5 rounded-xl p-6 space-y-6">
      <h4 className="text-white font-medium flex items-center gap-2">
        <span>⚙️</span>
        Processing Configuration
      </h4>

      {/* Frame Sampling */}
      <div>
        <label className="text-gray-300 text-sm mb-3 block">Frame Sampling:</label>
        <div className="space-y-2">
          {VIDEO_SETTINGS.samplingOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white transition"
            >
              <input
                type="radio"
                name="sampling"
                value={option.value}
                checked={settings.sampling === option.value}
                onChange={(e) => handleChange("sampling", e.target.value)}
                className="accent-blue-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white transition">
          <input
            type="checkbox"
            checked={settings.tracking}
            onChange={(e) => handleChange("tracking", e.target.checked)}
            className="accent-blue-500"
          />
          <span>Enable object tracking across frames</span>
        </label>

        <label className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white transition">
          <input
            type="checkbox"
            checked={settings.timeline}
            onChange={(e) => handleChange("timeline", e.target.checked)}
            className="accent-blue-500"
          />
          <span>Generate timeline visualization</span>
        </label>
      </div>

      {/* Estimated Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-200 text-sm">⚠️ Estimated processing: ~2-3 minutes per algorithm</p>
      </div>
    </div>
  );
};

export default VideoSettings;
