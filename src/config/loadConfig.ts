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

        // Validate config structure
        if (typeof config !== 'object' || config === null) {
            throw new Error('Config must be an object');
        }

        // Only allow known properties
        const allowedKeys = ['template', 'output', 'token', 'force'];
        const invalidKeys = Object.keys(config).filter(key => !allowedKeys.includes(key));

        if (invalidKeys.length > 0) {
            throw new Error(`Invalid config properties: ${invalidKeys.join(', ')}`);
        }

        return config;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load config: ${error.message}`);
        }
        throw error;
    }
}