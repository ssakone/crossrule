# React Component Standards

## Structure & Organization
- Use functional components with hooks
- Export components as default exports
- Keep components under 200 lines

## TypeScript Integration
- Define prop interfaces in same file
- Use generic types for reusable components
- Never use 'any' - prefer 'unknown' or specific types

## Performance Optimization
- Wrap event handlers in useCallback
- Use useMemo for expensive calculations
- Implement React.memo for pure components