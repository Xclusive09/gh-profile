// Config schema definition for versioning and validation

export const CONFIG_SCHEMA_VERSION = 2;

export interface ConfigV1 {
  template: string;
  output: string;
  github: {
    includePrivate: boolean;
    excludeRepos: string[];
    pinnedRepos: string[];
  };
  customize: {
    showLanguages: boolean;
    showStats: boolean;
    showSocial: boolean;
    sections: string[];
  };
  plugins?: Record<string, boolean>;
}

export interface ConfigV2 extends ConfigV1 {
  $schemaVersion: 2;
  templatesPath?: string;
}

export type AnyConfig = ConfigV1 | ConfigV2;
