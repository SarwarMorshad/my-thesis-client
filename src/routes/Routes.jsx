// src/routes/Routes.jsx
import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import InputPage from "../pages/InputPage";

import Processing from "../pages/Processing";
import Results from "../pages/Results";
import Statistics from "../pages/Statistics";
import Comparison from "../pages/Comparison";
import ErrorPage from "../pages/ErrorPage";
import AlgorithmSelectionPage from "../pages/AlgorithmSelectionPage";
import HomePage from "../pages/HomePage";

// ===========================
// Router Configuration
// ===========================
const router = createBrowserRouter([
  // ===========================
  // Public Routes (MainLayout)
  // ===========================
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Home Page
      {
        index: true,
        element: <HomePage />,
      },

      // Input Page (Image or Video Upload)
      {
        path: "input",
        element: <InputPage />,
      },

      // Algorithm Selection Page
      {
        path: "algorithm-selection",
        element: <AlgorithmSelectionPage />,
      },

      // Processing Page
      {
        path: "processing",
        element: <Processing />,
      },

      // Results Page
      {
        path: "results",
        element: <Results />,
      },

      // Statistics Page (for individual algorithm)
      {
        path: "statistics/:algorithmId",
        element: <Statistics />,
      },

      // Comparison Page (for multiple algorithms)
      {
        path: "comparison",
        element: <Comparison />,
      },
    ],
  },
]);

export default router;
