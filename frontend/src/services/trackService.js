import api from './api';

export const getAllTracks = async ({ signal } = {}) => {
  try {
    const response = await api.get('/tracks', { signal });

    const data = response?.data;
    const tracksArray =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.tracks)
        ? data.tracks
        : Array.isArray(data?.data)
        ? data.data
        : [];

    return tracksArray.map((t, i) => {
      const id = t?._id ?? t?.id ?? `track-${i}`;
      // Prefer storageUrl (backend Track model). If missing, try common fields or construct GridFS stream URL
      const storageUrl = t?.storageUrl ?? t?.audioUrl ?? t?.url ?? '';
      const gridFsId = t?.gridFsId ?? t?.raw?.gridFsId ?? t?._id;

      // Build a fully-qualified playable URL pointing to the backend
      let url = '';
      if (storageUrl) {
        if (/^https?:\/\//i.test(storageUrl)) {
          url = storageUrl;
        } else if (storageUrl.startsWith('/api')) {
          // if storageUrl already includes /api prefix, attach to backend origin
          const backendOrigin = (api.defaults.baseURL || '').replace(/\/api$/, '');
          url = backendOrigin + storageUrl;
        } else {
          // attach under the API base (which already includes /api)
          url = (api.defaults.baseURL || '') + (storageUrl.startsWith('/') ? storageUrl : `/${storageUrl}`);
        }
      } else if (gridFsId) {
        // fallback to the GridFS streaming endpoint on the backend
        url = (api.defaults.baseURL || '') + `/sounds/stream/${gridFsId}`;
      }

      return {
        _id: id,
        title: String(t?.title ?? 'Untitled Soundscape'),
        url: String(url),
        cover: t?.cover ?? t?.image ?? '/fallback-cover.png',
        artist: t?.artist ?? 'Unknown Artist',
        category: t?.category ?? 'Music',
        raw: t ?? {},
      };
    });

  } catch (error) {

    if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
      console.error('Failed to fetch tracks:', error);
    }

    return [];
  }
};
