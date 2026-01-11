import type { EngineState } from './types.js';

/**
 * Safely closes all browser resources.
 * Idempotent - safe to call multiple times.
 * Handles partial initialization failures gracefully.
 *
 * @param state - Engine state containing browser/context/page references
 */
export async function closeEngine(state: EngineState): Promise<void> {
  // If already closed or not initialized, do nothing
  if (state.status === 'closed' || state.status === 'not_initialized') {
    return;
  }

  // Close resources in reverse order of creation
  // Each close is wrapped in try-catch to ensure all cleanup attempts are made

  if (state.page) {
    try {
      await state.page.close();
    } catch (error) {
      // Log error but continue cleanup
      console.error('Error closing page:', error);
    }
    state.page = null;
  }

  if (state.context) {
    try {
      await state.context.close();
    } catch (error) {
      console.error('Error closing context:', error);
    }
    state.context = null;
  }

  if (state.browser) {
    try {
      await state.browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
    state.browser = null;
  }

  // Mark as closed
  state.status = 'closed';
}

