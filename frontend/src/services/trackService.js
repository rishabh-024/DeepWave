import api from './api';
import { isPlaceholderCoverUrl } from '../utils/coverArt';

const getBackendOrigin = () => (api.defaults.baseURL || '').replace(/\/api$/, '');

const resolveAssetUrl = (value, fallback = '') => {
  if (!value) {
    return fallback;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) {
    return value;
  }

  if (value.startsWith('/api')) {
    return `${getBackendOrigin()}${value}`;
  }

  if (value.startsWith('/')) {
    return `${getBackendOrigin()}${value}`;
  }

  return value;
};

export const normalizeTrack = (track, index = 0) => {
  const id = track?._id ?? track?.id ?? `track-${index}`;
  const storageUrl = track?.storageUrl ?? track?.audioUrl ?? track?.url ?? '';
  const gridFsId = track?.gridFsId ?? track?.raw?.gridFsId ?? '';
  const resolvedCover = resolveAssetUrl(track?.cover, '');

  return {
    _id: String(id),
    title: String(track?.title ?? 'Untitled Soundscape'),
    url: resolveAssetUrl(
      storageUrl || (gridFsId ? `/api/sounds/stream/${gridFsId}` : ''),
      ''
    ),
    cover: isPlaceholderCoverUrl(resolvedCover) ? '' : resolvedCover,
    artist: track?.artist ?? track?.source ?? 'DeepWave',
    category: track?.category ?? 'ambient',
    durationSec: track?.durationSec ?? 0,
    tags: Array.isArray(track?.tags) ? track.tags : [],
    raw: track ?? {},
  };
};

export const normalizeTrackList = (tracks = []) =>
  tracks.map((track, index) => normalizeTrack(track, index));

export const getAllTracks = async ({ signal } = {}) => {
  try {
    const response = await api.get('/tracks', { signal });
    const data = response?.data;
    const tracksArray = Array.isArray(data)
      ? data
      : Array.isArray(data?.tracks)
      ? data.tracks
      : Array.isArray(data?.data)
      ? data.data
      : [];

    return normalizeTrackList(tracksArray);

  } catch (error) {

    if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
      console.error('Failed to fetch tracks:', error);
    }

    return [];
  }
};
