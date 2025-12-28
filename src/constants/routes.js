// src/constants/routes.js

export const ROUTES = {
  HOME: "/",
  INPUT: "/input",
  ALGORITHM_SELECTION: "/algorithm-selection",
  PROCESSING: "/processing",
  RESULTS: "/results",
  STATISTICS: "/statistics",
  COMPARISON: "/comparison",
};

export const INPUT_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
};

export const NAVIGATION_STEPS = [
  { path: ROUTES.HOME, label: "Home", step: 0 },
  { path: ROUTES.INPUT, label: "Input", step: 1 },
  { path: ROUTES.ALGORITHM_SELECTION, label: "Select Algorithm", step: 2 },
  { path: ROUTES.PROCESSING, label: "Processing", step: 3 },
  { path: ROUTES.RESULTS, label: "Results", step: 4 },
  { path: ROUTES.STATISTICS, label: "Statistics", step: 5 },
  { path: ROUTES.COMPARISON, label: "Comparison", step: 6 },
];

// Helper to get statistics route with algorithm ID
export const getStatisticsRoute = (algorithmId) => {
  return `${ROUTES.STATISTICS}/${algorithmId}`;
};

// Helper to get input route with type
export const getInputRoute = (type = INPUT_TYPES.IMAGE) => {
  return `${ROUTES.INPUT}?type=${type}`;
};
