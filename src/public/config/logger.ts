/**
 * Log level for internal logging.
 */
export type IGLogLevel = 'silent' | 'error' | 'info' | 'debug';

/**
 * Logger interface for custom logging implementations.
 * Allows users to provide their own logging mechanism.
 */
export interface IGLogger {
  level: IGLogLevel;
  error(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}
