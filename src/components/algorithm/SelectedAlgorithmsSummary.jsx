// src/components/algorithm/SelectedAlgorithmsSummary.jsx

const SelectedAlgorithmsSummary = ({ algorithms, onRemove }) => {
  if (algorithms.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
      <h4 className="text-white font-medium mb-4">Selected Algorithms ({algorithms.length})</h4>
      <div className="flex flex-wrap gap-3">
        {algorithms.map((algo) => (
          <div
            key={algo.id}
            className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-lg px-4 py-2"
          >
            <span className="text-white font-medium">{algo.name}</span>
            <button onClick={() => onRemove(algo.id)} className="text-gray-400 hover:text-white transition">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedAlgorithmsSummary;
