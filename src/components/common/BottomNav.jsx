// src/components/common/BottomNav.jsx
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Don't show on homepage
  if (isHomePage) return null;

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#005F50] border-t-2 border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            onClick={handleHome}
            className="flex items-center gap-2 px-6 py-3 bg-[#005F50] hover:bg-[#007A65] text-white font-medium rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
