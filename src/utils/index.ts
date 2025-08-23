import { EditorType, EditorConfig } from '../types/index.js';

export const EDITOR_CONFIGS: Record<EditorType, EditorConfig> = {
  cursor: {
    name: 'cursor',
    displayName: 'Cursor',
    fileFormats: ['.mdc'],
    locations: ['.cursor/rules/'],
    legacyLocations: ['.cursorrules'],
    supportedRuleTypes: ['always', 'auto-attached', 'agent-requested', 'manual'],
    hasGlobSupport: true,
    hasYamlFrontmatter: true,
    maxFileSize: 500 * 80 // ~500 lines
  },
  windsurf: {
    name: 'windsurf',
    displayName: 'Windsurf',
    fileFormats: ['.md'],
    locations: ['.windsurf/rules/'],
    legacyLocations: ['.windsurfrules'],
    supportedRuleTypes: ['manual', 'model-decision', 'glob-pattern', 'always'],
    hasGlobSupport: true,
    hasYamlFrontmatter: true,
    maxFileSize: 12000,
    maxTotalSize: 12000
  },
  cline: {
    name: 'cline',
    displayName: 'Cline',
    fileFormats: ['.md'],
    locations: ['.clinerules/', '.clinerules'],
    supportedRuleTypes: ['always', 'manual'],
    hasGlobSupport: false,
    hasYamlFrontmatter: false
  },
  vscode: {
    name: 'vscode',
    displayName: 'VSCode',
    fileFormats: ['.md', '.json'],
    locations: ['.github/instructions/', '.github/prompts/', 'src/*/instructions/'],
    supportedRuleTypes: ['glob-pattern', 'always'],
    hasGlobSupport: true,
    hasYamlFrontmatter: true
  },
  codex: {
    name: 'codex',
    displayName: 'Codex CLI',
    fileFormats: ['.md'],
    locations: ['AGENTS.md'],
    supportedRuleTypes: ['always'],
    hasGlobSupport: false,
    hasYamlFrontmatter: false
  },
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    fileFormats: ['.md'],
    locations: ['CLAUDE.md'],
    supportedRuleTypes: ['always', 'manual'],
    hasGlobSupport: false,
    hasYamlFrontmatter: false
  },
  qoder: {
    name: 'qoder',
    displayName: 'Qoder',
    fileFormats: ['.md'],
    locations: ['.qoder/rules/'],
    supportedRuleTypes: ['manual', 'model-decision', 'always', 'specific-files'],
    hasGlobSupport: true,
    hasYamlFrontmatter: true,
    maxTotalSize: 100000
  },
  trae: {
    name: 'trae',
    displayName: 'Trae',
    fileFormats: ['.md'],
    locations: ['.trae/rules/'],
    legacyLocations: ['.cursorrules'],
    supportedRuleTypes: ['always', 'glob-pattern', 'manual'],
    hasGlobSupport: true,
    hasYamlFrontmatter: true
  },
  qwencoder: {
    name: 'qwencoder',
    displayName: 'QwenCoder',
    fileFormats: ['.md'],
    locations: ['QWEN.md'],
    supportedRuleTypes: ['always'],
    hasGlobSupport: false,
    hasYamlFrontmatter: false
  }
};

export function getEditorDisplayNames(): string[] {
  return Object.values(EDITOR_CONFIGS).map(config => config.displayName);
}

export function getEditorByDisplayName(displayName: string): EditorType | null {
  const entry = Object.entries(EDITOR_CONFIGS).find(
    ([, config]) => config.displayName === displayName
  );
  return entry ? entry[0] as EditorType : null;
}