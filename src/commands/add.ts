import fs from 'fs/promises';
import crypto from 'crypto';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { UniversalRule, AddRuleOptions, AddRuleResult, EditorType, UniversalRuleType } from '../types/index.js';
import { convertUniversalRule } from '../converters/universal.js';

export async function addCommand(content?: string, options: any = {}): Promise<void> {
  console.log(chalk.cyan.bold('\nAdding new rule to AI editors...'));
  
  // Parse and validate options
  const addOptions = await parseAddOptions(content, options);
  
  if (!addOptions) {
    console.log(chalk.yellow('Operation cancelled.'));
    return;
  }
  
  // Create the universal rule
  const universalRule = await createUniversalRule(addOptions);
  
  // Show preview and get confirmation
  const shouldProceed = await showPreviewAndConfirm(universalRule);
  
  if (!shouldProceed) {
    console.log(chalk.yellow('Operation cancelled.'));
    return;
  }
  
  // Convert and write to target editors
  const result = await addRuleToEditors(universalRule);
  
  // Display results
  displayResults(result);
}

async function parseAddOptions(content?: string, options: any = {}): Promise<AddRuleOptions | null> {
  const addOptions: Partial<AddRuleOptions> = {};
  
  // Validate rule type
  const validTypes: UniversalRuleType[] = ['always', 'pattern', 'manual', 'ai-decision'];
  if (!validTypes.includes(options.type)) {
    console.error(chalk.red(`Invalid rule type: ${options.type}`));
    console.error(chalk.gray(`Valid types: ${validTypes.join(', ')}`));
    return null;
  }
  addOptions.type = options.type;
  
  // Get content from various sources
  if (options.fromFile) {
    try {
      addOptions.content = await fs.readFile(options.fromFile, 'utf8');
      console.log(chalk.gray(`Read content from: ${options.fromFile}`));
    } catch (error) {
      console.error(chalk.red(`Cannot read file: ${options.fromFile}`));
      return null;
    }
  } else if (content) {
    addOptions.content = content;
  } else {
    // Interactive content input
    const { ruleContent } = await inquirer.prompt({
      type: 'editor',
      name: 'ruleContent',
      message: 'Enter rule content (opens editor):',
      default: `# New ${options.type} Rule\n\nEnter your rule content here...`
    });
    addOptions.content = ruleContent;
  }
  
  if (!addOptions.content?.trim()) {
    console.error(chalk.red('Rule content cannot be empty'));
    return null;
  }
  
  // Parse target editors
  if (options.to === 'all') {
    addOptions.targetEditors = 'all';
  } else {
    const editorNames = options.to.split(',').map((e: string) => e.trim());
    const validEditors: EditorType[] = ['cursor', 'windsurf', 'cline', 'vscode', 'codex', 'claude-code', 'qoder', 'trae', 'qwencoder'];
    const invalidEditors = editorNames.filter((name: string) => !validEditors.includes(name as EditorType));
    
    if (invalidEditors.length > 0) {
      console.error(chalk.red(`Invalid editors: ${invalidEditors.join(', ')}`));
      console.error(chalk.gray(`Valid editors: ${validEditors.join(', ')}`));
      return null;
    }
    
    addOptions.targetEditors = editorNames as EditorType[];
  }
  
  // Handle type-specific options
  if (options.type === 'pattern') {
    if (!options.patterns) {
      const { patterns } = await inquirer.prompt({
        type: 'input',
        name: 'patterns',
        message: 'Enter file patterns (comma-separated):',
        default: '*.js,*.ts',
        validate: (input: string) => input.trim().length > 0 || 'Patterns are required for pattern-based rules'
      });
      addOptions.patterns = patterns.split(',').map((p: string) => p.trim());
    } else {
      addOptions.patterns = options.patterns.split(',').map((p: string) => p.trim());
    }
  }
  
  if (options.type === 'ai-decision' && !options.context) {
    const { context } = await inquirer.prompt({
      type: 'input',
      name: 'context',
      message: 'Enter context for AI decision:',
      default: 'performance-critical'
    });
    addOptions.context = context;
  } else if (options.context) {
    addOptions.context = options.context;
  }
  
  // Other options
  addOptions.name = options.name;
  addOptions.description = options.description;
  addOptions.preserveMarkdown = options.preserveMarkdown;
  addOptions.author = options.author;
  
  return addOptions as AddRuleOptions;
}

