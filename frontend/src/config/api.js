/**
 * Global API configurations and fetch interceptors.
 * Dynamically prefixes client-side API requests with the deployed backend URL.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  // Prefix only relative API paths starting with /api/
  if (typeof url === 'string' && url.startsWith('/api/')) {
    url = `${API_BASE_URL}${url}`;
    
    // Always include credentials (cookies/session data) for cross-origin backend calls
    options.credentials = 'include';
  }
  return originalFetch(url, options);
};
