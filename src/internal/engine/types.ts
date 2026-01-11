import type { Browser, BrowserContext, Page } from 'playwright';

/**
 * Internal state tracking for the browser engine.
 * This is never exposed to the public API.
 */
export type EngineState = {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  status: 'not_initialized' | 'initializing' | 'initialized' | 'closed';
};

/**
 * Merged configuration used internally by the engine.
 * All optional fields from IGScraperConfig are resolved to concrete values.
 */
export type EngineConfig = {
  headless: boolean;
  timeoutMs: number;
  slowMoMs: number;
  locale: string;
  timezone: string;
};

