# AI Code Editor Rule Formats: Complete Technical Specification

This comprehensive research documents the exact rule/configuration specifications for 9 major AI code editors and assistants, providing the technical foundation needed to build a CLI tool for converting rules between different editors.

## Executive Summary

The AI code editor ecosystem has evolved diverse approaches to rule configuration, ranging from simple text files to sophisticated hierarchical systems with pattern matching and context injection. **Most modern tools favor Markdown-based rule formats with YAML frontmatter**, though file locations, naming conventions, and feature sets vary significantly. The research reveals three primary architectural patterns: **file-based rules** (Cursor, Windsurf, Cline), **JSON configuration systems** (Claude Code, Codex CLI), and **hybrid approaches** combining multiple formats (VSCode extensions, QwenCoder).

Key findings include standardization around `.md` file formats, growing adoption of glob pattern matching for file-specific rules, and increasing integration with Model Context Protocol (MCP) servers for advanced functionality. All systems support version control integration, with most storing rules in project-specific directories that can be shared across teams.

## Configuration Format Overview

| Tool | Primary Format | File Location | Legacy Support | Pattern Matching | Rule Types |
|------|----------------|---------------|----------------|------------------|------------|
| **Cursor** | `.mdc` (Markdown + YAML) | `.cursor/rules/` | `.cursorrules` | Glob patterns | 4 types |
| **Windsurf** | `.md` (Markdown) | `.windsurf/rules/` | `.windsurfrules` | Glob patterns | 4 activation modes |
| **Cline** | `.md` (Markdown) | `.clinerules` or `.clinerules/` | N/A | N/A | Global + Workspace |
| **Codex CLI** | `AGENTS.md` + `config.toml` | `~/.codex/` + project root | N/A | N/A | Hierarchical discovery |
| **Claude Code** | `settings.json` + `CLAUDE.md` | `~/.claude/` + `.claude/` | N/A | Permission patterns | Multiple scopes |
| **Qoder** | Natural language text | `.qoder/rules/` | N/A | File wildcards | 4 rule types |
| **VSCode** | Mixed formats | Multiple locations | Various | Extension-specific | Per-extension |
| **Trae** | `.md` (Markdown) | `.trae/rules/` | `.cursorrules` | Glob patterns | 3 types |
| **QwenCoder** | `settings.json` + `.md` | `~/.qwen/` + `.qwen/` | N/A | N/A | Context + MCP |

## Detailed Technical Specifications

### 1. Cursor (.cursor/rules format)

**File Format**: `.mdc` (Markdown Cursor) files with YAML frontmatter
**Location**: `.cursor/rules/` directory within project
**Legacy**: `.cursorrules` (plain text, deprecated)

**Schema Structure**:
```yaml
---
description: "Optional description for Agent Requested rules"
globs: ["optional/glob/pattern/**", "*.py"]  # For Auto Attached rules
alwaysApply: false  # True for Always rules
---

# Rule Content Starts Here
- Use this specific library/pattern
- Follow these coding conventions
- Include examples and templates

@referenced-file.ts  # Include external files as context
```

**Rule Types**:
- **Always**: Always included in model context
- **Auto Attached**: Included when files matching glob patterns are referenced
- **Agent Requested**: AI decides whether to include based on description
- **Manual**: Only included when explicitly mentioned using @ruleName

**File Discovery**: Hierarchical structure with subdirectories inheriting parent rules
**Performance**: Keep rules under 500 lines for optimal performance

### 2. Windsurf (rule format and configuration)

**File Format**: Markdown files with optional metadata
**Location**: `.windsurf/rules/` directory (modern), `.windsurfrules` (legacy)

**Schema Structure**:
```markdown
---
description: Guide for specific functionality
globs: **/*.ts,**/*.js
filesToApplyRule: src/**/*
alwaysApply: true
---

# Rule Content
- Technical specifications
- Code style guidelines
- Framework preferences
```

**Character Limits**: 6,000-12,000 characters per file, 12,000 total combined
**Activation Modes**:
- **Manual**: `@rule-name` invocation
- **Model Decision**: AI determines when to apply based on description
- **Glob Pattern**: Automatic application on matching files
- **Always Apply**: Applied to all conversations

