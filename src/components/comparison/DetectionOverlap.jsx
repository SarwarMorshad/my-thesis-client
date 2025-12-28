// src/components/comparison/DetectionOverlap.jsx

const DetectionOverlap = ({ algorithms, detections }) => {
  // Group detections by what algorithms found them
  const allDetected = [];
  const partialDetected = [];
  const uniqueDetections = {};

  // Mock overlap analysis
  const classes = ["person", "car", "dog", "bicycle"];

  // All algorithms detected
  classes.slice(0, 2).forEach((cls) => {
    allDetected.push({
      class: cls,
      algorithms: algorithms.map((a) => ({
        name: a.name,
        confidence: (0.8 + Math.random() * 0.15).toFixed(2),
      })),
    });
  });

  // Only some algorithms detected
  if (algorithms.length > 1) {
    classes.slice(2, 3).forEach((cls) => {
      partialDetected.push({
        class: cls,
        detectedBy: [algorithms[0].name],
        missedBy: algorithms.slice(1).map((a) => a.name),
      });
    });
  }

  const agreementRate =
    allDetected.length > 0
      ? ((allDetected.length / (allDetected.length + partialDetected.length)) * 100).toFixed(0)
      : 0;

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">🎯 Detection Overlap Analysis</h3>

      {/* Agreement Rate */}
      <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Overall Agreement Rate:</span>
          <span className="text-blue-400 font-bold text-2xl">{agreementRate}%</span>
        </div>
        <div className="mt-2 w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${agreementRate}%` }}
          />
        </div>
      </div>

      {/* All Algorithms Detected */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <span className="text-green-400">✓</span>
          All Algorithms Detected ({allDetected.length})
        </h4>
        {allDetected.length > 0 ? (
          <div className="space-y-3">
            {allDetected.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <p className="text-white font-bold mb-2 capitalize">{item.class}</p>
                <div className="space-y-1">
                  {item.algorithms.map((algo, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">{algo.name}:</span>
                      <span className="text-white font-medium">{(algo.confidence * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No objects detected by all algorithms</p>
        )}
      </div>

      {/* Partial Detections */}
      {partialDetected.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <span className="text-yellow-400">⚠</span>
            Partial Agreement ({partialDetected.length})
          </h4>
          <div className="space-y-3">
            {partialDetected.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <p className="text-white font-bold mb-2 capitalize">{item.class}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-green-400">Detected by: {item.detectedBy.join(", ")}</p>
                  <p className="text-red-400">Missed by: {item.missedBy.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Unique Detections */}
      <div>
        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
          <span className="text-blue-400">ℹ</span>
          Unique Detections
        </h4>
        <div className="space-y-2">
          {algorithms.map((algo) => (
            <div key={algo.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-gray-300">{algo.name} only:</span>
              <span className="text-white font-bold">{Math.floor(Math.random() * 2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetectionOverlap;
