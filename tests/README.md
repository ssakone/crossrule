# Test Organization

This directory contains all tests for the CrossRule CLI project.

## Structure

```
tests/
├── unit/                 # Unit tests for individual modules
│   ├── parsers.test.ts  # Rule detection and parsing tests
│   ├── converters.test.ts # Rule conversion logic tests
│   ├── utils.test.ts    # Utility function tests
│   └── types.test.ts    # Type validation tests
├── integration/         # Integration tests for full workflows
│   ├── cli.test.ts      # CLI command integration tests
│   ├── full-conversion.test.ts # End-to-end conversion tests
│   └── multi-editor.test.ts    # Multi-editor detection tests
└── fixtures/            # Test data and mock files
    ├── cursor-rules/    # Sample Cursor .mdc files
    ├── qoder-rules/     # Sample Qoder .md files
    ├── agents.md        # Sample Codex CLI file
    ├── claude.md        # Sample Claude Code file
    └── qwen.md          # Sample QwenCoder file

## Test Commands

```bash
npm test              # Run all tests
npm run test:unit     # Run only unit tests
npm run test:integration # Run only integration tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Test Categories

### Unit Tests
- **parsers.test.ts**: Tests rule detection across all 9 editors
- **converters.test.ts**: Tests conversion logic between formats
- **utils.test.ts**: Tests editor configurations and utilities
- **types.test.ts**: Tests TypeScript type definitions

### Integration Tests
- **cli.test.ts**: Tests CLI interface and user interactions
- **full-conversion.test.ts**: Tests complete conversion workflows
- **multi-editor.test.ts**: Tests projects with multiple rule sources

### Test Fixtures
Organized sample files for each editor format to ensure consistent testing:
- Cursor: `.mdc` files with various frontmatter configurations
- Windsurf: `.md` files with Windsurf-specific metadata  
- Qoder: `.md` files with different trigger types
- Single-file formats: Complete example files for AGENTS.md, CLAUDE.md, QWEN.md

## Testing Philosophy

1. **Unit tests** focus on individual functions and modules
2. **Integration tests** verify complete workflows work end-to-end
3. **Fixtures** provide realistic sample data for consistent testing
4. **Coverage** aims for >80% code coverage on critical paths

## Running Tests

Tests use Jest with TypeScript support and ES modules configuration. The test suite verifies:

- Rule detection accuracy across all editor formats
- Conversion logic preserves semantic meaning
- CLI interface handles user interactions correctly
- Error conditions are handled gracefully
- File I/O operations work reliably

## Adding New Tests

When adding tests:
1. Place unit tests in `tests/unit/` 
2. Place integration tests in `tests/integration/`
3. Add new fixtures to `tests/fixtures/` as needed
4. Follow existing naming conventions
5. Include both positive and negative test cases