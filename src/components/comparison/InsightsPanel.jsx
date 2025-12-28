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
    text: `${
      algorithms.find((a) => a.id === highestConf.id)?.name
    } has ${confDiff}% higher confidence scores on average`,
    type: "confidence",
  });

  // Model size comparison
  insights.push({
    icon: "💾",
    text: `Model sizes range from ${Math.min(
      ...algorithms.map((a) => parseFloat(a.specs.modelSize))
    )}MB to ${Math.max(...algorithms.map((a) => parseFloat(a.specs.modelSize)))}MB`,
    type: "size",
  });

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <span>💡</span>
        Key Insights
      </h3>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
          >
            <span className="text-2xl">{insight.icon}</span>
            <p className="text-gray-300 text-sm flex-1">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
