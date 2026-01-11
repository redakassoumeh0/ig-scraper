/**
 * Error type literals for Instagram scraping operations.
 */
export type IGErrorType =
  | 'AUTH_REQUIRED'
  | 'CHECKPOINT'
  | 'RATE_LIMIT'
  | 'PRIVATE_RESTRICTED'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'SCRAPE_FAILED'
  | 'PARSE_CHANGED';

/**
 * Structured error information.
 * Provides type, message, and optional context for error handling.
 */
export type IGError = {
  type: IGErrorType;
  message: string;
  cause?: unknown;
  hint?: string;
  retryable?: boolean;
  checkpointUrl?: string;
};
