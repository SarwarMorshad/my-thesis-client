// src/components/comparison/DetectionOverlap.jsx
const DetectionOverlap = ({ algorithms, detections }) => {
  // Analyze real detections
  const analyzeOverlap = () => {
    if (!detections || algorithms.length < 2) {
      return { allDetected: [], partialDetected: [], uniqueDetections: {} };
    }

    const allClasses = new Set();
    Object.values(detections).forEach((dets) => {
      dets.forEach((det) => allClasses.add(det.class));
    });

    const allDetected = [];
    const partialDetected = [];
    const uniqueDetections = {};

    algorithms.forEach((algo) => {
      uniqueDetections[algo.id] = 0;
    });

    allClasses.forEach((className) => {
      const detectedBy = [];
      const confidences = {};

      algorithms.forEach((algo) => {
        const algoDetections = detections[algo.id] || [];
        const hasClass = algoDetections.some((det) => det.class === className);

        if (hasClass) {
          detectedBy.push(algo.name);
          const classDetections = algoDetections.filter((det) => det.class === className);
          const avgConf =
            classDetections.reduce((sum, det) => sum + det.confidence, 0) / classDetections.length;
          confidences[algo.name] = avgConf;
        }
      });

      if (detectedBy.length === algorithms.length) {
        allDetected.push({
          class: className,
          algorithms: algorithms.map((a) => ({
            name: a.name,
            confidence: confidences[a.name] || 0,
          })),
        });
      } else if (detectedBy.length > 0) {
        const missedBy = algorithms.filter((a) => !detectedBy.includes(a.name)).map((a) => a.name);
        partialDetected.push({
          class: className,
          detectedBy,
          missedBy,
        });

        detectedBy.forEach((algoName) => {
          const algo = algorithms.find((a) => a.name === algoName);
          if (algo && missedBy.length > 0) {
            uniqueDetections[algo.id]++;
          }
        });
      }
    });

    const agreementRate = allClasses.size > 0 ? ((allDetected.length / allClasses.size) * 100).toFixed(0) : 0;

    return { allDetected, partialDetected, uniqueDetections, agreementRate };
  };

  const { allDetected, partialDetected, uniqueDetections, agreementRate } = analyzeOverlap();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-[#005F50] rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">Detection Overlap Analysis</h3>
      </div>

      {/* Agreement Rate - Compact */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-700 font-medium">Agreement Rate:</span>
          <span className="text-blue-600 font-bold text-2xl">{agreementRate}%</span>
        </div>
        <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-blue-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
            style={{ width: `${agreementRate}%` }}
          />
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* All Algorithms Detected - Compact */}
        <div>
          <h4 className="text-sm text-gray-900 font-bold mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            All Detected
            <span className="ml-auto bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {allDetected.length}
            </span>
          </h4>
          {allDetected.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allDetected.map((item, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-xs text-gray-900 font-bold capitalize mb-1.5">{item.class}</p>
                  <div className="space-y-1">
                    {item.algorithms.map((algo, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600">{algo.name}:</span>
                        <span className="text-gray-900 font-semibold">
                          {(algo.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
              <p className="text-gray-500 text-xs">None</p>
            </div>
          )}
        </div>

        {/* Partial Agreement - Compact */}
        <div>
          <h4 className="text-sm text-gray-900 font-bold mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Partial
            <span className="ml-auto bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {partialDetected.length}
            </span>
          </h4>
          {partialDetected.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {partialDetected.map((item, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs text-gray-900 font-bold capitalize mb-1.5">{item.class}</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-green-700">
                      <span className="font-medium">✓</span> {item.detectedBy.join(", ")}
                    </p>
                    <p className="text-red-700">
                      <span className="font-medium">✗</span> {item.missedBy.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
              <p className="text-gray-500 text-xs">None</p>
            </div>
          )}
        </div>

        {/* Unique Detections - Compact */}
        <div>
          <h4 className="text-sm text-gray-900 font-bold mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Unique Only
          </h4>
          <div className="space-y-2">
            {algorithms.map((algo) => {
              const algorithmColors = {
                "coco-ssd": "#10b981",
                yolov8: "#3b82f6",
                yolov5: "#f59e0b",
                "mobilenet-ssd": "#8b5cf6",
              };
              const color = algorithmColors[algo.id] || algo.color;

              return (
                <div
                  key={algo.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="text-xs text-gray-700 font-medium">{algo.name}</span>
                  </div>
                  <span className="text-sm text-gray-900 font-bold">{uniqueDetections[algo.id]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionOverlap;
