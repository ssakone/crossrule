import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { UniversalRule, EditorType } from '../types/index.js';

export async function convertUniversalRule(rule: UniversalRule, targetEditor: EditorType): Promise<string[]> {
  const outputFiles: string[] = [];
  
  switch (targetEditor) {
    case 'cursor':
      outputFiles.push(...await convertToCursor(rule));
      break;
    case 'windsurf':
      outputFiles.push(...await convertToWindsurf(rule));
      break;
    case 'cline':
      outputFiles.push(...await convertToCline(rule));
      break;
    case 'codex':
      outputFiles.push(...await convertToCodex(rule));
      break;
    case 'claude-code':
      outputFiles.push(...await convertToClaudeCode(rule));
      break;
    case 'qoder':
      outputFiles.push(...await convertToQoder(rule));
      break;
    case 'qwencoder':
      outputFiles.push(...await convertToQwenCoder(rule));
      break;
    case 'trae':
      outputFiles.push(...await convertToTrae(rule));
      break;
    case 'vscode':
      outputFiles.push(...await convertToVSCode(rule));
      break;
    default:
      throw new Error(`Unsupported editor: ${targetEditor}`);
  }
  
  return outputFiles;
}

async function convertToCursor(rule: UniversalRule): Promise<string[]> {
  const rulesDir = '.cursor/rules';
  await ensureDirectoryExists(rulesDir);
  
  // Generate filename
  const filename = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mdc`;
  const filepath = path.join(rulesDir, filename);
  
  // Create frontmatter
  const frontmatter: any = {
    description: rule.description || rule.name
  };
  
  if (rule.type === 'always') {
    frontmatter.alwaysApply = true;
  } else if (rule.type === 'pattern' && rule.patterns) {
    frontmatter.globs = rule.patterns;
  }
  
  // Create content
  const yamlFrontmatter = yaml.dump(frontmatter);
  const content = `---\n${yamlFrontmatter}---\n\n${rule.content}`;
  
  await fs.writeFile(filepath, content, 'utf8');
  return [filepath];
}

async function convertToWindsurf(rule: UniversalRule): Promise<string[]> {
  const rulesDir = '.windsurf/rules';
  await ensureDirectoryExists(rulesDir);
  
  const filename = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filepath = path.join(rulesDir, filename);
  
  // Windsurf uses plain markdown
  let content = rule.content;
  
  // Add header if not present
  if (!content.startsWith('#')) {
    content = `# ${rule.name}\n\n${content}`;
  }
  
  await fs.writeFile(filepath, content, 'utf8');
  return [filepath];
}

async function convertToCline(rule: UniversalRule): Promise<string[]> {
  const rulesDir = '.clinerules';
  await ensureDirectoryExists(rulesDir);
  
  const filename = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filepath = path.join(rulesDir, filename);
  
  let content = rule.content;
  
  // Add header if not present
  if (!content.startsWith('#')) {
    content = `# ${rule.name}\n\n${content}`;
  }
  
  await fs.writeFile(filepath, content, 'utf8');
  return [filepath];
}

async function convertToQoder(rule: UniversalRule): Promise<string[]> {
  const rulesDir = '.qoder/rules';
  await ensureDirectoryExists(rulesDir);
  
  const filename = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filepath = path.join(rulesDir, filename);
  
  // Create Qoder frontmatter
  const frontmatter: any = {};
  
  switch (rule.type) {
    case 'always':
      frontmatter.trigger = 'always_on';
      frontmatter.alwaysApply = true;
      break;
    case 'pattern':
      frontmatter.trigger = 'glob';
      if (rule.patterns) {
        frontmatter.glob = rule.patterns.join(',');
      }
      break;
    case 'manual':
      frontmatter.trigger = 'manual';
      break;
    case 'ai-decision':
      frontmatter.trigger = 'model_decision';
      if (rule.context) {
        frontmatter.description = rule.context;
      }
      break;
  }
  
  if (rule.description) {
    frontmatter.description = rule.description;
  }
  
  const yamlFrontmatter = yaml.dump(frontmatter);
  const content = `---\n${yamlFrontmatter}---\n\n${rule.content}`;
  
  await fs.writeFile(filepath, content, 'utf8');
  return [filepath];
}

