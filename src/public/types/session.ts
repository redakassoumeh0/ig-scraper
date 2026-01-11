/**
 * Playwright storage state wrapper.
 * Contains cookies and origin-specific storage data.
 */
export type IGStorageState = {
  cookies?: Array<Record<string, unknown>>;
  origins?: Array<Record<string, unknown>>;
};

/**
 * Full session state with metadata.
 * Represents a serializable browser storage snapshot with optional metadata.
 */
export type IGSessionState = {
  storageState: IGStorageState;
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  accountHint?: string; // optional, masked account identifier
  meta?: {
    userAgent?: string;
    locale?: string;
    timezone?: string;
  };
};
