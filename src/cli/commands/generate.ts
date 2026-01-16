import { Command } from 'commander';
import { GitHubClient } from '../../github/client.js';
import { normalize } from '../../core/normalize.js';
import { getTemplate, templateRegistry } from '../../templates/index.js';
import { writeOutput } from '../../output/writer.js';

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
    .addHelpText('after', `
Run one of the following for more help:
  gh-profile generate --help        detailed command usage + templates + token info
  gh-profile generate username      start generating your README
`)
    .action(async (username: string, options: GenerateOptions) => {
      const token = options.token || process.env.GITHUB_TOKEN;
      const client = new GitHubClient({ token });

      try {
        const templateId = options.template || DEFAULT_TEMPLATE_ID;
        if (!templateRegistry.has(templateId)) {
          const available = templateRegistry.listMetadata().map(m => m.id).join(', ');
          throw new Error(`Template '${templateId}' not found. Available: ${available}`);
        }

        console.log(`📡 Fetching GitHub data for ${username}...`);
        const rawData = await client.fetchAll(username);

        console.log('🔄 Normalizing data...');
        const normalizedData = normalize(rawData);

        console.log('📝 Generating README...');
        const template = getTemplate(templateId)!;
        const content = template.render(normalizedData);

        console.log('💾 Writing output...');
        const result = await writeOutput(content, options.output!, {
          overwrite: options.force ?? false,
        });

        console.log('\n✅ Successfully generated README!');
        console.log(`   File: ${result.path}`);
        if (result.overwritten) {
          console.log('   (overwrote existing file)');
        }

        console.log('\n📊 Quick stats:');
        console.log(`   • ${normalizedData.stats.totalRepos} repositories`);
        console.log(`   • ${normalizedData.stats.totalStars} total stars`);
        console.log(`   • ${normalizedData.stats.languages.length} languages used`);
        console.log('');
      } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });