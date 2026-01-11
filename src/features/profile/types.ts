/**
 * Internal types for profile extraction.
 * These represent the raw data structure from Instagram's JSON payloads.
 * These types are NOT exported from the package.
 */

/**
 * Raw profile data structure extracted from Instagram.
 * This represents the actual structure from Instagram's API/JSON.
 */
export type RawProfileData = {
  id?: string;
  username?: string;
  full_name?: string;
  biography?: string;
  external_url?: string;
  is_private?: boolean;
  is_verified?: boolean;
  edge_followed_by?: {
    count?: number;
  };
  edge_follow?: {
    count?: number;
  };
  edge_owner_to_timeline_media?: {
    count?: number;
  };
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  category_name?: string;
  business_category_name?: string;
  [key: string]: unknown; // Allow additional fields from Instagram
};

/**
 * Result of extraction attempt.
 */
export type ExtractionResult =
  | {
      success: true;
      data: RawProfileData;
      source: 'json' | 'dom';
    }
  | {
      success: false;
      error: string;
    };
