// src/components/statistics/SpatialDistribution.jsx

const SpatialDistribution = ({ detections, imageWidth = 640, imageHeight = 480 }) => {
  if (!detections || detections.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Spatial Distribution</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  // Divide image into 3x3 grid
  const gridCols = 3;
  const gridRows = 3;
  const cellWidth = imageWidth / gridCols;
  const cellHeight = imageHeight / gridRows;

  // Count detections in each cell
  const grid = Array(gridRows)
    .fill(0)
    .map(() => Array(gridCols).fill(0));

  detections.forEach((detection) => {
    const centerX = detection.x + detection.width / 2;
    const centerY = detection.y + detection.height / 2;

    const col = Math.min(Math.floor(centerX / cellWidth), gridCols - 1);
    const row = Math.min(Math.floor(centerY / cellHeight), gridRows - 1);

    grid[row][col]++;
  });

  const maxCount = Math.max(...grid.flat());

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-white font-bold mb-4">Spatial Distribution</h3>
      <p className="text-gray-400 text-sm mb-4">Object locations across image regions</p>

      <div className="grid grid-cols-3 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((count, colIndex) => {
            const intensity = maxCount > 0 ? count / maxCount : 0;
            const opacity = 0.1 + intensity * 0.9;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square rounded-lg border border-white/20 flex items-center justify-center"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${opacity})`,
                }}
              >
                <span className="text-white font-bold text-2xl">{count}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400 grid grid-cols-3 gap-2">
        <div className="text-center">Top Left</div>
        <div className="text-center">Top Center</div>
        <div className="text-center">Top Right</div>
        <div className="text-center">Mid Left</div>
        <div className="text-center">Center</div>
        <div className="text-center">Mid Right</div>
        <div className="text-center">Bottom Left</div>
        <div className="text-center">Bottom Center</div>
        <div className="text-center">Bottom Right</div>
      </div>
    </div>
  );
};

export default SpatialDistribution;
