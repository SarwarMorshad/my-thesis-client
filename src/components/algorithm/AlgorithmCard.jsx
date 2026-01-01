// src/components/algorithm/AlgorithmCard.jsx
const AlgorithmCard = ({ algorithm, isSelected, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className={`bg-white rounded-xl border-2 p-6 transition-all cursor-pointer ${
        isSelected ? "border-[#005F50] shadow-lg" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div
            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
              isSelected ? "bg-[#005F50] border-[#005F50]" : "border-gray-300"
            }`}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Name */}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{algorithm.name}</h3>
            <p className="text-xs text-gray-500">{algorithm.version}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{algorithm.description}</p>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Speed</p>
          <p className="text-sm font-bold text-gray-900">{algorithm.specs.speed}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Accuracy</p>
          <p className="text-sm font-bold text-gray-900">{algorithm.specs.accuracy}</p>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmCard;
