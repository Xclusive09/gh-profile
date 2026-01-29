import type { ConfigV2 } from './schema.js';

/**
 * Migrate any config object to the latest schema version (ConfigV2).
 * Mutates a copy, does not modify the original.
 */
export function migrateConfig(config: unknown): ConfigV2 {
  // If already v2, just return (with $schemaVersion)
  if (config && typeof config === 'object' && (config as any).$schemaVersion === 2) {
    return { ...(config as ConfigV2) };
  }

  // If v1 (no $schemaVersion), migrate
  const c = config as Record<string, unknown>;
  const migrated: ConfigV2 = {
    ...(c as any),
    $schemaVersion: 2,
    templatesPath: c.templatesPath as string | undefined ?? undefined,
  };
  return migrated;
}

/**
 * Detect config version (returns 1 or 2)
 */
export function detectConfigVersion(config: unknown): 1 | 2 {
  if (config && typeof config === 'object' && (config as any).$schemaVersion === 2) return 2;
  return 1;
}