async function createUniversalRule(options: AddRuleOptions): Promise<UniversalRule> {
  const id = crypto.randomUUID();
  const timestamp = new Date();
  const contentHash = crypto.createHash('sha256').update(options.content ?? '').digest('hex').substring(0, 16);
  const lineCount = (options.content || '').split('\\n').length;
  
  // Auto-generate name if not provided
  let name = options.name;
  if (!name) {
    const firstLine = options.content?.split('\\n')[0]?.replace(/^#\\s*/, '').trim() || '';
    if (firstLine && firstLine.length < 50) {
      name = firstLine;
    } else {
      name = `${options.type}-rule-${timestamp.getTime().toString().slice(-6)}`;
    }
  }
  
  // Resolve target editors
  let targetEditors: EditorType[];
  if (options.targetEditors === 'all') {
    targetEditors = ['cursor', 'windsurf', 'cline', 'vscode', 'codex', 'claude-code', 'qoder', 'trae', 'qwencoder'];
  } else {
    targetEditors = options.targetEditors;
  }
  
  const universalRule: UniversalRule = {
    id,
    name,
    type: options.type,
    content: options.content || '',
    ...(options.patterns && { patterns: options.patterns }),
    ...(options.context && { context: options.context }),
    ...(options.description && { description: options.description }),
    formatting: {
      preserveMarkdown: options.preserveMarkdown || false,
      preserveLineBreaks: true,
      indentationStyle: 'spaces',
      indentationSize: 2
    },
    metadata: {
      created: timestamp,
      updated: timestamp,
      ...(options.author && { author: options.author }),
      version: 1,
      contentHash,
      lineCount
    },
    targetEditors
  };
  
  return universalRule;
}

async function showPreviewAndConfirm(rule: UniversalRule): Promise<boolean> {
  console.log(chalk.green.bold('\\nRule Preview:'));
  console.log(`${chalk.cyan('Name:')} ${rule.name}`);
  console.log(`${chalk.cyan('Type:')} ${rule.type}`);
  console.log(`${chalk.cyan('Target Editors:')} ${rule.targetEditors.join(', ')}`);
  
  if (rule.patterns) {
    console.log(`${chalk.cyan('Patterns:')} ${rule.patterns.join(', ')}`);
  }
  
  if (rule.context) {
    console.log(`${chalk.cyan('Context:')} ${rule.context}`);
  }
  
  if (rule.description) {
    console.log(`${chalk.cyan('Description:')} ${rule.description}`);
  }
  
  console.log(`${chalk.cyan('Content:')}`);
  const preview = rule.content.length > 200 
    ? rule.content.substring(0, 200) + '...'
    : rule.content;
  console.log(chalk.gray(preview.split('\\n').map(line => `  ${line}`).join('\\n')));
  
  console.log(`\\n${chalk.cyan('Lines:')} ${rule.metadata.lineCount}`);
  console.log(`${chalk.cyan('Author:')} ${rule.metadata.author || 'Not specified'}`);
  
  const { proceed } = await inquirer.prompt({
    type: 'confirm',
    name: 'proceed',
    message: 'Add this rule to the specified editors?',
    default: true
  });
  
  return proceed;
}

async function addRuleToEditors(rule: UniversalRule): Promise<AddRuleResult> {
  const result: AddRuleResult = {
    success: true,
    rule,
    outputFiles: [],
    errors: [],
    warnings: []
  };
  
  console.log(chalk.blue('\\nConverting rule to editor formats...'));
  
  for (const editor of rule.targetEditors) {
    try {
      console.log(`  ${chalk.gray('→')} ${editor}`);
      const files = await convertUniversalRule(rule, editor);
      result.outputFiles.push(...files);
    } catch (error) {
      const errorMessage = `Failed to convert rule for ${editor}: ${error instanceof Error ? error.message : String(error)}`;
      result.errors.push(errorMessage);
      result.success = false;
    }
  }
  
  return result;
}

function displayResults(result: AddRuleResult): void {
  if (result.success) {
    console.log(chalk.green.bold('\\nRule successfully added!\\n'));
    
    if (result.outputFiles.length > 0) {
      console.log(chalk.cyan('Created/modified files:'));
      result.outputFiles.forEach(file => {
        console.log(`  ${file}`);
      });
    }
    
    if (result.warnings.length > 0) {
      console.log(chalk.yellow('\\nWarnings:'));
      result.warnings.forEach(warning => {
        console.log(`  ${warning}`);
      });
    }
    
    console.log(chalk.green('\\nYour rule is now active in the specified AI editors!'));
  } else {
    console.log(chalk.red.bold('\\nFailed to add rule.\\n'));
    
    if (result.errors.length > 0) {
      console.log(chalk.red('Errors:'));
      result.errors.forEach(error => {
        console.log(`  ${error}`);
      });
    }
  }
}