// src/components/input/MediaPreview.jsx
import { useState } from "react";

const MediaPreview = ({ file, type, info }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isVideo = type === "video";

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200">
        <div className="relative" style={{ maxHeight: "500px", overflow: "hidden" }}>
          {isVideo ? (
            <video src={info?.url} controls className="w-full h-auto max-h-[500px] object-contain">
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={info?.url}
              alt="Preview"
              className="w-full h-auto max-h-[500px] object-contain cursor-pointer hover:opacity-90 transition"
              onClick={() => setIsFullscreen(true)}
            />
          )}
        </div>

        {/* Fullscreen Button for Images */}
        {!isVideo && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            View Fullscreen
          </button>
        )}

        {/* Image Dimensions Overlay */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          {info?.width} × {info?.height}
        </div>
      </div>

      {/* File Name */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isVideo ? "bg-purple-100" : "bg-blue-100"
            }`}
          >
            <span className="text-2xl">{isVideo ? "🎥" : "📷"}</span>
          </div>
          <div>
            <p className="text-gray-900 font-semibold">{info?.name}</p>
            <p className="text-sm text-gray-600">{info?.type}</p>
          </div>
        </div>

        {/* File Size Badge */}
        <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
          <p className="text-sm font-medium text-gray-700">{info?.size}</p>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && !isVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Fullscreen Image */}
          <div className="max-w-7xl max-h-screen overflow-auto">
            <img
              src={info?.url}
              alt="Fullscreen Preview"
              className="w-full h-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Image Info Overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-xl">
            <p className="text-sm font-medium">
              {info?.name} • {info?.width} × {info?.height} • {info?.size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
