
import { logger } from '../cli/logger.js';
import { pluginRegistry } from './registry.js';
import type { Plugin, PluginContext, PluginError } from './types.js';
import type { NormalizedData } from '../core/normalize.js';

/**
 * Runs plugins in a specific lifecycle phase
 */
export class PluginRunner {
    /**
     * Run beforeRender hooks for all enabled plugins
     */
    async runBeforeRender(data: NormalizedData): Promise<NormalizedData> {
        const plugins = pluginRegistry.getEnabledPlugins();
        let currentData = { ...data };

        for (const plugin of plugins) {
            if (plugin.beforeRender) {
                try {
                    const context: PluginContext = {
                        data: currentData,
                        content: '',
                        config: {},
                    };

                    await plugin.beforeRender(context);
                    currentData = context.data;
                } catch (error) {
                    this.handleError(error, plugin, 'beforeRender');
                }
            }
        }

        return currentData;
    }

    /**
     * Run render hooks for all enabled plugins
     */
    async runRender(data: NormalizedData, content: string): Promise<string> {
        const plugins = pluginRegistry.getEnabledPlugins();
        let currentContent = content;

        for (const plugin of plugins) {
            if (plugin.render) {
                try {
                    const context: PluginContext = {
                        data,
                        content: currentContent,
                        config: {},
                    };

                    const result = await plugin.render(content, data);
                    if (result) {
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
     */
    async runAfterRender(data: NormalizedData, content: string): Promise<string> {
        const plugins = pluginRegistry.getEnabledPlugins();
        let currentContent = content;

        for (const plugin of plugins) {
            if (plugin.afterRender) {
                try {
                    const context: PluginContext = {
                        data,
                        content: currentContent,
                        config: {},
                    };

                    await plugin.afterRender(context);
                    currentContent = context.content;
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