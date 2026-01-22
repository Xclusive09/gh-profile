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
    }
};

export async function loadConfig(options: LoadConfigOptions = {}): Promise<Config> {
    const configPath = options.configPath || DEFAULT_CONFIG_NAME;
    const resolvedPath = resolve(process.cwd(), configPath);

    if (!existsSync(resolvedPath)) {
        return DEFAULT_CONFIG;
    }

    try {
        const configContent = await readFile(resolvedPath, 'utf-8');
        const config = JSON.parse(configContent);

        if (typeof config !== 'object' || config === null) {
            throw new Error('Config must be an object');
        }

        // Allowed top-level keys
        const allowedTopLevel = ['template', 'output', 'templatesPath', 'github', 'customize'];
        const invalidTop = Object.keys(config).filter(k => !allowedTopLevel.includes(k));

        if (invalidTop.length > 0) {
            throw new Error(`Invalid config properties: ${invalidTop.join(', ')}`);
        }

        // Validate and merge with defaults
        return {
            ...DEFAULT_CONFIG,
            ...config,
            github: {
                ...DEFAULT_CONFIG.github,
                ...(config.github || {})
            },
            customize: {
                ...DEFAULT_CONFIG.customize,
                ...(config.customize || {})
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config: ${error.message}`);
        }
        throw error;
    }
}