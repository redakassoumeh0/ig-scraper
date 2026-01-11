import { chromium } from 'playwright';
import * as readline from 'readline';
import type { IGSessionState } from '../types/session.js';
import type { CreateSessionOptions } from './types.js';

/**
 * Creates a new Instagram session by launching a headed browser
 * and allowing the user to manually log in.
 *
 * This function:
 * - Launches a visible Chromium browser
 * - Opens Instagram login page
 * - Waits for user to log in manually
 * - Prompts for confirmation
 * - Extracts and returns the session state
 * - Never stores credentials or writes files automatically
 *
 * @param options - Configuration options for session creation
 * @returns Promise resolving to the created IGSessionState
 *
 * @example
 * ```typescript
 * const session = await createSession({
 *   accountHint: 'my_username',
 *   timeout: 600000, // 10 minutes
 * });
 *
 * // Save the session yourself
 * await fs.writeFile('session.json', JSON.stringify(session, null, 2));
 * ```
 */
export async function createSession(
  options?: CreateSessionOptions
): Promise<IGSessionState> {
  const timeout = options?.timeout ?? 300000; // 5 minutes default
  const locale = options?.locale ?? 'en-US';
  const timezone = options?.timezone ?? 'UTC';
  const accountHint = options?.accountHint;
  const meta = options?.meta;
  const onLoginPrompt = options?.onLoginPrompt;

  let browser;
  let context;

  try {
    // Launch headed browser with extensive args to reduce bot detection
    // Try to use installed Chrome first (more resistant to detection), fall back to Chromium
    const launchArgs = [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-service-autorun',
      '--password-store=basic',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-infobars',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-domain-reliability',
      '--disable-features=TranslateUI,BlinkGenPropertyTrees,IsolateOrigins,site-per-process',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      '--enable-automation=false',
      '--enable-features=NetworkService,NetworkServiceInProcess',
      '--force-color-profile=srgb',
      '--hide-scrollbars',
      '--mute-audio',
    ];

    try {
      browser = await chromium.launch({
        headless: false,
        timeout,
        channel: 'chrome', // Use real Chrome if available
        args: launchArgs,
      });
      /* eslint-disable no-console */
      console.log('✓ Using installed Chrome browser');
      /* eslint-enable no-console */
    } catch {
      // Fallback to Chromium if Chrome not available
      browser = await chromium.launch({
        headless: false,
        timeout,
        args: launchArgs,
      });
      /* eslint-disable no-console */
      console.log('✓ Using Chromium browser (Chrome not found)');
      /* eslint-enable no-console */
    }

    // Create context with locale, timezone, and realistic user agent
    context = await browser.newContext({
      locale,
      timezoneId: timezone,
      viewport: { width: 1280, height: 720 },
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Sec-Ch-Ua':
          '"Not_A Brand";v="8", "Chromium";v="131", "Google Chrome";v="131"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Linux"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      permissions: ['geolocation', 'notifications'],
      colorScheme: 'light',
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: false,
      javaScriptEnabled: true,
    });

    // Create page
    const page = await context.newPage();

    // Comprehensive anti-detection script (passed as string to avoid TypeScript issues)
    await page.addInitScript(`
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Chrome runtime
      window.chrome = {
        runtime: {},
      };

      // Permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);

      // Plugin array
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          // Return a realistic plugin array
          return [
            {
              0: {
                type: 'application/x-google-chrome-pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: null,
              },
              description: 'Portable Document Format',
              filename: 'internal-pdf-viewer',
              length: 1,
              name: 'Chrome PDF Plugin',
            },
            {
              0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: '',
                enabledPlugin: null,
              },
              description: '',
              filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
              length: 1,
              name: 'Chrome PDF Viewer',
            },
            {
              0: {
                type: 'application/x-nacl',
                suffixes: '',
                description: 'Native Client Executable',
                enabledPlugin: null,
              },
              1: {
                type: 'application/x-pnacl',
                suffixes: '',
                description: 'Portable Native Client Executable',
                enabledPlugin: null,
              },
              description: '',
              filename: 'internal-nacl-plugin',
              length: 2,
              name: 'Native Client',
            },
          ];
        },
      });
    `);

    // Navigate to Instagram login page
    // Note: If this fails, Instagram may be blocking automated browsers
    try {
      await page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'domcontentloaded',
        timeout,
      });
    } catch (error) {
      // Check if we're on an error page
      const currentUrl = page.url();
      if (currentUrl.includes('chrome-error://')) {
        throw new Error(
          'Failed to connect to Instagram. This could be due to:\n' +
            '  1. Network connectivity issues\n' +
            '  2. Instagram blocking automated browsers from your IP\n' +
            '  3. Firewall or proxy blocking the connection\n' +
            '\n' +
            'Troubleshooting steps:\n' +
            '  - Check if you can access instagram.com in a regular browser\n' +
            '  - Try using a VPN if Instagram is blocking your IP\n' +
            '  - Wait a few minutes and try again\n' +
            '  - Check your network/firewall settings'
        );
      }

      // Try alternative approach via main page
      /* eslint-disable no-console */
      console.log(
        '\n⚠️  Direct login page navigation failed. Trying alternative route...'
      );
      /* eslint-enable no-console */

      try {
        await page.goto('https://www.instagram.com/', {
          waitUntil: 'domcontentloaded',
          timeout,
        });
      } catch (retryError) {
        const retryUrl = page.url();
        if (retryUrl.includes('chrome-error://')) {
          throw new Error(
            'Cannot connect to Instagram at all. Please check:\n' +
              '  1. Your internet connection\n' +
              '  2. If instagram.com is accessible in a regular browser\n' +
              '  3. Your firewall/proxy settings\n' +
              '\n' +
              'If Instagram works in a regular browser but not here,\n' +
              'Instagram may be blocking automated browser connections from your IP.'
          );
        }
        throw retryError;
      }

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Check where we landed
      const landingUrl = page.url();
      if (!landingUrl.includes('/accounts/login')) {
        // Try to click login link
        try {
          await page.click('a[href*="/accounts/login"]', { timeout: 5000 });
          await page.waitForLoadState('domcontentloaded');
        } catch {
          // Manual navigation as last resort
          await page.goto('https://www.instagram.com/accounts/login/', {
            waitUntil: 'domcontentloaded',
            timeout: timeout / 2,
          });
        }
      }
    }

    // Wait for user to log in
    if (onLoginPrompt) {
      // Use custom callback
      const confirmed = await onLoginPrompt();
      if (!confirmed) {
        throw new Error('User cancelled login process');
      }
    } else {
      // Use readline prompt
      await promptUserConfirmation();
    }

    // Verify login was successful by checking current URL
    const currentUrl = page.url();
    const isLoggedIn =
      !currentUrl.includes('/accounts/login') &&
      !currentUrl.includes('/accounts/emailsignup');

    if (!isLoggedIn) {
      throw new Error(
        'Login verification failed. Please ensure you are logged in before confirming.'
      );
    }

    // Extract storage state
    const storageState = await context.storageState();

    // Create session state
    const now = new Date().toISOString();
    const session: IGSessionState = {
      storageState,
      createdAt: now,
      updatedAt: now,
      accountHint,
      meta,
    };

    return session;
  } finally {
    // Clean up resources
    if (context) {
      await context.close().catch(() => {
        /* ignore cleanup errors */
      });
    }
    if (browser) {
      await browser.close().catch(() => {
        /* ignore cleanup errors */
      });
    }
  }
}

/**
 * Prompts the user in the terminal to confirm they've logged in.
 * @private
 */
function promptUserConfirmation(): Promise<void> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    /* eslint-disable no-console */
    console.log('\n==============================================');
    console.log('Instagram Login - Manual Session Creation');
    console.log('==============================================');
    console.log('');
    console.log('A browser window has opened to Instagram login page.');
    console.log('');
    console.log('Steps:');
    console.log('  1. Log in to your Instagram account in the browser');
    console.log('  2. Complete any 2FA or verification steps if prompted');
    console.log('  3. Wait until you see your Instagram feed');
    console.log('  4. Come back here and press Enter to continue');
    console.log('');
    console.log('Note: Your credentials are NEVER stored by this library.');
    console.log('      Only browser cookies/storage will be captured.');
    console.log('');
    console.log('==============================================\n');
    /* eslint-enable no-console */

    rl.question('Press Enter when you have logged in successfully... ', () => {
      rl.close();
      resolve();
    });

    // Handle Ctrl+C
    rl.on('SIGINT', () => {
      rl.close();
      reject(new Error('User cancelled login process'));
    });
  });
}
