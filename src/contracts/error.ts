/**
 * Wire-format error body returned by every BFF endpoint.
 */
export type BffErrorBody = {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
};
