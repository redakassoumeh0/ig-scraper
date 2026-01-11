import type { BrowserContext, Page } from 'playwright';
import type { EngineConfig } from './types.js';

/**
 * Creates a new page from the browser context.
 * Applies navigation and default timeouts from configuration.
 *
 * @param context - BrowserContext instance
 * @param config - Merged engine configuration
 * @returns Promise resolving to Page instance
 */
export async function createPage(
  context: BrowserContext,
  config: EngineConfig
): Promise<Page> {
  const page = await context.newPage();

  // Apply timeouts
  page.setDefaultNavigationTimeout(config.timeoutMs);
  page.setDefaultTimeout(config.timeoutMs);

  return page;
}
