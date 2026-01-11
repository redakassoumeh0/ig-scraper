import type { IGScraperConfig } from './config/config.js';
import type { IGError } from './types/error.js';
import type { IGPagedResult } from './types/pagination.js';
import type { IGPostDetailNormalized } from './types/models.js';
import type { IGPostSurfaceNormalized } from './types/models.js';
import type { IGProfileNormalized } from './types/models.js';
import type { IGResult } from './types/result.js';
import type { IGSessionState } from './types/session.js';
import { fail } from '../internal/result/fail.js';
import { time } from '../internal/result/time.js';

/**
 * Main class for Instagram scraping operations.
 * Provides methods for profile extraction, post listing, and post details.
 */
export class IGScraper {
  private readonly session: IGSessionState;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private readonly _config: IGScraperConfig; // Will be used in Phase 2

  /**
   * Creates a new IGScraper instance.
   *
   * @param session - Session state containing browser storage snapshot
   * @param config - Optional configuration options
   */
  constructor(session: IGSessionState, config?: IGScraperConfig) {
    this.session = session;
    this._config = config ?? {};
    // Config will be used in Phase 2 for engine initialization
    void this._config;
  }

  /**
   * Closes all underlying browser resources.
   * User-owned responsibility.
   */
  async close(): Promise<void> {
    // Stub: Not implemented yet
    // Will be implemented in Phase 2
  }

  /**
   * Returns the most recent session snapshot (if refreshed during runtime).
   * This does not persist anything.
   */
  async exportSession(): Promise<IGSessionState> {
    // Stub: Not implemented yet
    // Will be implemented in Phase 2
    return this.session;
  }

  /**
   * Best-effort validation that the session still works.
   */
  async validateSession(): Promise<IGResult<{ valid: boolean }>> {
    const startMs = Date.now();
    const error: IGError = {
      type: 'SCRAPE_FAILED',
      message: 'Not implemented yet',
    };
    return fail<{ valid: boolean }>(error, { durationMs: time(startMs) });
  }

  // --- Data Targets (v0) ---

  /**
   * Fetches all available profile-level information.
   * Accepts username (preferred) or profile URL.
   */
  async getProfile(_input: {
    username?: string;
    url?: string;
  }): Promise<IGResult<IGProfileNormalized>> {
    const startMs = Date.now();
    const error: IGError = {
      type: 'SCRAPE_FAILED',
      message: 'Not implemented yet',
    };
    return fail<IGProfileNormalized>(error, { durationMs: time(startMs) });
  }

  /**
   * Fetches surface-level post metadata for a profile.
   * Supports cursor-based pagination.
   */
  async listProfilePosts(
    _input: { username?: string; url?: string },
    _options?: {
      limit?: number;
      cursor?: string | null;
    }
  ): Promise<IGResult<IGPagedResult<IGPostSurfaceNormalized>>> {
    const startMs = Date.now();
    const error: IGError = {
      type: 'SCRAPE_FAILED',
      message: 'Not implemented yet',
    };
    return fail<IGPagedResult<IGPostSurfaceNormalized>>(error, {
      durationMs: time(startMs),
    });
  }

  /**
   * Fetches full details for a specific post.
   * Accepts shortcode (preferred) or post URL.
   */
  async getPost(_input: {
    shortcode?: string;
    url?: string;
  }): Promise<IGResult<IGPostDetailNormalized>> {
    const startMs = Date.now();
    const error: IGError = {
      type: 'SCRAPE_FAILED',
      message: 'Not implemented yet',
    };
    return fail<IGPostDetailNormalized>(error, { durationMs: time(startMs) });
  }
}
