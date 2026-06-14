const API_URL = __API_URL__;

export class ApiError extends Error {
  readonly status: number
  readonly code:
    | 'validation'
    | 'unauthorized'
    | 'forbidden'
    | 'payment_declined'
    | 'not_found'
    | 'conflict'
    | 'timeout'
    | 'network'
    | 'server';

  constructor(
    message: string,
    status: number,
    code: ApiError['code'],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  token?: string
  retries?: number
  timeoutMs?: number
}

const delay = (duration: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  });

type ErrorFromStatus = (status: number, detail?:string) => ApiError;
const errorFromStatus: ErrorFromStatus = (status, detail) => {
  if (status === 400 || status === 422) {
    return new ApiError(detail ?? 'Please review the submitted information.', status, 'validation');
  }
  if (status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    return new ApiError('Your session expired. Please sign in again.', status, 'unauthorized');
  }
  if (status === 402) {
    return new ApiError('The simulated payment was declined. Choose another method.', status, 'payment_declined');
  }
  if (status === 403) {
    return new ApiError('You do not have permission to perform this action.', status, 'forbidden');
  }
  if (status === 404) {
    return new ApiError('The requested resource was not found.', status, 'not_found');
  }
  if (status === 409) {
    return new ApiError(detail ?? 'The request conflicts with the current state.', status, 'conflict');
  }
  return new ApiError(detail ?? 'The service is temporarily unavailable.', status, 'server');
}
type ReadProblemDetail = (response: Response) => Promise<string | undefined>;
const readProblemDetail: ReadProblemDetail = async (response) => {
  try {
    const problem = (await response.json()) as { detail?: unknown };
    return typeof problem.detail === 'string' ? problem.detail : undefined;
  } catch {
    return undefined;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, retries = 2, timeoutMs = 8_000, headers, ...requestInit } = options;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...requestInit,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
      });

      if (!response.ok) {
        const error = errorFromStatus(response.status, await readProblemDetail(response));
        if (error.code === 'server' && attempt < retries) {
          await delay(300 * 2 ** attempt);
          continue;
        }
        throw error;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (attempt < retries) {
        await delay(300 * 2 ** attempt);
        continue;
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('The request timed out. Please try again.', 0, 'timeout');
      }
      throw new ApiError('Cannot reach the service. Check your connection.', 0, 'network');
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw new ApiError('The request could not be completed.', 0, 'network');
}
