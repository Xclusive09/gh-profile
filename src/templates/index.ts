import { join, resolve } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Template, TemplateMetadata, TemplateFunction, TemplateRegistryEntry, LocalTemplateFiles } from './types.js';
import { minimalTemplate } from './minimal.js';
import { showcaseTemplate } from './showcase.js';
import { statsHeavyTemplate } from './stats-heavy.js';
import { logger } from '../cli/logger.js';

/**
 * Central registry for all templates
 */
export class TemplateRegistry {
    private templates: Map<string, TemplateRegistryEntry> = new Map();
    private templatesDir: string = 'templates';

    constructor() {
        this.registerBuiltInTemplates();
        // Load local templates asynchronously (non-blocking)
        this.loadLocalTemplates().catch((err) => {
            logger.warn(`Failed to auto-load local templates: ${err instanceof Error ? err.message : 'unknown error'}`);
        });
    }

    private registerBuiltInTemplates(): void {
        this.register(minimalTemplate, true);
        this.register(showcaseTemplate, true);
        this.register(statsHeavyTemplate, true);
    }

    /**
     * Load templates from local filesystem (async)
     */
    public async loadLocalTemplates(customPath?: string): Promise<void> {
        const basePath = customPath || resolve(process.cwd(), this.templatesDir);

        if (!existsSync(basePath)) {
            logger.info(`No local templates directory found at ${basePath}`);
            return;
        }

        try {
            const entries = readdirSync(basePath, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const templateDir = join(basePath, entry.name);
                    await this.loadLocalTemplate(templateDir);
                }
            }
        } catch (error) {
            logger.warn(
                `Failed to load local templates from ${basePath}: ${error instanceof Error ? error.message : 'unknown error'}`
            );
        }
    }

    private async loadLocalTemplate(templateDir: string): Promise<void> {
        const files = this.findTemplateFiles(templateDir);
        if (!files) return;

        try {
            const metaContent = readFileSync(files.metaPath, 'utf-8');
            const meta = JSON.parse(metaContent) as TemplateMetadata;
            meta.source = 'local';
            meta.path = templateDir;

            const module = await import(files.indexPath);
            const template: Template = {
                metadata: meta,
                render: module.default as TemplateFunction,
            };

            this.register(template, false);
            logger.info(`Loaded local template: ${template.metadata.id}`);
        } catch (error) {
            logger.warn(
                `Failed to load template from ${templateDir}: ${error instanceof Error ? error.message : 'unknown error'}`
            );
        }
    }

    private findTemplateFiles(templateDir: string): LocalTemplateFiles | null {
        const metaPath = join(templateDir, 'meta.json');
        const indexPath = join(templateDir, 'index.ts');

        if (!existsSync(metaPath) || !existsSync(indexPath)) {
            return null;
        }

        return { metaPath, indexPath };
    }

    register(template: Template, builtIn: boolean = false): void {
        const { id } = template.metadata;

        if (this.templates.has(id)) {
            throw new Error(`Template with id '${id}' is already registered`);
        }

        this.templates.set(id, { template, builtIn });
    }

    get(id: string): Template | undefined {
        return this.templates.get(id)?.template;
    }

    getAll(): Template[] {
        return Array.from(this.templates.values()).map(entry => entry.template);
    }

    getBuiltIn(): Template[] {
        return Array.from(this.templates.values())
            .filter(entry => entry.builtIn)
            .map(entry => entry.template);
    }

    getLocal(): Template[] {
        return Array.from(this.templates.values())
            .filter(entry => !entry.builtIn)
            .map(entry => entry.template);
    }

    getByCategory(category: string): Template[] {
        return this.getAll().filter(t => t.metadata.category === category);
    }

    has(id: string): boolean {
        return this.templates.has(id);
    }

    listMetadata(): TemplateMetadata[] {
        return this.getAll().map(t => t.metadata);
    }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry();

// Export convenience functions
export function getTemplate(id: string): Template | undefined {
    return templateRegistry.get(id);
}

export function getAllTemplates(): Template[] {
    return templateRegistry.getAll();
}

export function getLocalTemplates(): Template[] {
    return templateRegistry.getLocal();
}