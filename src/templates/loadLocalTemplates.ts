import { join, resolve } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import type { Template, TemplateMetadata, LocalTemplateFiles } from './types.js';
import { logger } from '../cli/logger.js';

export async function loadLocalTemplates(templatesPath: string): Promise<Template[]> {
    const templates: Template[] = [];
    const absolutePath = resolve(process.cwd(), templatesPath);

    if (!existsSync(absolutePath)) {
        logger.warn(`Templates directory not found: ${templatesPath}`);
        return templates;
    }

    try {
        const entries = readdirSync(absolutePath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const templateDir = join(absolutePath, entry.name);
                const template = await loadTemplate(templateDir);
                if (template) {
                    templates.push(template);
                }
            }
        }
    } catch (error) {
        logger.error(`Failed to read templates directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return templates;
}

async function loadTemplate(templateDir: string): Promise<Template | null> {
    const files = findTemplateFiles(templateDir);
    if (!files) {
        logger.warn(`Invalid template structure in ${templateDir}: missing required files`);
        return null;
    }

    try {
        const meta = validateMetadata(files.metaPath);
        if (!meta) return null;

        const module = await import(files.indexPath);
        if (!module?.default || typeof module.default !== 'function') {
            logger.warn(`Invalid template in ${templateDir}: missing default export function`);
            return null;
        }

        return {
            metadata: {
                ...meta,
                source: 'local',
                path: templateDir
            },
            render: module.default
        };
    } catch (error) {
        logger.warn(`Failed to load template from ${templateDir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
}

function findTemplateFiles(templateDir: string): LocalTemplateFiles | null {
    const metaPath = join(templateDir, 'meta.json');
    const indexPath = join(templateDir, 'index.ts');

    if (!existsSync(metaPath) || !existsSync(indexPath)) {
        return null;
    }

    return { metaPath, indexPath };
}

function validateMetadata(metaPath: string): TemplateMetadata | null {
    try {
        const content = readFileSync(metaPath, 'utf-8');
        const meta = JSON.parse(content) as TemplateMetadata;

        // Validate required fields
        const required = ['id', 'name', 'description', 'category', 'version'];
        const missing = required.filter(field => !(field in meta));

        if (missing.length > 0) {
            logger.warn(`Invalid template metadata in ${metaPath}: missing required fields: ${missing.join(', ')}`);
            return null;
        }

        return meta;
    } catch (error) {
        logger.warn(`Failed to parse metadata from ${metaPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
}