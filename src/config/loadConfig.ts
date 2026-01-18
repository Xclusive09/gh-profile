import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type { Config, LoadConfigOptions } from './types.js';

const DEFAULT_CONFIG_NAME = 'gh-profile.config.json';

export async function loadConfig(options: LoadConfigOptions = {}): Promise<Config> {
    const configPath = options.configPath || DEFAULT_CONFIG_NAME;
    const resolvedPath = resolve(process.cwd(), configPath);

    if (!existsSync(resolvedPath)) {
        return {};
    }

    try {
        const configContent = await readFile(resolvedPath, 'utf-8');
        const config = JSON.parse(configContent);

        if (typeof config !== 'object' || config === null) {
            throw new Error('Config must be an object');
        }

        // Allowed top-level keys (matches README)
        const allowedTopLevel = ['template', 'output', 'token', 'force', 'github', 'customize'];
        const invalidTop = Object.keys(config).filter(k => !allowedTopLevel.includes(k));

        if (invalidTop.length > 0) {
            throw new Error(`Invalid config properties: ${invalidTop.join(', ')}`);
        }

        // Optional: validate nested objects
        if (config.github && typeof config.github === 'object') {
            const allowedGithub = ['includePrivate', 'excludeRepos', 'pinnedRepos'];
            const invalid = Object.keys(config.github).filter(k => !allowedGithub.includes(k));
            if (invalid.length) {
                throw new Error(`Invalid github properties: ${invalid.join(', ')}`);
            }
        }

        if (config.customize && typeof config.customize === 'object') {
            const allowedCustomize = ['showLanguages', 'showStats', 'showSocial', 'sections'];
            const invalid = Object.keys(config.customize).filter(k => !allowedCustomize.includes(k));
            if (invalid.length) {
                throw new Error(`Invalid customize properties: ${invalid.join(', ')}`);
            }
        }

        return config as Config;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config: ${error.message}`);
        }
        throw error;
    }
}