const configuredBaseUrl = import.meta.env.VITE_API_URL?.trim();

const baseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, '')
  : import.meta.env.DEV
    ? 'http://localhost:3333'
    : '';

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
