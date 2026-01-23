#!/usr/bin/env node

import { program } from 'commander';
import { generateCommand } from './commands/generate.js';
import { createTemplatesCommand } from './commands/templates.js';
import pkg from '../../package.json' with { type: 'json' };
import { createPreviewCommand } from './commands/preview.js';

program
    .name('gh-profile')
    .description('GitHub Profile README Generator\nUse --enable-plugin / --disable-plugin to override plugin settings.')
    .version(pkg.version);

program.addCommand(generateCommand);
program.addCommand(createTemplatesCommand());
program.addCommand(createPreviewCommand());

program.parse();