// src/components/statistics/ConfidenceChart.jsx
import { useMemo } from "react";

const ConfidenceChart = ({ detections }) => {
  const chartData = useMemo(() => {
    if (!detections || detections.length === 0) return [];

    return detections.map((d, index) => ({
      index: index + 1,
      class: d.class,
      confidence: (d.confidence * 100).toFixed(1),
      color: d.color,
    }));
  }, [detections]);

  const maxConfidence = 100;

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">Confidence Distribution</h3>

      {chartData.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No data available</p>
      ) : (
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{item.class}</span>
                <span className="text-white font-bold">{item.confidence}%</span>
              </div>
              <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.confidence}%`,
                    backgroundColor: item.color || "#10b981",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfidenceChart;
