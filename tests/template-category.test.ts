import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { createTemplatesCommand } from '../src/cli/commands/templates.js';
import { templateRegistry } from '../src/templates/index.js';
import type { TemplateMetadata } from '../src/templates/types.js';

const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

// Mock logger
vi.mock('../src/cli/logger.js', () => ({
    logger: {
        error: vi.fn(),
        info: vi.fn(),
        header: vi.fn(),
        dim: vi.fn(),
        newline: vi.fn(),
    }
}));

// Mock template registry
vi.mock('../src/templates/index.js', () => ({
    templateRegistry: {
        listMetadata: vi.fn(),
    }
}));

describe('Template Category Filtering', () => {
    const mockTemplates: TemplateMetadata[] = [
        {
            id: 'dev1',
            name: 'Developer 1',
            description: 'A developer template',
            category: 'developer',
            version: '1.0.0'
        },
        {
            id: 'des1',
            name: 'Designer 1',
            description: 'A designer template',
            category: 'designer',
            version: '1.0.0'
        },
        {
            id: 'gen1',
            name: 'Generic 1',
            description: 'A generic template',
            category: 'generic',
            version: '1.0.0'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(templateRegistry.listMetadata).mockReturnValue(mockTemplates);
    });

    it('should list all templates when no category is specified', async () => {
        const command = createTemplatesCommand();
        await command.parseAsync(['node', 'test']);

        expect(templateRegistry.listMetadata).toHaveBeenCalled();
    });

    it('should filter templates by valid category', async () => {
        const command = createTemplatesCommand();
        await command.parseAsync(['node', 'test', '--category', 'developer']);

        const logger = await import('../src/cli/logger.js');
        expect(logger.logger.header).toHaveBeenCalledWith('Templates (developer)');
    });

    it('should handle invalid categories gracefully', async () => {
        const command = createTemplatesCommand();
        await command.parseAsync(['node', 'test', '--category', 'invalid']);

        const logger = await import('../src/cli/logger.js');
        expect(logger.logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Invalid category')
        );
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle empty results gracefully', async () => {
        vi.mocked(templateRegistry.listMetadata).mockReturnValue([]);
        const command = createTemplatesCommand();
        await command.parseAsync(['node', 'test', '--category', 'founder']);

        const logger = await import('../src/cli/logger.js');
        expect(logger.logger.info).toHaveBeenCalledWith(
            expect.stringContaining('No templates found')
        );
    });

    afterAll(() => {
        mockExit.mockRestore();
    });
});