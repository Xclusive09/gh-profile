import { resolve, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { logger } from '../cli/logger.js';
import { pluginRegistry } from './registry.js';
import type { Config } from '../config/types.js';

const BUILT_IN_PLUGINS_DIR = resolve(import.meta.dirname, 'built-in');
const LOCAL_PLUGINS_DIR = 'plugins';

/**
 * Load all plugins (built-in and local)
 */
export async function loadPlugins(config?: Config): Promise<void> {
    logger.debug('Loading plugins...');

    try {
        // Load built-in plugins first
        await loadBuiltInPlugins();

        // Load local plugins from config path or default
        // Remove config.paths.plugins usage, fallback to LOCAL_PLUGINS_DIR
        const pluginsPath = resolve(process.cwd(), LOCAL_PLUGINS_DIR);
        await loadLocalPlugins(pluginsPath);

        // Remove config.pluginOptions usage, fallback to empty object
        const pluginOptions = {};
        await pluginRegistry.initialize(pluginOptions, config);

        const pluginCount = pluginRegistry.getAllPlugins().length;
        const enabledCount = pluginRegistry.getEnabledPlugins().length;

        logger.info(`Plugins loaded: ${enabledCount}/${pluginCount} enabled`);
    } catch (error) {
        logger.error('Failed to load plugins: ' + (error instanceof Error ? error.message : 'Unknown error'));
        throw error;
    }
}

/**
 * Load built-in plugins
 */
async function loadBuiltInPlugins(): Promise<void> {
    if (!existsSync(BUILT_IN_PLUGINS_DIR)) {
        logger.debug('No built-in plugins directory found');
        return;
    }

    try {
        const entries = await readdir(BUILT_IN_PLUGINS_DIR, { withFileTypes: true });
        const pluginFiles = entries.filter(entry =>
            entry.isDirectory() ||
            (entry.isFile() && entry.name.endsWith('.js'))
        );

        for (const entry of pluginFiles) {
            const pluginPath = join(BUILT_IN_PLUGINS_DIR, entry.name);
            await loadPluginModule(pluginPath, 'built-in');
        }

        logger.debug(`Built-in plugins scanned from: ${BUILT_IN_PLUGINS_DIR}`);
    } catch (error) {
        logger.warn('Failed to load built-in plugins: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Load local plugins from the filesystem
 */
async function loadLocalPlugins(pluginsPath: string): Promise<void> {
    if (!existsSync(pluginsPath)) {
        logger.debug(`No plugins directory found at ${pluginsPath}`);
        return;
    }

    try {
        const entries = await readdir(pluginsPath, { withFileTypes: true });

        for (const entry of entries) {
            const pluginPath = join(pluginsPath, entry.name);

            if (entry.isDirectory()) {
                await loadPluginFromDirectory(pluginPath);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                await loadPluginModule(pluginPath, 'local');
            }
        }

        logger.debug(`Local plugins scanned from: ${pluginsPath}`);
    } catch (error) {
        logger.warn(`Failed to load plugins from ${pluginsPath}: ` + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Load a plugin from a directory
 */
async function loadPluginFromDirectory(pluginDir: string): Promise<void> {
    const packageJsonPath = join(pluginDir, 'package.json');
    const indexJsPath = join(pluginDir, 'index.js');

    try {
        // Try to load from package.json first
        if (existsSync(packageJsonPath)) {
            const pkgRaw = readFileSync(packageJsonPath, 'utf-8');
            const pkg = JSON.parse(pkgRaw);
            if (pkg.main) {
                const mainPath = join(pluginDir, pkg.main);
                await loadPluginModule(mainPath, 'local');
                return;
            }
        }

        // Fall back to index.js
        if (existsSync(indexJsPath)) {
            await loadPluginModule(indexJsPath, 'local');
            return;
        }

        logger.debug(`No plugin entry point found in ${pluginDir}`);
    } catch (error) {
        logger.warn(`Failed to load plugin from directory ${pluginDir}: ` + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Load a plugin module from a file
 */
async function loadPluginModule(modulePath: string, source: 'built-in' | 'local'): Promise<void> {
    try {
        // Use dynamic import with cache busting for development
        const module = await import(`${modulePath}?t=${Date.now()}`);
        const plugin = module.default || module.plugin || module;

        if (!plugin) {
            logger.warn(`No plugin export found in ${modulePath}`);
            return;
        }

        pluginRegistry.register(plugin);
        logger.debug(`Loaded ${source} plugin from: ${modulePath}`);
    } catch (error) {
        logger.warn(`Failed to load plugin module ${modulePath}: ` + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

/**
 * Initialize plugin system (legacy compatibility)
 */
export async function initializePlugins(): Promise<void> {
    await loadPlugins();
}

/**
 * Get plugin registry instance
 */
export function getPluginRegistry() {
    return pluginRegistry;
}

/**
 * Reset plugin system (for testing)
 */
export function resetPlugins(): void {
    pluginRegistry.reset();
}