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
import type { EngineState, EngineConfig } from '../internal/engine/types.js';
import { mergeWithDefaults } from '../internal/engine/defaults.js';
import { launchBrowser } from '../internal/engine/launch.js';
import { createContext } from '../internal/engine/context.js';
import { createPage } from '../internal/engine/page.js';
import { closeEngine } from '../internal/engine/lifecycle.js';

/**
 * Main class for Instagram scraping operations.
 * Provides methods for profile extraction, post listing, and post details.
 */
export class IGScraper {
  private readonly session: IGSessionState;
  private readonly config: EngineConfig;
  private engineState: EngineState | null = null;

  /**
   * Creates a new IGScraper instance.
   *
   * @param session - Session state containing browser storage snapshot
   * @param config - Optional configuration options
   */
  constructor(session: IGSessionState, config?: IGScraperConfig) {
    // Light validation of session object shape
    if (!session || typeof session !== 'object') {
      throw new Error('Invalid session: session must be an object');
    }
    if (!session.storageState || typeof session.storageState !== 'object') {
      throw new Error(
        'Invalid session: storageState is required and must be an object'
      );
    }

    this.session = session;
    this.config = mergeWithDefaults(config);
    this.engineState = null;
  }

  /**
   * Ensures the engine is initialized (lazy initialization).
   * Launches browser on first call that needs it.
   *
   * @private
   */
  private async ensureEngine(): Promise<EngineState> {
    // If already initialized, return existing state
    if (this.engineState && this.engineState.status === 'initialized') {
      return this.engineState;
    }

    // If closed, throw error
    if (this.engineState && this.engineState.status === 'closed') {
      throw new Error('IGScraper has been closed and cannot be reused');
    }

    // Prevent concurrent initialization
    if (this.engineState && this.engineState.status === 'initializing') {
      throw new Error('Engine initialization already in progress');
    }

    // Initialize new engine state
    this.engineState = {
      browser: null,
      context: null,
      page: null,
      status: 'initializing',
    };

    try {
      // Launch browser
      const browser = await launchBrowser(this.config);
      this.engineState.browser = browser;

      // Create context with session
      const context = await createContext(browser, this.session, this.config);
      this.engineState.context = context;

      // Create page
      const page = await createPage(context, this.config);
      this.engineState.page = page;

      // Mark as initialized
      this.engineState.status = 'initialized';

      return this.engineState;
    } catch (error) {
      // On initialization failure, attempt cleanup
      if (this.engineState) {
        await closeEngine(this.engineState);
      }
      this.engineState = null;
      throw error;
    }
  }

  /**
   * Closes all underlying browser resources.
   * User-owned responsibility.
   * Safe to call multiple times (idempotent).
   */
  async close(): Promise<void> {
    if (!this.engineState) {
      return;
    }

    await closeEngine(this.engineState);
    this.engineState = null;
  }

  /**
   * Returns the most recent session snapshot (if refreshed during runtime).
   * This does not persist anything.
   */
  async exportSession(): Promise<IGSessionState> {
    // Ensure engine is initialized
    const engine = await this.ensureEngine();

    if (!engine.context) {
      throw new Error('Context not available');
    }

    // Get current storage state
    const storageState = await engine.context.storageState();

    // Return wrapped session with updated timestamp
    return {
      storageState,
      createdAt: this.session.createdAt,
      updatedAt: new Date().toISOString(),
      accountHint: this.session.accountHint,
      meta: this.session.meta,
    };
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
