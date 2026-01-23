
import { logger } from '../cli/logger.js';
import type { Plugin, PluginMetadata, PluginOptions } from './types.js';

/**
 * Registry for managing plugins
 */
export class PluginRegistry {
    private plugins = new Map<string, Plugin>();
    private enabledPlugins = new Set<string>();
    private initialized = false;

    /**
     * Register a plugin with the registry
     */
    register(plugin: Plugin): void {
        if (!this.validatePlugin(plugin)) {
            return;
        }

        const { id } = plugin.metadata;

        if (this.plugins.has(id)) {
            logger.warn(`Plugin with ID '${id}' is already registered. Skipping.`);
            return;
        }

        this.plugins.set(id, plugin);
        this.enabledPlugins.add(id);
    }

    /**
     * Initialize all registered plugins
     */
    async initialize(options: Record<string, PluginOptions> = {}): Promise<void> {
        if (this.initialized) {
            return;
        }

        for (const [id, plugin] of this.plugins) {
            try {
                if (plugin.init) {
                    await plugin.init(options[id] || {});
                }
            } catch (error) {
                logger.warn(`Failed to initialize plugin '${id}': ${error instanceof Error ? error.message : 'Unknown error'}`);
                this.enabledPlugins.delete(id);
            }
        }

        this.initialized = true;
    }

    /**
     * Get a plugin by ID
     */
    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id);
    }

    /**
     * Get all registered plugins
     */
    getAllPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }

    /**
     * Get all enabled plugins
     */
    getEnabledPlugins(): Plugin[] {
        return Array.from(this.plugins.entries())
            .filter(([id]) => this.enabledPlugins.has(id))
            .map(([, plugin]) => plugin);
    }

    /**
     * Enable a plugin
     */
    enablePlugin(id: string): void {
        if (this.plugins.has(id)) {
            this.enabledPlugins.add(id);
        }
    }

    /**
     * Disable a plugin
     */
    disablePlugin(id: string): void {
        this.enabledPlugins.delete(id);
    }

    /**
     * Check if a plugin is enabled
     */
    isEnabled(id: string): boolean {
        return this.enabledPlugins.has(id);
    }

    /**
     * Validate plugin shape
     */
    private validatePlugin(plugin: unknown): plugin is Plugin {
        if (!plugin || typeof plugin !== 'object') {
            logger.warn('Invalid plugin: must be an object');
            return false;
        }

        // Check metadata
        if (!this.validateMetadata((plugin as Plugin).metadata)) {
            return false;
        }

        // Check hooks are functions if present
        const hooks = ['init', 'beforeRender', 'render', 'afterRender'];
        for (const hook of hooks) {
            const hookFn = (plugin as any)[hook];
            if (hookFn !== undefined && typeof hookFn !== 'function') {
                logger.warn(`Invalid plugin '${(plugin as Plugin).metadata.id}': ${hook} must be a function`);
                return false;
            }
        }

        return true;
    }

    /**
     * Validate plugin metadata
     */
    private validateMetadata(metadata: unknown): metadata is PluginMetadata {
        if (!metadata || typeof metadata !== 'object') {
            logger.warn('Invalid plugin metadata: must be an object');
            return false;
        }

        const required: (keyof PluginMetadata)[] = ['id', 'name', 'description', 'version', 'author'];
        const missing = required.filter(key => !(key in metadata));

        if (missing.length > 0) {
            logger.warn(`Invalid plugin metadata: missing required fields: ${missing.join(', ')}`);
            return false;
        }

        return true;
    }
}

/**
 * Global plugin registry instance
 */
export const pluginRegistry = new PluginRegistry();