// src/components/processing/ProcessingStats.jsx

const ProcessingStats = ({ overallProgress, stats }) => {
  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-lg mb-4">Overall Progress</h3>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 text-sm">Total Progress</span>
          <span className="text-blue-400 font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white mb-1">{stats.completed}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400 mb-1">{stats.processing}</p>
          <p className="text-xs text-gray-400">Processing</p>
        </div>
        <div className="bg-white/5 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-400 mb-1">{stats.queued}</p>
          <p className="text-xs text-gray-400">Queued</p>
        </div>
      </div>

      {/* Estimated Time */}
      {stats.estimatedTimeRemaining && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Estimated time remaining:{" "}
            <span className="text-white font-medium">{stats.estimatedTimeRemaining}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessingStats;
