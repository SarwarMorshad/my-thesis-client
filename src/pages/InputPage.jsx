// src/pages/InputPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { navigateToAlgorithmSelection, navigateBack } from "../utils/navigation";
import { loadImage, loadVideo } from "../utils/fileProcessing";
import FileUpload from "../components/input/FileUpload";
import WebcamCapture from "../components/input/WebcamCapture";
import MediaPreview from "../components/input/MediaPreview";
import VideoSettings from "../components/input/VideoSettings";

const InputPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputType = searchParams.get("type") || "image";

  const [uploadMethod, setUploadMethod] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [videoSettings, setVideoSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const isVideo = inputType === "video";

  // Handle file selection
  const handleFileSelect = async (file) => {
    setLoading(true);
    try {
      const info = isVideo ? await loadVideo(file) : await loadImage(file);

      setSelectedFile(file);
      setFileInfo(info);
    } catch (error) {
      console.error("Error loading file:", error);
      alert("Failed to load file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle continue
  const handleContinue = () => {
    // Don't store the file itself, only metadata
    const data = {
      fileInfo: {
        name: fileInfo.name,
        type: fileInfo.type,
        size: fileInfo.size,
        resolution: fileInfo.resolution,
        width: fileInfo.width,
        height: fileInfo.height,
        url: fileInfo.url, // This is the base64 URL for preview
        ...(isVideo && {
          duration: fileInfo.duration,
          durationSeconds: fileInfo.durationSeconds,
          fps: fileInfo.fps,
          totalFrames: fileInfo.totalFrames,
        }),
      },
      inputType: inputType,
      videoSettings: isVideo ? videoSettings : null,
    };

    // Store in sessionStorage (without the file blob)
    try {
      sessionStorage.setItem("inputData", JSON.stringify(data));

      // Store the actual file separately in a way that won't exceed quota
      // We'll keep it in component state and pass through navigation
      navigateToAlgorithmSelection(navigate, { ...data, fileObject: selectedFile });
    } catch (error) {
      console.error("Error storing data:", error);
      alert("Failed to store file data. File may be too large.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigateBack(navigate)}
            className="text-gray-400 hover:text-white transition"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">{isVideo ? "🎥 Video Input" : "📷 Image Input"}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Upload Method Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Upload Method</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setUploadMethod("upload")}
              className={`p-6 rounded-xl border transition ${
                uploadMethod === "upload"
                  ? "bg-blue-500/20 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <div className="text-3xl mb-2">📤</div>
              <p className="font-medium">Upload File</p>
            </button>

            <button
              onClick={() => setUploadMethod("webcam")}
              className={`p-6 rounded-xl border transition ${
                uploadMethod === "webcam"
                  ? "bg-blue-500/20 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <div className="text-3xl mb-2">📹</div>
              <p className="font-medium">{isVideo ? "Record" : "Capture"}</p>
            </button>

            <button
              onClick={() => setUploadMethod("samples")}
              className={`p-6 rounded-xl border transition ${
                uploadMethod === "samples"
                  ? "bg-blue-500/20 border-blue-500 text-white"
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <div className="text-3xl mb-2">🖼️</div>
              <p className="font-medium">Samples</p>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
          {uploadMethod === "upload" && <FileUpload type={inputType} onFileSelect={handleFileSelect} />}

          {uploadMethod === "webcam" && <WebcamCapture type={inputType} onCapture={handleFileSelect} />}

          {uploadMethod === "samples" && (
            <div className="text-center text-gray-400 py-12">
              <span className="text-6xl mb-4 block">🖼️</span>
              <p>Sample {isVideo ? "videos" : "images"} coming soon...</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
            <p className="text-blue-200 text-center">Loading file...</p>
          </div>
        )}

        {/* File Preview & Info */}
        {selectedFile && fileInfo && !loading && (
          <>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-white mb-6">{isVideo ? "Video" : "Image"} Preview</h3>

              <MediaPreview file={selectedFile} type={inputType} info={fileInfo} />

              {/* File Information Grid */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Resolution</p>
                  <p className="text-white font-medium">{fileInfo.resolution}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">File Size</p>
                  <p className="text-white font-medium">{fileInfo.size}</p>
                </div>
                {isVideo && (
                  <>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">Duration</p>
                      <p className="text-white font-medium">{fileInfo.duration}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-1">FPS</p>
                      <p className="text-white font-medium">{fileInfo.fps}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Video Processing Options */}
            {isVideo && (
              <div className="mb-8">
                <VideoSettings onSettingsChange={setVideoSettings} />
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition flex items-center gap-2"
              >
                Continue to Algorithm Selection
                <span>→</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InputPage;
