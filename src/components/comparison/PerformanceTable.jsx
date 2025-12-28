// src/components/comparison/PerformanceTable.jsx

const PerformanceTable = ({ algorithms, metrics }) => {
  const getWinnerIcon = (isWinner) => (isWinner ? "🏆" : "");

  return (
    <div className="bg-white/5 rounded-xl p-6 overflow-x-auto">
      <h3 className="text-white font-bold mb-4">⚡ Performance Comparison</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Metric</th>
            {algorithms.map((algo) => (
              <th key={algo.id} className="text-center py-3 px-4 text-gray-400 font-medium">
                {algo.name}
              </th>
            ))}
            <th className="text-center py-3 px-4 text-gray-400 font-medium">Winner</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, index) => (
            <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
              <td className="py-4 px-4 text-gray-300 font-medium">{metric.name}</td>
              {algorithms.map((algo) => {
                const value = metric.values[algo.id];
                const isWinner = metric.winner === algo.id;
                return (
                  <td
                    key={algo.id}
                    className={`text-center py-4 px-4 font-bold ${
                      isWinner ? "text-green-400" : "text-white"
                    }`}
                  >
                    {value} {isWinner && "🏆"}
                  </td>
                );
              })}
              <td className="text-center py-4 px-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${algorithms.find((a) => a.id === metric.winner)?.color}20`,
                    color: algorithms.find((a) => a.id === metric.winner)?.color,
                  }}
                >
                  {algorithms.find((a) => a.id === metric.winner)?.name}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTable;
