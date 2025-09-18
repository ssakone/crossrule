import inquirer from 'inquirer';
import chalk from 'chalk';
import { DetectionResult, EditorType } from '../types/index.js';
import { detectAllRules } from '../parsers/index.js';
import { EDITOR_CONFIGS, getEditorDisplayNames, getDisplayNamesForEditor, getEditorByDisplayName } from '../utils/index.js';

// Export add command
export { addCommand } from './add.js';

export async function initCommand(): Promise<void> {
  // Welcome message
  console.log(chalk.cyan.bold('\nWelcome to CrossRule!'));
  console.log(chalk.gray('Let me help you sync your AI editor rules across different tools.\n'));
  
  // Show scanning animation
  const spinner = createSpinner();
  spinner.start('Scanning your project for existing AI editor rules...');
  
  // Detect all existing rules in the current project
  const detectedRules = await detectAllRules('.');
  spinner.stop();
  
  if (detectedRules.length === 0) {
    console.log(chalk.yellow('\nNo AI editor rules found in this project.'));
    console.log(chalk.gray('   I looked for: Cursor, Windsurf, Cline, VSCode, Codex CLI, Claude Code, Qoder, Trae, QwenCoder'));
    
    const { shouldCreateNew } = await inquirer.prompt({
      type: 'confirm',
      name: 'shouldCreateNew',
      message: 'Would you like me to help you create some rules?',
      default: true
    });
    
    if (shouldCreateNew) {
      await createNewRulesFlow();
    } else {
      console.log(chalk.gray('\nNo worries! Come back anytime when you have some rules to convert.'));
    }
    return;
  }

  // Display detected rules in a friendly way
  console.log(chalk.green('\nFound existing rules:'));
  
  for (const detection of detectedRules) {
    const config = EDITOR_CONFIGS[detection.editor as keyof typeof EDITOR_CONFIGS];
    const ruleText = detection.ruleCount === 1 ? 'rule' : 'rules';
    const aliasNote = config.aliasDisplayNames && config.aliasDisplayNames.length > 0
      ? chalk.gray(` (also: ${config.aliasDisplayNames.join(', ')})`)
      : '';
    console.log(`\n   ${chalk.bold(config.displayName)}${aliasNote} - ${detection.ruleCount} ${ruleText}`);
    console.log(`     ${chalk.gray(detection.location)}`);
  }

  console.log(); // Empty line for spacing

  // Handle single or multiple rule sources
  if (detectedRules.length === 1) {
    const singleResult = detectedRules[0];
    if (singleResult) {
      await handleSingleRuleSource(singleResult);
    }
  } else {
    await handleMultipleRuleSources(detectedRules);
  }
}

function createSpinner() {
  let frame = 0;
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let interval: NodeJS.Timeout;
  
  return {
    start: (message: string) => {
      process.stdout.write('\x1B[?25l'); // Hide cursor
      interval = setInterval(() => {
        process.stdout.write('\r' + chalk.cyan(frames[frame]) + ' ' + message);
        frame = (frame + 1) % frames.length;
      }, 80);
    },
    stop: () => {
      clearInterval(interval);
      process.stdout.write('\r\x1B[K'); // Clear line
      process.stdout.write('\x1B[?25h'); // Show cursor
    }
  };
}

async function handleSingleRuleSource(detection: DetectionResult): Promise<void> {
  const config = EDITOR_CONFIGS[detection.editor];
  const ruleText = detection.ruleCount === 1 ? 'rule' : 'rules';
  
  console.log(chalk.blue(`Perfect! I'll use your ${config.displayName} ${ruleText} as the source.`));
  console.log(chalk.gray(`That's ${detection.ruleCount} ${ruleText} from: ${detection.location}\n`));
  
  await selectTargetEditors(detection);
}

