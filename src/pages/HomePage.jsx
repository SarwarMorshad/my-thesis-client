// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";
import { INPUT_TYPES } from "../constants/routes";

const HomePage = () => {
  const navigate = useNavigate();

  const analysisTypes = [
    {
      type: INPUT_TYPES.IMAGE,
      icon: "📷",
      title: "Image Analysis",
      description:
        "Upload images or capture from webcam for instant object detection with detailed analysis.",
      features: ["Single frame detection", "Fast processing", "High accuracy"],
    },
    {
      type: INPUT_TYPES.VIDEO,
      icon: "🎥",
      title: "Video Analysis",
      description: "Upload videos or record from webcam to track objects over time with temporal analysis.",
      features: ["Temporal tracking", "Motion analysis", "Timeline visualization"],
    },
  ];

  const features = [
    {
      icon: "🤖",
      title: "Multiple AI Models",
      description: "Compare YOLOv8, COCO-SSD, and other algorithms side-by-side",
    },
    {
      icon: "📊",
      title: "Detailed Analytics",
      description: "Interactive charts and comprehensive performance metrics",
    },
    {
      icon: "⚡",
      title: "Real-time Processing",
      description: "Fast browser-based inference with instant results",
    },
  ];

  const handleStartAnalysis = (type) => {
    navigate(`/input?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-[#E6E6E6]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#005F50] to-[#007A65] text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Deep Learning Object Detection
            </h1>
            <p className="text-xl md:text-2xl text-emerald-50 max-w-3xl mx-auto mb-12">
              Interactive platform for analyzing and comparing object detection algorithms
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="relative -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 32.5C840 35 960 40 1080 40C1200 40 1320 35 1380 32.5L1440 30V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
              fill="#E6E6E6"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Analysis Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {analysisTypes.map((analysis, index) => (
            <div
              key={index}
              onClick={() => handleStartAnalysis(analysis.type)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
            >
              <div className="h-2 bg-[#005F50]"></div>

              <div className="p-8">
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">
                  {analysis.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{analysis.title}</h3>

                <p className="text-gray-600 mb-6 leading-relaxed">{analysis.description}</p>

                <div className="space-y-2 mb-6">
                  {analysis.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-[#005F50]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 bg-[#005F50] text-white font-bold rounded-xl hover:bg-[#007A65] transition-all">
                  <span className="flex items-center justify-center gap-2">
                    Start Analysis
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all text-center"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
