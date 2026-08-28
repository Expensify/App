# Expensify App

## HybridApp Architecture

- The mobile application is built from the Mobile-Expensify submodule, not directly from the App repository.
- NewDot refers to the New Expensify App, OldDot or Expensify Classic refers to our Old expensify app and website

### Key Integration Points

- App (NewDot) and Mobile-Expensify (OldDot) are combined into a single mobile application
- The HybridApp module (`@expensify/react-native-hybrid-app`) manages transitions between OldDot and NewDot
- Build process merges `.env` files from both repositories
- Mobile-Expensify environment variables supersede App variables
- Mobile builds **must** be initiated from the Mobile-Expensify directory

### Build Modes

- **Standalone**: Pure NewDot application (web)
- **HybridApp**: Combined OldDot + NewDot (mobile apps)
- Controlled via `STANDALONE_NEW_DOT` environment variable

## Navigation & Routing

### Key Navigators

- **AuthScreens**: Authenticated app screens
- **PublicScreens**: Login and onboarding screens
- **RHP (Right Hand Pane)**: Contextual panels — settings and details
- **Central Pane**: Main content area
- **LHN (Left Hand Navigation)**: Report list and navigation

## State Management

Onyx (`react-native-onyx`) is our custom offline-first key-value store; keys are defined in `src/ONYXKEYS.ts`.

### Reading Onyx data (`useOnyx` vs `Onyx.connectWithoutView`)

Prefer pure functions taking data as params over direct Onyx reads — callers read and pass data in. When a read is needed, use **`useOnyx`** (`@hooks/useOnyx`) by default; reach for **`Onyx.connectWithoutView`** only for non-render logic (actions/libraries) that genuinely can't use `useOnyx`. Don't copy-paste `Onyx.connectWithoutView` usages — justify each with a comment. Using it in components for perf needs `@frontend-performance` Slack approval linked in PR description. See [Onyx Data Management](contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md#reading-onyx-data-useonyx-vs-onyxconnectwithoutview).

## Related Repositories

### Mobile-Expensify (Submodule)

- **Path**: `App/Mobile-Expensify/`
- **Purpose**: Legacy OldDot application and mobile build source
- **Critical**: All mobile builds originate from this directory
- Contains platform-specific code for iOS and Android
- Manages the HybridApp integration layer
- **Submodule pointer**: bumped automatically by OSBotify on every merge to Mobile-Expensify `main`

## Development Practices

### React Native Best Practices

Use the `/react-native-best-practices` skill when working on performance-sensitive code, native modules, or release preparation. This ensures code respects established best practices from the start, resulting in more consistent code, fewer review iterations, and better resilience against regressions.

### Memoization

React Compiler auto-memoizes code in components and hooks (excluding `tests/`). Two different compilers run it: `babel-plugin-react-compiler` on native/Jest (see `babel.config.js`) and `oxc-transform-react` on web (see `config/rsbuild/`). They do not behave identically. The compliance check and the ESLint processor run BOTH compilers via the shared helpers in `config/reactCompiler/` and only relax manual-memoization rules when both compilers memoize the file.

Do not use `useMemo`, `useCallback`, or `React.memo` in components or hooks that compile with React Compiler.

### Code Quality

- **ESLint**: Linter. Pre-existing violations are grandfathered via [`eslint-seatbelt`](https://github.com/justjake/eslint-seatbelt).

### Post-Edit Checklist (IMPORTANT)

**ALWAYS run these steps after making code changes, before committing:**

1. **ESLint**: Run `npm run lint-changed` to catch lint errors early.
2. **TypeScript**: Run `npm run typecheck` after changes that may affect typing (types, interfaces, or function signatures). It runs the TypeScript 7 native compiler and is the required merge gate in CI.
3. **React Compiler**: If you added new React components/hooks or modified existing ones, run `npm run react-compiler-compliance-check check-changed` to verify they compile with React Compiler. This applies the same rules as CI, evaluated against BOTH the Babel and OXC compilers: new components/hooks must compile, existing compiled files must not regress, and changes must not introduce new memoization divergence (one compiler memoizing a file while the other does not). See `contributingGuides/REACT_COMPILER.md` for details and common fixes.
4. **Spelling**: Run `npm run spell-changed -- <files you changed>` to catch spelling errors (cspell needs an explicit file list). CI validates with cspell, which remains the required merge gate.

### Testing

App tests use Jest. Tests for `.github/` and `scripts/` live in `tests/tooling/` and run under `bun:test` (`npm run test:bun`) — see `tests/tooling/README.md`.

## Special Considerations

### Offline-First Architecture

- All features work offline
- Optimistic updates with rollback
- Queue-based request handling
- Conflict resolution strategies

## Customer-Facing Help Site

- **NewDot Help**: https://help.expensify.com/new-expensify/hubs/
- **OldDot/Expensify Classic Help**: https://help.expensify.com/expensify-classic/hubs/

## Development Environment

### Browser Testing

Use the `/playwright-app-testing` skill to test and debug the App in a browser. Use this skill after making frontend changes to verify your work, or when the user requests testing.

### Mobile Device Testing

Use the `/agent-device` skill to drive the App on iOS and Android (simulators or real devices) for interactive testing, performance profiling, bug reproduction, and device-specific debugging.

### Sentry Analysis

Use the Sentry skill whenever the user wants to analyze any data from Sentry: spans, metrics, crashes, crash free rate, etc.
