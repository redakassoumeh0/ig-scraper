import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { IGSessionState } from '../types/session.js';
import type { CreateSessionOptions } from './types.js';

/**
 * Creates a new Instagram session using Playwright's codegen tool.
 * This method is more reliable and less likely to be blocked by Instagram.
 *
 * This function:
 * - Launches Playwright's interactive codegen tool
 * - Opens Instagram in a real browser
 * - Allows manual login with full 2FA support
 * - Saves session to a temporary file
 * - Returns IGSessionState
 * - Never stores credentials
 *
 * @param options - Configuration options for session creation
 * @returns Promise resolving to the created IGSessionState
 *
 * @example
 * ```typescript
 * const session = await createSessionWithCodegen({
 *   accountHint: 'my_username',
 * });
 *
 * // Save the session yourself
 * await fs.writeFile('session.json', JSON.stringify(session, null, 2));
 * ```
 */
export async function createSessionWithCodegen(
  options?: CreateSessionOptions
): Promise<IGSessionState> {
  const accountHint = options?.accountHint;
  const meta = options?.meta;

  // Create temporary file for session storage
  const tempDir = os.tmpdir();
  const tempSessionFile = path.join(tempDir, `ig-session-${Date.now()}.json`);

  try {
    /* eslint-disable no-console */
    console.log('\n==============================================');
    console.log('Instagram Login - Playwright Codegen Method');
    console.log('==============================================');
    console.log('');
    console.log("This will launch Playwright's interactive browser.");
    console.log('');
    console.log('Steps:');
    console.log('  1. A browser window will open to Instagram');
    console.log('  2. Log in to your Instagram account');
    console.log('  3. Complete any 2FA or verification steps');
    console.log('  4. Once logged in, close the browser window');
    console.log('  5. The session will be saved automatically');
    console.log('');
    console.log('Note: Your credentials are NEVER stored by this library.');
    console.log('      Only browser cookies/storage will be captured.');
    console.log('');
    console.log('Launching browser...\n');
    /* eslint-enable no-console */

    // Execute playwright codegen command
    // This opens an interactive browser that the user can use to log in
    const command = `npx playwright codegen --save-storage="${tempSessionFile}" https://www.instagram.com/`;

    try {
      execSync(command, {
        stdio: 'inherit', // Pass through stdin/stdout/stderr
        cwd: process.cwd(),
      });
    } catch (error) {
      // User may have closed the browser or cancelled
      if (!fs.existsSync(tempSessionFile)) {
        throw new Error(
          'Session creation cancelled or failed. No storage file was created.'
        );
      }
      // If file exists, the session was saved successfully
    }

    // Check if session file was created
    if (!fs.existsSync(tempSessionFile)) {
      throw new Error(
        'Session file was not created. Please ensure you logged in before closing the browser.'
      );
    }

    // Read the storage state from the temp file
    const storageStateJson = fs.readFileSync(tempSessionFile, 'utf-8');
    const storageState = JSON.parse(storageStateJson);

    // Clean up temp file
    try {
      fs.unlinkSync(tempSessionFile);
    } catch {
      /* ignore cleanup errors */
    }

    // Validate that we got cookies (indicates successful login)
    if (
      !storageState.cookies ||
      !Array.isArray(storageState.cookies) ||
      storageState.cookies.length === 0
    ) {
      throw new Error(
        'No cookies found in session. Please ensure you logged in successfully.'
      );
    }

    // Create session state
    const now = new Date().toISOString();
    const session: IGSessionState = {
      storageState,
      createdAt: now,
      updatedAt: now,
      accountHint,
      meta,
    };

    /* eslint-disable no-console */
    console.log('\n✓ Session created successfully!');
    console.log(`  - Cookies captured: ${storageState.cookies.length}`);
    if (accountHint) {
      console.log(`  - Account hint: ${accountHint}`);
    }
    console.log('');
    /* eslint-enable no-console */

    return session;
  } catch (error) {
    // Clean up temp file on error
    try {
      if (fs.existsSync(tempSessionFile)) {
        fs.unlinkSync(tempSessionFile);
      }
    } catch {
      /* ignore cleanup errors */
    }

    throw error;
  }
}
