import { Command } from 'commander';
import { templateRegistry } from '../../templates/index.js';
import { logger } from '../logger.js';
import type { TemplateCategory } from '../../templates/types.js';

const VALID_CATEGORIES: TemplateCategory[] = ['developer', 'designer', 'founder', 'generic'];

export function createTemplatesCommand() {
    return new Command('templates')
        .description('List available templates')
        .option('-c, --category <category>', 'filter by category')
        .action((options) => {
            const { category } = options;

            // Validate category if provided
            if (category && !VALID_CATEGORIES.includes(category as TemplateCategory)) {
                logger.error(
                    `Invalid category: "${category}"\nValid categories: ${VALID_CATEGORIES.join(', ')}`
                );
                process.exit(1);
            }

            // Get templates, optionally filtered by category
            const templates = templateRegistry.listMetadata()
                .filter(t => !category || t.category === category);

            // Handle no results
            if (templates.length === 0) {
                if (category) {
                    logger.info(`No templates found for category: ${category}`);
                } else {
                    logger.info('No templates available');
                }
                return;
            }

            // Display results
            logger.header(category
                ? `Templates (${category})`
                : 'All Templates'
            );
            logger.newline();

            templates.forEach(t => {
                logger.info(`${t.name} (${t.id})`);
                logger.dim(`  Category: ${t.category}`);
                logger.dim(`  ${t.description}`);
                logger.newline();
            });
        });
}