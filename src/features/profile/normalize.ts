import type {
  IGProfileAccess,
  IGProfileNormalized,
} from '../../public/types/models.js';
import type { RawProfileData } from './types.js';

/**
 * Determines the access level from raw profile data.
 *
 * @param data - Raw profile data
 * @returns Profile access level
 */
function determineAccess(data: RawProfileData): IGProfileAccess {
  if (data.is_private === true) {
    return 'PRIVATE';
  }

  // Check for restricted account indicators
  // Instagram may mark accounts as restricted in various ways
  if (
    data.category_name === 'Restricted Account' ||
    (typeof data === 'object' &&
      'is_restricted' in data &&
      (data as { is_restricted?: boolean }).is_restricted === true)
  ) {
    return 'RESTRICTED';
  }

  // Default to PUBLIC if not private
  if (data.is_private === false) {
    return 'PUBLIC';
  }

  // If we can't determine, return UNKNOWN
  return 'UNKNOWN';
}

/**
 * Normalizes raw profile data to IGProfileNormalized format.
 *
 * @param data - Raw profile data from extraction
 * @param username - Username (required field)
 * @returns Normalized profile data
 */
export function normalizeProfile(
  data: RawProfileData,
  username: string
): { normalized: IGProfileNormalized; warnings: string[] } {
  const warnings: string[] = [];
  const access = determineAccess(data);
  const isPrivate = access === 'PRIVATE';

  const normalized: IGProfileNormalized = {
    username,
    access,
    isPrivate: isPrivate || undefined,
    fetchedAt: new Date().toISOString(),
  };

  // Map optional fields with best-effort
  if (data.id) {
    normalized.id = String(data.id);
  }

  if (data.full_name && typeof data.full_name === 'string') {
    normalized.fullName = data.full_name;
  } else if (typeof (data as { fullName?: string }).fullName === 'string') {
    // Handle camelCase variant
    normalized.fullName = (data as { fullName: string }).fullName;
  }

  if (data.biography) {
    normalized.biography = data.biography;
  }

  if (data.external_url && typeof data.external_url === 'string') {
    normalized.externalUrl = data.external_url;
  } else if (
    typeof (data as { externalUrl?: string }).externalUrl === 'string'
  ) {
    // Handle camelCase variant
    normalized.externalUrl = (data as { externalUrl: string }).externalUrl;
  }

  if (typeof data.is_verified === 'boolean') {
    normalized.isVerified = data.is_verified;
  } else if (
    typeof (data as { isVerified?: boolean }).isVerified === 'boolean'
  ) {
    normalized.isVerified = (data as { isVerified: boolean }).isVerified;
  }

  // Extract counts from edge structures (Instagram GraphQL format)
  if (
    data.edge_followed_by &&
    typeof data.edge_followed_by === 'object' &&
    'count' in data.edge_followed_by &&
    typeof data.edge_followed_by.count === 'number'
  ) {
    normalized.followersCount = data.edge_followed_by.count;
  }

  if (
    data.edge_follow &&
    typeof data.edge_follow === 'object' &&
    'count' in data.edge_follow &&
    typeof data.edge_follow.count === 'number'
  ) {
    normalized.followingCount = data.edge_follow.count;
  }

  if (
    data.edge_owner_to_timeline_media &&
    typeof data.edge_owner_to_timeline_media === 'object' &&
    'count' in data.edge_owner_to_timeline_media &&
    typeof data.edge_owner_to_timeline_media.count === 'number'
  ) {
    normalized.postsCount = data.edge_owner_to_timeline_media.count;
  }

  // Extract profile picture URLs
  if (data.profile_pic_url) {
    normalized.profilePicUrl = data.profile_pic_url;
  } else if ((data as { profilePicUrl?: string }).profilePicUrl) {
    normalized.profilePicUrl = (
      data as { profilePicUrl: string }
    ).profilePicUrl;
  }

  if (data.profile_pic_url_hd) {
    normalized.profilePicUrlHd = data.profile_pic_url_hd;
  } else if ((data as { profilePicUrlHd?: string }).profilePicUrlHd) {
    normalized.profilePicUrlHd = (
      data as { profilePicUrlHd: string }
    ).profilePicUrlHd;
  } else if (normalized.profilePicUrl) {
    // Use regular profile pic as HD if HD not available
    normalized.profilePicUrlHd = normalized.profilePicUrl;
  }

  // Extract business fields
  if (data.category_name) {
    normalized.categoryName = data.category_name;
  }

  if (data.business_category_name) {
    normalized.businessCategoryName = data.business_category_name;
  }

  // Add warnings for missing important fields
  if (!normalized.id) {
    warnings.push('Profile ID not found in source data');
  }

  if (
    !normalized.followersCount &&
    !normalized.followingCount &&
    !normalized.postsCount
  ) {
    warnings.push('Profile counts not found in source data');
  }

  if (!normalized.profilePicUrl) {
    warnings.push('Profile picture URL not found in source data');
  }

  return { normalized, warnings };
}
