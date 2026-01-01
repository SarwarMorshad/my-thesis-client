// src/components/results/QuickStats.jsx
const QuickStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Objects Detected */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#005F50] transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Objects Detected</p>
        <p className="text-3xl font-bold text-gray-900">{stats.objectsDetected}</p>
      </div>

      {/* Processing Time */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#005F50] transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Processing Time</p>
        <p className="text-3xl font-bold text-gray-900">{stats.processingTime}</p>
      </div>

      {/* Avg Confidence */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#005F50] transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
        <p className="text-3xl font-bold text-gray-900">{stats.avgConfidence}</p>
      </div>

      {/* Classes Found */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#005F50] transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">Classes Found</p>
        <p className="text-3xl font-bold text-gray-900">{stats.classesFound}</p>
      </div>
    </div>
  );
};

export default QuickStats;
