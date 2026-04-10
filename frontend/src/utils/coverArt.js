export const isPlaceholderCoverUrl = (value = '') => {
  if (!value) {
    return false;
  }

  const normalizedValue = String(value).toLowerCase();

  return (
    normalizedValue.includes('placehold.co') &&
    normalizedValue.includes('deepwave')
  );
};
