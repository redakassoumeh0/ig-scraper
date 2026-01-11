import type { Browser, BrowserContext } from 'playwright';
import type { IGSessionState } from '../../public/types/session.js';
import type { EngineConfig } from './types.js';

/**
 * Creates a browser context with session storage state applied.
 * Also applies locale and timezone configuration.
 *
 * @param browser - Browser instance
 * @param session - Session state containing storage snapshot
 * @param config - Merged engine configuration
 * @returns Promise resolving to BrowserContext instance
 */
export async function createContext(
  browser: Browser,
  session: IGSessionState,
  config: EngineConfig
): Promise<BrowserContext> {
  const context = await browser.newContext({
    // Apply session storage state
    // Cast to any since IGStorageState is intentionally flexible
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storageState: session.storageState as any,
    // Apply locale and timezone
    locale: config.locale,
    timezoneId: config.timezone,
    // Stable viewport
    viewport: { width: 1280, height: 720 },
  });

  return context;
}