**Advanced Features**: XML tags for rule grouping, self-reporting rules

### 3. Cline (formerly Claude Dev)

**File Format**: Markdown files
**Location**: `.clinerules` (single file) or `.clinerules/` (directory)

**Configuration Locations**:
- **Global**: `~/Documents/Cline/Rules` (OS-specific)
- **Workspace**: `.clinerules` or `.clinerules/` in project root

**Schema Structure**:
```markdown
# Rule Title
Description of what this rule does

## Specific Instructions
- Bullet points with specific behaviors
- Code formatting preferences
- Documentation requirements
- Testing standards

## Context
Additional context about when to apply this rule
```

**Advanced Features**:
- AI-editable rules (Cline can modify its own rules)
- Toggleable rules via UI popover
- Rules bank system for organizing inactive rules
- Community prompts repository integration

### 4. VSCode (with AI extensions)

**Multiple Configuration Approaches**:

**GitHub Copilot**:
- **Settings**: `settings.json` configurations
- **Instructions**: `.instructions.md` files with YAML frontmatter
- **Prompts**: `.prompt.md` files for agent mode
- **Location**: `.github/instructions/`, `.github/prompts/`

**Example Instruction File**:
```markdown
---
description: "TypeScript and React coding guidelines"
applyTo: "**/*.ts,**/*.tsx"
---

# Project coding standards for TypeScript and React
Apply the [general coding guidelines](./general-coding.instructions.md) to all code.

## TypeScript Guidelines
- Use TypeScript for all new code
- Follow functional programming principles where possible
```

**Settings.json Configuration**:
```json
{
  "github.copilot.chat.codeGeneration.useInstructionFiles": true,
  "chat.instructionsFilesLocations": {
    ".github/instructions": true,
    "src/frontend/instructions": true
  }
}
```

**Other Extensions**:
- **Continue**: JSON schema-based configuration
- **Amazon CodeWhisperer**: AWS Toolkit extension settings
- **AI Toolkit**: Model configurations and settings

### 5. Codex CLI (OpenAI)

**File Format**: TOML configuration + Markdown rules
**Location**: `~/.codex/config.toml` + project `AGENTS.md`
**Shared Standard**: `AGENTS.md` is recognized by Codex CLI, OpenCode, VSCode Agents, and other tools documented at https://agents.md

**Config Structure**:
```toml
model = "o4-mini"
model_provider = "openai"
preferred_auth_method = "chatgpt"
approval_policy = "untrusted"
sandbox_mode = "read-only"
model_reasoning_effort = "medium"

[profiles.o3]
model = "o3"
model_provider = "openai"
approval_policy = "never"
model_reasoning_effort = "high"

[mcp_servers.server-name]
command = "npx"
args = ["-y", "mcp-server"]
env = { "API_KEY" = "value" }
```

**AGENTS.md Structure**:
```markdown
# Project Agent Rules

## Project Structure
- `/src`: Source code directory
- `/components`: React components

## Coding Conventions
### General Rules
- Use TypeScript for all new code
- Follow existing code style in each file

## Testing Requirements
Run tests with these commands:
```bash
npm test
npm test -- --coverage
```
```

**Rule Discovery Order**:
1. `~/.codex/AGENTS.md` - Personal global guidance
2. `AGENTS.md` at repository root - Shared project rules
3. `AGENTS.md` in current working directory - Sub-folder specific rules

### 6. Claude Code (Anthropic CLI)

**File Format**: JSON configuration + Markdown memory
**Location**: `~/.claude/settings.json` + `.claude/settings.json` + `CLAUDE.md`

**Settings Schema**:
```json
{
  "apiKeyHelper": "/path/to/key/script.sh",
  "model": "claude-4-sonnet-20250514",
  "permissions": {
    "allow": ["Bash(git:*)", "Read", "Write"],
    "deny": ["Read(./.env)", "WebFetch"],
    "defaultMode": "acceptEdits"
  },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Running command...' >> ~/.claude/bash-log.txt"
          }
        ]
      }
    ]
  }
}
```

**Permission Patterns**:
- `Bash(git:*)` - Allow all git commands
- `Read(./src/**)` - Allow reading source files
- `Write(./dist/**)` - Allow writing to dist folder

