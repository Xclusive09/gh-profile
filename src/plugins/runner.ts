import { logger } from '../cli/logger.js';
import { pluginRegistry } from './registry.js';
import type { Plugin, PluginContext } from './types.js';
import type { NormalizedData } from '../core/normalize.js';
import { normalizedDataCache } from '../core/normalize.js';
import { cloneDeep } from 'lodash-es';

/**
 * Runs plugins in a specific lifecycle phase in deterministic order.
 * Each plugin receives its own context/data to prevent side effects.
 * All hooks require pluginRegistry to be initialized first.
 */
export class PluginRunner {
    /**
     * Run beforeRender hooks for all enabled plugins
     * Accepts raw GitHubData and caches normalization/aggregation.
     */
    async runBeforeRenderRaw(rawData: import('../github/types.js').GitHubData): Promise<NormalizedData> {
        const data = normalizedDataCache.get(rawData);
        return this.runBeforeRender(data);
    }

    /**
     * Run beforeRender hooks for all enabled plugins
     * Each plugin receives a deep copy of the data to prevent mutation.
     */
    async runBeforeRender(data: NormalizedData): Promise<NormalizedData> {
        if (!pluginRegistry.isInitialized()) {
            throw new Error('PluginRegistry must be initialized before running plugin hooks.');
        }
        const plugins = pluginRegistry.getEnabledPlugins();
        let currentData = data;

        for (const plugin of plugins) {
            if (plugin.beforeRender) {
                try {
                    // Deep copy to prevent mutation
                    const context: PluginContext = {
                        data: cloneDeep(currentData),
                        content: '',
                        config: {},
                    };
                    await plugin.beforeRender(context);
                    // Only allow plugin to return a new data object, not mutate shared state
                    if (context.data && typeof context.data === 'object') {
                        currentData = context.data;
                    }
                } catch (error) {
                    this.handleError(error, plugin, 'beforeRender');
                }
            }
        }
        return currentData;
    }

    /**
     * Run render hooks for all enabled plugins
     * Accepts raw GitHubData and caches normalization/aggregation.
     */
    async runRenderRaw(rawData: import('../github/types.js').GitHubData, content: string): Promise<string> {
        const data = normalizedDataCache.get(rawData);
        return this.runRender(data, content);
    }

    /**
     * Run render hooks for all enabled plugins
     * Each plugin receives a deep copy of the data to prevent mutation.
     */
    async runRender(data: NormalizedData, content: string): Promise<string> {
        if (!pluginRegistry.isInitialized()) {
            throw new Error('PluginRegistry must be initialized before running plugin hooks.');
        }
        const plugins = pluginRegistry.getEnabledPlugins();
        let currentContent = content;

        for (const plugin of plugins) {
            if (plugin.render) {
                try {
                    // Deep copy to prevent mutation
                    const pluginData = cloneDeep(data);
                    const result = await plugin.render(currentContent, pluginData);
                    if (typeof result === 'string') {
                        currentContent = result;
                    }
                } catch (error) {
                    this.handleError(error, plugin, 'render');
                }
            }
        }
        return currentContent;
    }
    /**
     * Run afterRender hooks for all enabled plugins
     * Accepts raw GitHubData and caches normalization/aggregation.
     */
    async runAfterRenderRaw(rawData: import('../github/types.js').GitHubData, content: string): Promise<string> {
        const data = normalizedDataCache.get(rawData);
        return this.runAfterRender(data, content);
    }

    /**
     * Run afterRender hooks for all enabled plugins
     * Each plugin receives a deep copy of the data to prevent mutation.
     */
    async runAfterRender(data: NormalizedData, content: string): Promise<string> {
        if (!pluginRegistry.isInitialized()) {
            throw new Error('PluginRegistry must be initialized before running plugin hooks.');
        }
        const plugins = pluginRegistry.getEnabledPlugins();
        let currentContent = content;

        for (const plugin of plugins) {
            if (plugin.afterRender) {
                try {
                    // Deep copy to prevent mutation
                    const pluginData = cloneDeep(data);
                    const result = await plugin.afterRender(currentContent, pluginData);
                    if (typeof result === 'string') {
                        currentContent = result;
                    }
                } catch (error) {
                    this.handleError(error, plugin, 'afterRender');
                }
            }
        }
        return currentContent;
    }

    private handleError(error: unknown, plugin: Plugin, phase: string): void {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.warn(`Plugin '${plugin.metadata.id}' failed during ${phase}: ${message}`);
    }
}

export const pluginRunner = new PluginRunner();