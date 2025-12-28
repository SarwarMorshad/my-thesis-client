// src/components/common/AnalysisTypeCard.jsx
import { useNavigate } from "react-router-dom";
import { navigateToInput } from "../../utils/navigation";

const AnalysisTypeCard = ({ type, icon, title, description, features, color }) => {
  const navigate = useNavigate();

  // Color variants
  const colorVariants = {
    blue: {
      iconBg: "bg-blue-500/20",
      textColor: "text-blue-400",
      hoverText: "group-hover:text-blue-300",
    },
    purple: {
      iconBg: "bg-purple-500/20",
      textColor: "text-purple-400",
      hoverText: "group-hover:text-purple-300",
    },
  };

  const currentColor = colorVariants[color] || colorVariants.blue;

  return (
    <div
      onClick={() => navigateToInput(navigate, type)}
      className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition cursor-pointer group"
    >
      {/* Icon */}
      <div
        className={`w-16 h-16 ${currentColor.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}
      >
        <span className="text-4xl">{icon}</span>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>

      {/* Description */}
      <p className="text-gray-400 mb-4">{description}</p>

      {/* Features List */}
      <ul className="space-y-2 text-sm text-gray-300 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div
        className={`${currentColor.textColor} font-medium flex items-center gap-2 group-hover:gap-3 transition-all`}
      >
        Start {title}
        <span>→</span>
      </div>
    </div>
  );
};

export default AnalysisTypeCard;
