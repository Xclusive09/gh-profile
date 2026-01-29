/**
 * Parse CLI plugin enable/disable flags from options object.
 */
export function parsePluginFlags(options: Record<string, unknown>): {
  enable: string[];
  disable: string[];
} {
  const enable = Array.isArray(options['enable-plugin']) ? options['enable-plugin'] as string[] : [];
  const disable = Array.isArray(options['disable-plugin']) ? options['disable-plugin'] as string[] : [];
  return { enable, disable };
}
