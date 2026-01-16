#!/usr/bin/env node

import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';

const program = new Command('gh-profile')
    .description('Generate GitHub profile READMEs from your public activity')
    .version('0.2.0');

program.addCommand(generateCommand);

program.parse();