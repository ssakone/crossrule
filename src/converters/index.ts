import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { Rule, EditorType, ConversionResult } from '../types/index.js';
import { EDITOR_CONFIGS, getEditorByDisplayName } from '../utils/index.js';

export async function convertRules(
  sourceRules: Rule[],
  targetEditors: string[],
  outputPath = '.'
): Promise<ConversionResult> {
  const result: ConversionResult = {
    success: true,
    converted: 0,
    skipped: 0,
    errors: [],
    outputFiles: []
  };

  for (const editorName of targetEditors) {
    const editorType = getEditorByDisplayName(editorName);
    if (!editorType) {
      result.errors.push(`Unknown editor: ${editorName}`);
      continue;
    }

    try {
      const files = await convertToEditor(sourceRules, editorType, outputPath);
      result.outputFiles.push(...files);
      result.converted += files.length;
    } catch (error) {
      result.errors.push(`Failed to convert to ${editorName}: ${error}`);
      result.success = false;
    }
  }

  return result;
}

async function convertToEditor(
  rules: Rule[],
  targetEditor: EditorType,
  basePath: string
): Promise<string[]> {
  const config = EDITOR_CONFIGS[targetEditor];
  const outputFiles: string[] = [];
  
  // Special handling for single-file editors like Codex CLI
  if (targetEditor === 'codex' || targetEditor === 'claude-code' || targetEditor === 'qwencoder') {
    return convertToSingleFile(rules, targetEditor, basePath);
  }
  
  // Determine output directory for multi-file editors
  const outputDir = join(basePath, config.locations[0] || '.');
  
  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const rule of rules) {
    try {
      const convertedContent = convertRuleContent(rule, targetEditor);
      const fileName = generateFileName(rule, targetEditor);
      const filePath = join(outputDir, fileName);
      
      writeFileSync(filePath, convertedContent, 'utf-8');
      outputFiles.push(filePath);
    } catch (error) {
      throw new Error(`Failed to convert rule ${rule.name}: ${error}`);
    }
  }

  return outputFiles;
}

async function convertToSingleFile(
  rules: Rule[],
  targetEditor: EditorType,
  basePath: string
): Promise<string[]> {
  const config = EDITOR_CONFIGS[targetEditor];
  const fileName = config.locations[0]; // e.g., 'AGENTS.md', 'CLAUDE.md', 'QWEN.md'
  const filePath = join(basePath, fileName || 'rules.md');
  
  let content = '';
  
  // Add header based on editor type
  switch (targetEditor) {
    case 'codex':
      content = '# Project Agent Rules\n\n';
      content += '*Converted rules from multiple sources*\n\n';
      break;
    case 'claude-code':
      content = '# CLAUDE.md\n\n';
      content += 'This file provides guidance to Claude Code when working with code in this repository.\n\n';
      break;
    case 'qwencoder':
      content = '# Project Context Rules\n\n';
      content += '*AI coding assistant guidance*\n\n';
      break;
  }
  
  // Add each rule as a section
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (!rule) continue;
    
    // Add section delimiter based on editor
    if (targetEditor === 'codex' || targetEditor === 'qwencoder') {
      content += `---- ${rule.name} ----\n\n`;
    } else {
      // For other single-file editors like CLAUDE.md, use regular markdown sections
      content += `## ${rule.description || rule.name}\n\n`;
    }
    
    // Add rule content
    content += rule.content;
    
    // Add spacing between sections
    if (i < rules.length - 1) {
      content += '\n\n';
    }
  }
  
  writeFileSync(filePath, content, 'utf-8');
  return [filePath];
}

function convertRuleContent(rule: Rule, targetEditor: EditorType): string {
  switch (targetEditor) {
    case 'cursor':
      return convertToCursor(rule);
    case 'windsurf':
      return convertToWindsurf(rule);
    case 'cline':
      return convertToCline(rule);
    case 'vscode':
      return convertToVSCode(rule);
    case 'codex':
      return convertToCodex(rule);
    case 'claude-code':
      return convertToClaudeCode(rule);
    case 'qoder':
      return convertToQoder(rule);
    case 'trae':
      return convertToTrae(rule);
    case 'qwencoder':
      return convertToQwenCoder(rule);
    default:
      throw new Error(`Unsupported target editor: ${targetEditor}`);
  }
}

