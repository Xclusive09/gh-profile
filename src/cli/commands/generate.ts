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
    .action(async (username: string, options: GenerateOptions) => {
      const token = options.token || process.env.GITHUB_TOKEN;
      const client = new GitHubClient({ token });

      try {
        console.log(`📡 Fetching GitHub data for ${username}...`);
        const rawData = await client.fetchAll(username);

        console.log('🔄 Processing data...');
        const normalizedData = normalize(rawData);

        console.log('📝 Generating README...');

        // ── Select template using registry ───────────────────────────────
        const templateId = options.template || DEFAULT_TEMPLATE_ID;

        const template = getTemplate(templateId);

        if (!template) {
          const available = templateRegistry.listMetadata().map(m => m.id).join(', ');
          throw new Error(
              `Template '${templateId}' not found.\n` +
              `Available templates: ${available}`
          );
        }

        const content = template.render(normalizedData);

        const result = await writeOutput(content, options.output!, {
          overwrite: options.force ?? false,
        });

        // Success message
        console.log('\n✅ README generated successfully!');
        console.log(`   📄 File: ${result.path}`);
        if (result.overwritten) {
          console.log('   ⚠️  (overwrote existing file)');
        }

        console.log('\n📊 Stats:');
        console.log(`   • ${normalizedData.stats.totalRepos} repositories`);
        console.log(`   • ${normalizedData.stats.totalStars} total stars`);
        console.log(`   • ${normalizedData.stats.languages.length} languages`);
        console.log('');
      } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });