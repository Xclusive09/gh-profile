import type { Template, TemplateMetadata, TemplateFunction, TemplateRegistryEntry } from './types.js';
import { minimalTemplate } from './minimal.js';
import { showcaseTemplate } from './showcase.js';

/**
 * Central registry for all templates
 */
class TemplateRegistry {
    private templates: Map<string, TemplateRegistryEntry> = new Map();

    constructor() {
        this.registerBuiltInTemplates();
    }

    /**
     * Register built-in templates
     */
    private registerBuiltInTemplates(): void {
        this.register(minimalTemplate
            , true);
        this.register(showcaseTemplate, true);

    }

    /**
     * Register a template
     */
    register(template: Template, builtIn: boolean = false): void {
        const { id } = template.metadata;

        if (this.templates.has(id)) {
            throw new Error(`Template with id '${id}' is already registered`);
        }

        this.templates.set(id, { template, builtIn });
    }

    /**
     * Get a template by id
     */
    get(id: string): Template | undefined {
        return this.templates.get(id)?.template;
    }

    /**
     * Get all registered templates
     */
    getAll(): Template[] {
        return Array.from(this.templates.values()).map(entry => entry.template);
    }

    /**
     * Get built-in templates only
     */
    getBuiltIn(): Template[] {
        return Array.from(this.templates.values())
            .filter(entry => entry.builtIn)
            .map(entry => entry.template);
    }

    /**
     * Get templates by category
     */
    getByCategory(category: string): Template[] {
        return this.getAll().filter(t => t.metadata.category === category);
    }

    /**
     * Check if a template exists
     */
    has(id: string): boolean {
        return this.templates.has(id);
    }

    /**
     * List all template metadata (for CLI display)
     */
    listMetadata(): TemplateMetadata[] {
        return this.getAll().map(t => t.metadata);
    }
}

// Export singleton instance
export const templateRegistry = new TemplateRegistry();

// Export types for external use
export type { Template, TemplateMetadata, TemplateFunction, TemplateRegistryEntry };

// Export convenience function
export function getTemplate(id: string): Template | undefined {
    return templateRegistry.get(id);
}

export function getAllTemplates(): Template[] {
    return templateRegistry.getAll();
}