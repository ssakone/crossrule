// Core types for AI editor rule formats conversion

export interface Rule {
  name: string;
  description?: string;
  content: string;
  type: RuleType;
  patterns?: string[]; // File patterns for auto-attachment
  metadata?: Record<string, unknown>;
  source: EditorType;
}

export interface RuleSet {
  rules: Rule[];
  editor: EditorType;
  location: string;
  metadata?: Record<string, unknown>;
}

export interface DetectionResult {
  editor: EditorType;
  rules: Rule[];
  location: string;
  ruleCount: number;
}

// Universal Rule Management System
export interface UniversalRule {
  id: string;
  name: string;
  type: UniversalRuleType;
  content: string;              // Supports multi-line content
  patterns?: string[];          // File patterns for pattern-based rules
  context?: string;             // Context for AI-decision rules
  description?: string;         // Human-readable description
  formatting?: {
    preserveMarkdown: boolean;  // Keep markdown structure
    preserveLineBreaks: boolean; // Maintain line breaks
    indentationStyle: 'spaces' | 'tabs';
    indentationSize: number;
  };
  metadata: {
    created: Date;
    updated: Date;
    author?: string;
    version: number;
    contentHash: string;        // For detecting changes
    lineCount: number;          // Track complexity
  };
  targetEditors: EditorType[];  // Which editors to sync to
}

export interface AddRuleOptions {
  name?: string;                // Auto-generated if not provided
  type: UniversalRuleType;
  content?: string;             // Can be provided via stdin or file
  patterns?: string[];
  context?: string;
  description?: string;
  targetEditors: EditorType[] | 'all';
  fromFile?: string;            // Read content from file
  preserveMarkdown?: boolean;
  author?: string;
}

export interface AddRuleResult {
  success: boolean;
  rule?: UniversalRule;
  outputFiles: string[];       // Files created/modified
  errors: string[];
  warnings: string[];
}

export type EditorType = 
  | 'cursor'
  | 'windsurf'
  | 'cline'
  | 'vscode'
  | 'codex'
  | 'claude-code'
  | 'qoder'
  | 'trae'
  | 'qwencoder';

export type RuleType = 
  | 'always'           // Always included
  | 'auto-attached'    // Auto-attached based on patterns
  | 'agent-requested'  // AI decides when to include
  | 'manual'           // Manual invocation only
  | 'model-decision'   // Model decides when to apply
  | 'glob-pattern'     // Pattern-based activation
  | 'specific-files';  // File-specific rules

// Universal rule system types
export type UniversalRuleType = 
  | 'always'           // Always apply everywhere
  | 'pattern'          // Pattern-based (file/project specific)  
  | 'manual'           // Manual trigger
  | 'ai-decision';     // AI-decided based on context

export interface EditorConfig {
  name: string;
  displayName: string;
  fileFormats: string[];
  locations: string[];
  legacyLocations?: string[];
  supportedRuleTypes: RuleType[];
  hasGlobSupport: boolean;
  hasYamlFrontmatter: boolean;
  maxFileSize?: number;
  maxTotalSize?: number;
}

export interface ConversionOptions {
  sourceEditor: EditorType;
  targetEditor: EditorType;
  preserveMetadata: boolean;
  createBackup: boolean;
  outputPath?: string;
}

export interface ConversionResult {
  success: boolean;
  converted: number;
  skipped: number;
  errors: string[];
  outputFiles: string[];
}

// Editor-specific rule formats
export interface CursorRule extends Rule {
  frontmatter?: {
    description?: string;
    globs?: string[];
    alwaysApply?: boolean;
  };
}

export interface WindsurfRule extends Rule {
  frontmatter?: {
    description?: string;
    globs?: string;
    filesToApplyRule?: string;
    alwaysApply?: boolean;
  };
  characterLimit: number;
}

export interface ClineRule extends Rule {
  scope: 'global' | 'workspace';
  isEditable: boolean;
}

export interface ClaudeCodeRule extends Rule {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  hooks?: Record<string, unknown>;
}

export interface QoderRule extends Rule {
  wildcardPatterns?: string[];
  characterLimit: number;
}

export interface TraeRule extends Rule {
  frontmatter?: {
    description?: string;
    globs?: string;
    alwaysApply?: boolean;
  };
  language?: string;
}

export interface QwenCoderRule extends Rule {
  contextType: 'markdown' | 'mcp' | 'settings';
  mcpConfig?: Record<string, unknown>;
}