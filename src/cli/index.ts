#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';

const program = new Command();

program
  .name('gh-profile')
  .description('Generate GitHub profile READMEs from your public activity')
    .version('1.0.0');

program.addCommand(generateCommand);

program.parse();
