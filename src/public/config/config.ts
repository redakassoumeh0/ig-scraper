import type { IGLogger } from './logger.js';

/**
 * Configuration options for IGScraper.
 * All options are optional with sensible defaults defined internally.
 */
export type IGScraperConfig = {
  headless?: boolean; // default: true
  timeoutMs?: number; // default: safe value
  slowMoMs?: number; // default: 0

  locale?: string; // default: "en-US"
  timezone?: string; // default: "UTC"

  logger?: IGLogger; // default: internal minimal logger
  throwOnError?: boolean; // default: false

  // Diagnostics (optional)
  debugArtifacts?: {
    enabled: boolean;
    // If provided, implementation may write artifacts under this directory.
    // Note: session persistence is still user-controlled.
    outputDir?: string;
    captureOnError?: boolean; // default: true
  };
};
