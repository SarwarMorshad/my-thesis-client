// src/components/comparison/PerformanceTable.jsx

const PerformanceTable = ({ algorithms, metrics }) => {
  const algorithmColors = {
    "coco-ssd": "#10b981",
    yolov8: "#3b82f6",
    yolov5: "#f59e0b",
    "mobilenet-ssd": "#8b5cf6",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#005F50] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">Performance Comparison</h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700 font-bold text-sm">Metric</th>
              {algorithms.map((algo) => (
                <th key={algo.id} className="text-center py-3 px-4 text-gray-700 font-bold text-sm">
                  {algo.name}
                </th>
              ))}
              <th className="text-center py-3 px-4 text-gray-700 font-bold text-sm">Best</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="py-3 px-4 text-gray-900 font-medium text-sm">{metric.name}</td>
                {algorithms.map((algo) => {
                  const value = metric.values[algo.id];
                  const isWinner = metric.winner === algo.id;
                  const color = algorithmColors[algo.id] || algo.color;

                  return (
                    <td key={algo.id} className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold text-sm ${isWinner ? "text-gray-900" : "text-gray-600"}`}>
                          {value}
                        </span>
                        {isWinner && (
                          <svg className="w-5 h-5" style={{ color }} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center py-3 px-4">
                  <span
                    className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2"
                    style={{
                      backgroundColor: `${
                        algorithmColors[metric.winner] ||
                        algorithms.find((a) => a.id === metric.winner)?.color
                      }15`,
                      color:
                        algorithmColors[metric.winner] ||
                        algorithms.find((a) => a.id === metric.winner)?.color,
                      borderColor: `${
                        algorithmColors[metric.winner] ||
                        algorithms.find((a) => a.id === metric.winner)?.color
                      }40`,
                    }}
                  >
                    {algorithms.find((a) => a.id === metric.winner)?.name}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-gray-600 font-medium">= Best performer for this metric</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTable;
