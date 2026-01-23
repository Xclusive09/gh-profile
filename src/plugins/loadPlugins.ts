
import { resolve, join } from 'node:path';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { logger } from '../cli/logger.js';
import { pluginRegistry } from './registry.js';
import type { Plugin } from './types.js';

const PLUGINS_DIR = 'plugins';

/**
 * Load built-in plugins
 */
export async function loadBuiltInPlugins(): Promise<void> {
    // No built-in plugins yet
    // Will be implemented when we add the first built-in plugin
}

/**
 * Load local plugins from the filesystem
 */
export async function loadLocalPlugins(customPath?: string): Promise<void> {
    const pluginsPath = customPath || resolve(process.cwd(), PLUGINS_DIR);

    if (!existsSync(pluginsPath)) {
        logger.debug(`No plugins directory found at ${pluginsPath}`);
        return;
    }

    try {
        const entries = await readdir(pluginsPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const pluginDir = join(pluginsPath, entry.name);
                await loadLocalPlugin(pluginDir);
            }
        }
    } catch (error) {
        logger.warn(
            `Failed to load plugins from ${pluginsPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Load a single local plugin
 */
async function loadLocalPlugin(pluginDir: string): Promise<void> {
    try {
        const pluginModule = await import(pluginDir);
        const plugin = pluginModule.default as Plugin;

        if (!plugin) {
            logger.warn(`No default export found in plugin at ${pluginDir}`);
            return;
        }

        pluginRegistry.register(plugin);
        logger.debug(`Loaded plugin: ${plugin.metadata.id}`);
    } catch (error) {
        logger.warn(
            `Failed to load plugin from ${pluginDir}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Initialize plugin system
 */
export async function initializePlugins(): Promise<void> {
    await loadBuiltInPlugins();
    await loadLocalPlugins();
    await pluginRegistry.initialize();
}