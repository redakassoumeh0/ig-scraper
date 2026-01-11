/**
 * Manual test script for profile extraction feature.
 *
 * This script tests:
 * 1. Creating a session using createSessionWithCodegen
 * 2. Creating an IGScraper instance with the session
 * 3. Testing getProfile() with a known public profile
 * 4. Validating the result structure
 * 5. Testing error cases (not found, private account if available)
 *
 * Usage:
 *   npx tsx docs/testing/test-profile-extraction.ts
 *   or
 *   npm run build && node dist/docs/testing/test-profile-extraction.js
 *
 * Note: This script requires manual interaction for session creation.
 */

import { IGScraper, createSessionWithCodegen } from '../../src/index.js';
import type { IGResult, IGProfileNormalized } from '../../src/index.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates that a profile result has the expected structure.
 */
function validateProfileResult(
  result: IGResult<IGProfileNormalized>,
  expectedUsername: string
): void {
  console.log('\n=== Profile Result Validation ===');
  console.log(`OK: ${result.ok}`);
  console.log(`Duration: ${result.meta?.durationMs}ms`);

  if (result.ok && result.data) {
    const profile = result.data.normalized;
    console.log('\n--- Normalized Data ---');
    console.log(`Username: ${profile.username}`);
    console.log(`Full Name: ${profile.fullName || '(not available)'}`);
    console.log(`Is Private: ${profile.isPrivate ?? '(not available)'}`);
    console.log(`Access: ${profile.access}`);
    console.log(`Is Verified: ${profile.isVerified ?? '(not available)'}`);
    console.log(`Followers: ${profile.followersCount ?? '(not available)'}`);
    console.log(`Following: ${profile.followingCount ?? '(not available)'}`);
    console.log(`Posts: ${profile.postsCount ?? '(not available)'}`);
    console.log(`Fetched At: ${profile.fetchedAt}`);

    if (result.warnings && result.warnings.length > 0) {
      console.log('\n--- Warnings ---');
      result.warnings.forEach((warning) => {
        console.log(`  - ${warning}`);
      });
    }

    // Basic validation
    if (profile.username !== expectedUsername) {
      throw new Error(
        `Username mismatch: expected ${expectedUsername}, got ${profile.username}`
      );
    }

    if (!profile.fetchedAt) {
      throw new Error('Missing fetchedAt timestamp');
    }

    console.log('\n✓ Profile result validation passed');
  } else if (result.error) {
    console.log('\n--- Error ---');
    console.log(`Type: ${result.error.type}`);
    console.log(`Message: ${result.error.message}`);
    if (result.error.hint) {
      console.log(`Hint: ${result.error.hint}`);
    }
  }
}

/**
 * Main test function.
 */
async function main(): Promise<void> {
  console.log('==========================================');
  console.log('Profile Extraction Test Script');
  console.log('==========================================\n');

  try {
    // Step 1: Create a session using createSessionWithCodegen
    console.log('Step 1: Creating session with codegen...');
    console.log(
      'Note: This will open a browser window. Please log in to Instagram manually.\n'
    );

    const session = await createSessionWithCodegen({
      accountHint: 'test_account',
    });

    console.log('\n✓ Session created successfully');
    console.log(`  - Created at: ${session.createdAt}`);
    console.log(`  - Cookies: ${session.storageState.cookies?.length ?? 0}`);

    // Optional: Save session for reuse
    const sessionPath = path.join(process.cwd(), 'test-session.json');
    console.log(`\nSaving session to ${sessionPath}...`);
    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    console.log('✓ Session saved\n');

    // Step 2: Create IGScraper instance
    console.log('Step 2: Creating IGScraper instance...');
    const scraper = new IGScraper(session);

    // Step 3: Validate session
    console.log('\nStep 3: Validating session...');
    const validationResult = await scraper.validateSession();
    if (!validationResult.ok) {
      console.error('✗ Session validation failed');
      console.error(`Error: ${validationResult.error?.message}`);
      await scraper.close();
      process.exit(1);
    }
    console.log('✓ Session is valid');

    // Step 4: Test getProfile with a known public profile
    console.log(
      '\nStep 4: Testing getProfile() with public profile (instagram)...'
    );
    const profileResult = await scraper.getProfile({ username: 'instagram' });
    validateProfileResult(profileResult, 'instagram');

    if (!profileResult.ok) {
      console.error('\n✗ Profile extraction failed');
      await scraper.close();
      process.exit(1);
    }

    // Step 5: Test error case - not found
    console.log('\n\nStep 5: Testing error case - not found username...');
    const notFoundResult = await scraper.getProfile({
      username: 'this_user_does_not_exist_12345_xyz',
    });
    console.log('\n=== Not Found Result ===');
    console.log(`OK: ${notFoundResult.ok}`);
    if (notFoundResult.error) {
      console.log(`Error Type: ${notFoundResult.error.type}`);
      console.log(`Error Message: ${notFoundResult.error.message}`);
      if (notFoundResult.error.type === 'NOT_FOUND') {
        console.log('✓ Correctly returned NOT_FOUND error');
      } else {
        console.log(
          `⚠ Expected NOT_FOUND but got ${notFoundResult.error.type}`
        );
      }
    }

    // Step 6: Test with URL input
    console.log('\n\nStep 6: Testing getProfile() with URL input...');
    const urlResult = await scraper.getProfile({
      url: 'https://www.instagram.com/instagram/',
    });
    validateProfileResult(urlResult, 'instagram');

    if (!urlResult.ok) {
      console.error('\n✗ URL-based profile extraction failed');
    } else {
      console.log('✓ URL-based profile extraction successful');
    }

    // Cleanup
    console.log('\n\nStep 7: Cleaning up...');
    await scraper.close();
    console.log('✓ Scraper closed');

    console.log('\n==========================================');
    console.log('✓ All tests completed successfully');
    console.log('==========================================\n');
  } catch (error) {
    console.error('\n✗ Test failed with error:');
    console.error(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
