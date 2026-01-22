import type { Template, TemplateMetadata, TemplateCategory } from './types.js';

export class TemplateRegistry {
    public templates: Template[] = [];
    public initialized = false;

    public async loadBuiltInTemplates(): Promise<Template[]> {
        // Implementation will be added later
        return [];
    }

    public async loadLocalTemplates(): Promise<Template[]> {
        // Implementation will be added later
        return [];
    }

    public async initializeRegistry(): Promise<void> {
        if (this.initialized) {
            return;
        }

        const [builtIn, local] = await Promise.all([
            this.loadBuiltInTemplates(),
            this.loadLocalTemplates()
        ]);

        // Validate and sort built-in templates
        const sortedBuiltIn = this.validateAndSort(builtIn);

        // Validate and sort local templates
        const sortedLocal = this.validateAndSort(local);

        // Check for duplicate IDs across all templates
        const allTemplates = [...sortedBuiltIn, ...sortedLocal];
        this.validateNoDuplicates(allTemplates);

        this.templates = allTemplates;
        this.initialized = true;
    }

    public validateAndSort(templates: Template[]): Template[] {
        // Validate each template
        templates.forEach(this.validateTemplate);

        // Sort alphabetically by ID
        return [...templates].sort((a, b) =>
            a.metadata.id.localeCompare(b.metadata.id)
        );
    }

    public validateTemplate(template: Template): void {
        const validCategories: TemplateCategory[] = ['developer', 'designer', 'founder', 'generic'];

        if (!validCategories.includes(template.metadata.category)) {
            throw new Error(`Invalid category '${template.metadata.category}' in template '${template.metadata.id}'`);
        }
    }

    public validateNoDuplicates(templates: Template[]): void {
        const ids = new Set<string>();

        templates.forEach(template => {
            if (ids.has(template.metadata.id)) {
                throw new Error(`Duplicate template ID: ${template.metadata.id}`);
            }
            ids.add(template.metadata.id);
        });
    }

    public getAllTemplates(): Template[] {
        return [...this.templates];
    }

    public getTemplatesByCategory(category: TemplateCategory): Template[] {
        return this.templates.filter(t => t.metadata.category === category);
    }
}

export const registry = new TemplateRegistry();
export const {
    getAllTemplates,
    getTemplatesByCategory,
    initializeRegistry,
    loadBuiltInTemplates,
    loadLocalTemplates
} = registry;