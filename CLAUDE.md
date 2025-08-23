# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rulehop is a Node.js CLI tool written in TypeScript that converts rule configurations between different AI code editors and assistants (Cursor, Windsurf, Cline, VSCode, Codex CLI, Claude Code, Qoder, Trae, QwenCoder).

## Commands

### Development Commands
```bash
# Development workflow (planned)
npm run dev          # Run CLI in development with tsx
npm run build        # Compile TypeScript to dist/
npm run watch        # Watch mode with nodemon
npm test            # Run Jest test suite
npm run lint        # ESLint code checking
npm run format      # Prettier code formatting
npm run clean       # Remove build artifacts
npm run release     # Semantic release automation

# Current available
npm test            # Currently outputs error - project in early development
```

### CLI Usage (when implemented)
```bash
rulehop convert --from cursor --to windsurf [path]
rulehop list-formats
rulehop validate [file]
```

## Architecture

The project follows a modular CLI architecture with TypeScript:

### Core Structure
- `src/cli.ts` - CLI entry point using Commander.js
- `src/commands/` - Command implementations (convert, list-formats, validate)
- `src/parsers/` - Format-specific parsers for each AI editor
- `src/converters/` - Conversion logic between formats
- `src/types/` - TypeScript interfaces for rules, configs, conversion options
- `src/utils/` - Shared utilities

### Supported AI Editor Formats
1. **Cursor**: `.mdc` files in `.cursor/rules/`
2. **Windsurf**: Markdown in `.windsurf/rules/`
3. **Cline**: Markdown in `.clinerules/`
4. **VSCode**: Multiple formats depending on AI extension
5. **Codex CLI**: TOML config + Markdown rules
6. **Claude Code**: JSON settings + Markdown memory
7. **Qoder**: Natural language text files
8. **Trae**: Markdown with YAML frontmatter
9. **QwenCoder**: JSON settings + Markdown context

### Key Dependencies
- **Commander.js** (14.0.0) - CLI framework
- **chalk** (5.6.0) - Terminal styling
- **inquirer** (12.9.3) - Interactive prompts
- **js-yaml** (4.1.0) - YAML parsing
- **gray-matter** (4.0.3) - Frontmatter parsing
- **fast-glob** (3.3.3) - File pattern matching

## Development Setup Requirements

### Missing Configuration Files
The project needs these configuration files to be implemented:
- `tsconfig.json` - TypeScript config (ES2020, NodeNext modules)
- `eslint.config.js` - ESLint with TypeScript rules
- `jest.config.js` - Jest with ts-jest for TypeScript testing
- `prettier.config.js` - Code formatting configuration

### TypeScript Configuration
Target: ES2020, Module: NodeNext, Strict mode enabled
Output directory: `dist/`

## Current Development State

**Status**: Early development phase - core files exist as empty placeholders
**Next Steps**: Implement configuration files, type definitions, and core functionality
**Architecture Pattern**: Command pattern for CLI, Strategy pattern for parsers, Adapter pattern for converters

## Technical Specification

Detailed requirements available in `spec.md` including:
- Rule format specifications for each AI editor
- Conversion logic requirements
- CLI interface specifications
- File structure mappings
- Validation requirements

## Development Guidelines

- Follow TypeScript strict mode
- Use semantic-release for versioning
- Implement comprehensive error handling for file I/O operations
- Support both interactive and non-interactive CLI modes
- Handle edge cases in rule format parsing and conversion
## api-validation

Always validate API input parameters
