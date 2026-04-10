import api, { extractApiErrorMessage } from './api';

const sendMessage = async (message) => {
  try {
    const response = await api.post('/chat', { message });
    return response.data;
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw new Error(extractApiErrorMessage(error, "Failed to get a reply from the server"));
  }
};

export { sendMessage };
