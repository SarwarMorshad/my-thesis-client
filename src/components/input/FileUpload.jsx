// src/components/input/FileUpload.jsx
import { useState, useRef } from "react";
import { validateImageFile, validateVideoFile } from "../../utils/fileProcessing";

const FileUpload = ({ type, onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const isVideo = type === "video";
  const acceptedFormats = isVideo ? ".mp4,.webm,.avi,.mov" : ".jpg,.jpeg,.png,.webp,.bmp";

  const maxSize = isVideo ? "100MB" : "10MB";
  const supportedFormats = isVideo ? "MP4, WebM, AVI, MOV" : "JPG, PNG, WebP, BMP";

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError(null);

    // Validate file
    const validation = isVideo ? validateVideoFile(file) : validateImageFile(file);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Pass file to parent
    onFileSelect(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
          dragActive
            ? "border-blue-500 bg-blue-500/10"
            : error
            ? "border-red-500 bg-red-500/10"
            : "border-white/20 hover:border-white/40 hover:bg-white/5"
        }`}
      >
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
          <span className="text-5xl">{isVideo ? "🎥" : "📷"}</span>
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-white mb-2">
          {dragActive ? `Drop your ${type} here` : `Drag & Drop ${type} here`}
        </h3>
        <p className="text-gray-400 mb-4">or</p>
        <button
          type="button"
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition"
        >
          Browse Files
        </button>

        {/* File Info */}
        <div className="mt-6 text-sm text-gray-400">
          <p>Supported: {supportedFormats}</p>
          <p>Max size: {maxSize}</p>
          {isVideo && <p>Max duration: 2 minutes</p>}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
