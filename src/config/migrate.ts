import type { ConfigV1, ConfigV2 } from './schema.js';

function isConfigV2(config: unknown): config is ConfigV2 {
  return (
    typeof config === 'object' &&
    config !== null &&
    '$schemaVersion' in config &&
    (config as { $schemaVersion: unknown }).$schemaVersion === 2
  );
}

function isConfigV1(config: unknown): config is ConfigV1 {
  return (
    typeof config === 'object' &&
    config !== null &&
    !('$schemaVersion' in config)
  );
}

/**
 * Migrate any config object to the latest schema version (ConfigV2).
 * Mutates a copy, does not modify the original.
 */
export function migrateConfig(config: unknown): ConfigV2 {
  if (isConfigV2(config)) {
    // Already v2, just return a shallow copy
    return { ...config };
  }
  if (isConfigV1(config)) {
    // v1 (no $schemaVersion), migrate
    const c = config as ConfigV1;
    const migrated: ConfigV2 = {
      ...c,
      $schemaVersion: 2,
      templatesPath: (c as Partial<ConfigV1> & { templatesPath?: string }).templatesPath ?? undefined,
    };
    return migrated;
  }
  // fallback: treat as empty v2
  return {
    template: '',
    output: '',
    github: {
      includePrivate: false,
      excludeRepos: [],
      pinnedRepos: [],
    },
    customize: {
      showLanguages: false,
      showStats: false,
      showSocial: false,
      sections: [],
    },
    $schemaVersion: 2,
  };
}

/**
 * Detect config version (returns 1 or 2)
 */
export function detectConfigVersion(config: unknown): 1 | 2 {
  if (isConfigV2(config)) return 2;
  return 1;
}
