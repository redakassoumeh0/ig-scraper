import type { IGError } from './error.js';

/**
 * Unified result wrapper for all extraction operations.
 * Provides consistent structure for success, failure, and partial success cases.
 *
 * @template TNormalized - The normalized data type returned on success
 */
export type IGResult<TNormalized> = {
  ok: boolean;
  data?: {
    raw: unknown; // Source fidelity - original data structure
    normalized: TNormalized; // Stable normalized format
  };
  error?: IGError;
  warnings?: string[]; // Partial success indicators
  meta?: {
    durationMs: number;
    debugId?: string; // Correlates logs/artifacts
  };
};
