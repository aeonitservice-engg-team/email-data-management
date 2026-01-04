/**
 * Custom fetch wrapper that automatically includes database URL from localStorage
 * Use this instead of native fetch for all API calls
 */

type FetchOptions = RequestInit & {
  headers?: HeadersInit;
};

export async function fetchWithDb(url: string, options: FetchOptions = {}): Promise<Response> {
  // Get database URL from localStorage (client-side only)
  const databaseUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('database_url') || ''
    : '';

  // Merge headers
  const headers = new Headers(options.headers || {});
  
  if (databaseUrl) {
    headers.set('x-database-url', databaseUrl);
  }

  // Make the fetch request with updated headers
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper for GET requests
 */
export async function fetchGet(url: string, options: FetchOptions = {}): Promise<Response> {
  return fetchWithDb(url, {
    ...options,
    method: 'GET',
  });
}

/**
 * Helper for POST requests
 */
export async function fetchPost(
  url: string,
  data?: any,
  options: FetchOptions = {}
): Promise<Response> {
  return fetchWithDb(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for PUT requests
 */
export async function fetchPut(
  url: string,
  data?: any,
  options: FetchOptions = {}
): Promise<Response> {
  return fetchWithDb(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export async function fetchDelete(url: string, options: FetchOptions = {}): Promise<Response> {
  return fetchWithDb(url, {
    ...options,
    method: 'DELETE',
  });
}

export default fetchWithDb;
