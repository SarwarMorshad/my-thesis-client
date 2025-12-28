// src/components/results/QuickStats.jsx

const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-gray-400 text-sm mb-1">Objects Detected</p>
        <p className="text-white font-bold text-2xl">{stats.objectsDetected || 0}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-gray-400 text-sm mb-1">Processing Time</p>
        <p className="text-white font-bold text-2xl">{stats.processingTime || "N/A"}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-gray-400 text-sm mb-1">Avg Confidence</p>
        <p className="text-white font-bold text-2xl">{stats.avgConfidence || "N/A"}</p>
      </div>
      <div className="bg-white/5 rounded-xl p-4">
        <p className="text-gray-400 text-sm mb-1">Classes Found</p>
        <p className="text-white font-bold text-2xl">{stats.classesFound || 0}</p>
      </div>
    </div>
  );
};

export default QuickStats;
