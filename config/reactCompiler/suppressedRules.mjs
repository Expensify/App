// Plain `.mjs`: oxlint's JS plugin runtime cannot load TypeScript.
const RULES_SUPPRESSED_BY_REACT_COMPILER = new Set(['react/jsx-no-constructed-context-values', 'rulesdir/no-inline-useOnyx-selector']);

const EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;

export {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN, RULES_SUPPRESSED_BY_REACT_COMPILER};
