import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'kurio-pos-access-token-v2';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function setAccessToken(token: string | null) {
  if (token) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL belum dikonfigurasi');
  }

  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? `Request gagal (${response.status})`);
  }
  if (data?.code && data.code !== 'SUCCESS') {
    throw new Error(data.message ?? 'Respons server tidak valid');
  }
  return data as T;
}
