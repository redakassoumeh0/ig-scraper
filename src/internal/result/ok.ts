import type { IGResult } from '../../public/types/result.js';

/**
 * Creates a successful IGResult.
 *
 * @template T - The normalized data type
 * @param data - The raw and normalized data
 * @param meta - Optional metadata (duration, debugId)
 * @returns A successful IGResult
 */
export function ok<T>(
  data: { raw: unknown; normalized: T },
  meta?: { durationMs: number; debugId?: string }
): IGResult<T> {
  return {
    ok: true,
    data,
    meta,
  };
}
