import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Template, TemplateMetadata, TemplateCategory } from '../src/templates/types.js';
import type { NormalizedData } from '../src/core/normalize.js';

import { TemplateRegistry } from '../src/templates/registry.js';

function createMockTemplate(
    overrides: Partial<TemplateMetadata> = {},
): Template {
    return {
        metadata: {
            id: 'mock-template',
            name: 'Mock Template',
            description: 'A mock template for testing',
            category: 'generic' as TemplateCategory,
            version: '1.0.0',
            ...overrides,
        },
        render: (data: NormalizedData) => `# ${data.profile.name ?? 'User'}`,
    };
}

describe('Template Registry', () => {
    let registry: TemplateRegistry;

    beforeEach(() => {
        registry = new TemplateRegistry();
    });

    describe('Loading Order', () => {
        it('loads built-in templates before local templates', async () => {
            const builtInTemplate = createMockTemplate({
                id: 'built-in',
                category: 'developer' as TemplateCategory,
            });

            const localTemplate = createMockTemplate({
                id: 'local',
                category: 'generic' as TemplateCategory,
            });

            vi.spyOn(registry, 'loadBuiltInTemplates').mockResolvedValue([builtInTemplate]);
            vi.spyOn(registry, 'loadLocalTemplates').mockResolvedValue([localTemplate]);

            await registry.initializeRegistry();

            const templates = registry.getAllTemplates();

            expect(templates[0].metadata.id).toBe('built-in');
            expect(templates[1].metadata.id).toBe('local');
        });

        it('preserves alphabetical order within each source group', async () => {
            const builtInTemplates = [
                createMockTemplate({ id: 'zebra', source: 'built-in' }),
                createMockTemplate({ id: 'alpha', source: 'built-in' }),
            ];

            const localTemplates = [
                createMockTemplate({ id: 'yankee', source: 'local' }),
                createMockTemplate({ id: 'bravo', source: 'local' }),
            ];

            vi.spyOn(registry, 'loadBuiltInTemplates').mockResolvedValue(builtInTemplates);
            vi.spyOn(registry, 'loadLocalTemplates').mockResolvedValue(localTemplates);

            await registry.initializeRegistry();

            const templates = registry.getAllTemplates();

            expect(templates[0].metadata.id).toBe('alpha');
            expect(templates[1].metadata.id).toBe('zebra');
            expect(templates[2].metadata.id).toBe('bravo');
            expect(templates[3].metadata.id).toBe('yankee');
        });
    });

    describe('Category Filtering', () => {
        it('filters templates by category', async () => {
            const templates = [
                createMockTemplate({ id: 'dev1', category: 'developer' as TemplateCategory }),
                createMockTemplate({ id: 'des1', category: 'designer' as TemplateCategory }),
                createMockTemplate({ id: 'dev2', category: 'developer' as TemplateCategory }),
                createMockTemplate({ id: 'fou1', category: 'founder' as TemplateCategory }),
            ];

            vi.spyOn(registry, 'loadBuiltInTemplates').mockResolvedValue(templates);
            vi.spyOn(registry, 'loadLocalTemplates').mockResolvedValue([]);

            await registry.initializeRegistry();

            const devTemplates = registry.getTemplatesByCategory('developer');

            expect(devTemplates).toHaveLength(2);
            expect(devTemplates.every(t => t.metadata.category === 'developer')).toBe(true);
        });

        it('returns empty array for non-existent category', async () => {
            const templates = [
                createMockTemplate({ id: 'dev1', category: 'developer' as TemplateCategory }),
                createMockTemplate({ id: 'des1', category: 'designer' as TemplateCategory }),
            ];

            vi.spyOn(registry, 'loadBuiltInTemplates').mockResolvedValue(templates);
            vi.spyOn(registry, 'loadLocalTemplates').mockResolvedValue([]);

            await registry.initializeRegistry();

            const result = registry.getTemplatesByCategory('non-existent' as TemplateCategory);

            expect(result).toHaveLength(0);
        });
    });

    describe('Template Validation', () => {
        it('rejects templates with duplicate IDs', async () => {
            const templates = [
                createMockTemplate({ id: 'duplicate' }),
                createMockTemplate({ id: 'duplicate' }),
            ];

            vi.spyOn(registry, 'loadBuiltInTemplates').mockResolvedValue(templates);
            vi.spyOn(registry, 'loadLocalTemplates').mockResolvedValue([]);

            await expect(registry.initializeRegistry()).rejects.toThrow(
                /Duplicate template ID/i,
            );
        });

        it('rejects templates with invalid categories', async () => {
            const invalidCategory = 'invalid-category' as unknown as TemplateCategory;

            const template = createMockTemplate({ category: invalidCategory });

            vi.spyOn(registry, 'loadBuiltInTemplates').mockResolvedValue([template]);
            vi.spyOn(registry, 'loadLocalTemplates').mockResolvedValue([]);

            await expect(registry.initializeRegistry()).rejects.toThrow(
                /Invalid category/i,
            );
        });
    });
});