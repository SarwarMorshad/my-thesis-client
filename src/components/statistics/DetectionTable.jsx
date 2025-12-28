// src/components/statistics/DetectionTable.jsx

const DetectionTable = ({ detections }) => {
  if (!detections || detections.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Detection Details</h3>
        <p className="text-gray-400 text-center py-8">No detections found</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">Detection Details</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-gray-400 font-medium">ID</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Class</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Confidence</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Position (x, y)</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Size (w × h)</th>
              <th className="text-left py-3 px-2 text-gray-400 font-medium">Area</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((detection, index) => (
              <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition">
                <td className="py-3 px-2 text-gray-300">{index + 1}</td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: detection.color || "#10b981" }}
                    />
                    <span className="text-white font-medium">{detection.class}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-white font-bold">{(detection.confidence * 100).toFixed(1)}%</td>
                <td className="py-3 px-2 text-gray-300">
                  ({Math.round(detection.x)}, {Math.round(detection.y)})
                </td>
                <td className="py-3 px-2 text-gray-300">
                  {Math.round(detection.width)} × {Math.round(detection.height)}
                </td>
                <td className="py-3 px-2 text-gray-300">
                  {(detection.width * detection.height).toFixed(0)}px
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionTable;
