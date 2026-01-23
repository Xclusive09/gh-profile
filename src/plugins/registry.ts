import { logger } from '../cli/logger.js';
import type { Plugin, PluginMetadata, PluginOptions } from './types.js';
import type { Config } from '../config/types.js';

export class PluginRegistry {
    private plugins = new Map<string, Plugin>();
    private enabledPlugins = new Set<string>();
    private initialized = false;

    private readonly supportedHooks = ['init', 'beforeRender', 'render', 'afterRender'] as const;

    register(plugin: Plugin): void {
        if (!this.validatePlugin(plugin)) return;

        const { id } = plugin.metadata;

        if (this.plugins.has(id)) {
            logger.warn(`Plugin '${id}' already registered. Skipping.`);
            return;
        }

        this.plugins.set(id, plugin);
        this.enabledPlugins.add(id); // default: enabled
    }

    async initialize(
        options: Record<string, PluginOptions> = {},
        config?: Config
    ): Promise<void> {
        if (this.initialized) return;

        // Apply config overrides
        if (config?.plugins) {
            for (const [pluginId, shouldEnable] of Object.entries(config.plugins)) {
                if (typeof shouldEnable !== 'boolean') {
                    logger.warn(`Invalid config value for plugin '${pluginId}': expected boolean`);
                    continue;
                }

                if (!this.plugins.has(pluginId)) {
                    logger.warn(`Config references unknown plugin '${pluginId}' — ignoring`);
                    continue;
                }

                if (shouldEnable === false) {
                    this.disablePlugin(pluginId);
                    logger.info(`Plugin '${pluginId}' disabled via config`);
                } else {
                    this.enablePlugin(pluginId);
                }
            }
        }

        // Initialize enabled plugins
        for (const [id, plugin] of this.plugins) {
            if (!this.isEnabled(id)) {
                logger.debug(`Skipping disabled plugin: ${id}`);
                continue;
            }

            try {
                if (plugin.init) {
                    await plugin.init(options[id] || {});
                    logger.debug(`Plugin '${id}' initialized`);
                }
            } catch (error) {
                logger.warn(
                    `Plugin '${id}' init failed: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
                this.disablePlugin(id);
            }
        }

        this.initialized = true;
    }

    // ── Optional helper for tests/debug ──
    reset(): void {
        this.plugins.clear();
        this.enabledPlugins.clear();
        this.initialized = false;
    }

    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id);
    }

    getAllPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }

    getEnabledPlugins(): Plugin[] {
        return Array.from(this.plugins.values()).filter(p => this.isEnabled(p.metadata.id));
    }

    enablePlugin(id: string): void {
        if (this.plugins.has(id)) this.enabledPlugins.add(id);
    }

    disablePlugin(id: string): void {
        this.enabledPlugins.delete(id);
    }

    isEnabled(id: string): boolean {
        return this.enabledPlugins.has(id);
    }

    private validatePlugin(plugin: unknown): plugin is Plugin {
        if (!plugin || typeof plugin !== 'object') {
            logger.warn('Invalid plugin: not an object');
            return false;
        }

        const p = plugin as Plugin;
        if (!this.validateMetadata(p.metadata)) return false;

        for (const hook of this.supportedHooks) {
            const fn = (p as unknown as never)[hook];
            if (fn !== undefined && typeof fn !== 'function') {
                logger.warn(`Plugin '${p.metadata.id}': '${hook}' must be a function`);
                return false;
            }
        }

        return true;
    }

    private validateMetadata(metadata: unknown): metadata is PluginMetadata {
        if (!metadata || typeof metadata !== 'object') {
            logger.warn('Invalid plugin metadata');
            return false;
        }

        const m = metadata as PluginMetadata;
        const required: (keyof PluginMetadata)[] = ['id', 'name', 'description', 'version', 'author'];
        const missing = required.filter(key => !(key in m));

        if (missing.length > 0) {
            logger.warn(`Plugin metadata missing: ${missing.join(', ')}`);
            return false;
        }

        return true;
    }
}

export const pluginRegistry = new PluginRegistry();