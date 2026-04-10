import api from './api';
import { normalizeTrackList } from './trackService';

const getRecommendations = async () => {
  try {
    const response = await api.get('/recommendations');
    return normalizeTrackList(response.data?.recommendations || []);
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return [];
  }
};

export { getRecommendations };
