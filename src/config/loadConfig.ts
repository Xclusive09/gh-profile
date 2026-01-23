import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import type { Config, LoadConfigOptions } from './types.js';

const DEFAULT_CONFIG_NAME = 'gh-profile.config.json';

const DEFAULT_CONFIG: Config = {
    template: 'minimal',
    output: './README.md',
    github: {
        includePrivate: false,
        excludeRepos: [],
        pinnedRepos: []
    },
    customize: {
        showLanguages: true,
        showStats: true,
        showSocial: true,
        sections: ['intro', 'projects', 'skills', 'stats']
    },
    // Default: empty object → all plugins enabled (fallback behavior)
    plugins: {}
};

export async function loadConfig(options: LoadConfigOptions = {}): Promise<Config> {
    const configPath = options.configPath || DEFAULT_CONFIG_NAME;
    const resolvedPath = resolve(process.cwd(), configPath);

    // No config file → return full defaults
    if (!existsSync(resolvedPath)) {
        return DEFAULT_CONFIG;
    }

    try {
        const configContent = await readFile(resolvedPath, 'utf-8');
        const parsed = JSON.parse(configContent);

        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Config must be an object');
        }

        // Enforce allowed top-level keys
        const allowedTopLevel = [
            'template',
            'output',
            'templatesPath',
            'github',
            'customize',
            'plugins'
        ];

        const invalidKeys = Object.keys(parsed).filter(key => !allowedTopLevel.includes(key));

        if (invalidKeys.length > 0) {
            throw new Error(`Invalid config properties: ${invalidKeys.join(', ')}`);
        }

        // Deep merge with defaults
        return {
            ...DEFAULT_CONFIG,
            ...parsed,
            github: {
                ...DEFAULT_CONFIG.github,
                ...(parsed.github ?? {})
            },
            customize: {
                ...DEFAULT_CONFIG.customize,
                ...(parsed.customize ?? {})
            },
            plugins: {
                ...DEFAULT_CONFIG.plugins,
                ...(parsed.plugins ?? {})
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config: ${error.message}`);
        }
        throw error;
    }
}