---
trigger: glob
glob: "**/*.ts,**/*.tsx"
description: Rules specific to TypeScript and TSX files
---

# TypeScript File Specific Rules

## Type Safety
- Enable strict mode in tsconfig.json and fix all resulting type errors
- Use proper type guards when working with union types or unknown data
- Implement comprehensive type definitions for all external APIs and libraries
- Avoid using `any` type; use `unknown` or proper type definitions instead

## Module System
- Use ES6 imports and exports consistently throughout the codebase
- Implement proper barrel exports in index files for clean import paths
- Avoid default exports for better refactoring and IDE support
- Use path mapping in tsconfig.json for clean internal imports

## Error Handling
- Use custom error classes that extend the built-in Error class
- Implement proper error boundaries and error handling strategies
- Type error responses from APIs and external services
- Use Result/Either patterns for functions that can fail