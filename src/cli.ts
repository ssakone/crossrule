#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/index.js';

const program = new Command();

program
  .name('crossrule')
  .description('Convert AI editor rules between different formats')
  .version('1.0.0');

program
  .command('init')
  .description('Detect existing rules and convert to other AI editors')
  .action(async () => {
    try {
      await initCommand();
    } catch (error) {
      console.error(chalk.red('L Error during initialization:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Legacy support - if no command is provided, default to init
if (process.argv.length === 2) {
  process.argv.push('init');
}

program.parse();