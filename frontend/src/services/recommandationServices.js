import api from './api';

const getRecommendations = async () => {
  try {
    const response = await api.get('/recommendations');
    return response.data.recommendations;
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
};

export { getRecommendations };