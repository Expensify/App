/**
 * Lint reports that tell you to memoize by hand. Manual memoization is banned in files React Compiler
 * already memoizes, so ReactCompilerFilter and the oxlint plugins drop these reports in those files.
 * It's plain `.mjs` because oxlint's JS plugins can't load TypeScript.
 */
const RULES_SUPPRESSED_BY_REACT_COMPILER = new Set(['react/jsx-no-constructed-context-values', 'rulesdir/no-inline-useOnyx-selector']);

const EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;

export {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN, RULES_SUPPRESSED_BY_REACT_COMPILER};
