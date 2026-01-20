import { Command } from 'commander';
import chalk from 'chalk';
import { getAllTemplates } from '../../templates/index.js';
import type { Template } from '../../templates/types.js';

/**
 * Format template source badge
 */
function formatSource(template: Template): string {
    return template.metadata.source === 'built-in'
        ? chalk.blue('built-in')
        : chalk.green('local');
}

/**
 * Format category with color
 */
function formatCategory(category: string): string {
    const colors: Record<string, (str: string) => string> = {
        developer: chalk.yellow,
        designer: chalk.magenta,
        founder: chalk.cyan,
        generic: chalk.white,
    };

    const colorFn = colors[category.toLowerCase()] || chalk.white;
    return colorFn(category);
}

/**
 * Create the 'templates' command
 */
export function createTemplatesCommand(): Command {
    return new Command('templates')
        .description('List all available templates')
        .action(() => {
            const templates = getAllTemplates();
            

            if (templates.length === 0) {
                console.log(chalk.yellow('No templates found.'));
                return;
            }

            console.log(chalk.cyan('\nAvailable Templates:\n'));

            // Calculate max widths for clean table
            const nameWidth = Math.max(...templates.map(t => t.metadata.name.length), 'Name'.length);
            const catWidth = Math.max(...templates.map(t => t.metadata.category.length), 'Category'.length);
            const descWidth = 45;

            // Header
            console.log(
                chalk.dim('┌─'),
                chalk.bold('Name'.padEnd(nameWidth)),
                chalk.dim('─┬─'),
                chalk.bold('Category'.padEnd(catWidth)),
                chalk.dim('─┬─'),
                chalk.bold('Description'.padEnd(descWidth)),
                chalk.dim('─┬─'),
                chalk.bold('Source'),
                chalk.dim('─┐')
            );

            // Separator
            console.log(
                chalk.dim('├─' + '─'.repeat(nameWidth) + '┼─' +
                    '─'.repeat(catWidth) + '┼─' +
                    '─'.repeat(descWidth) + '┼─' + '───────┤')
            );

            // Rows
            templates.forEach(t => {
                const { name, category, description } = t.metadata;
                const shortDesc = description.length > descWidth - 3
                    ? description.slice(0, descWidth - 6) + '...'
                    : description;

                console.log(
                    chalk.dim('│ '),
                    name.padEnd(nameWidth),
                    chalk.dim(' │ '),
                    formatCategory(category).padEnd(catWidth),
                    chalk.dim(' │ '),
                    shortDesc.padEnd(descWidth),
                    chalk.dim(' │ '),
                    formatSource(t).padEnd(8),
                    chalk.dim(' │')
                );
            });

            // Footer
            console.log(
                chalk.dim('└─' + '─'.repeat(nameWidth) + '┴─' +
                    '─'.repeat(catWidth) + '┴─' +
                    '─'.repeat(descWidth) + '┴─' + '───────┘')
            );

            console.log(chalk.dim('\nUse --template <name> to select one.\n'));
        });
}