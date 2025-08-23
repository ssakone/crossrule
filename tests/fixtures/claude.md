# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

CrossRule is a Node.js CLI tool written in TypeScript that converts AI editor rules between different formats.

## Development Guidelines

### Code Standards
- Use strict TypeScript configuration with all strict mode options enabled
- Follow existing code patterns and naming conventions
- Implement comprehensive error handling for file I/O operations
- Write meaningful commit messages using conventional commit format

### Testing Requirements
- Write unit tests for all utility functions and core logic
- Use Jest with TypeScript support for testing framework
- Maintain test coverage above 80% for critical code paths
- Include integration tests for CLI commands and workflows

### Architecture Patterns
- Command pattern for CLI command implementations
- Strategy pattern for different rule format parsers
- Adapter pattern for converting between rule formats
- Proper separation of concerns between parsing, conversion, and CLI layers

## File Structure

- `src/cli.ts` - CLI entry point using Commander.js
- `src/commands/` - Command implementations
- `src/parsers/` - Format-specific parsers for each AI editor
- `src/converters/` - Conversion logic between formats
- `src/types/` - TypeScript interfaces and type definitions
- `src/utils/` - Shared utilities and configurations