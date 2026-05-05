import { ApiError, UnauthorizedError } from './errors';

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '/api') as string;

interface ZodLike<T> {
  parse: (value: unknown) => T;
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
}

function buildUrl(path: string, query?: ApiOptions['query']) {
  const url = `${BASE}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Typed fetch wrapper. Sends cookies (`credentials: include`),
 * throws ApiError / UnauthorizedError on failure, and
 * optionally validates the JSON response with a zod schema.
 */
export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
  schema?: ZodLike<T>,
): Promise<T> {
  const { body, query, headers, ...rest } = options;

  const init: RequestInit = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(headers ?? {}),
    },
    ...rest,
  };

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), init);

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    const message =
      (errorPayload && typeof errorPayload === 'object' && 'error' in errorPayload
        ? String((errorPayload as { error: unknown }).error)
        : null) ?? `HTTP ${response.status}`;
    if (response.status === 401) throw new UnauthorizedError(message, errorPayload);
    throw new ApiError(response.status, message, errorPayload);
  }

  if (response.status === 204) return undefined as T;

  const json = (await response.json()) as unknown;
  return schema ? schema.parse(json) : (json as T);
}
