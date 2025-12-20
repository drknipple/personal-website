// Week 7 Complete Example: Sharing Utilities

export function generateShareLink(location) {
  const baseUrl = window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    id: location.id,
    name: location.name,
    lat: location.latitude,
    lng: location.longitude
  });
  return `${baseUrl}?${params.toString()}`;
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  }).catch(() => {
    alert('Failed to copy link. Please copy it manually.');
  });
}