**Hook System**: PreToolUse, PostToolUse, Notification, Stop, SubagentStop events

**MCP Integration**:
```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### 7. Qoder (rule format and structure)

**File Format**: Natural language text files
**Location**: `.qoder/rules` directory
**Character Limit**: 100,000 total characters across all active rule files

**Rule Types**:
- **Apply Manually**: Invoked via #rule in chat
- **Model Decision**: AI evaluates description and decides when to apply
- **Always Apply**: Applies to all AI Chat and Inline Chat requests
- **Specific Files**: Applies to files matching wildcard patterns

**Pattern Examples**:
- `*.md` - All Markdown files
- `src/*.java` - All Java files in src directory
- `src/**/*.ts` - All TypeScript files in src and subdirectories

**Configuration Access**: User icon → Qoder Settings → Rules
**Best Practices**: Be concise, structure clearly, include examples, iterate and optimize

### 8. Trae (rule specifications)

**File Format**: Markdown with YAML frontmatter
**Location**: `.trae/rules/` directory, `user_rules.md` (global)

**Schema Structure**:
```markdown
---
description: web 项目规则
globs: 
alwaysApply: true
---

### 📋 WEB 项目开发规则

#### 🔧 通用开发规则
1. **代码质量**
   * 保持代码简洁、可读性强
   * 添加必要的注释和文档
```

**Rule Types**:
- **Personal/User Rules**: Global across all projects
- **Project Rules**: Project-specific guidelines
- **Agent Rules**: Custom instructions for specific Agents (v1.3.0+)

**Rule Invocation**: `#rulename` syntax with tab completion
**MCP Integration**: Version 1.3.0+ supports Model Context Protocol
**Multi-language Support**: Rules can be written in multiple languages

### 9. QwenCoder (rule format and configuration)

**Multiple Configuration Approaches**:

**Primary Config**: `settings.json` (JSON format)
```json
{
  "theme": "Default",
  "selectedAuthType": "openai",
  "apiKey": "your-api-key",
  "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
  "modelName": "qwen3-coder-plus"
}
```

**Context Files**: `.qwen/QWEN.md`, `CLAUDE.md`, `GEMINI.md` (compatibility)
```markdown
# Project Context Rules

## Coding Standards
- Use TypeScript for all new components
- Follow ESLint configuration
- Include unit tests for all public APIs

## Architecture Guidelines  
- Use dependency injection patterns
- Implement proper error handling
- Follow REST API conventions
```

**MCP Configuration**:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"],
      "timeout": 30000
    }
  }
}
```

**Configuration Hierarchy**:
1. System-level: `/etc/gemini-cli/settings.json` (Linux)
2. User-level: `~/.qwen/settings.json`
3. Project-level: `.qwen/settings.json`

## Implementation Considerations for Rule Conversion

### Format Commonalities
- **Markdown Dominance**: 7/9 tools use Markdown as primary format
- **YAML Frontmatter**: Common pattern for metadata (Cursor, Windsurf, Trae)
- **Glob Patterns**: Widely supported for file-specific rules
- **Hierarchical Discovery**: Most tools search parent directories

### Conversion Challenges
1. **Semantic Mapping**: Different rule types don't always have direct equivalents
2. **Pattern Syntax**: Glob patterns vary between tools
3. **Metadata Loss**: Rich metadata may not transfer between formats
4. **File Organization**: Different directory structures and naming conventions
5. **Advanced Features**: Hooks, MCP integration, and tool-specific features

### Recommended Conversion Strategy
1. **Create Abstract Rule Model**: Define common rule properties (name, description, content, patterns, type)
2. **Implement Format Parsers**: Each tool needs custom parsing logic
3. **Semantic Type Mapping**: Map rule types between tools with fallback options
4. **Pattern Translation**: Convert glob patterns to target tool syntax
5. **Metadata Preservation**: Store tool-specific metadata in comments or separate files
6. **Validation System**: Verify converted rules meet target tool requirements

This comprehensive specification provides the technical foundation needed to build a robust CLI tool for converting AI editor rules between different formats while preserving as much functionality and semantic meaning as possible.
