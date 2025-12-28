// src/components/comparison/SideBySideView.jsx
import { useState } from "react";

const SideBySideView = ({ algorithms, imageUrl }) => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'slider'

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white font-bold">Visual Comparison</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("slider")}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              viewMode === "slider" ? "bg-blue-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Slider View
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div
          className={`grid gap-4 ${
            algorithms.length === 2 ? "grid-cols-2" : algorithms.length === 3 ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {algorithms.map((algo) => (
            <div key={algo.id} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: algo.color }} />
                <p className="text-white font-medium">{algo.name}</p>
              </div>
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <img
                  src={imageUrl || "/placeholder.png"}
                  alt={`${algo.name} result`}
                  className="w-full h-full object-cover opacity-50"
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Objects:</span>
                <span className="text-white font-bold">{Math.floor(Math.random() * 5) + 3}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <img
              src={imageUrl || "/placeholder.png"}
              alt="Comparison"
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">Slider view coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default SideBySideView;
