// src/utils/navigation.js
import { ROUTES, INPUT_TYPES } from "../constants/routes";

export const navigateToInput = (navigate, type = INPUT_TYPES.IMAGE) => {
  navigate(`${ROUTES.INPUT}?type=${type}`);
};

export const navigateToAlgorithmSelection = (navigate, state = {}) => {
  navigate(ROUTES.ALGORITHM_SELECTION, { state });
};

export const navigateToProcessing = (navigate, state = {}) => {
  navigate(ROUTES.PROCESSING, { state });
};

export const navigateToResults = (navigate, state = {}) => {
  navigate(ROUTES.RESULTS, { state });
};

export const navigateToStatistics = (navigate, algorithmId, state = {}) => {
  navigate(`${ROUTES.STATISTICS}/${algorithmId}`, { state });
};

export const navigateToComparison = (navigate, state = {}) => {
  navigate(ROUTES.COMPARISON, { state });
};

export const navigateBack = (navigate, fallbackRoute = ROUTES.HOME) => {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallbackRoute);
  }
};
