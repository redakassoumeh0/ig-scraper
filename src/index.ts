// Root export - ONLY re-exports from src/public/*
// Everything in src/internal/ and src/features/ is private

// Main class
export { IGScraper } from './public/IGScraper.js';

// Session utilities
export {
  createSession,
  createSessionWithCodegen,
} from './public/session/index.js';
export type { CreateSessionOptions } from './public/session/index.js';

// Types
export type { IGStorageState, IGSessionState } from './public/types/session.js';

export type { IGErrorType, IGError } from './public/types/error.js';

export type { IGResult } from './public/types/result.js';

export type { IGPagination, IGPagedResult } from './public/types/pagination.js';

export type {
  IGProfileAccess,
  IGPostMediaType,
  IGProfileNormalized,
  IGPostSurfaceNormalized,
  IGPostDetailNormalized,
  IGPostOwner,
  IGPostMediaItem,
} from './public/types/models.js';

// Config
export type { IGLogLevel, IGLogger } from './public/config/logger.js';
export type { IGScraperConfig } from './public/config/config.js';
