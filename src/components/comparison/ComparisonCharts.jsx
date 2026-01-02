// src/components/comparison/ComparisonCharts.jsx

const ComparisonCharts = ({ algorithms, data }) => {
  return (
    <div className="space-y-4">
      {/* Processing Speed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            Processing Speed
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">⬇️ Lower is better</span>
        </div>
        <div className="space-y-4">
          {algorithms.map((algo) => {
            const speed = data.speed[algo.id];
            const maxSpeed = Math.max(...Object.values(data.speed), 1);
            const percentage = (speed / maxSpeed) * 100;
            const algorithmColors = {
              "coco-ssd": "#10b981",
              yolov8: "#3b82f6",
              yolov5: "#f59e0b",
              "mobilenet-ssd": "#8b5cf6",
            };
            const color = algorithmColors[algo.id] || algo.color;

            return (
              <div key={algo.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{algo.name}</span>
                  <span className="text-sm font-bold text-gray-900">{speed}ms</span>
                </div>
                <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  >
                    {percentage > 20 && (
                      <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Objects Detected */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Objects Detected
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            ⬆️ Higher is better
          </span>
        </div>
        <div className="space-y-4">
          {algorithms.map((algo) => {
            const count = data.detections[algo.id];
            const maxCount = Math.max(...Object.values(data.detections), 1);
            const percentage = (count / maxCount) * 100;
            const algorithmColors = {
              "coco-ssd": "#10b981",
              yolov8: "#3b82f6",
              yolov5: "#f59e0b",
              "mobilenet-ssd": "#8b5cf6",
            };
            const color = algorithmColors[algo.id] || algo.color;

            return (
              <div key={algo.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{algo.name}</span>
                  <span className="text-sm font-bold text-gray-900">{count} objects</span>
                </div>
                <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  >
                    {percentage > 20 && (
                      <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Average Confidence */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Average Confidence
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            ⬆️ Higher is better
          </span>
        </div>
        <div className="space-y-4">
          {algorithms.map((algo) => {
            const confidence = data.confidence[algo.id];
            const algorithmColors = {
              "coco-ssd": "#10b981",
              yolov8: "#3b82f6",
              yolov5: "#f59e0b",
              "mobilenet-ssd": "#8b5cf6",
            };
            const color = algorithmColors[algo.id] || algo.color;

            return (
              <div key={algo.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{algo.name}</span>
                  <span className="text-sm font-bold text-gray-900">{confidence}%</span>
                </div>
                <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${confidence}%`,
                      backgroundColor: color,
                    }}
                  >
                    {confidence > 20 && <span className="text-xs font-bold text-white">{confidence}%</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ComparisonCharts;
