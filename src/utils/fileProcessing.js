// src/utils/fileProcessing.js

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Format duration to mm:ss format
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

/**
 * Validate image file
 */
export const validateImageFile = (file, maxSize = 10 * 1024 * 1024) => {
  const validFormats = ["jpg", "jpeg", "png", "webp", "bmp"];
  const extension = getFileExtension(file.name);

  if (!validFormats.includes(extension)) {
    return { valid: false, error: `Invalid format. Supported: ${validFormats.join(", ")}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${formatFileSize(maxSize)}` };
  }

  return { valid: true };
};

/**
 * Validate video file
 */
export const validateVideoFile = (file, maxSize = 100 * 1024 * 1024) => {
  const validFormats = ["mp4", "webm", "avi", "mov"];
  const extension = getFileExtension(file.name);

  if (!validFormats.includes(extension)) {
    return { valid: false, error: `Invalid format. Supported: ${validFormats.join(", ")}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${formatFileSize(maxSize)}` };
  }

  return { valid: true };
};

/**
 * Load image and get metadata
 */
export const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          url: e.target.result,
          width: img.width,
          height: img.height,
          resolution: `${img.width} x ${img.height}`,
          size: formatFileSize(file.size),
          name: file.name,
          type: file.type,
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Load video and get metadata
 */
export const loadVideo = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const fps = 30; // Default, actual detection would require more complex logic

        resolve({
          url: e.target.result,
          width: video.videoWidth,
          height: video.videoHeight,
          resolution: `${video.videoWidth} x ${video.videoHeight}`,
          duration: formatDuration(duration),
          durationSeconds: duration,
          fps: fps,
          totalFrames: Math.floor(duration * fps),
          size: formatFileSize(file.size),
          name: file.name,
          type: file.type,
        });
      };

      video.onerror = reject;
      video.src = URL.createObjectURL(file);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
