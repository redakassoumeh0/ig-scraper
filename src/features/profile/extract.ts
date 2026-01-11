import type { Page } from 'playwright';
import type { ExtractionResult, RawProfileData } from './types.js';

/**
 * Normalizes input to a canonical Instagram profile URL.
 *
 * @param username - Optional username
 * @param url - Optional profile URL
 * @returns Canonical profile URL
 * @throws Error if neither input is provided
 */
export function normalizeProfileUrl(
  username?: string,
  url?: string
): string {
  if (username) {
    // Clean username (remove @, spaces, etc.)
    const cleanUsername = username.trim().replace(/^@/, '').replace(/\s+/g, '');
    return `https://www.instagram.com/${cleanUsername}/`;
  }

  if (url) {
    // Parse and normalize URL
    try {
      const urlObj = new URL(url);
      // Extract username from path
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        const usernameFromUrl = pathParts[0];
        return `https://www.instagram.com/${usernameFromUrl}/`;
      }
      throw new Error('Invalid URL: could not extract username');
    } catch (error) {
      throw new Error(
        `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  throw new Error('Either username or url must be provided');
}

/**
 * Extracts JSON data from Instagram profile page.
 * Looks for JSON-LD or script tags with profile data.
 *
 * @param page - Playwright page instance
 * @returns Raw profile data or null if not found
 */
async function extractJsonData(page: Page): Promise<RawProfileData | null> {
  try {
    // Try to extract data from window._sharedData or JSON-LD
    // Instagram embeds user data in script tags
    // Note: Code inside page.evaluate() runs in browser context where window/document exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData = await page.evaluate((): any => {
      // @ts-expect-error - window exists in browser context (page.evaluate runs in browser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = (window as any);

      // Try window._sharedData first (common Instagram pattern)
      if (win._sharedData?.entry_data) {
        return win._sharedData.entry_data;
      }

      // Try to find JSON-LD structured data
      // @ts-expect-error - document exists in browser context (page.evaluate runs in browser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scripts = (document as any).querySelectorAll(
        'script[type="application/json"]'
      );
      for (const script of scripts) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = JSON.parse(script.textContent || '');
          // Look for user/profile data in common paths
          if (data?.entry_data?.ProfilePage?.[0]?.graphql?.user) {
            return data.entry_data.ProfilePage[0].graphql.user;
          }
          if (data?.graphql?.user) {
            return data.graphql.user;
          }
          if (data?.user) {
            return data.user;
          }
        } catch {
          // Continue searching
        }
      }

      return null;
    });

    if (jsonData && typeof jsonData === 'object') {
      // Extract user data from various possible structures
      let userData: unknown = jsonData;

      // Handle entry_data.ProfilePage[0].graphql.user structure
      if (
        typeof jsonData === 'object' &&
        'entry_data' in jsonData &&
        jsonData.entry_data &&
        typeof jsonData.entry_data === 'object' &&
        'ProfilePage' in jsonData.entry_data &&
        Array.isArray((jsonData.entry_data as { ProfilePage?: unknown[] }).ProfilePage) &&
        (jsonData.entry_data as { ProfilePage: unknown[] }).ProfilePage.length > 0
      ) {
        const profilePage = (
          jsonData.entry_data as { ProfilePage: unknown[] }
        ).ProfilePage[0];
        if (
          profilePage &&
          typeof profilePage === 'object' &&
          'graphql' in profilePage &&
          profilePage.graphql &&
          typeof profilePage.graphql === 'object' &&
          'user' in profilePage.graphql
        ) {
          userData = (profilePage.graphql as { user: unknown }).user;
        }
      }

      if (userData && typeof userData === 'object') {
        return userData as RawProfileData;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts profile data using DOM selectors as fallback.
 *
 * @param page - Playwright page instance
 * @returns Raw profile data or null if not found
 */
async function extractDomData(page: Page): Promise<RawProfileData | null> {
  try {
    // Note: Code inside page.evaluate() runs in browser context where document exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await page.evaluate((): RawProfileData | null => {
      // @ts-expect-error - document exists in browser context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = document as any;
      const profileData: RawProfileData = {};

      // Extract username from meta tags or title
      const metaUsername = doc.querySelector('meta[property="og:username"]');
      if (metaUsername) {
        profileData.username =
          metaUsername.getAttribute('content') || undefined;
      }

      // Extract from page title (fallback)
      if (!profileData.username) {
        const title = doc.title;
        const match = title.match(/([^(@]+)\s*\(@([^)]+)\)/);
        if (match) {
          profileData.username = match[2];
          profileData.full_name = match[1];
        }
      }

      // Extract full name from meta tags
      const metaFullName = doc.querySelector('meta[property="og:title"]');
      if (metaFullName) {
        const content = metaFullName.getAttribute('content') || '';
        // Try to parse username from title format
        const titleMatch = content.match(/^(.+?)\s*\(@/);
        if (titleMatch) {
          profileData.full_name = titleMatch[1];
        }
      }

      // Extract description/biography
      const metaDescription = doc.querySelector(
        'meta[property="og:description"]'
      );
      if (metaDescription) {
        profileData.biography =
          metaDescription.getAttribute('content') || undefined;
      }

      // Extract profile picture
      const metaImage = doc.querySelector('meta[property="og:image"]');
      if (metaImage) {
        profileData.profile_pic_url =
          metaImage.getAttribute('content') || undefined;
        profileData.profile_pic_url_hd =
          metaImage.getAttribute('content') || undefined;
      }

      return profileData.username ? profileData : null;
    });

    return data;
  } catch {
    return null;
  }
}

/**
 * Checks if the page indicates a "not found" error.
 *
 * @param page - Playwright page instance
 * @returns true if page indicates not found
 */
async function isNotFound(page: Page): Promise<boolean> {
  try {
    const url = page.url();
    if (url.includes('/accounts/login') || url.includes('/accounts/emailsignup')) {
      return false; // This is an auth issue, not a not-found
    }

    // Check for 404 indicators
    // Note: Code inside page.evaluate() runs in browser context where document exists
    const hasNotFoundText = await page.evaluate((): boolean => {
      // @ts-expect-error - document exists in browser context (page.evaluate runs in browser)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyText = ((document as any).body.textContent || '') as string;
      return (
        bodyText.includes("Sorry, this page isn't available") ||
        bodyText.includes('The link you followed may be broken') ||
        bodyText.includes('User not found')
      );
    });

    if (hasNotFoundText) {
      return true;
    }

    // Check URL pattern
    if (url.includes('/404') || url === 'https://www.instagram.com/') {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Checks if the page indicates a private account restriction.
 *
 * @param page - Playwright page instance
 * @returns true if page indicates private account
 */
async function isPrivateRestricted(page: Page): Promise<boolean> {
  try {
    // Note: Code inside page.evaluate() runs in browser context where document exists
    const hasPrivateText = await page.evaluate((): boolean => {
      // @ts-expect-error - document exists in browser context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyText = (document as any).body.textContent || '';
      return (
        bodyText.includes('This Account is Private') ||
        bodyText.includes('This account is private')
      );
    });

    return hasPrivateText;
  } catch {
    return false;
  }
}

/**
 * Checks if the session appears to be invalid (redirected to login).
 *
 * @param page - Playwright page instance
 * @returns true if redirected to login
 */
async function isAuthRequired(page: Page): Promise<boolean> {
  try {
    const url = page.url();
    return (
      url.includes('/accounts/login') || url.includes('/accounts/emailsignup')
    );
  } catch {
    return false;
  }
}

/**
 * Intercepts and extracts profile data from Instagram API responses.
 *
 * @param page - Playwright page instance
 * @returns Raw profile data or null if not found
 */
async function extractApiResponse(
  page: Page
): Promise<RawProfileData | null> {
  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        page.off('response', responseHandler);
        resolve(null);
      }
    }, 10000); // 10 second timeout

    const responseHandler = async (response: {
      url: () => string;
      json: () => Promise<unknown>;
      status: () => number;
    }) => {
      if (resolved) {
        return;
      }

      try {
        const url = response.url();
        const status = response.status();

        // Look for Instagram GraphQL API responses
        if (
          status === 200 &&
          (url.includes('/graphql/query/') ||
            url.includes('/api/v1/users/web_profile_info/') ||
            url.includes('/api/v1/users/') ||
            url.includes('__a=1') ||
            url.includes('__d=dis'))
        ) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsonData = (await response.json()) as any;

            // Try various response structures
            let userData: unknown = null;

            // Structure 1: Direct user object
            if (jsonData?.user) {
              userData = jsonData.user;
            }
            // Structure 2: data.user
            else if (jsonData?.data?.user) {
              userData = jsonData.data.user;
            }
            // Structure 3: entry_data.ProfilePage[0].graphql.user
            else if (
              jsonData?.entry_data?.ProfilePage?.[0]?.graphql?.user
            ) {
              userData = jsonData.entry_data.ProfilePage[0].graphql.user;
            }
            // Structure 4: items[0] (array response)
            else if (
              Array.isArray(jsonData?.items) &&
              jsonData.items.length > 0 &&
              jsonData.items[0]
            ) {
              userData = jsonData.items[0];
            }
            // Structure 5: data.items[0]
            else if (
              jsonData?.data?.items &&
              Array.isArray(jsonData.data.items) &&
              jsonData.data.items.length > 0
            ) {
              userData = jsonData.data.items[0];
            }
            // Structure 6: users array
            else if (
              Array.isArray(jsonData?.users) &&
              jsonData.users.length > 0
            ) {
              userData = jsonData.users[0];
            }

            if (userData && typeof userData === 'object') {
              // Check if it has username (indicates it's profile data)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const profileData = userData as any;
              if (profileData.username || profileData.user?.username) {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  page.off('response', responseHandler);
                  resolve(
                    (profileData.user || profileData) as RawProfileData
                  );
                }
                return;
              }
            }
          } catch {
            // Not JSON or parsing failed, continue
          }
        }
      } catch {
        // Error handling response, continue
      }
    };

    page.on('response', responseHandler);
  });
}

/**
 * Extracts profile data from Instagram profile page.
 * Tries API response interception first, then falls back to embedded JSON and DOM.
 *
 * @param page - Playwright page instance
 * @param profileUrl - Canonical profile URL
 * @returns Extraction result with raw data or error information
 */
export async function extractProfile(
  page: Page,
  profileUrl: string
): Promise<ExtractionResult> {
  try {
    // Set up API response interception before navigation
    const apiResponsePromise = extractApiResponse(page);

    // Navigate to profile page
    await page.goto(profileUrl, {
      waitUntil: 'domcontentloaded',
    });

    // Wait a bit for API responses to arrive
    await page.waitForTimeout(2000);

    // Try to get API response data (with timeout already handled in extractApiResponse)
    const apiData = await apiResponsePromise;
    if (apiData && apiData.username) {
      return {
        success: true,
        data: apiData,
        source: 'api',
      };
    }

    // Check for error conditions
    if (await isAuthRequired(page)) {
      return {
        success: false,
        error: 'AUTH_REQUIRED',
      };
    }

    if (await isNotFound(page)) {
      return {
        success: false,
        error: 'NOT_FOUND',
      };
    }

    if (await isPrivateRestricted(page)) {
      return {
        success: false,
        error: 'PRIVATE_RESTRICTED',
      };
    }

    // Fallback: Try JSON extraction (embedded in page)
    const jsonData = await extractJsonData(page);
    if (jsonData && jsonData.username) {
      return {
        success: true,
        data: jsonData,
        source: 'json',
      };
    }

    // Fallback: Try DOM extraction
    const domData = await extractDomData(page);
    if (domData && domData.username) {
      return {
        success: true,
        data: domData,
        source: 'dom',
      };
    }

    // No data found - parse changed
    return {
      success: false,
      error: 'PARSE_CHANGED',
    };
  } catch (error) {
    // Network or other errors
    if (error instanceof Error) {
      if (
        error.message.includes('net::') ||
        error.message.includes('Navigation')
      ) {
        return {
          success: false,
          error: 'NETWORK',
        };
      }
    }
    return {
      success: false,
      error: 'SCRAPE_FAILED',
    };
  }
}