function generateFileName(rule: Rule, targetEditor: EditorType): string {
  const config = EDITOR_CONFIGS[targetEditor];
  const baseName = rule.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const extension = config.fileFormats[0];
  return `${baseName}${extension}`;
}

// Editor-specific conversion functions

function convertToCursor(rule: Rule): string {
  const frontmatter: any = {
    description: rule.description || `Converted from ${rule.source}`
  };

  // Map rule types to Cursor format
  switch (rule.type) {
    case 'always':
      frontmatter.alwaysApply = true;
      break;
    case 'auto-attached':
    case 'glob-pattern':
    case 'specific-files':
      if (rule.patterns) {
        frontmatter.globs = rule.patterns;
      }
      break;
  }

  return matter.stringify(rule.content, frontmatter);
}

function convertToWindsurf(rule: Rule): string {
  const frontmatter: any = {
    description: rule.description || `Converted from ${rule.source}`
  };

  // Map rule types
  switch (rule.type) {
    case 'always':
      frontmatter.alwaysApply = true;
      break;
    case 'auto-attached':
    case 'glob-pattern':
    case 'specific-files':
      if (rule.patterns) {
        frontmatter.globs = rule.patterns.join(',');
      }
      break;
  }

  return matter.stringify(rule.content, frontmatter);
}

function convertToCline(rule: Rule): string {
  let content = '';
  
  // Add title
  if (rule.description) {
    content += `# ${rule.description}\n\n`;
  } else {
    content += `# ${rule.name}\n\n`;
  }

  // Add conversion note
  content += `*Converted from ${rule.source} rules*\n\n`;
  
  // Add main content
  content += rule.content;

  return content;
}

function convertToVSCode(rule: Rule): string {
  const frontmatter: any = {
    description: rule.description || `Converted from ${rule.source}`
  };

  if (rule.patterns) {
    frontmatter.applyTo = rule.patterns.join(',');
  }

  return matter.stringify(rule.content, frontmatter);
}

function convertToCodex(rule: Rule): string {
  let content = '';
  
  content += `# ${rule.description || rule.name}\n\n`;
  content += `*Converted from ${rule.source} rules*\n\n`;
  content += rule.content;

  return content;
}

function convertToClaudeCode(rule: Rule): string {
  let content = '';
  
  content += `# ${rule.description || rule.name}\n\n`;
  content += rule.content;

  return content;
}

function convertToQoder(rule: Rule): string {
  const frontmatter: any = {
    trigger: mapRuleTypeToQoderTrigger(rule.type),
    description: rule.description || `Converted from ${rule.source}`
  };

  // Add alwaysApply for always_on trigger
  if (rule.type === 'always') {
    frontmatter.alwaysApply = true;
  }

  // Add glob patterns for pattern-based triggers
  if ((rule.type === 'auto-attached' || rule.type === 'glob-pattern' || rule.type === 'specific-files') && rule.patterns && rule.patterns.length > 0) {
    frontmatter.glob = rule.patterns.length === 1 ? rule.patterns[0] : rule.patterns.join(',');
  }

  return matter.stringify(rule.content, frontmatter);
}

function mapRuleTypeToQoderTrigger(ruleType: string): string {
  switch (ruleType) {
    case 'manual':
      return 'manual';
    case 'model-decision':
    case 'agent-requested':
      return 'model_decision';
    case 'always':
      return 'always_on';
    case 'auto-attached':
    case 'glob-pattern':
    case 'specific-files':
      return 'glob';
    default:
      return 'manual';
  }
}

function convertToTrae(rule: Rule): string {
  const frontmatter: any = {
    description: rule.description || `Converted from ${rule.source}`
  };

  if (rule.type === 'always') {
    frontmatter.alwaysApply = true;
  }

  if (rule.patterns) {
    frontmatter.globs = rule.patterns.join(',');
  }

  return matter.stringify(rule.content, frontmatter);
}

function convertToQwenCoder(rule: Rule): string {
  let content = '';
  
  content += `# ${rule.description || rule.name}\n\n`;
  content += `*Converted from ${rule.source} rules*\n\n`;
  content += rule.content;

  return content;
}