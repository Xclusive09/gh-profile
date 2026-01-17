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

function getRichHelpText(): string {
  const templates = templateRegistry.listMetadata();

  return `
Description:
  Create beautiful, professional GitHub profile READMEs from public activity.

Commands:
  generate <username>     Generate README for the specified GitHub user

Options (generate):
  -t, --template <name>   Template to use (default: minimal)
  -o, --output <path>     Output file (default: ./README.md)
  --token <token>         GitHub personal access token
  -f, --force             Overwrite without confirmation

Available Templates:
${templates.map(t => `  • ${t.id.padEnd(14)}${t.description}`).join('\n')}

Examples:
  gh-profile generate xclusive
  gh-profile generate xclusive -t stats-heavy -o profile.md --force
  gh-profile generate xclusive --token ghp_xxx

Tip:
  For better rate limits, create a token at:
  https://github.com/settings/tokens (classic • public_repo scope)
  `;
}

export const generateCommand = new Command('generate')
    .description('Generate a GitHub profile README')
    .argument('<username>', 'GitHub username')
    .option('-t, --template <name>', 'template to use', DEFAULT_TEMPLATE_ID)
    .option('-o, --output <path>', 'output file path', './README.md')
    .option('--token <token>', 'GitHub personal access token')
    .option('-f, --force', 'overwrite without prompting', false)
    .addHelpText('after', getRichHelpText())
    .action(async (username: string, cliOptions: GenerateOptions) => {
      try {
        logger.header('gh-profile • Generate README');

        // 1. Validate input early
        if (!username?.trim()) {
          logger.error('Username is required.\nUsage: gh-profile generate <username>', ExitCode.InvalidArguments);
        }
        if (!/^[a-zA-Z0-9-]+$/.test(username)) {
          logger.error('Invalid username format', ExitCode.ValidationError);
        }

        // 2. Load & merge configuration
        logger.step('Loading configuration');
        const config = await loadConfig();
        const options = {
          ...config,
          ...cliOptions,
          output: cliOptions.output ?? config.output ?? './README.md',
        };

        // 3. Validate template
        const templateId = options.template ?? DEFAULT_TEMPLATE_ID;
        if (!templateRegistry.has(templateId)) {
          const available = templateRegistry.listMetadata().map(m => m.id).join(', ');
          logger.error(`Unknown template: ${templateId}\nAvailable: ${available}`, ExitCode.ValidationError);
        }

        // 4. Initialize client
        const token = options.token || process.env.GITHUB_TOKEN;
        if (!token) {
          logger.warn('No GitHub token provided → rate limit may be low');
        }
        const client = new GitHubClient({ token });

        // 5. Fetch → Process → Generate → Write (with beautiful progress)
        logger.start(`Fetching data for @${username}`);
        const raw = await client.fetchAll(username);
        logger.stop();

        logger.start('Normalizing data');
        const data = normalize(raw);
        logger.stop();

        logger.start(`Generating with template: ${templateId}`);
        const template = getTemplate(templateId)!;
        const content = template.render(data);
        logger.stop();

        logger.start(`Writing to ${options.output}`);
        const writeResult = await writeOutput(content, options.output, {
          overwrite: options.force,
        });
        logger.stop();

        // 6. Beautiful success screen
        logger.newline(2);
        logger.success(`README generated successfully!`);
        logger.newline();

        logger.box('Summary', [
          `User:        @${username}`,
          `Template:    ${templateId}`,
          `Output:      ${writeResult.path}`,
          writeResult.overwritten ? 'Status:      Overwritten existing file' : 'Status:      New file created',
        ].join('\n'));

        logger.newline();
        logger.header('Statistics');
        logger.keyValue('Repositories', data.stats.totalRepos);
        logger.keyValue('Total Stars', data.stats.totalStars);
        logger.keyValue('Languages', data.stats.languages.length);
        logger.newline();

        process.exit(ExitCode.Success);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        logger.error(message, ExitCode.GeneralError);
      }
    });