# CrossRule

A command-line tool for converting AI code editor rules between different formats. Work seamlessly across Cursor, Windsurf, Cline, VSCode, and other AI-powered development environments without losing your carefully crafted coding guidelines.

[![npm version](https://badge.fury.io/js/crossrule.svg)](https://www.npmjs.com/package/crossrule)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

You've spent time crafting the perfect coding rules for Cursor, but now you want to try Windsurf. Or maybe your team uses different AI editors, and you need to share consistent guidelines across tools. Manually converting and maintaining rules across multiple editors is tedious and error-prone.

## The Solution

CrossRule automatically detects existing AI editor rules in your project and converts them to any other supported format. Your TypeScript conventions, React patterns, and testing requirements can follow you wherever you code.

## Supported Editors

CrossRule works with 9 major AI code editors:

- **Cursor** - `.mdc` files in `.cursor/rules/`
- **Windsurf** - Markdown files in `.windsurf/rules/`  
- **Cline** - Markdown files in `.clinerules/`
- **VSCode** - Instructions and prompts for AI extensions
- **Codex CLI** - `AGENTS.md` project rules
- **Claude Code** - `CLAUDE.md` guidance files
- **Qoder** - Natural language rules with trigger conditions
- **Trae** - Markdown rules with YAML frontmatter
- **QwenCoder** - `QWEN.md` context files

## Installation

Install CrossRule globally to use it in any project:

```bash
npm install -g crossrule
```

Or run it directly without installing using npx:

```bash
npx crossrule init
```

Verify the installation:

```bash
crossrule --version
# Should output: 1.0.0
```

## Quick Start

Navigate to your project directory and run:

```bash
crossrule init
```

CrossRule will:
1. Scan your project for existing AI editor rules
2. Show you what it found and let you choose a source
3. Present an interactive list of target editors
4. Convert your rules while preserving their meaning and structure

## Example Workflow

```bash
$ cd my-typescript-project
$ crossrule init

= CrossRule Init - Detecting existing rules...

 Found existing rules:

=� Cursor:
   Location: .cursor/rules
   Rules: 3 files

Using rules from Cursor as source.
Found 3 rules at: .cursor/rules

=� Select target editors to generate rules for:

o� Windsurf
 � Cline  
 � Claude Code
 � Qoder

 Conversion completed successfully!

Converted: 3 files
Output files:
  " .windsurf/rules/typescript.md
  " .windsurf/rules/react.md
  " .windsurf/rules/testing.md
```

## How It Works

### Smart Detection
CrossRule understands the unique file structures and formats of each AI editor. It correctly parses YAML frontmatter, section delimiters, and trigger conditions to extract the semantic meaning of your rules.

### Semantic Preservation
When converting between formats, CrossRule maintains the intent of your rules:

- Always-active rules remain always-active
- File pattern rules are converted to equivalent glob patterns
- Manual trigger rules preserve their conditional nature
- Descriptions and metadata are carried forward appropriately

### Format-Specific Output
Each editor has its own conventions:

- **Cursor**: YAML frontmatter with `alwaysApply` and `globs` fields
- **Qoder**: Trigger-based frontmatter (`always_on`, `glob`, `manual`, `model_decision`)
- **Codex CLI**: Section delimiters like `---- section-name ----`
- **Claude Code**: Standard markdown with proper heading hierarchy

## Rule Types

CrossRule recognizes and converts between different rule activation patterns:

- **Always Active**: Applied to all conversations and code
- **Pattern-Based**: Triggered when working with specific file types
- **Manual**: Invoked explicitly by name or command
- **AI-Decided**: Applied when the AI determines relevance

## Advanced Usage

### Converting Specific Formats

If you know exactly what you want to convert:

```bash
crossrule convert --from cursor --to windsurf
crossrule convert --from qoder --to "claude-code"
```

### Batch Conversion

Convert to multiple formats at once:

```bash
crossrule convert --from cursor --to windsurf,cline,qoder
```

### Custom Output Paths

Specify where converted files should be saved:

```bash
crossrule convert --from cursor --to windsurf --output ./my-rules/
```

## Configuration Files

CrossRule looks for rules in these locations:

```
# Single-file formats
AGENTS.md          # Codex CLI
CLAUDE.md          # Claude Code  
QWEN.md            # QwenCoder

# Directory-based formats
.cursor/rules/     # Cursor .mdc files
.windsurf/rules/   # Windsurf markdown
.clinerules/       # Cline markdown
.qoder/rules/      # Qoder trigger-based rules
.trae/rules/       # Trae multilingual rules
```

## Project Integration

Add CrossRule to your development workflow:

### Package.json Scripts
```json
{
  "scripts": {
    "rules:sync": "crossrule init",
    "rules:cursor": "crossrule convert --from claude-code --to cursor",
    "rules:windsurf": "crossrule convert --from claude-code --to windsurf"
  }
}
```

### Team Onboarding
New team members can quickly set up their preferred AI editor:

```bash
git clone your-project
cd your-project  
crossrule init  # Convert existing rules to their preferred editor
```

## Rule Format Examples

### Cursor (.mdc with frontmatter)
```markdown
---
description: TypeScript coding standards
alwaysApply: true
---

# TypeScript Rules
- Use strict mode configuration
- Prefer interfaces over type aliases
```

### Qoder (trigger-based)
```markdown
---
trigger: always_on
alwaysApply: true
description: Global coding standards
---

# Always Active Rules
- Write self-documenting code
- Use meaningful variable names
```

### Codex CLI (section delimiters)
```markdown
# Project Agent Rules

---- typescript ----

- Use strict TypeScript configuration
- Always provide return types

---- testing ----  

- Write comprehensive unit tests
- Use Jest framework
```

## Contributing

CrossRule is open source and welcomes contributions:

1. **Bug Reports**: Found an issue with rule conversion? Please report it with sample files.

2. **New Editor Support**: Want to add support for another AI editor? Check out the parser and converter architecture in the source code.

3. **Rule Format Improvements**: Each AI editor evolves their rule formats. Help us keep up with the latest specifications.

4. **Documentation**: Improve examples, add use cases, or clarify installation instructions.

## Development

```bash
git clone https://github.com/your-username/crossrule
cd crossrule
npm install
npm run build
npm run dev  # Test the CLI locally
```

### Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests only  
npm run test:integration # Integration tests only
npm run test:coverage    # Coverage report
```

## Troubleshooting

### Rules Not Detected
- Ensure you're in the project root directory
- Check that rule files exist in the expected locations
- Verify file formats match the editor's specifications

### Conversion Issues  
- Some advanced features may not translate perfectly between editors
- Check the output files and adjust manually if needed
- Report conversion bugs with sample input files

### Permissions
- Ensure CrossRule has write permissions in the target directories
- Some editors may require specific file permissions or ownership

## License

MIT License. See LICENSE file for details.

## Acknowledgments

CrossRule was built to solve a real workflow problem in the AI-assisted coding era. Thanks to the teams behind all the supported AI editors for creating tools that enhance developer productivity.

The project maintains compatibility with the latest rule format specifications from each editor. As these tools evolve, CrossRule evolves with them.

---

**Made for developers who love consistency across their AI coding tools.**