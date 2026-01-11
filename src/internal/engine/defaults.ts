import type { IGScraperConfig } from '../../public/config/config.js';
import type { EngineConfig } from './types.js';

/**
 * Default configuration values for the engine.
 * These provide sensible defaults for all optional config fields.
 */
const ENGINE_DEFAULTS: EngineConfig = {
  headless: true,
  timeoutMs: 30000, // 30 seconds
  slowMoMs: 0,
  locale: 'en-US',
  timezone: 'UTC',
};

/**
 * Merges user-provided config with defaults.
 * All optional fields are resolved to concrete values.
 */
export function mergeWithDefaults(
  userConfig?: IGScraperConfig
): EngineConfig {
  return {
    headless: userConfig?.headless ?? ENGINE_DEFAULTS.headless,
    timeoutMs: userConfig?.timeoutMs ?? ENGINE_DEFAULTS.timeoutMs,
    slowMoMs: userConfig?.slowMoMs ?? ENGINE_DEFAULTS.slowMoMs,
    locale: userConfig?.locale ?? ENGINE_DEFAULTS.locale,
    timezone: userConfig?.timezone ?? ENGINE_DEFAULTS.timezone,
  };
}

