// src/pages/HomePage.jsx
import { INPUT_TYPES } from "../constants/routes";
import AnalysisTypeCard from "../components/common/AnalysisTypeCard";
import FeatureCard from "../components/common/FeatureCard";
import ProjectCard from "../components/common/ProjectCard";

const HomePage = () => {
  // Analysis type data
  const analysisTypes = [
    {
      type: INPUT_TYPES.IMAGE,
      icon: "📷",
      title: "Image Analysis",
      description:
        "Upload images or capture from webcam. Get instant object detection results with detailed analysis.",
      features: ["Single frame detection", "Fast processing", "High detail analysis"],
      color: "blue",
    },
    {
      type: INPUT_TYPES.VIDEO,
      icon: "🎥",
      title: "Video Analysis",
      description: "Upload videos or record from webcam. Track objects over time with temporal analysis.",
      features: ["Temporal tracking", "Motion analysis", "Timeline visualization"],
      color: "purple",
    },
  ];

  // Features data
  const features = [
    {
      icon: "🔬",
      title: "Multiple Algorithms",
      description: "Compare YOLOv8, COCO-SSD, YOLOv5, and more side-by-side",
    },
    {
      icon: "📊",
      title: "Detailed Analytics",
      description: "Comprehensive statistics, charts, and performance metrics",
    },
    {
      icon: "⚡",
      title: "Real-time Processing",
      description: "Fast inference with browser-based ML models",
    },
  ];

  // Recent projects data
  const recentProjects = [
    {
      type: "image",
      fileName: "street_scene.jpg",
      algorithmInfo: "YOLOv8 vs COCO-SSD",
      timestamp: "2 hours ago",
    },
    {
      type: "video",
      fileName: "traffic_video.mp4",
      algorithmInfo: "YOLOv8",
      timestamp: "Yesterday",
    },
    {
      type: "image",
      fileName: "crowd_detection.jpg",
      algorithmInfo: "All algorithms",
      timestamp: "2 days ago",
    },
  ];

  const handleOpenProject = (project) => {
    console.log("Opening project:", project);
    // Navigate to project or load project data
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Deep Learning Object Detection
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mt-2">
            Analysis & Comparison
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Interactive visualization platform for comparing multiple object detection algorithms. Analyze
          performance, visualize results, and make data-driven decisions.
        </p>
      </div>

      {/* Analysis Type Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        {analysisTypes.map((analysis, index) => (
          <AnalysisTypeCard
            key={index}
            type={analysis.type}
            icon={analysis.icon}
            title={analysis.title}
            description={analysis.description}
            features={analysis.features}
            color={analysis.color}
          />
        ))}
      </div>

      {/* Features Grid */}
      <div id="features" className="grid md:grid-cols-3 gap-6 mb-20">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>

      {/* Recent Projects */}
    </main>
  );
};

export default HomePage;
