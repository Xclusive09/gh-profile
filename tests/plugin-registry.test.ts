import { describe, test, expect, beforeEach } from 'vitest';
import { PluginRegistry } from '../src/plugins/registry.js';
import type { Plugin, PluginMetadata } from '../src/plugins/types.js';

// Helper to create valid plugin metadata
const validMetadata = (id: string): PluginMetadata => ({
    id,
    name: `Test Plugin ${id}`,
    description: 'Test plugin',
    version: '1.0.0',
    author: 'Test Author',
    // homepage is optional
});

describe('PluginRegistry', () => {
    let registry: PluginRegistry;

    const createPlugin = (id: string, partial: Partial<Plugin> = {}): Plugin => ({
        metadata: validMetadata(id),
        render: (content: string) => content, // Always include a no-op render hook
        ...partial
    });

    beforeEach(() => {
        registry = new PluginRegistry();
    });

    test('registers valid plugins', () => {
        const plugin = createPlugin('test');
        registry.register(plugin);
        expect(registry.getPlugin('test')).toBe(plugin);
    });

    test('plugins are enabled by default', () => {
        const plugin = createPlugin('test');
        registry.register(plugin);
        expect(registry.isEnabled('test')).toBe(true);
    });

    test('rejects plugins with duplicate IDs', () => {
        const plugin1 = createPlugin('test');
        const plugin2 = createPlugin('test');

        registry.register(plugin1);
        registry.register(plugin2);

        expect(registry.getPlugin('test')).toBe(plugin1);
    });

    test('validates required metadata fields', () => {
        const invalidMetadata: PluginMetadata = {
            id: 'test',
            name: 'Test',
            description: 'Test',
            version: '1.0.0'
        } as unknown as never;

        const plugin = { metadata: invalidMetadata };
        registry.register(plugin as Plugin);

        expect(registry.getPlugin('test')).toBeUndefined();
    });

    test('validates hook types', () => {
        const invalidPlugin = createPlugin('test', {
            init: 'not a function' as unknown as never,
        });

        registry.register(invalidPlugin);
        expect(registry.getPlugin('test')).toBeUndefined();
    });

    test('enable/disable plugins', () => {
        const plugin = createPlugin('test');
        registry.register(plugin);

        registry.disablePlugin('test');
        expect(registry.isEnabled('test')).toBe(false);

        registry.enablePlugin('test');
        expect(registry.isEnabled('test')).toBe(true);
    });

    test('getEnabledPlugins returns only enabled plugins', () => {
        const plugin1 = createPlugin('test1');
        const plugin2 = createPlugin('test2');

        registry.register(plugin1);
        registry.register(plugin2);
        registry.disablePlugin('test2');

        const enabled = registry.getEnabledPlugins();
        expect(enabled).toHaveLength(1);
        expect(enabled[0].metadata.id).toBe('test1');
    });

    test('reset clears all plugins and state', () => {
        const plugin = createPlugin('test');
        registry.register(plugin);
        registry.reset();

        expect(registry.getPlugin('test')).toBeUndefined();
        expect(registry.getAllPlugins()).toHaveLength(0);
    });
});