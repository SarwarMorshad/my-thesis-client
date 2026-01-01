// src/components/results/ViewControls.jsx
const ViewControls = ({ settings, onSettingsChange }) => {
  const handleToggle = (key) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Display Options</h3>

      <div className="space-y-4">
        {/* Show Labels */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Show Labels</label>
          <button
            onClick={() => handleToggle("showLabels")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showLabels ? "bg-[#005F50]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showLabels ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Show Confidence */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Show Confidence</label>
          <button
            onClick={() => handleToggle("showConfidence")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showConfidence ? "bg-[#005F50]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showConfidence ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Show Bounding Boxes */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Show Bounding Boxes</label>
          <button
            onClick={() => handleToggle("showBoxes")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.showBoxes ? "bg-[#005F50]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.showBoxes ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewControls;
