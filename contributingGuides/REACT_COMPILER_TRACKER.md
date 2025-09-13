# React Compiler Compliance Checker

## Overview

The React Compiler Compliance Checker is a comprehensive solution for monitoring and enforcing React Compiler compatibility across the Expensify codebase. It helps engineers understand when React Compiler will automatically optimize their components and when manual memoization is still needed.

## Problem Statement

When React Compiler is enabled, it automatically adds invisible `React.memo`, `useMemo`, and `useCallback` optimizations to compatible components. However, it's often unclear which components are being optimized and which aren't, making it difficult to decide when to add manual memoization.

## Solution

The React Compiler Compliance Checker provides:

1. **CI Enforcement**: Automatically checks that new components follow the Rules of React
2. **Local Development Tools**: Quick checks and optimization suggestions during development
3. **Tracking**: Persistent tracking of component compilation status over time
4. **Reporting**: Detailed reports on React Compiler compatibility

## Tools

### 1. React Compiler Compliance Checker (Main Tool)

The main tracking and CI tool that manages component compilation status.

#### Commands

```bash
# Run a full check of all components
npm run react-compiler-tracker full-check

# Check only changed files (used in CI)
npm run react-compiler-tracker check-changed

# Check a specific file
npm run react-compiler-tracker check-file src/components/MyComponent.tsx

# Show current tracker status
npm run react-compiler-tracker status

# Generate a detailed report
npm run react-compiler-tracker report
```

#### CI Integration

The tracker automatically runs in CI on pull requests and pushes to main. It will:

- ✅ Allow existing non-compilable components to remain unchanged
- ❌ Block new components that cannot be compiled by React Compiler
- 📊 Provide detailed feedback in PR comments

### 2. React Compiler Dev Tool (Development Helper)

A companion tool for local development that provides quick insights and suggestions.

#### Commands

```bash
# Quick check of current directory or specific file
npm run react-compiler-dev-tool quick-check [file]

# Analyze a directory for compiler compatibility
npm run react-compiler-dev-tool analyze [directory]

# Get optimization suggestions for a specific file
npm run react-compiler-dev-tool suggest <file>

# Show help
npm run react-compiler-dev-tool help
```

## Usage Examples

### During Development

```bash
# Check if your new component is React Compiler compatible
npm run react-compiler-tracker check-file src/components/NewFeature.tsx

# Get optimization suggestions
npm run react-compiler-dev-tool suggest src/components/NewFeature.tsx

# Quick check of your current work
npm run react-compiler-dev-tool quick-check
```

### Before Submitting a PR

```bash
# Check all changed files
npm run react-compiler-tracker check-changed

# Generate a detailed report
npm run react-compiler-tracker report
```

### Understanding Project Status

```bash
# See overall project status
npm run react-compiler-tracker status

# Analyze specific directories
npm run react-compiler-dev-tool analyze src/components
```

## Understanding the Output

### ✅ Compilable Components

Components that can be compiled by React Compiler will:

- Automatically receive memoization optimizations
- Not need manual `React.memo`, `useMemo`, or `useCallback`
- Follow the Rules of React

### ❌ Non-compilable Components

Components that cannot be compiled by React Compiler may need:

- Manual memoization for performance
- Code refactoring to follow Rules of React
- Investigation of specific compilation errors

### Common Issues and Solutions

#### 1. Mutating Props or State

```tsx
// ❌ Bad - mutating props
function MyComponent({ items }) {
  items.push('new item'); // This breaks Rules of React
  return <div>{items.length}</div>;
}

// ✅ Good - immutable updates
function MyComponent({ items }) {
  const newItems = [...items, 'new item'];
  return <div>{newItems.length}</div>;
}
```

#### 2. Ref Naming

```tsx
// ❌ Bad - ref without proper naming
const rerender = useRef();

// ✅ Good - ref with proper naming
const rerenderRef = useRef();
```

#### 3. Side Effects in Render

```tsx
// ❌ Bad - side effect in render
function MyComponent() {
  localStorage.setItem('key', 'value'); // Side effect in render
  return <div>Hello</div>;
}

// ✅ Good - side effect in useEffect
function MyComponent() {
  useEffect(() => {
    localStorage.setItem('key', 'value');
  }, []);

  return <div>Hello</div>;
}
```

## Files and Data

### Tracker Data

The tracker maintains data in `.react-compiler-tracker.json`:

```json
{
  "components": {
    "src/components/MyComponent.tsx": {
      "file": "src/components/MyComponent.tsx",
      "canCompile": true,
      "lastChecked": "2024-01-15T10:30:00.000Z"
    }
  },
  "lastFullCheck": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Reports

Detailed reports are saved to `react-compiler-report.json` and include:

- Summary statistics
- List of compilable components
- List of non-compilable components with error details
- Timestamp of the check

## CI Workflow

The CI workflow (`.github/workflows/react-compiler-compliance.yml`) runs on:

- **Pull Requests**: Checks changed files for compliance
- **Main Branch**: Updates tracking data

### PR Comments

The CI automatically comments on PRs with:

- Current compilation status
- List of non-compilable components
- Suggestions for improvement
- Links to detailed reports

## Best Practices

### 1. Regular Monitoring

```bash
# Check project status weekly
npm run react-compiler-tracker status
```

### 2. Before Adding Manual Memoization

```bash
# Check if React Compiler can handle it
npm run react-compiler-tracker check-file src/components/MyComponent.tsx
```

### 3. Performance Testing

After removing manual memoization from compilable components:

- Test performance with React DevTools Profiler
- Monitor bundle size changes
- Verify no performance regressions

### 4. Gradual Migration

- Focus on new components first (enforced by CI)
- Gradually fix existing non-compilable components
- Use the tracker to monitor progress

## Troubleshooting

### Common Errors

#### "File not found"

- Ensure the file path is correct
- Check that the file exists in the workspace

#### "No React components found"

- Verify the file contains React components or hooks
- Check file extension (.tsx or .ts)

#### "Failed to run React Compiler healthcheck"

- Ensure dependencies are installed: `npm ci`
- Check that `react-compiler-healthcheck` is available

### Getting Help

1. Check the detailed report: `npm run react-compiler-tracker report`
2. Look at the raw compiler output: `react-compiler-output.json`
3. Review the [React Compiler documentation](https://react.dev/learn/react-compiler)
4. Check existing [React Compiler guide](./REACT_COMPILER.md)

## Integration with Existing Tools

The React Compiler Compliance Checker integrates with:

- **Existing healthcheck**: Uses the patched `react-compiler-healthcheck` with JSON output
- **Git workflows**: Tracks changes and new files
- **CI/CD**: Provides automated compliance checking
- **Development workflow**: Offers quick local checks

## Future Enhancements

Potential improvements:

- IDE integration (VS Code extension)
- Performance impact analysis
- Automatic code fixes for common issues
- Integration with bundle analysis tools
- Historical trend tracking
