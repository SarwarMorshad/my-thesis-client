// src/components/statistics/ClassDistribution.jsx

const ClassDistribution = ({ detections }) => {
  if (!detections || detections.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Class Distribution</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  // Count classes
  const classCounts = detections.reduce((acc, detection) => {
    acc[detection.class] = (acc[detection.class] || 0) + 1;
    return acc;
  }, {});

  const total = detections.length;
  const classData = Object.entries(classCounts).map(([className, count]) => ({
    class: className,
    count,
    percentage: ((count / total) * 100).toFixed(1),
    color: detections.find((d) => d.class === className)?.color || "#10b981",
  }));

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">Class Distribution</h3>

      <div className="space-y-4">
        {classData.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">{item.class}</span>
              <span className="text-white">
                <span className="font-bold">{item.count}</span> ({item.percentage}%)
              </span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassDistribution;