async function convertToCodex(rule: UniversalRule): Promise<string[]> {
  const filepath = 'AGENTS.md';
  
  // Create section delimiter and content
  const sectionName = rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sectionContent = `---- ${sectionName} ----\n\n${rule.content}\n\n`;
  
  // Append to AGENTS.md or create it
  let existingContent = '';
  try {
    existingContent = await fs.readFile(filepath, 'utf8');
  } catch (error) {
    // File doesn't exist, start with header
    existingContent = '# Project Agent Rules\n\n';
  }
  
  // Check if section already exists
  const sectionPattern = new RegExp(`---- ${sectionName} ----[\\s\\S]*?(?=---- |$)`, 'g');
  if (sectionPattern.test(existingContent)) {
    // Replace existing section
    existingContent = existingContent.replace(sectionPattern, sectionContent);
  } else {
    // Append new section
    existingContent += sectionContent;
  }
  
  await fs.writeFile(filepath, existingContent, 'utf8');
  return [filepath];
}

async function convertToClaudeCode(rule: UniversalRule): Promise<string[]> {
  const filepath = 'CLAUDE.md';
  
  let content = rule.content;
  
  // Add context for pattern-based rules
  if (rule.type === 'pattern' && rule.patterns) {
    const patternContext = `When working with files matching: ${rule.patterns.join(', ')}\n\n`;
    content = patternContext + content;
  }
  
  // Add context for AI-decision rules
  if (rule.type === 'ai-decision' && rule.context) {
    const contextNote = `Context: ${rule.context}\n\n`;
    content = contextNote + content;
  }
  
  // Add header if not present
  if (!content.startsWith('#')) {
    content = `# ${rule.name}\n\n${content}`;
  }
  
  // Append to CLAUDE.md or create it
  let existingContent = '';
  try {
    existingContent = await fs.readFile(filepath, 'utf8');
  } catch (error) {
    existingContent = '# AI Assistant Guidelines\n\n';
  }
  
  existingContent += `\n## ${rule.name}\n\n${rule.content}\n`;
  
  await fs.writeFile(filepath, existingContent, 'utf8');
  return [filepath];
}

async function convertToQwenCoder(rule: UniversalRule): Promise<string[]> {
  const filepath = 'QWEN.md';
  
  // Create section delimiter and content (similar to Codex)
  const sectionName = rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sectionContent = `---- ${sectionName} ----\n\n${rule.content}\n\n`;
  
  // Append to QWEN.md or create it
  let existingContent = '';
  try {
    existingContent = await fs.readFile(filepath, 'utf8');
  } catch (error) {
    existingContent = '# QwenCoder Context\n\n';
  }
  
  // Check if section already exists
  const sectionPattern = new RegExp(`---- ${sectionName} ----[\\s\\S]*?(?=---- |$)`, 'g');
  if (sectionPattern.test(existingContent)) {
    existingContent = existingContent.replace(sectionPattern, sectionContent);
  } else {
    existingContent += sectionContent;
  }
  
  await fs.writeFile(filepath, existingContent, 'utf8');
  return [filepath];
}

async function convertToTrae(rule: UniversalRule): Promise<string[]> {
  const rulesDir = '.trae/rules';
  await ensureDirectoryExists(rulesDir);
  
  const filename = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filepath = path.join(rulesDir, filename);
  
  // Trae uses YAML frontmatter
  const frontmatter: any = {
    title: rule.name
  };
  
  if (rule.description) {
    frontmatter.description = rule.description;
  }
  
  if (rule.patterns) {
    frontmatter.patterns = rule.patterns;
  }
  
  const yamlFrontmatter = yaml.dump(frontmatter);
  const content = `---\n${yamlFrontmatter}---\n\n${rule.content}`;
  
  await fs.writeFile(filepath, content, 'utf8');
  return [filepath];
}

async function convertToVSCode(rule: UniversalRule): Promise<string[]> {
  // VSCode rules can be stored in workspace settings or as separate files
  // For simplicity, we'll create a rules directory
  const rulesDir = '.vscode/rules';
  await ensureDirectoryExists(rulesDir);
  
  const filename = `${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  const filepath = path.join(rulesDir, filename);
  
  let content = rule.content;
  
  // Add header if not present
  if (!content.startsWith('#')) {
    content = `# ${rule.name}\n\n${content}`;
  }
  
  await fs.writeFile(filepath, content, 'utf8');
  return [filepath];
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}