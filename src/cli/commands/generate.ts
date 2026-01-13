import { Command } from 'commander';
import { GitHubClient } from '../../github/client.js';
import { normalize } from '../../core/normalize.js';
import { defaultTemplate } from '../../templates/default.js';
import { writeOutput } from '../../output/writer.js';

export interface GenerateOptions {
  template: string;
  output: string;
  token?: string;
  force?: boolean;
}

export const generateCommand = new Command('generate')
  .description('Generate a GitHub profile README')
  .argument('<username>', 'GitHub username to generate README for')
  .option('-t, --template <name>', 'template to use', 'default')
  .option('-o, --output <path>', 'output file path', './README.md')
  .option('--token <token>', 'GitHub personal access token')
  .option('-f, --force', 'overwrite existing file without prompting', false)
  .action(async (username: string, options: GenerateOptions) => {
    const token = options.token || process.env.GITHUB_TOKEN;
    const client = new GitHubClient({ token });

    try {
      // Step 1: Fetch GitHub data
      console.log(`📡 Fetching GitHub data for ${username}...`);
      const rawData = await client.fetchAll(username);

      // Step 2: Normalize data
      console.log('🔄 Processing data...');
      const normalizedData = normalize(rawData);

      // Step 3: Render template
      console.log('📝 Generating README...');
      const template = defaultTemplate; // TODO: support other templates
      const content = template.render(normalizedData);

      // Step 4: Write output
      const result = await writeOutput(content, options.output, {
        overwrite: options.force !== false,
      });

      // Success output
      console.log('');
      console.log('✅ README generated successfully!');
      console.log('');
      console.log(`   📄 File: ${result.path}`);
      if (result.overwritten) {
        console.log('   ⚠️  (overwrote existing file)');
      }
      console.log('');
      console.log('📊 Stats:');
      console.log(`   • ${normalizedData.stats.totalRepos} repositories`);
      console.log(`   • ${normalizedData.stats.totalStars} total stars`);
      console.log(`   • ${normalizedData.stats.languages.length} languages`);
      console.log('');
    } catch (error) {
      console.log('');
      if (error instanceof Error) {
        console.error(`❌ Error: ${error.message}`);
      } else {
        console.error('❌ An unknown error occurred');
      }
      process.exit(1);
    }
  });
