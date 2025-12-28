// src/components/results/DetectionList.jsx - Update for better horizontal layout

const DetectionList = ({ detections, onDetectionClick }) => {
  if (!detections || detections.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <p className="text-gray-400">No detections found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">Detected Objects ({detections.length})</h3>

      {/* Scrollable grid for better horizontal space usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        {detections.map((detection, index) => (
          <div
            key={index}
            onClick={() => onDetectionClick?.(detection)}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer border border-white/10"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: detection.color || "#10b981" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm capitalize truncate">{detection.class}</p>
                <p className="text-gray-400 text-xs">
                  ID: {detection.id + 1} • Position: ({Math.round(detection.x)}, {Math.round(detection.y)})
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-white font-bold text-sm">{(detection.confidence * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-400">confidence</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DetectionList;
