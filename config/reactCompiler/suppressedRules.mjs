/**
 * The lint rules React Compiler makes redundant, and the pattern that picks out the
 * `react-hooks/exhaustive-deps` messages it makes redundant.
 *
 * Three consumers read this, in three different runtimes, so the list lives here rather than in any
 * one of them: the lint pipeline's processor (`scripts/lint/processors/ReactCompilerFilter.ts`, bun),
 * oxlint's equivalent gate (`config/oxlint/plugins/hosted-rules.mjs`, oxlint's JS plugin runtime) and
 * the migration harness that proves the two agree (`oxlint-migration/rule-tester/`, node). Plain
 * `.mjs` because only the first of those can load TypeScript.
 */

// Rules that are entirely unnecessary when React Compiler successfully compiles
// all functions in a file. Add more rules here as needed.
const RULES_SUPPRESSED_BY_REACT_COMPILER = new Set(['react/jsx-no-constructed-context-values', 'rulesdir/no-inline-useOnyx-selector']);

// react-hooks/exhaustive-deps warnings that suggest useCallback/useMemo are
// false positives in compiled files, since React Compiler auto-memoizes.
// We only suppress the "wrap in useCallback/useMemo" suggestions, NOT warnings
// about genuinely missing dependencies.
const EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;

export {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN, RULES_SUPPRESSED_BY_REACT_COMPILER};
