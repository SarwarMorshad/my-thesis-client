// src/components/processing/ProcessingLog.jsx
import { useEffect, useRef } from "react";

const ProcessingLog = ({ logs }) => {
  const logEndRef = useRef(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div className="bg-black/50 border border-white/10 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <span>📋</span> Processing Log
      </h3>

      <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No logs yet...</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-gray-500 text-xs">{log.timestamp}</span>
                <span className={getLogColor(log.type)}>{getLogIcon(log.type)}</span>
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingLog;
