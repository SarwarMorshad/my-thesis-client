// src/components/common/ProjectCard.jsx

const ProjectCard = ({ type, fileName, algorithmInfo, timestamp, onOpen }) => {
  const iconBg = type === "image" ? "bg-blue-500/20" : "bg-purple-500/20";
  const icon = type === "image" ? "📷" : "🎥";
  const textColor = type === "image" ? "text-blue-400" : "text-purple-400";
  const hoverColor = type === "image" ? "hover:text-blue-300" : "hover:text-purple-300";

  return (
    <div
      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-white font-medium">{fileName}</p>
          <p className="text-sm text-gray-400">
            {algorithmInfo} • {timestamp}
          </p>
        </div>
      </div>
      <button className={`${textColor} ${hoverColor} transition`}>Open →</button>
    </div>
  );
};

export default ProjectCard;
