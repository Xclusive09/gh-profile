import { Command } from 'commander';
import { GitHubClient } from '../../github/client.js';
import { normalize } from '../../core/normalize.js';
import { sanitizeTechStack } from '../../core/sanitize.js';
import { makeAssetsLocal } from '../../core/assets.js';
import { getTemplate, templateRegistry } from '../../templates/index.js';
import { writeOutput } from '../../output/writer.js';
import { loadConfig } from '../../config/loadConfig.js';
import { pluginRegistry } from '../../plugins/registry.js';
import { logger, ExitCode } from '../../cli/logger.js';

export interface GenerateOptions {
  template?: string;
  output: string;
  token?: string;
  force?: boolean;

  local?: boolean;
  'enable-plugin'?: string[];     // new
  'disable-plugin'?: string[];    // new
}

const DEFAULT_TEMPLATE_ID = 'minimal';

function getRichHelpText(): string {
  const templates = templateRegistry.listMetadata();

  return `
Description:
  Create beautiful, professional GitHub profile READMEs from public activity.

Options (generate):
  -t, --template <name>          Template to use (default: minimal)
  -o, --output <path>            Output file (default: ./README.md)
  --token <token>                GitHub personal access token
  -f, --force                    Overwrite without prompting
  --enable-plugin <name>         Force-enable a plugin (overrides config)
  --disable-plugin <name>        Force-disable a plugin (overrides config)

Available Templates:
${templates.map(t => `  • ${t.id.padEnd(14)}${t.description}`).join('\n')}

Examples:
  gh-profile generate xclusive
  gh-profile generate xclusive --enable-plugin stats --disable-plugin socials
  gh-profile generate xclusive -t stats-heavy --force
  `;
}

