#!/usr/bin/env node

import { program } from 'commander';
import { generateCommand } from './commands/generate.js';
import { createTemplatesCommand } from './commands/templates.js';
import pkg from '../../package.json' with { type: 'json' };

program
    .name('gh-profile')
    .description('GitHub Profile README Generator')
    .version(pkg.version);

program.addCommand(generateCommand);
program.addCommand(createTemplatesCommand());

program.parse();