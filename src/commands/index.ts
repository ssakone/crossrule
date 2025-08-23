import inquirer from 'inquirer';
import chalk from 'chalk';
import { DetectionResult } from '../types/index.js';
import { detectAllRules } from '../parsers/index.js';
import { EDITOR_CONFIGS, getEditorDisplayNames } from '../utils/index.js';

export async function initCommand(): Promise<void> {
  console.log(chalk.blue.bold('🔍 CrossRule Init - Detecting existing rules...\n'));
  
  // Detect all existing rules in the current project
  const detectedRules = await detectAllRules('.');
  
  if (detectedRules.length === 0) {
    console.log(chalk.yellow('❌ No existing AI editor rules found in this project.'));
    console.log(chalk.gray('Searched for rules from: Cursor, Windsurf, Cline, VSCode, Codex CLI, Claude Code, Qoder, Trae, QwenCoder\n'));
    
    const { shouldCreateNew } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldCreateNew',
        message: 'Would you like to create new rules for an editor?',
        default: false
      }
    ]);
    
    if (shouldCreateNew) {
      await createNewRulesFlow();
    }
    return;
  }

  // Display detected rules
  console.log(chalk.green.bold('✅ Found existing rules:\n'));
  
  for (const detection of detectedRules) {
    const config = EDITOR_CONFIGS[detection.editor];
    console.log(chalk.cyan(`📁 ${config.displayName}:`));
    console.log(`   ${chalk.gray('Location:')} ${detection.location}`);
    console.log(`   ${chalk.gray('Rules:')} ${detection.ruleCount} file(s)\n`);
  }

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

async function handleSingleRuleSource(detection: DetectionResult): Promise<void> {
  const config = EDITOR_CONFIGS[detection.editor];
  
  console.log(chalk.blue(`Using rules from ${config.displayName} as source.`));
  console.log(chalk.gray(`Found ${detection.ruleCount} rule(s) at: ${detection.location}\n`));
  
  await selectTargetEditors(detection);
}

async function handleMultipleRuleSources(detections: DetectionResult[]): Promise<void> {
  console.log(chalk.yellow('⚠️ Multiple rule sources detected. Please choose which one to use as the source:\n'));
  
  const choices = detections.map(detection => {
    const config = EDITOR_CONFIGS[detection.editor];
    return {
      name: `${config.displayName} (${detection.ruleCount} rules) - ${detection.location}`,
      value: detection,
      short: config.displayName
    };
  });

  const { selectedSource } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedSource',
      message: 'Select source rules to convert from:',
      choices,
      pageSize: Math.min(choices.length, 10)
    }
  ]);

  await selectTargetEditors(selectedSource);
}

async function selectTargetEditors(sourceDetection: DetectionResult): Promise<void> {
  const sourceConfig = EDITOR_CONFIGS[sourceDetection.editor];
  
  // Get all available editors except the source
  const allEditors = getEditorDisplayNames();
  const targetChoices = allEditors
    .filter(name => name !== sourceConfig.displayName)
    .map(name => ({
      name,
      value: name,
      checked: false
    }));

  console.log(chalk.blue(`\n📝 Select target editors to generate rules for:\n`));
  
  const { targetEditors } = await inquirer.prompt({
    type: 'checkbox',
    name: 'targetEditors',
    message: 'Choose editors to generate rules for (use space to select, enter to confirm):',
    choices: targetChoices,
    pageSize: Math.min(targetChoices.length, 10)
  });

  if (targetEditors.length === 0) {
    console.log(chalk.yellow('No target editors selected. Exiting.'));
    return;
  }

  // Show preview of what will be converted
  await showConversionPreview(sourceDetection, targetEditors);
}

async function showConversionPreview(
  sourceDetection: DetectionResult, 
  targetEditors: string[]
): Promise<void> {
  const sourceConfig = EDITOR_CONFIGS[sourceDetection.editor];
  
  console.log(chalk.green.bold('\n🔄 Conversion Preview:\n'));
  console.log(`${chalk.cyan('Source:')} ${sourceConfig.displayName} (${sourceDetection.ruleCount} rules)`);
  console.log(`${chalk.cyan('Location:')} ${sourceDetection.location}\n`);
  
  console.log(chalk.cyan('Target editors:'));
  for (const editorName of targetEditors) {
    console.log(`  • ${editorName}`);
  }
  
  console.log(chalk.gray('\nRules to be converted:'));
  for (const rule of sourceDetection.rules.slice(0, 5)) {
    const preview = rule.content.length > 50 
      ? rule.content.substring(0, 50) + '...'
      : rule.content;
    console.log(`  • ${chalk.white(rule.name)} - ${chalk.gray(preview)}`);
  }
  
  if (sourceDetection.rules.length > 5) {
    console.log(`  ${chalk.gray(`... and ${sourceDetection.rules.length - 5} more`)}`);
  }

  const { confirmConversion } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmConversion',
      message: '\nProceed with conversion?',
      default: true
    }
  ]);

  if (confirmConversion) {
    await performConversion(sourceDetection, targetEditors);
  } else {
    console.log(chalk.yellow('Conversion cancelled.'));
  }
}

async function performConversion(
  sourceDetection: DetectionResult,
  targetEditors: string[]
): Promise<void> {
  console.log(chalk.blue.bold('\n⚙️ Converting rules...\n'));
  
  try {
    const { convertRules } = await import('../converters/index.js');
    
    const result = await convertRules(sourceDetection.rules, targetEditors, '.');
    
    if (result.success) {
      console.log(chalk.green.bold('✅ Conversion completed successfully!\n'));
      
      console.log(`${chalk.cyan('Converted:')} ${result.converted} files`);
      console.log(`${chalk.cyan('Output files:')}`);
      
      for (const file of result.outputFiles) {
        console.log(`  • ${chalk.white(file)}`);
      }
      
      if (result.errors.length > 0) {
        console.log(chalk.yellow('\n⚠️ Warnings:'));
        for (const error of result.errors) {
          console.log(`  • ${chalk.yellow(error)}`);
        }
      }
      
      console.log(chalk.green('\n🎉 Rules have been converted and are ready to use!'));
      console.log(chalk.gray('You can now copy these files to your target AI editors.'));
      
    } else {
      console.log(chalk.red.bold('❌ Conversion failed!\n'));
      
      if (result.errors.length > 0) {
        console.log(chalk.red('Errors:'));
        for (const error of result.errors) {
          console.log(`  • ${chalk.red(error)}`);
        }
      }
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Conversion error:'));
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
  }
}

async function createNewRulesFlow(): Promise<void> {
  const allEditors = getEditorDisplayNames();
  
  const { selectedEditor } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedEditor',
      message: 'Select an editor to create rules for:',
      choices: allEditors,
      pageSize: Math.min(allEditors.length, 10)
    }
  ]);
  
  console.log(chalk.blue(`\n📝 Creating new rules for ${selectedEditor}...`));
  console.log(chalk.yellow('🚧 Rule creation not yet implemented.'));
}