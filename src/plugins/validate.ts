import type { Plugin } from './types.js';

/**
 * Throws an error if the plugin does not conform to the stable contract.
 * Used to fail loudly and early for invalid plugins.
 */
export function assertValidPlugin(plugin: unknown): asserts plugin is Plugin {
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('Plugin must be an object');
  }
  const p = plugin as Plugin;
  if (!p.metadata || typeof p.metadata !== 'object') {
    throw new Error('Plugin must have a metadata object');
  }
  const m = p.metadata;
  if (typeof m.id !== 'string' || !m.id) throw new Error('Plugin metadata.id is required');
  if (typeof m.name !== 'string' || !m.name) throw new Error('Plugin metadata.name is required');
  if (typeof m.description !== 'string' || !m.description) throw new Error('Plugin metadata.description is required');
  if (typeof m.version !== 'string' || !m.version) throw new Error('Plugin metadata.version is required');
  if (typeof m.author !== 'string' || !m.author) throw new Error('Plugin metadata.author is required');
  // At least one lifecycle hook must be a function
  if (
    typeof p.init !== 'function' &&
    typeof p.beforeRender !== 'function' &&
    typeof p.render !== 'function' &&
    typeof p.afterRender !== 'function'
  ) {
    throw new Error('Plugin must implement at least one lifecycle hook (init, beforeRender, render, afterRender)');
  }
}
