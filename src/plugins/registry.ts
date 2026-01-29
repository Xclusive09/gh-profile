import { logger } from '../cli/logger.js';
import type { Plugin, PluginOptions, PluginHook, PluginRegistration } from './types.js';
import type { Config } from '../config/types.js';
import { isPlugin } from './types.js';

/**
 * Plugin Registry to manage plugins
 */
export class PluginRegistry {
    private plugins = new Map<string, PluginRegistration>();
    private initialized = false;
    private readonly supportedHooks: PluginHook[] = ['init', 'beforeRender', 'render', 'afterRender'];

    constructor() {
        // Initialize with core metadata
        logger.debug('PluginRegistry initialized');
    }

    /**
     * Register a plugin with options
     */
    register(plugin: Plugin, options: PluginOptions = {}): void {
        if (!this.validatePlugin(plugin)) {
            logger.warn(`Plugin validation failed for: ${(plugin as Plugin)?.metadata?.id || 'unknown'}`);
            return;
        }

        const { id } = plugin.metadata;

        if (this.plugins.has(id)) {
            logger.warn(`Plugin '${id}' already registered. Skipping.`);
            return;
        }

        const registration: PluginRegistration = {
            plugin,
            options: {
                enabled: options.enabled ?? true, // Default to enabled
                config: options.config || {}
            },
            enabled: options.enabled ?? true
        };

        this.plugins.set(id, registration);
        logger.debug(`Registered plugin: ${id} (${registration.enabled ? 'enabled' : 'disabled'})`);
    }

    /**
     * Initialize all enabled plugins
     */
    async initialize(
        pluginOptions: Record<string, PluginOptions> = {},
        config?: Config
    ): Promise<void> {
        if (this.initialized) {
            logger.debug('PluginRegistry already initialized');
            return;
        }

        logger.info('Initializing plugins...');

        // Apply configuration overrides first
        this.applyConfigOverrides(config);

        // Apply runtime options
        this.applyPluginOptions(pluginOptions);

        // Initialize enabled plugins
        const initPromises: Promise<void>[] = [];

        for (const [id, registration] of this.plugins) {
            if (!registration.enabled) {
                logger.debug(`Skipping disabled plugin: ${id}`);
                continue;
            }

            initPromises.push(
                this.initializePlugin(id, registration).catch(error => {
                    logger.warn(`Plugin '${id}' initialization failed, disabling: ${error instanceof Error ? error.message : String(error)}`);
                    registration.enabled = false;
                })
            );
        }

        await Promise.allSettled(initPromises);
        this.initialized = true;

        const enabledCount = this.getEnabledPlugins().length;
        logger.info(`Plugin system initialized. ${enabledCount} plugin(s) enabled.`);
    }

