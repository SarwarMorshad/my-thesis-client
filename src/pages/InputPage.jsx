// src/pages/InputPage.jsx
import { useState } from "react";
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
    const data = {
      fileInfo: {
        name: fileInfo.name,
        type: fileInfo.type,
        size: fileInfo.size,
        resolution: fileInfo.resolution,
        width: fileInfo.width,
        height: fileInfo.height,
        url: fileInfo.url,
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

    try {
      sessionStorage.setItem("inputData", JSON.stringify(data));
      navigateToAlgorithmSelection(navigate, { ...data, fileObject: selectedFile });
    } catch (error) {
      console.error("Error storing data:", error);
      alert("Failed to store file data. File may be too large.");
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E6E6]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateBack(navigate)}
              className="text-gray-600 hover:text-[#005F50] transition flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isVideo ? "🎥 Video Input" : "📷 Image Input"}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Upload Method Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Upload Method</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setUploadMethod("upload")}
              className={`group p-6 rounded-xl border-2 transition-all ${
                uploadMethod === "upload"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[#005F50] hover:shadow-md"
              }`}
            >
              <div
                className={`text-4xl mb-3 transition-transform ${
                  uploadMethod === "upload" ? "" : "group-hover:scale-110"
                }`}
              >
                📤
              </div>
              <p className="font-bold text-lg mb-1">Upload File</p>
              <p className={`text-sm ${uploadMethod === "upload" ? "text-emerald-100" : "text-gray-500"}`}>
                From your device
              </p>
            </button>

            <button
              onClick={() => setUploadMethod("webcam")}
              className={`group p-6 rounded-xl border-2 transition-all ${
                uploadMethod === "webcam"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[#005F50] hover:shadow-md"
              }`}
            >
              <div
                className={`text-4xl mb-3 transition-transform ${
                  uploadMethod === "webcam" ? "" : "group-hover:scale-110"
                }`}
              >
                📹
              </div>
              <p className="font-bold text-lg mb-1">{isVideo ? "Record" : "Capture"}</p>
              <p className={`text-sm ${uploadMethod === "webcam" ? "text-emerald-100" : "text-gray-500"}`}>
                Use your camera
              </p>
            </button>

            <button
              onClick={() => setUploadMethod("samples")}
              className={`group p-6 rounded-xl border-2 transition-all ${
                uploadMethod === "samples"
                  ? "bg-[#005F50] border-[#005F50] text-white shadow-lg"
                  : "bg-white border-gray-200 text-gray-700 hover:border-[#005F50] hover:shadow-md"
              }`}
            >
              <div
                className={`text-4xl mb-3 transition-transform ${
                  uploadMethod === "samples" ? "" : "group-hover:scale-110"
                }`}
              >
                🖼️
              </div>
              <p className="font-bold text-lg mb-1">Samples</p>
              <p className={`text-sm ${uploadMethod === "samples" ? "text-emerald-100" : "text-gray-500"}`}>
                Try examples
              </p>
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          {uploadMethod === "upload" && <FileUpload type={inputType} onFileSelect={handleFileSelect} />}

          {uploadMethod === "webcam" && <WebcamCapture type={inputType} onCapture={handleFileSelect} />}

          {uploadMethod === "samples" && (
            <div className="bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
              <span className="text-7xl mb-6 block">🖼️</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Sample {isVideo ? "Videos" : "Images"}
              </h3>
              <p className="text-gray-600">Coming soon... Check back later!</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-blue-700 font-medium">Loading file...</p>
            </div>
          </div>
        )}

        {/* File Preview & Info */}
        {selectedFile && fileInfo && !loading && (
          <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                {isVideo ? "Video" : "Image"} Preview
              </h3>

              <MediaPreview file={selectedFile} type={inputType} info={fileInfo} />

              {/* File Information Grid */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#005F50]/10 to-[#005F50]/5 border border-[#005F50]/20 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1 font-medium">Resolution</p>
                  <p className="text-gray-900 font-bold text-lg">{fileInfo.resolution}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-gray-600 text-sm mb-1 font-medium">File Size</p>
                  <p className="text-gray-900 font-bold text-lg">{fileInfo.size}</p>
                </div>
                {isVideo && (
                  <>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-gray-600 text-sm mb-1 font-medium">Duration</p>
                      <p className="text-gray-900 font-bold text-lg">{fileInfo.duration}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl p-4">
                      <p className="text-gray-600 text-sm mb-1 font-medium">FPS</p>
                      <p className="text-gray-900 font-bold text-lg">{fileInfo.fps}</p>
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
            <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">File ready for analysis</p>
                  <p className="text-sm text-gray-600">Click continue to select detection algorithms</p>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="px-8 py-4 bg-[#005F50] hover:bg-[#007A65] text-white font-bold rounded-xl transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InputPage;