async function handleMultipleRuleSources(detections: DetectionResult[]): Promise<void> {
  console.log(chalk.blue('Multiple rule sources detected. Select which one to convert from:'));
  
  const choices = detections.map(detection => {
    const config = EDITOR_CONFIGS[detection.editor as keyof typeof EDITOR_CONFIGS];
    const ruleText = detection.ruleCount === 1 ? 'rule' : 'rules';
    return {
      name: `${config.displayName} - ${detection.ruleCount} ${ruleText}`,
      value: detection,
      short: config.displayName
    };
  });

  const { selectedSource } = await inquirer.prompt({
    type: 'list',
    name: 'selectedSource',
    message: 'Which rules should I convert from?',
    choices,
    pageSize: Math.min(choices.length, 10)
  });

  const config = EDITOR_CONFIGS[selectedSource.editor as keyof typeof EDITOR_CONFIGS];
  console.log(chalk.green(`\n✨ Great choice! Using your ${config.displayName} rules.\n`));

  await selectTargetEditors(selectedSource);
}

async function selectTargetEditors(sourceDetection: DetectionResult): Promise<void> {
  // Get all available editors except the source
  const allEditors = getEditorDisplayNames();
  const namesToExclude = getDisplayNamesForEditor(sourceDetection.editor as EditorType);
  const targetChoices = allEditors
    .filter(name => !namesToExclude.includes(name))
    .map(name => ({
      name,
      value: name,
      checked: false
    }));

  console.log(chalk.blue('Select target editors to convert to:'));
  console.log(chalk.gray('   (Use spacebar to select, enter when ready)\n'));
  
  const { targetEditors } = await inquirer.prompt({
    type: 'checkbox',
    name: 'targetEditors',
    message: 'Select target editors:',
    choices: targetChoices,
    pageSize: Math.min(targetChoices.length, 8),
    loop: false
  });

  if (targetEditors.length === 0) {
    console.log(chalk.yellow('No editors selected. Exiting.'));
    return;
  }

  // Show preview of what will be converted
  await showConversionPreview(sourceDetection, targetEditors);
}

async function showConversionPreview(
  sourceDetection: DetectionResult, 
  targetEditors: string[]
): Promise<void> {
  const sourceConfig = EDITOR_CONFIGS[sourceDetection.editor as keyof typeof EDITOR_CONFIGS];
  const ruleText = sourceDetection.ruleCount === 1 ? 'rule' : 'rules';
  
  console.log(chalk.green.bold('\nConversion preview:'));
  
  console.log(`\n   ${chalk.cyan('From:')} ${sourceConfig.displayName} (${sourceDetection.ruleCount} ${ruleText})`);
  const groupedTargets = groupEditorsByType(targetEditors);
  const formattedTargets = groupedTargets.map(group => {
    const { base, aliases } = getEditorLabelParts(group);
    const aliasText = aliases.length ? ` ${chalk.gray(`(${aliases.join(', ')})`)}` : '';
    return `${base}${aliasText}`;
  });
  console.log(`   ${chalk.cyan('To:')} ${formattedTargets.join(', ')}`);
  
  if (sourceDetection.rules.length <= 3) {
    console.log(`\n   ${chalk.gray('Your rules:')}`);
    for (const rule of sourceDetection.rules) {
      const preview = rule.content.length > 60 
        ? rule.content.substring(0, 60).replace(/\n/g, ' ') + '...'
        : rule.content.replace(/\n/g, ' ');
      console.log(`   ${chalk.cyan('•')} ${chalk.white(rule.name)} - ${chalk.gray(preview)}`);
    }
  } else {
    console.log(`\n   ${chalk.gray('Including rules:')}`);
    for (const rule of sourceDetection.rules.slice(0, 3)) {
      console.log(`   ${chalk.cyan('•')} ${rule.name}`);
    }
    console.log(`   ${chalk.gray(`... and ${sourceDetection.rules.length - 3} more`)}`);
  }

  const { confirmConversion } = await inquirer.prompt({
    type: 'confirm',
    name: 'confirmConversion',
    message: '\nShall I convert these rules now?',
    default: true
  });

  if (confirmConversion) {
    await performConversion(sourceDetection, targetEditors);
  } else {
    console.log(chalk.yellow('Operation cancelled. Your rules are unchanged.'));
  }
}

