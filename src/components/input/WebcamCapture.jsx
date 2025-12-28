// src/components/input/WebcamCapture.jsx
import { useState, useRef, useEffect } from "react";

const WebcamCapture = ({ type, onCapture }) => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const isVideo = type === "video";

  // Start webcam
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: isVideo,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Unable to access webcam. Please check permissions.");
      console.error("Error accessing webcam:", err);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Capture image
  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `webcam_capture_${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file);
      stopWebcam();
    }, "image/jpeg");
  };

  // Start recording
  const startRecording = () => {
    chunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `webcam_recording_${Date.now()}.webm`, { type: "video/webm" });
      onCapture(file);
      stopWebcam();
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopWebcam();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Webcam Preview */}
      <div className="bg-black rounded-2xl overflow-hidden aspect-video relative">
        {stream ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <span className="w-3 h-3 bg-white rounded-full"></span>
                Recording {formatTime(recordingTime)}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <span className="text-6xl mb-4 block">📹</span>
              <p>Webcam preview will appear here</p>
            </div>
          </div>
        )}
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

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        {!stream ? (
          <button
            onClick={startWebcam}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition"
          >
            Start Webcam
          </button>
        ) : (
          <>
            {!isVideo ? (
              // Image capture button
              <button
                onClick={captureImage}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition"
              >
                📷 Capture Photo
              </button>
            ) : (
              // Video recording buttons
              <>
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition"
                  >
                    ⏺️ Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}
              </>
            )}
            <button
              onClick={stopWebcam}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
