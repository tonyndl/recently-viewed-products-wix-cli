import { httpClient } from '@wix/essentials';

export const httpGet = (url: string, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, { ...options, method: 'GET' });

export const httpPost = (url: string, body: unknown, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(body),
  });

export const httpPatch = (url: string, body: unknown, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(body),
  });

export const httpDelete = (url: string, id?: unknown, options?: RequestInit) =>
  httpClient.fetchWithAuth(url, {
    ...options,
    method: 'DELETE',
    ...(id !== undefined && {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify({ id }),
    }),
  });