export const generateCommand = new Command('generate')
  .description('Generate a GitHub profile README')
  .argument('<username>', 'GitHub username')
  .option('-t, --template <name>', 'template to use', DEFAULT_TEMPLATE_ID)
  .option('-o, --output <path>', 'output file path', './README.md')
  .option('--token <token>', 'GitHub personal access token')
  .option('-f, --force', 'overwrite without prompting', false)
  .option('-l, --local', 'download all assets locally for offline use')
  // ── NEW repeatable flags ──
  .option('--enable-plugin <name>', 'force-enable plugin (overrides config)', collectOption, [])
  .option('--disable-plugin <name>', 'force-disable plugin (overrides config)', collectOption, [])
  .addHelpText('after', getRichHelpText())
  .action(async (username: string, cliOptions: GenerateOptions) => {
    try {
      logger.header('gh-profile • Generate README');

      // 1. Validate input
      if (!username?.trim()) {
        logger.error('Username is required.', ExitCode.InvalidArguments);
      }
      if (!/^[a-zA-Z0-9-]+$/.test(username)) {
        logger.error('Invalid username format', ExitCode.ValidationError);
      }

      // 2. Load config
      logger.step('Loading configuration');
      const config = await loadConfig();

      const options = {
        ...config,
        ...cliOptions,
        output: cliOptions.output ?? config.output ?? './README.md',
      };

      // 3. Initialize plugins from config first
      //    CLI overrides will be applied after this step
      logger.step('Initializing plugins');
      await pluginRegistry.initialize({}, config);

      // 4. Apply CLI overrides (highest precedence: CLI > config > defaults)
      let cliOverridesApplied = false;

      if (cliOptions['enable-plugin']?.length) {
        for (const id of cliOptions['enable-plugin']) {
          if (pluginRegistry.getPlugin(id)) {
            pluginRegistry.enablePlugin(id);
            logger.info(`CLI override: enabled plugin '${id}'`);
            cliOverridesApplied = true;
          } else {
            logger.warn(`CLI --enable-plugin: unknown plugin '${id}' (ignored)`);
          }
        }
      }

      if (cliOptions['disable-plugin']?.length) {
        for (const id of cliOptions['disable-plugin']) {
          if (pluginRegistry.getPlugin(id)) {
            pluginRegistry.disablePlugin(id);
            logger.info(`CLI override: disabled plugin '${id}'`);
            cliOverridesApplied = true;
          } else {
            logger.warn(`CLI --disable-plugin: unknown plugin '${id}' (ignored)`);
          }
        }
      }

      const finalEnabledCount = pluginRegistry.getEnabledPlugins().length;
      logger.info(`Final active plugins: ${finalEnabledCount}`);

      // 5. Validate template
      const templateId = options.template ?? DEFAULT_TEMPLATE_ID;
      if (!templateRegistry.has(templateId)) {
        const available = templateRegistry.listMetadata().map(m => m.id).join(', ');
        logger.error(`Unknown template: ${templateId}\nAvailable: ${available}`, ExitCode.ValidationError);
      }

      // 6. Proceed with generation...
      const token = options.token || process.env.GITHUB_TOKEN;
      if (!token) {
        logger.warn('No GitHub token provided → rate limit may be low');
      }

      // Interactive Prompt for Tools
      // prompt user for tools always (unless we add a --no-interactive flag later)
      // User explicit request: "make user input the tools and framework themselves" even with --force
      let userTools: string[] = [];

      // Check if we are in a TTY context or if the user specifically requested it
      // For now, valid for all runs as requested
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise<string>(resolve => {
        rl.question('\n? Enter your tools/frameworks (comma-separated, e.g. git,react): ', resolve);
      });
      rl.close();

      if (answer.trim()) {
        const rawTools = answer.split(',').map(s => s.trim()).filter(Boolean);
        userTools = sanitizeTechStack(rawTools);
      }
      const client = new GitHubClient({ token });

      logger.start(`Fetching data for @${username}`);
      const raw = await client.fetchAll(username);
      logger.stop();

      logger.start('Normalizing data');
      const data = normalize(raw);
      if (userTools.length > 0) {
        data.tools = userTools;
      }
      logger.stop();

      logger.start(`Generating with template: ${templateId}`);
      const template = getTemplate(templateId)!;
      let content = template.render(data);

      for (const plugin of pluginRegistry.getEnabledPlugins()) {
        if (plugin.render) {
          content = await plugin.render(content, data) || content;
        }
      }

      logger.stop();

      logger.stop();

      // Offline Mode: Download assets (post-processing)
      if (options.local) {
        logger.start('Downloading assets for offline mode');
        try {
          content = await makeAssetsLocal(content, options.output);
          logger.success('Assets downloaded to ./assets/ folder');
        } catch (err: any) {
          logger.warn(`Failed to download some assets: ${err.message}`);
        }
        logger.stop();
      }

      logger.start(`Writing to ${options.output}`);
      const writeResult = await writeOutput(content, options.output, {
        overwrite: options.force,
      });
      logger.stop();

      // 7. Summary with plugin info
      logger.newline(2);
      logger.success(`README generated successfully!`);
      logger.newline();

      const summaryLines = [
        `User:        @${username}`,
        `Template:    ${templateId}`,
        `Output:      ${writeResult.path}`,
        writeResult.overwritten ? 'Status:      Overwritten' : 'Status:      New file',
        `Plugins:     ${finalEnabledCount} active`,
      ];

      if (cliOverridesApplied) {
        summaryLines.push('CLI overrides: applied');
      }

      logger.box('Summary', summaryLines.join('\n'));

      logger.newline();
      logger.header('Statistics');
      logger.keyValue('Repositories', data.stats.totalRepos);
      logger.keyValue('Total Stars', data.stats.totalStars);
      logger.keyValue('Languages', data.stats.languages.length);
      if (data.tools?.length) {
        logger.keyValue('Tools', data.tools.length);
      }
      logger.newline();

      process.exit(ExitCode.Success);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      logger.error(message, ExitCode.GeneralError);
    }
  });

// Helper to collect repeatable options
function collectOption(value: string, previous: string[] = []) {
  return previous.concat([value]);
}