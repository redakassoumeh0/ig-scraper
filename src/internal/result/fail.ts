import type { IGError } from '../../public/types/error.js';
import type { IGResult } from '../../public/types/result.js';

/**
 * Creates a failed IGResult.
 *
 * @template T - The normalized data type (for type consistency)
 * @param error - The error information
 * @param meta - Optional metadata (duration, debugId)
 * @param warnings - Optional warnings array
 * @returns A failed IGResult
 */
export function fail<T>(
  error: IGError,
  meta?: { durationMs: number; debugId?: string },
  warnings?: string[]
): IGResult<T> {
  return {
    ok: false,
    error,
    warnings,
    meta,
  };
}
