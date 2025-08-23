#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand, addCommand } from './commands/index.js';

const program = new Command();

program
  .name('crossrule')
  .description('Convert AI editor rules between different formats')
  .version('1.0.1', '-v, --version', 'Display version number');

program
  .command('init')
  .description('Detect existing rules and convert to other AI editors')
  .action(async () => {
    try {
      await initCommand();
    } catch (error) {
      console.error(chalk.red('Error during initialization:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program
  .command('add')
  .description('Add a new rule to specified AI editors')
  .argument('[content]', 'Rule content (or use --from-file)')
  .option('-t, --type <type>', 'Rule type: always, pattern, manual, ai-decision', 'always')
  .option('-p, --patterns <patterns>', 'File patterns (comma-separated) for pattern-based rules')
  .option('-c, --context <context>', 'Context description for AI-decision rules')  
  .option('-d, --description <description>', 'Rule description')
  .option('--to <editors>', 'Target editors (comma-separated) or "all"', 'all')
  .option('-f, --from-file <file>', 'Read rule content from file')
  .option('-n, --name <name>', 'Rule name (auto-generated if not provided)')
  .option('--preserve-markdown', 'Preserve markdown formatting', false)
  .option('--author <author>', 'Rule author name')
  .action(async (content, options) => {
    try {
      await addCommand(content, options);
    } catch (error) {
      console.error(chalk.red('Error adding rule:'));
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

// Legacy support - if no command is provided, default to init
if (process.argv.length === 2) {
  process.argv.push('init');
}

program.parse();