import { Command } from 'commander';
import { getTemplate } from '../../templates/index.js';
import { GitHubClient } from '../../github/client.js';
import { normalize } from '../../core/normalize.js';
import { logger } from '../logger.js';
import type { GitHubClientOptions } from '../../github/types.js';

export function createPreviewCommand(): Command {
    const command = new Command('preview')
        .description('Preview a template without generating a file')
        .argument('<username>', 'GitHub username')
        .option('-t, --template <name>', 'Template to use', 'minimal')
        .option('--token <token>', 'GitHub token for API access')
        .action(async (username: string, options: { template: string; token?: string }) => {
            const template = getTemplate(options.template);

            if (!template) {
                logger.error(`Template '${options.template}' not found`);
                process.exit(1);
            }

            try {
                logger.start('Fetching GitHub data...');
                const clientOptions: GitHubClientOptions = {};
                if (options.token) {
                    clientOptions.token = options.token;
                }
                const client = new GitHubClient(clientOptions);
                const rawData = await client.fetchAll(username);
                logger.stop();

                logger.start('Generating preview...');
                const normalizedData = normalize(rawData);
                const output = template.render(normalizedData);
                logger.stop();

                // Print preview directly to stdout
                console.log('\n' + output + '\n');
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error.message);
                } else {
                    logger.error('An unknown error occurred');
                }
                process.exit(1);
            }
        });

    return command;
}