    /**
     * Get plugin by ID
     */
    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id)?.plugin;
    }

    /**
     * Get all registered plugins
     */
    getAllPlugins(): Plugin[] {
        return Array.from(this.plugins.values()).map(r => r.plugin);
    }

    /**
     * Get enabled plugins
     */
    getEnabledPlugins(): Plugin[] {
        return Array.from(this.plugins.values())
            .filter(r => r.enabled)
            .map(r => r.plugin);
    }

    /**
     * Get enabled plugins that implement a specific hook
     */
    getPluginsWithHook(hook: PluginHook): Plugin[] {
        return this.getEnabledPlugins().filter(plugin =>
            typeof ((plugin as unknown) as Record<string, unknown>)[hook] === 'function'
        );
    }

    /**
     * Enable a plugin
     */
    enablePlugin(id: string): void {
        const registration = this.plugins.get(id);
        if (registration) {
            registration.enabled = true;
            registration.options.enabled = true;
            logger.debug(`Enabled plugin: ${id}`);
        }
    }

    /**
     * Disable a plugin
     */
    disablePlugin(id: string): void {
        const registration = this.plugins.get(id);
        if (registration) {
            registration.enabled = false;
            registration.options.enabled = false;
            logger.debug(`Disabled plugin: ${id}`);
        }
    }

    /**
     * Check if a plugin is enabled
     */
    isEnabled(id: string): boolean {
        return this.plugins.get(id)?.enabled ?? false;
    }

    /**
     * Check if plugin system is initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Reset registry (for testing)
     */
    reset(): void {
        this.plugins.clear();
        this.initialized = false;
        logger.debug('PluginRegistry reset');
    }

    /**
     * Execute a specific hook on all enabled plugins
     */
    async executeHook<T extends PluginHook>(
        hook: T,
        ...args: Parameters<NonNullable<Plugin[T]>>
    ): Promise<void> {
        if (!this.initialized) {
            throw new Error('PluginRegistry not initialized');
        }

        const plugins = this.getPluginsWithHook(hook);

        if (plugins.length === 0) {
            return;
        }

        logger.debug(`Executing '${hook}' hook on ${plugins.length} plugin(s)`);

        const executions = plugins.map(async (plugin) => {
            try {
                const hookFn = ((plugin as unknown) as Record<string, unknown>)[hook] as ((...args: unknown[]) => unknown);
                await hookFn(...args);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                logger.warn(`Plugin '${plugin.metadata.id}' failed during '${hook}' hook: ${errorMessage}`);

                // Don't disable plugin for runtime hook failures, just log
                if (hook === 'init') {
                    this.disablePlugin(plugin.metadata.id);
                }
            }
        });

        await Promise.allSettled(executions);
    }

    private async initializePlugin(id: string, registration: PluginRegistration): Promise<void> {
        const { plugin, options } = registration;

        if (!plugin.init) {
            return; // No init hook
        }

        try {
            await plugin.init(options);
            logger.debug(`Plugin '${id}' initialized successfully`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Plugin '${id}' initialization failed:` + ` ${errorMessage}`);
            throw error;
        }
    }

    private applyConfigOverrides(config?: Config): void {
        if (!config?.plugins) {
            return;
        }

        for (const [pluginId, configValue] of Object.entries(config.plugins)) {
            const registration = this.plugins.get(pluginId);

            if (!registration) {
                logger.debug(`Config references unknown plugin '${pluginId}' - ignoring`);
                continue;
            }

            if (typeof configValue === 'boolean') {
                registration.enabled = configValue;
                registration.options.enabled = configValue;
                logger.debug(`Plugin '${pluginId}' ${configValue ? 'enabled' : 'disabled'} via config`);
            } else if (
                typeof configValue === 'object' &&
                configValue !== null &&
                !Array.isArray(configValue) &&
                Object.prototype.toString.call(configValue) === '[object Object]'
            ) {
                registration.options.config = Object.assign(
                    {},
                    registration.options.config,
                    configValue
                );
                logger.debug(`Plugin '${pluginId}' config updated via config`);
            }
        }
    }

    private applyPluginOptions(pluginOptions: Record<string, PluginOptions>): void {
        for (const [pluginId, options] of Object.entries(pluginOptions)) {
            const registration = this.plugins.get(pluginId);

            if (!registration) {
                logger.debug(`Options provided for unknown plugin '${pluginId}' - ignoring`);
                continue;
            }

            // Merge options
            registration.options = {
                ...registration.options,
                ...options,
                config: {
                    ...registration.options.config,
                    ...options.config
                }
            };

            // Update enabled state if specified
            if (typeof options.enabled === 'boolean') {
                registration.enabled = options.enabled;
            }
        }
    }

    private validatePlugin(plugin: unknown): plugin is Plugin {
        // Use the type guard from types.ts
        if (!isPlugin(plugin)) {
            return false;
        }

        // Additional runtime validation
        const { id } = plugin.metadata;

        // Check for duplicate IDs
        if (this.plugins.has(id)) {
            logger.warn(`Duplicate plugin ID detected: ${id}`);
            return false;
        }

        // Validate hook signatures
        for (const hook of this.supportedHooks) {
            const hookFn = ((plugin as unknown) as Record<string, unknown>)[hook];            if (hookFn !== undefined && typeof hookFn !== 'function') {
                logger.warn(`Plugin '${id}': '${hook}' must be a function`);
                return false;
            }
        }

        return true;
    }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();