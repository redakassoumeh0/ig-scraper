/**
 * Options for creating a new Instagram session through manual login.
 */
export interface CreateSessionOptions {
  /**
   * Maximum time to wait for user to complete login (in milliseconds).
   * @default 300000 (5 minutes)
   */
  timeout?: number;

  /**
   * Custom callback to prompt user for confirmation after login.
   * If not provided, uses readline prompt in terminal.
   * Should return true when user confirms they've logged in.
   */
  onLoginPrompt?: () => Promise<boolean>;

  /**
   * Locale for the browser context.
   * @default "en-US"
   */
  locale?: string;

  /**
   * Timezone for the browser context.
   * @default "UTC"
   */
  timezone?: string;

  /**
   * Optional account hint to store with the session.
   * Useful for identifying which account this session belongs to.
   */
  accountHint?: string;

  /**
   * Optional metadata to store with the session.
   */
  meta?: Record<string, unknown>;
}
