---
trigger: always_on
alwaysApply: true
description: Rules that apply to all code regardless of file type
---

# Always Active Development Rules

## Code Quality Standards
- Write self-documenting code with clear variable and function names
- Follow consistent indentation and formatting throughout the project
- Remove commented-out code and unused imports before committing
- Use meaningful commit messages that explain the "why" not just the "what"

## Security Practices
- Never commit sensitive information like API keys or passwords
- Validate all user inputs and sanitize data before processing
- Use environment variables for configuration values
- Implement proper authentication and authorization for API endpoints

## Performance Guidelines
- Optimize for readability first, performance second, unless performance is critical
- Profile code performance before implementing complex optimizations
- Use appropriate data structures and algorithms for the task at hand
- Monitor memory usage and prevent memory leaks in long-running applications