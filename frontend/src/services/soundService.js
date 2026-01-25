import api from './api';

const uploadSound = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('audio', file);
  try {
    const response = await api.post('/sounds', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload sound file:", error);
    throw error.response?.data || new Error("Upload failed");
  }
};

export { uploadSound };
