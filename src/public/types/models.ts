/**
 * Profile access level indicator.
 */
export type IGProfileAccess = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED' | 'UNKNOWN';

/**
 * Post media type indicator.
 */
export type IGPostMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'UNKNOWN';

/**
 * Normalized profile data structure.
 * Represents all available profile-level information.
 */
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
  fetchedAt: string; // ISO timestamp
};

/**
 * Post owner information.
 */
export type IGPostOwner = {
  id?: string;
  username: string;
  fullName?: string;
};

/**
 * Post media item structure.
 */
export type IGPostMediaItem = {
  mediaType: IGPostMediaType;
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
};

/**
 * Normalized post surface data (list item).
 * Represents surface-level metadata for posts in a list.
 */
export type IGPostSurfaceNormalized = {
  id?: string;
  shortcode?: string;
  url?: string;

  mediaType: IGPostMediaType;

  captionText?: string;
  createdAt?: string; // ISO timestamp

  likeCount?: number;
  commentCount?: number;
  viewCount?: number; // video

  thumbnailUrl?: string;

  // Timestamps
  fetchedAt: string; // ISO timestamp
};

/**
 * Normalized post detail data.
 * Represents full post metadata including media items.
 */
export type IGPostDetailNormalized = {
  id?: string;
  shortcode?: string;
  url?: string;

  owner?: IGPostOwner;

  captionText?: string;
  createdAt?: string; // ISO timestamp

  likeCount?: number;
  commentCount?: number;
  viewCount?: number;

  media: IGPostMediaItem[];

  // Optional best-effort extras
  locationName?: string;
  hashtags?: string[];
  mentions?: string[];

  fetchedAt: string; // ISO timestamp
};
