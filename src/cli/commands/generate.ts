import { Command } from 'commander';

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
  .action((username: string, options: GenerateOptions) => {
    console.log(`Generating README for: ${username}`);
    console.log(`Template: ${options.template}`);
    console.log(`Output: ${options.output}`);
    console.log(`Token: ${options.token ? '***' : 'not provided'}`);

    // TODO: implement actual generation logic
    console.log('\n[stub] Generation not yet implemented');
  });
