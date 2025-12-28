// src/components/results/ViewControls.jsx

const ViewControls = ({ settings, onSettingsChange }) => {
  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">Display Options</h3>
      <div className="space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-300">Show Labels</span>
          <input
            type="checkbox"
            checked={settings.showLabels}
            onChange={(e) => onSettingsChange({ ...settings, showLabels: e.target.checked })}
            className="w-5 h-5 accent-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-300">Show Confidence</span>
          <input
            type="checkbox"
            checked={settings.showConfidence}
            onChange={(e) => onSettingsChange({ ...settings, showConfidence: e.target.checked })}
            className="w-5 h-5 accent-blue-500"
          />
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-300">Show Bounding Boxes</span>
          <input
            type="checkbox"
            checked={settings.showBoxes}
            onChange={(e) => onSettingsChange({ ...settings, showBoxes: e.target.checked })}
            className="w-5 h-5 accent-blue-500"
          />
        </label>
      </div>
    </div>
  );
};

export default ViewControls;
