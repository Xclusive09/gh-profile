import { describe, test, expect, beforeEach, vi } from 'vitest';
import { pluginRegistry } from '../src/plugins/registry.js';
import { pluginRunner } from '../src/plugins/runner.js';
import type { Plugin, NormalizedData } from '../src/plugins/types.js';

// Minimal realistic mock that should satisfy most NormalizedData shapes
const mockData: NormalizedData = {
    profile: {
        username: 'Test User',
        name: 'Test User',
        bio: 'Test bio',
        avatarUrl: 'https://example.com/avatar.png',
        profileUrl: 'https://github.com/testuser',
        company: null,
        location: null,
        blog: null,
        twitter: null,
        email: null,
        followers: 42,
        following: 13,
        publicRepos: 8,
        createdAt: new Date('2020-01-01'),
    },
    repos: [],
    stats: {
        totalStars: 0,
        totalForks: 0,
        totalRepos: 0,
        languages: [],
        topRepos: [],
        recentRepos: [],
    },
    languages: [],
    contributions: {
        total: 0,
        calendar: {},
    },
};

describe('Plugin Lifecycle', () => {
    beforeEach(() => {
        pluginRegistry.reset();
    });

    test('lifecycle hooks execute in correct order', async () => {
        const order: string[] = [];

        const plugin: Plugin = {
            metadata: {
                id: 'test',
                name: 'Test Plugin',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            init: async () => {
                order.push('init');
            },
            beforeRender: async () => {
                order.push('beforeRender');
            },
            render: async (content) => {
                order.push('render');
                return content;
            },
            afterRender: async () => {
                order.push('afterRender');
            },
        };

        pluginRegistry.register(plugin);
        await pluginRegistry.initialize();

        const content = '# Test';
        await pluginRunner.runBeforeRender(mockData);
        const rendered = await pluginRunner.runRender(mockData, content);
        await pluginRunner.runAfterRender(mockData, rendered);

        expect(order).toEqual(['init', 'beforeRender', 'render', 'afterRender']);
    });

    test('disabled plugins are not executed', async () => {
        const mock = vi.fn();

        const plugin: Plugin = {
            metadata: {
                id: 'test',
                name: 'Test Plugin',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            render: mock,
        };

        pluginRegistry.register(plugin);
        pluginRegistry.disablePlugin('test');
        await pluginRegistry.initialize();

        await pluginRunner.runRender(mockData, '# Test');
        expect(mock).not.toHaveBeenCalled();
    });

    test('plugin modifications are cumulative', async () => {
        const plugin1: Plugin = {
            metadata: {
                id: 'test1',
                name: 'Test Plugin 1',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            render: async (content) => content + '\nPlugin 1',
        };

        const plugin2: Plugin = {
            metadata: {
                id: 'test2',
                name: 'Test Plugin 2',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            render: async (content) => content + '\nPlugin 2',
        };

        pluginRegistry.register(plugin1);
        pluginRegistry.register(plugin2);
        await pluginRegistry.initialize();

        const result = await pluginRunner.runRender(mockData, '# Test');
        expect(result).toBe('# Test\nPlugin 1\nPlugin 2');
    });

    test('failing plugin does not affect others', async () => {
        const goodPlugin: Plugin = {
            metadata: {
                id: 'good',
                name: 'Good Plugin',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            render: async (content) => content + '\nGood Plugin',
        };

        const badPlugin: Plugin = {
            metadata: {
                id: 'bad',
                name: 'Bad Plugin',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            render: async () => {
                throw new Error('Plugin failed');
            },
        };

        pluginRegistry.register(goodPlugin);
        pluginRegistry.register(badPlugin);
        await pluginRegistry.initialize();

        const result = await pluginRunner.runRender(mockData, '# Test');
        expect(result).toBe('# Test\nGood Plugin');
    });

    test('plugin config is passed correctly', async () => {
        const configSpy = vi.fn();

        const plugin: Plugin = {
            metadata: {
                id: 'test',
                name: 'Test Plugin',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            init: configSpy,
        };

        const config = { test: { enabled: true, config: { key: 'value' } } };

        pluginRegistry.register(plugin);
        await pluginRegistry.initialize(config);

        expect(configSpy).toHaveBeenCalledWith(config.test);
    });

    test('snapshot: complex plugin output', async () => {
        const complexPlugin: Plugin = {
            metadata: {
                id: 'complex',
                name: 'Complex Plugin',
                description: 'Test plugin',
                version: '1.0.0',
                author: 'Test Author',
            },
            render: async (content, data) => {
                return `${content}\n## Generated by ${data.profile.name}\n\n* Item 1\n* Item 2`;
            },
        };

        pluginRegistry.register(complexPlugin);
        await pluginRegistry.initialize();

        const result = await pluginRunner.runRender(mockData, '# Test Title');
        expect(result).toMatchSnapshot();
    });
});