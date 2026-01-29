/**
 * Resolves plugin enable/disable state from CLI, config, and defaults.
 * Precedence: CLI > config > default (enabled)
 */
export interface PluginResolution {
  enabled: string[];
  disabled: string[];
}

export interface PluginResolutionInput {
  allPluginIds: string[];
  cliEnable?: string[];
  cliDisable?: string[];
  config?: Record<string, boolean>;
}

export function resolvePluginState(input: PluginResolutionInput): PluginResolution {
  const { allPluginIds, cliEnable = [], cliDisable = [], config = {} } = input;
  const enabled = new Set<string>();
  const disabled = new Set<string>();

  // 1. CLI disables always win
  for (const id of cliDisable) {
    disabled.add(id);
    enabled.delete(id);
  }
  // 2. CLI enables next
  for (const id of cliEnable) {
    if (!disabled.has(id)) enabled.add(id);
  }
  // 3. Config disables
  for (const [id, value] of Object.entries(config)) {
    if (value === false && !cliEnable.includes(id)) {
      disabled.add(id);
      enabled.delete(id);
    }
  }
  // 4. Config enables
  for (const [id, value] of Object.entries(config)) {
    if (value === true && !disabled.has(id)) {
      enabled.add(id);
    }
  }
  // 5. Defaults: enable any not explicitly disabled
  for (const id of allPluginIds) {
    if (!disabled.has(id) && !enabled.has(id)) {
      enabled.add(id);
    }
  }
  return {
    enabled: Array.from(enabled),
    disabled: Array.from(disabled),
  };
}