async function performConversion(
  sourceDetection: DetectionResult,
  targetEditors: string[]
): Promise<void> {
  // Show a nice progress indicator
  const spinner = createSpinner();
  spinner.start('Converting your rules...');
  
  try {
    const { convertRules } = await import('../converters/index.js');
    const result = await convertRules(sourceDetection.rules, targetEditors, '.');
    
    spinner.stop();
    
    if (result.success) {
      console.log(chalk.green.bold('Conversion complete! Your rules are ready to go.\n'));
      
      const groupedTargets = groupEditorsByType(targetEditors);
      const perEditorOutputs = result.perEditorOutputFiles ?? {};
      let showedAgentsNote = false;

      groupedTargets.forEach(group => {
        const { base, aliases } = getEditorLabelParts(group);
        const config = EDITOR_CONFIGS[group.editorType];
        const aliasNote = config.aliasDisplayNames && config.aliasDisplayNames.length > 0
          ? chalk.gray(` (also: ${config.aliasDisplayNames.join(', ')})`)
          : '';
        const selectionNote = aliases.length > 0
          ? chalk.gray(` [selected as: ${aliases.join(', ')}]`)
          : '';

        console.log(`   ${chalk.cyan('📁')} ${chalk.bold(base)}${aliasNote}${selectionNote}`);

        const files = perEditorOutputs[group.editorType] ?? [];
        files.forEach(file => {
          console.log(`     ${chalk.gray('→')} ${file}`);
        });

        if (group.editorType === 'codex' && !showedAgentsNote) {
          const sharedNames = [config.displayName, ...(config.aliasDisplayNames ?? [])].join(', ');
          console.log(`     ${chalk.gray('Shared AGENTS.md format:')} ${sharedNames}`);
          showedAgentsNote = true;
        }

        console.log();
      });
      
      if (result.errors.length > 0) {
        console.log(chalk.yellow('⚠️  A few things to note:'));
        result.errors.forEach(error => {
          console.log(`   ${chalk.yellow('•')} ${error}`);
        });
        console.log();
      }
      
      console.log(chalk.green('Your rules are now ready to use in your target editors!'));
      console.log(chalk.gray('   💡 Tip: Test the converted rules in a small project first to ensure they work as expected.\n'));
      
    } else {
      console.log(chalk.red.bold('Conversion failed.\n'));
      
      if (result.errors.length > 0) {
        console.log(chalk.red('Here\'s what happened:'));
        result.errors.forEach(error => {
          console.log(`   ${chalk.red('•')} ${error}`);
        });
        console.log();
        console.log(chalk.gray('💡 Try running the command again, or check if your rule files have the correct format.'));
      }
    }
    
  } catch (error) {
    spinner.stop();
    console.log(chalk.red.bold('Unexpected error during conversion!\n'));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    console.log(chalk.gray('\n💡 This might be a bug. Consider reporting it with your rule files.'));
  }
}

type EditorGroup = {
  editorType: EditorType;
  names: string[];
};

function groupEditorsByType(editorNames: string[]): EditorGroup[] {
  const groups = new Map<EditorType, string[]>();
  for (const name of editorNames) {
    const editorType = getEditorByDisplayName(name);
    if (!editorType) continue;
    const existing = groups.get(editorType) ?? [];
    existing.push(name);
    groups.set(editorType, existing);
  }
  return Array.from(groups.entries()).map(([editorType, names]) => ({ editorType, names }));
}

function getEditorLabelParts(group: EditorGroup): { base: string; aliases: string[] } {
  const config = EDITOR_CONFIGS[group.editorType];
  const aliases = group.names.filter(name => name !== config.displayName);
  return {
    base: config.displayName,
    aliases
  };
}

async function createNewRulesFlow(): Promise<void> {
  const allEditors = getEditorDisplayNames();
  
  console.log(chalk.blue('🆕 Let\'s create some rules! Which editor are you using?'));
  
  const { selectedEditor } = await inquirer.prompt({
    type: 'list',
    name: 'selectedEditor',
    message: 'Choose your AI editor:',
    choices: allEditors,
    pageSize: Math.min(allEditors.length, 8)
  });
  
  console.log(chalk.green(`\n✨ Great! I'd love to help you create ${selectedEditor} rules.`));
  console.log(chalk.yellow('🚧 Rule creation is coming in the next version!'));
  console.log(chalk.gray('   For now, you can manually create rules and then use CrossRule to convert them.'));
  console.log(chalk.gray('   Check the documentation for rule format examples.\n'));
}
