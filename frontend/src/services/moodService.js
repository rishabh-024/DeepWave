import api from './api';

const logMood = async (moodData) => {
  try {
    const response = await api.post('/mood/log', moodData);
    return response.data;
  } catch (error) {
    console.error("Failed to log mood:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to log mood");
  }
};

export { logMood };