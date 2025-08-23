import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import glob from 'fast-glob';
import matter from 'gray-matter';
import { EditorType, DetectionResult, Rule, RuleType } from '../types/index.js';
import { EDITOR_CONFIGS } from '../utils/index.js';

export async function detectAllRules(projectPath = '.'): Promise<DetectionResult[]> {
  const results: DetectionResult[] = [];
  
  for (const editorType of Object.keys(EDITOR_CONFIGS) as EditorType[]) {
    const detected = await detectRulesForEditor(editorType, projectPath);
    if (detected.ruleCount > 0) {
      results.push(detected);
    }
  }
  
  return results.sort((a, b) => b.ruleCount - a.ruleCount);
}

export async function detectRulesForEditor(
  editor: EditorType, 
  projectPath = '.'
): Promise<DetectionResult> {
  const config = EDITOR_CONFIGS[editor];
  const rules: Rule[] = [];
  let detectedLocation = '';

  // Check primary locations
  for (const location of config.locations) {
    const fullPath = resolve(projectPath, location);
    
    if (existsSync(fullPath)) {
      const foundRules = await parseRulesFromLocation(editor, fullPath);
      rules.push(...foundRules);
      if (foundRules.length > 0 && !detectedLocation) {
        detectedLocation = fullPath;
      }
    }
  }

  // Check legacy locations
  if (config.legacyLocations) {
    for (const legacyLocation of config.legacyLocations) {
      const fullPath = resolve(projectPath, legacyLocation);
      if (existsSync(fullPath)) {
        const foundRules = await parseRulesFromLocation(editor, fullPath);
        rules.push(...foundRules);
        if (foundRules.length > 0 && !detectedLocation) {
          detectedLocation = fullPath;
        }
      }
    }
  }

  return {
    editor,
    rules,
    location: detectedLocation,
    ruleCount: rules.length
  };
}

async function parseRulesFromLocation(editor: EditorType, location: string): Promise<Rule[]> {
  const rules: Rule[] = [];
  const stat = statSync(location);

  if (stat.isFile()) {
    // Handle single-file editors with multiple sections
    if (editor === 'codex' || editor === 'claude-code' || editor === 'qwencoder') {
      const sectionsRules = await parseSingleFileWithSections(editor, location);
      rules.push(...sectionsRules);
    } else {
      const rule = await parseRuleFile(editor, location);
      if (rule) rules.push(rule);
    }
  } else if (stat.isDirectory()) {
    const config = EDITOR_CONFIGS[editor];
    const patterns = config.fileFormats.map(ext => `${location}/**/*${ext}`);
    const files = await glob(patterns, { absolute: true });
    
    for (const file of files) {
      const rule = await parseRuleFile(editor, file);
      if (rule) rules.push(rule);
    }
  }

  return rules;
}

async function parseSingleFileWithSections(editor: EditorType, filePath: string): Promise<Rule[]> {
  const rules: Rule[] = [];
  const content = readFileSync(filePath, 'utf-8');
  
  if (editor === 'codex' || editor === 'qwencoder') {
    // Parse AGENTS.md/QWEN.md with ---- section ---- delimiters
    const sections = content.split(/^---- (.+?) ----$/gm);
    
    // First section is usually header/intro, skip it if it doesn't have a name
    for (let i = 1; i < sections.length; i += 2) {
      const sectionName = sections[i]?.trim();
      const sectionContent = sections[i + 1]?.trim();
      
      if (sectionName && sectionContent) {
        const sourceDesc = editor === 'codex' ? 'Codex CLI' : 'QwenCoder';
        rules.push({
          name: sectionName,
          description: `${sectionName} rules from ${sourceDesc}`,
          content: sectionContent,
          type: 'always',
          source: editor,
          metadata: {
            filePath,
            section: sectionName
          }
        });
      }
    }
  } else {
    // For other single-file editors, treat as single rule
    const fileName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'unnamed';
    const rule = parseRuleContent(editor, fileName, content, filePath);
    rules.push(rule);
  }
  
  return rules;
}

async function parseRuleFile(editor: EditorType, filePath: string): Promise<Rule | null> {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const fileName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'unnamed';
    
    return parseRuleContent(editor, fileName, content, filePath);
  } catch (error) {
    console.error(`Error reading rule file ${filePath}:`, error);
    return null;
  }
}

function parseRuleContent(
  editor: EditorType, 
  name: string, 
  content: string, 
  filePath: string
): Rule {
  const config = EDITOR_CONFIGS[editor];
  let parsedContent = content;
  let description = '';
  let patterns: string[] = [];
  let ruleType: RuleType = 'always';

  // Parse YAML frontmatter if supported
  if (config.hasYamlFrontmatter) {
    try {
      const parsed = matter(content);
      parsedContent = parsed.content;
      const frontmatter = parsed.data;

      if (frontmatter.description) {
        description = frontmatter.description;
      }

      if (frontmatter.globs) {
        patterns = Array.isArray(frontmatter.globs) ? frontmatter.globs : [frontmatter.globs];
        ruleType = 'auto-attached';
      }

      if (frontmatter.alwaysApply === true) {
        ruleType = 'always';
      }

      // Editor-specific frontmatter parsing
      switch (editor) {
        case 'windsurf':
          if (frontmatter.filesToApplyRule) {
            patterns = [frontmatter.filesToApplyRule];
            ruleType = 'glob-pattern';
          }
          break;
        case 'qoder':
          if (frontmatter.trigger) {
            switch (frontmatter.trigger) {
              case 'manual':
                ruleType = 'manual';
                break;
              case 'model_decision':
                ruleType = 'model-decision';
                break;
              case 'always_on':
                ruleType = 'always';
                break;
              case 'glob':
                ruleType = 'glob-pattern';
                break;
            }
          }
          if (frontmatter.glob) {
            patterns = typeof frontmatter.glob === 'string' 
              ? [frontmatter.glob]
              : frontmatter.glob;
          }
          break;
      }
    } catch (error) {
      console.warn(`Warning: Could not parse frontmatter in ${filePath}`);
    }
  }

  // Editor-specific parsing logic
  switch (editor) {
    case 'cursor':
      // .mdc files with frontmatter already handled above
      break;
      
    case 'cline':
      // Simple markdown, look for title
      const titleMatch = parsedContent.match(/^#\s+(.+)$/m);
      if (titleMatch && titleMatch[1] && !description) {
        description = titleMatch[1];
      }
      break;
      
    case 'codex':
      if (filePath.includes('AGENTS.md')) {
        description = 'Project Agent Rules';
      }
      break;
      
    case 'claude-code':
      if (filePath.includes('CLAUDE.md')) {
        description = 'Claude Code Instructions';
      }
      break;
      
    case 'qoder':
      // Natural language text files
      if (content.includes('*.') || content.includes('src/')) {
        ruleType = 'specific-files';
        // Extract file patterns from content
        const patternMatches = content.match(/\*\.[a-zA-Z]+|\*\*\/\*\.[a-zA-Z]+|src\/\*+/g);
        if (patternMatches) {
          patterns = patternMatches;
        }
      }
      break;
  }

  return {
    name,
    description,
    content: parsedContent.trim(),
    type: ruleType,
    ...(patterns.length > 0 && { patterns }),
    source: editor,
    metadata: {
      filePath,
      size: content.length
    }
  };
}