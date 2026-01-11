# IG-Scraper — API Reference Skeleton (v0)

> Status: SKELETON (LOCKED SHAPE)
>
> Goal: Define the **public API surface** for v0.x without implementation details.

This document is the executable contract for the library’s public API.

---

## 0. Package Entry

### Import

```tsx
import { IGScraper } from 'ig-scraper';
```

---

## 1. Core Types

### 1.1 Session

A session is a serializable browser storage snapshot.

```tsx
export type IGStorageState = {
  cookies?: Array<Record<string, unknown>>;
  origins?: Array<Record<string, unknown>>;
};

export type IGSessionState = {
  storageState: IGStorageState;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
  accountHint?: string; // optional, masked
  meta?: {
    userAgent?: string;
    locale?: string;
    timezone?: string;
  };
};
```

### 1.2 Result Model

All extraction calls return a structured result object.

```tsx
export type IGResult<TNormalized> = {
  ok: boolean;
  data?: {
    raw: unknown;
    normalized: TNormalized;
  };
  error?: IGError;
  warnings?: string[];
  meta?: {
    durationMs: number;
    debugId?: string;
  };
};
```

### 1.3 Errors

```tsx
export type IGErrorType =
  | 'AUTH_REQUIRED'
  | 'CHECKPOINT'
  | 'RATE_LIMIT'
  | 'PRIVATE_RESTRICTED'
  | 'NOT_FOUND'
  | 'NETWORK'
  | 'SCRAPE_FAILED'
  | 'PARSE_CHANGED';

export type IGError = {
  type: IGErrorType;
  message: string;
  cause?: unknown;
  hint?: string;
  retryable?: boolean;
  checkpointUrl?: string;
};
```

---

## 2. Configuration

### 2.1 Logger

```tsx
export type IGLogLevel = 'silent' | 'error' | 'info' | 'debug';

export interface IGLogger {
  level: IGLogLevel;
  error(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}
```

### 2.2 Constructor Config

```tsx
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
```

---

## 3. Pagination

```tsx
export type IGPagination = {
  cursor?: string | null;
  hasNextPage: boolean;
};

export type IGPagedResult<TItem> = {
  items: TItem[];
  page: IGPagination;
};
```

---

## 4. Normalized Data Models (v0)

> Normalized models are intended to be stable and meaningful. Raw data remains available for fidelity and debugging.

### 4.1 Profile

```tsx
export type IGProfileAccess = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED' | 'UNKNOWN';

export type IGProfileNormalized = {
  id?: string;
  username: string;
  fullName?: string;
  biography?: string;
  externalUrl?: string;

  isPrivate?: boolean;
  isVerified?: boolean;
  access: IGProfileAccess;

  followersCount?: number;
  followingCount?: number;
  postsCount?: number;

  profilePicUrl?: string;
  profilePicUrlHd?: string;

  // Optional surface fields (best-effort)
  categoryName?: string;
  businessCategoryName?: string;

  // Timestamps
  fetchedAt: string; // ISO
};
```

### 4.2 Post Surface (List Item)

```tsx
export type IGPostMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'UNKNOWN';

export type IGPostSurfaceNormalized = {
  id?: string;
  shortcode?: string;
  url?: string;

  mediaType: IGPostMediaType;

  captionText?: string;
  createdAt?: string; // ISO

  likeCount?: number;
  commentCount?: number;
  viewCount?: number; // video

  thumbnailUrl?: string;

  // Timestamps
  fetchedAt: string; // ISO
};
```

### 4.3 Post Details

```tsx
export type IGPostOwner = {
  id?: string;
  username: string;
  fullName?: string;
};

export type IGPostMediaItem = {
  mediaType: IGPostMediaType;
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
};

export type IGPostDetailNormalized = {
  id?: string;
  shortcode?: string;
  url?: string;

  owner?: IGPostOwner;

  captionText?: string;
  createdAt?: string; // ISO

  likeCount?: number;
  commentCount?: number;
  viewCount?: number;

  media: IGPostMediaItem[];

  // Optional best-effort extras
  locationName?: string;
  hashtags?: string[];
  mentions?: string[];

  fetchedAt: string; // ISO
};
```

---

## 5. Main Class

```tsx
export class IGScraper {
  constructor(session: IGSessionState, config?: IGScraperConfig);

  /**
   * Closes all underlying browser resources.
   * User-owned responsibility.
   */
  close(): Promise<void>;

  /**
   * Returns the most recent session snapshot (if refreshed during runtime).
   * This does not persist anything.
   */
  exportSession(): Promise<IGSessionState>;

  /**
   * Best-effort validation that the session still works.
   */
  validateSession(): Promise<IGResult<{ valid: boolean }>>;

  // --- Data Targets (v0) ---

  /**
   * Fetches all available profile-level information.
   * Accepts username (preferred) or profile URL.
   */
  getProfile(input: {
    username?: string;
    url?: string;
  }): Promise<IGResult<IGProfileNormalized>>;

  /**
   * Fetches surface-level post metadata for a profile.
   * Supports cursor-based pagination.
   */
  listProfilePosts(
    input: { username?: string; url?: string },
    options?: {
      limit?: number; // default: safe value
      cursor?: string | null;
    }
  ): Promise<IGResult<IGPagedResult<IGPostSurfaceNormalized>>>;

  /**
   * Fetches full details for a specific post.
   * Accepts shortcode (preferred) or post URL.
   */
  getPost(input: {
    shortcode?: string;
    url?: string;
  }): Promise<IGResult<IGPostDetailNormalized>>;
}
```

---

## 6. Behavioral Notes (API-Level)

### 6.1 Best-Effort

- Calls may return partial normalized fields when Instagram restricts access or changes occur.
- Partial data is represented via optional fields plus `warnings` where helpful.

### 6.2 Private / Restricted Accounts

- If a profile is private and inaccessible, the library returns what is available.
- If nothing is accessible, return `ok: false` with `error.type = "PRIVATE_RESTRICTED"` (or `AUTH_REQUIRED` if session is invalid).

### 6.3 Strict Mode

If `throwOnError: true`, the implementation may throw for non-OK results.

The thrown error should be an `IGError`-compatible structure.

---

## 7. Future Expansion Rules

Any addition to the public API must:

- Stay within the locked project scope
- Preserve API simplicity
- Include examples in documentation
- Be evaluated for breaking impact

---

## 8. Open Items (Explicitly Not Decided Here)

- Exact normalized field completeness and mapping logic
- Internal module layout
- Selector strategy and fallback mechanisms
- Artifact capture format and directory naming
