import { Command } from 'commander';
import { GitHubClient } from '../../github/client.js';
import { normalize } from '../../core/normalize.js';
import { getTemplate, templateRegistry } from '../../templates/index.js';
import { writeOutput } from '../../output/writer.js';
import { loadConfig } from '../../config/loadConfig.js';
import { logger, ExitCode } from '../../cli/logger.js';

export interface GenerateOptions {
  template?: string;
  output: string;
  token?: string;
  force?: boolean;
}

const DEFAULT_TEMPLATE_ID = 'minimal';

export function getRichHelpText(isSubcommand = false): string {
  const prefix = isSubcommand ? '' : 'gh-profile ';

  const templateDescriptions = templateRegistry
      .listMetadata()
      .map(t => `  • ${t.id.padEnd(12)} ${t.description}`)
      .join('\n');

  return `
Description:
  Generate beautiful GitHub profile READMEs based on your public activity.

Available Templates:
${templateDescriptions}

Examples:
  ${prefix}generate username
  ${prefix}generate username -t stats-heavy
  ${prefix}generate username -t showcase -o ./profile.md
  ${prefix}generate username --token ghp_xxxxxxxxxxxxxxxxxxxxxx --force

GitHub Token (recommended):
  • For higher rate limits and better data quality
  • Create at: https://github.com/settings/tokens (classic token, public_repo scope)
  • Use via --token flag or GITHUB_TOKEN environment variable
  `;
}

function validateTemplate(templateId: string): void {
  if (!templateRegistry.has(templateId)) {
    const available = templateRegistry.listMetadata().map(m => m.id).join(', ');
    logger.error(
        `Template '${templateId}' not found.\nAvailable templates: ${available}`,
        ExitCode.ValidationError
    );
  }
}

function validateUsername(username: string): void {
  if (!username) {
    logger.error(
        'Username is required.\nUsage: gh-profile generate <username>',
        ExitCode.InvalidArguments
    );
  }
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    logger.error(
        'Invalid username. Username can only contain letters, numbers, and hyphens.',
        ExitCode.ValidationError
    );
  }
}

export const generateCommand = new Command('generate')
    .description('Generate a GitHub profile README')
    .argument('<username>', 'GitHub username to generate README for')
    .option(
        '-t, --template <name>',
        `template to use (available: ${templateRegistry.listMetadata().map(m => m.id).join(', ')})`,
        DEFAULT_TEMPLATE_ID
    )
    .option('-o, --output <path>', 'output file path', './README.md')
    .option('--token <token>', 'GitHub personal access token')
    .option('-f, --force', 'overwrite existing file without prompting', false)
    .addHelpText('after', getRichHelpText(true))
    .action(async (username: string, cliOptions: GenerateOptions) => {
      try {
        // Username is guaranteed to be string by Commander
        validateUsername(username);

        logger.step('Loading configuration...');
        const fileConfig = await loadConfig();

        const options: GenerateOptions = {
          ...fileConfig,
          ...cliOptions,
          // Make sure output always has a fallback
          output: cliOptions.output ?? fileConfig.output ?? './README.md',
        };

        const templateId = options.template || DEFAULT_TEMPLATE_ID;
        validateTemplate(templateId);

        const token = options.token || process.env.GITHUB_TOKEN;
        const client = new GitHubClient({ token });

        // ── Fetch
        logger.startSpinner(`Fetching GitHub data for ${username}...`);
        const rawData = await client.fetchAll(username);
        logger.stopSpinner();

        // ── Normalize
        logger.startSpinner('Processing data...');
        const normalizedData = normalize(rawData);
        logger.stopSpinner();

        // ── Generate
        logger.startSpinner('Generating README...');
        const template = getTemplate(templateId)!;
        const content = template.render(normalizedData);
        logger.stopSpinner();

        // ── Write
        logger.startSpinner('Saving README...');
        const result = await writeOutput(content, options.output, {
          overwrite: options.force ?? false,
        });
        logger.stopSpinner();

        // ── Success output
        logger.newLine();
        logger.success('README generated successfully!');
        logger.info(`File saved to: ${result.path}`);
        if (result.overwritten) {
          logger.warning('Existing file was overwritten');
        }

        logger.newLine();
        logger.info('Generation Statistics:');
        logger.stats('Repositories', normalizedData.stats.totalRepos);
        logger.stats('Total stars', normalizedData.stats.totalStars);
        logger.stats('Languages', normalizedData.stats.languages.length);
        logger.newLine();

        process.exit(ExitCode.Success);
      } catch (error) {
        // All errors from async operations are caught here
        logger.error(
            error instanceof Error ? error.message : 'An unknown error occurred',
            ExitCode.GeneralError
        );
      }
    });