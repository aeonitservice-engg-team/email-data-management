/**
 * Client-side database URL management
 */

const DB_URL_STORAGE_KEY = 'email_management_db_url';

/**
 * Get database URL from localStorage
 */
export function getStoredDatabaseUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem(DB_URL_STORAGE_KEY);
  } catch (error) {
    console.error('Error reading database URL from localStorage:', error);
    return null;
  }
}

/**
 * Enhanced fetch that automatically adds database URL header
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const dbUrl = getStoredDatabaseUrl();
  
  const headers = new Headers(init?.headers);
  
  // Add database URL header if available
  if (dbUrl) {
    headers.set('X-Database-URL', dbUrl);
  }
  
  return fetch(input, {
    ...init,
    headers,
  });
}
