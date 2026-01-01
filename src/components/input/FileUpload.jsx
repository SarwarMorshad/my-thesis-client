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

    const validation = isVideo ? validateVideoFile(file) : validateImageFile(file);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    onFileSelect(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Area - Compact */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-[#005F50] bg-[#005F50]/5 scale-[1.01]"
            : error
            ? "border-red-500 bg-red-50"
            : "border-gray-300 bg-white hover:border-[#005F50] hover:bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              dragActive ? "bg-[#005F50]/10 scale-110" : error ? "bg-red-100" : "bg-gray-100"
            }`}
          >
            <span className="text-4xl">{isVideo ? "🎥" : "📷"}</span>
          </div>

          {/* Text & Button */}
          <div>
            <h3
              className={`text-lg font-bold mb-2 ${
                dragActive ? "text-[#005F50]" : error ? "text-red-600" : "text-gray-900"
              }`}
            >
              {dragActive ? `Drop your ${type} here` : `Drag & Drop ${type} here`}
            </h3>

            <button
              type="button"
              className="px-6 py-2.5 bg-[#005F50] hover:bg-[#007A65] text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              or Browse Files
            </button>
          </div>

          {/* Compact File Info */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              {supportedFormats}
            </span>
            <span>•</span>
            <span>Max {maxSize}</span>
            {isVideo && (
              <>
                <span>•</span>
                <span>Max 2 min</span>
              </>
            )}
          </div>
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

      {/* Error Message - Compact */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
