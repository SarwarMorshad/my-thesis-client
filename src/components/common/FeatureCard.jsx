// src/components/common/FeatureCard.jsx

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
