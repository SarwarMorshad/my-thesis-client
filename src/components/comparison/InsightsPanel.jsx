// src/components/comparison/InsightsPanel.jsx

const InsightsPanel = ({ algorithms, data }) => {
  // Generate insights based on data
  const insights = [];

  // Speed comparison
  const speeds = Object.entries(data.speed).map(([id, speed]) => ({ id, speed }));
  const fastest = speeds.reduce((min, curr) => (curr.speed < min.speed ? curr : min));
  const slowest = speeds.reduce((max, curr) => (curr.speed > max.speed ? curr : max));
  const speedDiff = (((slowest.speed - fastest.speed) / fastest.speed) * 100).toFixed(0);

  insights.push({
    icon: "⚡",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: `${algorithms.find((a) => a.id === fastest.id)?.name} is ${speedDiff}% faster than ${
      algorithms.find((a) => a.id === slowest.id)?.name
    }`,
    type: "speed",
  });

  // Detection comparison
  const detections = Object.entries(data.detections).map(([id, count]) => ({ id, count }));
  const mostDetections = detections.reduce((max, curr) => (curr.count > max.count ? curr : max));
  const leastDetections = detections.reduce((min, curr) => (curr.count < min.count ? curr : min));
  const detectionDiff = mostDetections.count - leastDetections.count;

  if (detectionDiff > 0) {
    insights.push({
      icon: "🎯",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      text: `${
        algorithms.find((a) => a.id === mostDetections.id)?.name
      } detected ${detectionDiff} more object${detectionDiff > 1 ? "s" : ""} than ${
        algorithms.find((a) => a.id === leastDetections.id)?.name
      }`,
      type: "detection",
    });
  }

  // Confidence comparison
  const confidences = Object.entries(data.confidence).map(([id, conf]) => ({ id, conf }));
  const highestConf = confidences.reduce((max, curr) => (curr.conf > max.conf ? curr : max));
  const confDiff = (highestConf.conf - Math.min(...confidences.map((c) => c.conf))).toFixed(0);

  insights.push({
    icon: "📊",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: `${
      algorithms.find((a) => a.id === highestConf.id)?.name
    } has ${confDiff}% higher confidence scores on average`,
    type: "confidence",
  });

  // Model size comparison
  insights.push({
    icon: "💾",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: `Model sizes range from ${Math.min(
      ...algorithms.map((a) => parseFloat(a.specs.modelSize))
    )}MB to ${Math.max(...algorithms.map((a) => parseFloat(a.specs.modelSize)))}MB`,
    type: "size",
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-[#005F50] rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 ${insight.bg} ${insight.border} transition-all hover:shadow-md`}
          >
            <div className={`text-2xl flex-shrink-0 ${insight.color}`}>{insight.icon}</div>
            <p className="text-gray-700 text-sm font-medium flex-1 leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          💡 These insights help you choose the best algorithm for your specific use case
        </p>
      </div>
    </div>
  );
};

export default InsightsPanel;
