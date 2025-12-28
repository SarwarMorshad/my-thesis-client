// src/components/processing/AlgorithmProgress.jsx

const AlgorithmProgress = ({ algorithm, status, progress, stats }) => {
  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "processing":
        return "text-blue-400";
      case "queued":
        return "text-gray-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return "✅";
      case "processing":
        return "🔄";
      case "queued":
        return "⏳";
      case "error":
        return "❌";
      default:
        return "⏳";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "completed":
        return `Complete (${stats?.processingTime || "0s"})`;
      case "processing":
        return `Processing... ${
          stats?.currentFrame ? `Frame ${stats.currentFrame}/${stats.totalFrames}` : ""
        }`;
      case "queued":
        return "Waiting...";
      case "error":
        return "Failed";
      default:
        return "Pending";
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${algorithm.color}20` }}
          >
            <span className="text-xl">{getStatusIcon()}</span>
          </div>
          <div>
            <h3 className="text-white font-bold">{algorithm.name}</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>

        {/* Stats */}
        {status === "completed" && stats?.objectsDetected !== undefined && (
          <div className="text-right">
            <p className="text-white font-bold">{stats.objectsDetected}</p>
            <p className="text-xs text-gray-400">objects detected</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: algorithm.color,
            }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">{progress}%</p>
      </div>

      {/* Additional Stats (for processing/completed) */}
      {(status === "processing" || status === "completed") && stats && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {stats.speed && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Speed</p>
              <p className="text-white font-medium text-sm">{stats.speed}</p>
            </div>
          )}
          {stats.currentFrame && (
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Progress</p>
              <p className="text-white font-medium text-sm">
                {stats.currentFrame}/{stats.totalFrames}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlgorithmProgress;
