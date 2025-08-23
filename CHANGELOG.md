# Changelog

All notable changes to CrossRule will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-01-20

### Added
- **Universal Rule Management System** - Revolutionary `crossrule add` command for adding rules across all AI editors
- **Multi-line Rule Support** - Handle complex markdown rules with proper formatting preservation
- **Smart Rule Type System** - Support for always, pattern-based, manual, and AI-decision rules
- **Cross-Editor Conversion** - Intelligent conversion that respects each editor's unique format requirements
- **Interactive CLI Experience** - Rich preview, confirmation flows, and user-friendly prompts
- **Comprehensive Documentation** - Added `docs/next_steps.md` with roadmap for advanced features

### New Commands
- `crossrule add` - Add new rules to specified AI editors with multiple input methods:
  - Direct content: `crossrule add "Rule content" --type always --to all`
  - From file: `crossrule add --from-file rules.md --type pattern --patterns "*.tsx"`
  - Interactive editor for complex multi-line rules

### New Rule Types
- **Always Apply Rules**: Active across all conversations (`--type always`)
- **Pattern-Based Rules**: Triggered by file patterns (`--type pattern --patterns "*.tsx,*.jsx"`)
- **Manual Trigger Rules**: Invoked on demand (`--type manual`)
- **AI-Decision Rules**: Context-aware activation (`--type ai-decision --context "performance"`)

### Editor Format Support
Enhanced conversion logic for all 9 supported editors:
- **Cursor**: YAML frontmatter with `alwaysApply` and `globs` fields
- **Qoder**: Trigger-based frontmatter (`always_on`, `glob`, `manual`, `model_decision`)
- **Codex CLI**: Section delimiters in `AGENTS.md`
- **Claude Code**: Contextual markdown appended to `CLAUDE.md`
- **QwenCoder**: Section delimiters in `QWEN.md`
- **Windsurf, Cline, Trae, VSCode**: Directory-based markdown files

### Technical Improvements
- **UniversalRule Type System** - Comprehensive TypeScript interfaces for rule management
- **Content Processing** - Advanced multi-line content handling with format preservation
- **File Organization** - Automatic directory creation and intelligent file naming
- **Error Handling** - Comprehensive validation and user-friendly error messages

### Enhanced CLI Experience
- Reduced emoji usage for professional appearance
- Improved conversational flow and messaging
- Better progress indicators and status feedback
- Smart rule name auto-generation from content
- Rich preview system with content truncation

## [1.0.0] - 2025-01-17

### Added
- **Initial Release** - CrossRule CLI tool for converting AI editor rules between formats
- **Rule Detection** - Automatic discovery of existing rules across 9 AI editors
- **Interactive Conversion** - User-friendly rule conversion with preview and confirmation
- **Multi-Editor Support** - Support for Cursor, Windsurf, Cline, VSCode, Codex CLI, Claude Code, Qoder, Trae, QwenCoder

### Commands
- `crossrule init` - Detect and convert existing rules between AI editors
- `crossrule --version` - Display version information

### Core Features
- **Smart Detection**: Understands unique file structures and formats of each AI editor
- **Semantic Preservation**: Maintains rule intent across format conversions
- **Format-Specific Output**: Respects each editor's conventions and requirements
- **Interactive Interface**: Keyboard navigation and user-friendly prompts

### Supported Editors
- **Cursor** - `.mdc` files in `.cursor/rules/`
- **Windsurf** - Markdown files in `.windsurf/rules/`
- **Cline** - Markdown files in `.clinerules/`
- **VSCode** - Instructions and prompts for AI extensions
- **Codex CLI** - `AGENTS.md` project rules
- **Claude Code** - `CLAUDE.md` guidance files
- **Qoder** - Natural language rules with trigger conditions
- **Trae** - Markdown rules with YAML frontmatter
- **QwenCoder** - `QWEN.md` context files

### Installation
- **npm Global Install**: `npm install -g crossrule`
- **npx Usage**: `npx crossrule init`
- **Binary Distribution**: Published to npm registry

---

## Upcoming Features (Roadmap)

### [1.1.0] - Live Rule Synchronization
- `crossrule sync --watch` - Real-time rule synchronization
- File system watchers and change detection
- Conflict resolution system

### [1.2.0] - Advanced Rule Management
- `crossrule list` - View all rules across editors
- `crossrule update` - Modify existing rules
- `crossrule remove` - Delete rules from specific editors

### [1.3.0] - Team Collaboration
- `crossrule export` - Share rule sets
- `crossrule import` - Import team standards
- `crossrule templates` - Pre-built rule libraries

### [2.0.0] - Rule DevOps Platform
- Rule analytics and insights
- Team adoption tracking
- Advanced conflict resolution
- Git integration and hooks