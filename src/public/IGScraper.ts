import type { IGScraperConfig } from './config/config.js';
import type { IGError } from './types/error.js';
import type { IGPagedResult } from './types/pagination.js';
import type { IGPostDetailNormalized } from './types/models.js';
import type { IGPostSurfaceNormalized } from './types/models.js';
import type { IGProfileNormalized } from './types/models.js';
import type { IGResult } from './types/result.js';
import type { IGSessionState } from './types/session.js';
import { fail } from '../internal/result/fail.js';
import { ok } from '../internal/result/ok.js';
import { time } from '../internal/result/time.js';
import type { EngineState, EngineConfig } from '../internal/engine/types.js';
import { mergeWithDefaults } from '../internal/engine/defaults.js';
import { launchBrowser } from '../internal/engine/launch.js';
import { createContext } from '../internal/engine/context.js';
import { createPage } from '../internal/engine/page.js';
import { closeEngine } from '../internal/engine/lifecycle.js';
import {
  extractProfile,
  normalizeProfileUrl,
} from '../features/profile/extract.js';
import { normalizeProfile } from '../features/profile/normalize.js';

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

    try {
      // Ensure engine is initialized
      const engine = await this.ensureEngine();

      if (!engine.page) {
        throw new Error('Page not available');
      }

      // Navigate to Instagram homepage
      try {
        await engine.page.goto('https://www.instagram.com/', {
          waitUntil: 'domcontentloaded',
        });
      } catch (error) {
        // Network error
        const networkError: IGError = {
          type: 'NETWORK',
          message: `Failed to navigate to Instagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
        return fail<{ valid: boolean }>(networkError, {
          durationMs: time(startMs),
        });
      }

      // Best-effort login detection using simple heuristics
      // Look for elements that indicate logged-in state

      // Method 1: Check for navigation elements that only appear when logged in
      const hasNavBar = await engine.page
        .locator('nav[role="navigation"]')
        .count();
      const hasHomeLink = await engine.page.locator('a[href="/"]').count();

      // Method 2: Check if we're on login page (indicates not logged in)
      const currentUrl = engine.page.url();
      const isOnLoginPage =
        currentUrl.includes('/accounts/login') ||
        currentUrl.includes('/accounts/emailsignup');

      // Determine if session is valid
      const valid = (hasNavBar > 0 || hasHomeLink > 0) && !isOnLoginPage;

      if (!valid) {
        // Session is invalid - return AUTH_REQUIRED error
        const authError: IGError = {
          type: 'AUTH_REQUIRED',
          message: 'Session is invalid or expired. Please login again.',
        };
        return fail<{ valid: boolean }>(authError, {
          durationMs: time(startMs),
        });
      }

      // Session is valid
      return ok<{ valid: boolean }>(
        { raw: { valid: true }, normalized: { valid: true } },
        { durationMs: time(startMs) }
      );
    } catch (error) {
      const scrapeError: IGError = {
        type: 'SCRAPE_FAILED',
        message: `Session validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
      return fail<{ valid: boolean }>(scrapeError, {
        durationMs: time(startMs),
      });
    }
  }

  // --- Data Targets (v0) ---

  /**
   * Fetches all available profile-level information.
   * Accepts username (preferred) or profile URL.
   */
  async getProfile(input: {
    username?: string;
    url?: string;
  }): Promise<IGResult<IGProfileNormalized>> {
    const startMs = Date.now();

    try {
      // Validate input
      if (!input.username && !input.url) {
        const error: IGError = {
          type: 'SCRAPE_FAILED',
          message: 'Either username or url must be provided',
        };
        return fail<IGProfileNormalized>(error, { durationMs: time(startMs) });
      }

      // Normalize input to canonical URL
      let profileUrl: string;
      let username: string;

      try {
        profileUrl = normalizeProfileUrl(input.username, input.url);

        // Extract username from URL for normalization
        const urlMatch = profileUrl.match(/instagram\.com\/([^/]+)/);
        const extractedUsername = urlMatch ? urlMatch[1] : input.username;

        if (!extractedUsername || typeof extractedUsername !== 'string') {
          throw new Error('Could not extract username from URL');
        }

        username = extractedUsername;
      } catch (error) {
        const urlError: IGError = {
          type: 'SCRAPE_FAILED',
          message:
            error instanceof Error ? error.message : 'Invalid input format',
          cause: error,
        };
        return fail<IGProfileNormalized>(urlError, {
          durationMs: time(startMs),
        });
      }

      // Ensure engine is initialized
      const engine = await this.ensureEngine();

      if (!engine.page) {
        const error: IGError = {
          type: 'SCRAPE_FAILED',
          message: 'Page not available',
        };
        return fail<IGProfileNormalized>(error, { durationMs: time(startMs) });
      }

      // Extract profile data
      const extractionResult = await extractProfile(engine.page, profileUrl);

      if (!extractionResult.success) {
        // Map extraction error to IGError
        let errorType: IGError['type'] = 'SCRAPE_FAILED';
        let message = 'Profile extraction failed';

        switch (extractionResult.error) {
          case 'NOT_FOUND':
            errorType = 'NOT_FOUND';
            message = `Profile not found: ${username}`;
            break;
          case 'PRIVATE_RESTRICTED':
            errorType = 'PRIVATE_RESTRICTED';
            message = `Profile is private and not accessible: ${username}`;
            break;
          case 'AUTH_REQUIRED':
            errorType = 'AUTH_REQUIRED';
            message = 'Session is invalid or expired. Please login again.';
            break;
          case 'PARSE_CHANGED':
            errorType = 'PARSE_CHANGED';
            message =
              'Instagram page structure changed. Expected data sources not found.';
            break;
          case 'NETWORK':
            errorType = 'NETWORK';
            message = 'Network error while fetching profile';
            break;
          default:
            errorType = 'SCRAPE_FAILED';
            message = `Profile extraction failed: ${extractionResult.error}`;
        }

        const error: IGError = {
          type: errorType,
          message,
          hint:
            errorType === 'PARSE_CHANGED'
              ? 'Instagram may have changed their page structure. The library may need to be updated.'
              : undefined,
        };

        return fail<IGProfileNormalized>(error, { durationMs: time(startMs) });
      }

      // Normalize the extracted data
      const { normalized, warnings } = normalizeProfile(
        extractionResult.data,
        username
      );

      // Return successful result
      const result = ok<IGProfileNormalized>(
        {
          raw: extractionResult.data,
          normalized,
        },
        { durationMs: time(startMs) }
      );

      // Add warnings if present
      if (warnings.length > 0) {
        result.warnings = warnings;
      }

      return result;
    } catch (error) {
      // Unexpected error
      const scrapeError: IGError = {
        type: 'SCRAPE_FAILED',
        message: `Unexpected error during profile extraction: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        cause: error,
      };
      return fail<IGProfileNormalized>(scrapeError, {
        durationMs: time(startMs),
      });
    }
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
