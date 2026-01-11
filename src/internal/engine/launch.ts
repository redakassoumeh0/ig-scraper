import { chromium, type Browser } from 'playwright';
import type { EngineConfig } from './types.js';

/**
 * Launches a Chromium browser instance with stable options.
 * Uses configuration to set headless mode.
 *
 * @param config - Merged engine configuration
 * @returns Promise resolving to Browser instance
 */
export async function launchBrowser(config: EngineConfig): Promise<Browser> {
  const browser = await chromium.launch({
    headless: config.headless,
    // Stable options for consistent behavior
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  return browser;
}

