// src/pages/ErrorPage.jsx
import { useRouteError, useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-6xl">⚠️</span>
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">{error?.status || "404"}</h1>

        {/* Error Message */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {error?.status === 404 ? "Page Not Found" : error?.statusText || "Oops! Something went wrong"}
        </h2>

        <p className="text-gray-400 mb-8 text-lg">
          {error?.status === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : error?.message || "An unexpected error occurred. Please try again."}
        </p>

        {/* Error Details (only in development) */}
        {import.meta.env.DEV && error?.stack && (
          <details className="mb-8 text-left">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300 mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="bg-black/50 text-red-400 p-4 rounded-lg overflow-auto text-xs">{error.stack}</pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/20"
          >
            ← Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
