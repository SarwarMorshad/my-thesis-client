// src/components/input/MediaPreview.jsx

const MediaPreview = ({ file, type, info }) => {
  const isVideo = type === "video";

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="bg-black rounded-2xl overflow-hidden">
        {isVideo ? (
          <video src={info?.url} controls className="w-full">
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={info?.url} alt="Preview" className="w-full h-auto" />
        )}
      </div>

      {/* File Name */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isVideo ? "bg-purple-500/20" : "bg-blue-500/20"
            }`}
          >
            <span className="text-xl">{isVideo ? "🎥" : "📷"}</span>
          </div>
          <div>
            <p className="text-white font-medium">{info?.name}</p>
            <p className="text-sm text-gray-400">{info?.type}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreview;
