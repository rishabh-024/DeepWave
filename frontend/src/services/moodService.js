import api, { extractApiErrorMessage } from './api';

const logMood = async (moodData) => {
  try {
    const response = await api.post('/mood/log', moodData);
    return response.data;
  } catch (error) {
    console.error("Failed to log mood:", error.response?.data || error.message);
    throw new Error(extractApiErrorMessage(error, "Failed to log mood"));
  }
};

export { logMood };
