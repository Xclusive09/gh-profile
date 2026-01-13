import { Command } from 'commander';
import { GitHubClient } from '../../github/client.js';

export interface GenerateOptions {
  template: string;
  output: string;
  token?: string;
}

export const generateCommand = new Command('generate')
  .description('Generate a GitHub profile README')
  .argument('<username>', 'GitHub username to generate README for')
  .option('-t, --template <name>', 'template to use', 'default')
  .option('-o, --output <path>', 'output file path', './README.md')
  .option('--token <token>', 'GitHub personal access token')
  .action(async (username: string, options: GenerateOptions) => {
    console.log(`Fetching GitHub data for: ${username}\n`);

    const token = options.token || process.env.GITHUB_TOKEN;
    const client = new GitHubClient({ token });

    try {
      const data = await client.fetchAll(username);

      // Temporary: log raw output for verification
      console.log('=== USER ===');
      console.log(`Name: ${data.user.name || data.user.login}`);
      console.log(`Bio: ${data.user.bio || 'N/A'}`);
      console.log(`Location: ${data.user.location || 'N/A'}`);
      console.log(`Followers: ${data.user.followers}`);
      console.log(`Public repos: ${data.user.public_repos}`);
      console.log(`URL: ${data.user.html_url}`);

      console.log('\n=== REPOS ===');
      console.log(`Total fetched: ${data.repos.length}`);
      console.log('\nTop 5 by stars:');
      const topRepos = [...data.repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5);

      for (const repo of topRepos) {
        console.log(
          `  - ${repo.name}: ⭐${repo.stargazers_count} (${repo.language || 'N/A'})`
        );
      }

      console.log('\n[TODO] Template rendering not yet implemented');
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });
