export type ApiError = {
  message: string;
  status?: number;
  details?: any;
};

const DEFAULT_BASE_URL = 'https://api.carenexa.life';
const USER_STORAGE_KEY = 'diet_app_user';

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (!envUrl) return DEFAULT_BASE_URL;
  return envUrl.replace(/\/$/, '');
}

function getApiKey() {
  return 'FT0EwbwfCW9zyDxHNzmSM@&lG<@Xv4xp'
}

function buildUrl(path: string) {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${getBaseUrl()}/${normalized}`;
}

function getUserIdFromClient() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.id === undefined || parsed?.id === null) return null;
    return String(parsed.id);
  } catch (error) {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const url = buildUrl(path);
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (apiKey) {
    headers['x-medvista-api-key'] = apiKey;
  }

  if (!headers['x-user-id']) {
    const userId = getUserIdFromClient();
    if (userId) {
      headers['x-user-id'] = userId;
    }
  }

  if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials ?? 'omit',
    cache: options.cache ?? 'no-store',
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch (error) {
    // Ignore JSON parse errors
  }

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed';
    const err: ApiError = {
      message,
      status: response.status,
      details: data
    };
    throw err;
  }

  return data as T;
}

export function get<T>(path: string, options: RequestInit = {}) {
  return request<T>(path, { ...options, method: 'GET' });
}

export function post<T>(path: string, json?: unknown, options: RequestInit = {}) {
  return request<T>(path, { ...options, method: 'POST', json });
}

export function put<T>(path: string, json?: unknown, options: RequestInit = {}) {
  return request<T>(path, { ...options, method: 'PUT', json });
}

export function del<T>(path: string, options: RequestInit = {}) {
  return request<T>(path, { ...options, method: 'DELETE' });
}

export function login<T>(email: string, password: string) {
  return request<T>('login', { method: 'POST', json: { email, password } });
}

export function signup<T>(payload: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  acceptTnc: boolean;
}) {
  return request<T>('signup', { method: 'POST', json: payload });
}
