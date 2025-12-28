// src/components/algorithm/AlgorithmCard.jsx
import { useState } from "react";

const AlgorithmCard = ({ algorithm, isSelected, onToggle }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Fast":
        return "bg-green-500/20 text-green-400";
      case "Light":
        return "bg-blue-500/20 text-blue-400";
      case "Balanced":
        return "bg-orange-500/20 text-orange-400";
      case "Mobile":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div
      className={`border rounded-2xl p-6 transition cursor-pointer ${
        isSelected
          ? "bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/50"
          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
      }`}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
              isSelected ? "bg-blue-500" : "bg-white/10"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-5 h-5 accent-blue-500 pointer-events-none"
            />
          </div>

          {/* Name & Version */}
          <div>
            <h3 className="text-xl font-bold text-white">{algorithm.name}</h3>
            <p className="text-sm text-gray-400">{algorithm.version}</p>
          </div>
        </div>

        {/* Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(algorithm.badge)}`}>
          {algorithm.badge}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-3">{algorithm.description}</p>
      <p className="text-gray-400 text-sm mb-6">
        <span className="text-gray-500">Best for:</span> {algorithm.bestFor}
      </p>

      {/* Specifications Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Model Size</p>
          <p className="text-white font-medium text-sm">{algorithm.specs.modelSize}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Speed</p>
          <p className="text-white font-medium text-sm">{algorithm.specs.speed}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Classes</p>
          <p className="text-white font-medium text-sm">{algorithm.specs.classes}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Accuracy</p>
          <p className="text-white font-medium text-sm">{algorithm.specs.accuracy}</p>
        </div>
      </div>

      {/* Features List (Collapsible) */}
      {showDetails && (
        <div className="mb-4 p-4 bg-white/5 rounded-lg animate-fadeIn">
          <h4 className="text-white font-medium text-sm mb-3">Key Features:</h4>
          <ul className="space-y-2">
            {algorithm.features.map((feature, index) => (
              <li key={index} className="text-gray-300 text-sm flex items-center gap-2">
                <span className="text-green-400">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Links */}
      <div className="flex gap-3 text-sm">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="text-blue-400 hover:text-blue-300 transition"
        >
          {showDetails ? "Hide Details" : "View Details"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open("#", "_blank");
          }}
          className="text-gray-400 hover:text-gray-300 transition"
        >
          Documentation →
        </button>
      </div>
    </div>
  );
};

export default AlgorithmCard;
