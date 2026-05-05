export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', payload?: unknown) {
    super(401, message, payload);
    this.name = 'UnauthorizedError';
  }
}
