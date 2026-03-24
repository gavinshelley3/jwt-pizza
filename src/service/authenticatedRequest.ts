const AUTH_STORAGE_KEY = 'token';

/**
 * Ensures every protected API call carries the logged-in JWT so the backend
 * can count active users. Import this helper anywhere you would otherwise call
 * fetch/axios directly.
 */
export function withAuthHeaders(init: RequestInit = {}): RequestInit {
  const authToken = getAuthToken();
  if (!authToken) {
    return init;
  }

  const headers = new Headers(init.headers ?? {});
  headers.set('Authorization', `Bearer ${authToken}`);

  return {
    ...init,
    headers,
  };
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function persistAuthToken(token: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}
