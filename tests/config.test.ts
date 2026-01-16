import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { loadConfig } from '../src/config/loadConfig.js';

const TEST_CONFIG = 'test-gh-profile.config.json';

describe('Config', () => {
    const configPath = resolve(process.cwd(), TEST_CONFIG);

    beforeEach(async () => {
        // Cleanup any existing test config
        if (existsSync(configPath)) {
            await unlink(configPath);
        }
    });

    afterEach(async () => {
        // Cleanup after tests
        if (existsSync(configPath)) {
            await unlink(configPath);
        }
    });

    it('returns empty object when no config exists', async () => {
        const config = await loadConfig();
        expect(config).toEqual({});
    });

    it('loads valid config file', async () => {
        const testConfig = {
            template: 'showcase',
            output: 'custom.md',
            token: 'test-token',
            force: true
        };

        await writeFile(configPath, JSON.stringify(testConfig));
        const config = await loadConfig({ configPath: TEST_CONFIG });
        expect(config).toEqual(testConfig);
    });

    it('throws on invalid JSON', async () => {
        await writeFile(configPath, 'invalid json');
        await expect(loadConfig({ configPath: TEST_CONFIG })).rejects.toThrow();
    });

    it('throws on invalid config properties', async () => {
        const invalidConfig = {
            invalid: 'property',
            template: 'showcase'
        };

        await writeFile(configPath, JSON.stringify(invalidConfig));
        await expect(loadConfig({ configPath: TEST_CONFIG })).rejects.toThrow();
    });
});