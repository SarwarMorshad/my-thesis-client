// src/components/comparison/ComparisonCharts.jsx

const ComparisonCharts = ({ algorithms, data }) => {
  return (
    <div className="space-y-6">
      {/* Speed Comparison */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">⚡ Processing Speed</h3>
        <p className="text-gray-400 text-sm mb-4">Lower is better</p>
        <div className="space-y-3">
          {algorithms.map((algo) => {
            const speed = data.speed[algo.id];
            const maxSpeed = Math.max(...Object.values(data.speed));
            const percentage = (speed / maxSpeed) * 100;

            return (
              <div key={algo.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{algo.name}</span>
                  <span className="text-white font-bold">{speed}ms</span>
                </div>
                <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: algo.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detection Count */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">🎯 Objects Detected</h3>
        <p className="text-gray-400 text-sm mb-4">Higher is better</p>
        <div className="space-y-3">
          {algorithms.map((algo) => {
            const count = data.detections[algo.id];
            const maxCount = Math.max(...Object.values(data.detections));
            const percentage = (count / maxCount) * 100;

            return (
              <div key={algo.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{algo.name}</span>
                  <span className="text-white font-bold">{count} objects</span>
                </div>
                <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: algo.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence Comparison */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">📊 Average Confidence</h3>
        <p className="text-gray-400 text-sm mb-4">Higher is better</p>
        <div className="space-y-3">
          {algorithms.map((algo) => {
            const confidence = data.confidence[algo.id];

            return (
              <div key={algo.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{algo.name}</span>
                  <span className="text-white font-bold">{confidence}%</span>
                </div>
                <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${confidence}%`,
                      backgroundColor: algo.color,
                    }}
                  />
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
