// src/components/results/DetectionList.jsx
const DetectionList = ({ detections }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Detected Objects ({detections.length})</h3>
      </div>

      {detections.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No objects detected</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting detection settings</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {detections.map((detection, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all"
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Color Indicator */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: detection.color }}
                />

                {/* Detection Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 capitalize">{detection.class}</p>
                    <span className="text-xs text-gray-500">ID: {detection.id}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Position: ({Math.round(detection.x)}, {Math.round(detection.y)}){" • "}
                    Size: {Math.round(detection.width)} × {Math.round(detection.height)}
                  </p>
                </div>

                {/* Confidence Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      detection.confidence >= 0.8
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : detection.confidence >= 0.6
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        : "bg-orange-100 text-orange-700 border border-orange-300"
                    }`}
                  >
                    {Math.round(detection.confidence * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetectionList;
