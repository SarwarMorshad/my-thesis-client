// src/components/algorithm/AlgorithmCard.jsx
import React, { useState } from "react";

const AlgorithmCard = ({ algorithm, isSelected, onToggle }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`border rounded-2xl p-6 transition cursor-pointer ${
        isSelected ? "bg-blue-500/10 border-blue-500" : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isSelected ? "bg-blue-500" : "bg-white/10"
            }`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              className="w-5 h-5 accent-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{algorithm.name}</h3>
            <p className="text-sm text-gray-400">{algorithm.version}</p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            algorithm.badge === "Fast"
              ? "bg-green-500/20 text-green-400"
              : algorithm.badge === "Light"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-orange-500/20 text-orange-400"
          }`}
        >
          {algorithm.badge}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4">{algorithm.description}</p>
      <p className="text-gray-400 text-sm mb-6">Best for: {algorithm.bestFor}</p>

      {/* Specifications */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Model Size</p>
          <p className="text-white font-medium">{algorithm.specs.modelSize}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Speed</p>
          <p className="text-white font-medium">{algorithm.specs.speed}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Classes</p>
          <p className="text-white font-medium">{algorithm.specs.classes}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-1">Accuracy</p>
          <p className="text-white font-medium">{algorithm.specs.accuracy}</p>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          View Sample Results
        </button>
        <button onClick={(e) => e.stopPropagation()} className="text-sm text-gray-400 hover:text-gray-300">
          Documentation
        </button>
      </div>
    </div>
  );
};

export default AlgorithmCard;
