// src/components/algorithm/AlgorithmComparison.jsx

const AlgorithmComparison = ({ selectedAlgorithms }) => {
  if (selectedAlgorithms.length < 2) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">🔬</div>
        <div className="flex-1">
          <h4 className="text-white font-bold text-lg mb-2">Comparison Mode Enabled</h4>
          <p className="text-gray-300 text-sm mb-3">
            You've selected <span className="text-blue-400 font-bold">{selectedAlgorithms.length}</span>{" "}
            algorithms. After processing, you'll be able to compare their performance side-by-side.
          </p>
          <ul className="space-y-1 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Visual comparison of detection results
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Performance metrics analysis
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Detection overlap and disagreement tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmComparison;
