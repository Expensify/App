/**
 * ESLint processor that conditionally suppresses lint rules which are unnecessary
 * for files that BOTH React Compilers memoize.
 *
 * React Compiler automatically memoizes components and hooks, making rules like
 * `react/jsx-no-constructed-context-values` redundant for memoized files. But the app
 * runs two different compilers -- Babel (babel-plugin-react-compiler) on native/Jest and
 * OXC (oxc-transform) on web -- and they don't always agree. A file that only one compiler
 * memoizes still ships without memoization on the other platform, so the manual memoization
 * (and the lint rules that enforce it) is still needed there.
 *
 * This processor therefore:
 * 1. Runs BOTH React Compilers on each file during the `preprocess` phase
 * 2. Only if BOTH compilers memoize the file, filters out messages from rules that
 *    React Compiler makes unnecessary in `postprocess`
 * 3. Otherwise (either compiler skips memoization, or a file fails to compile) preserves
 *    all lint messages as-is
 */
import _ from 'lodash';

import {didBothCompilersMemoizeFile} from '../../reactCompiler/checkBoth.mjs';

// Rules that are entirely unnecessary when React Compiler successfully compiles
// all functions in a file. Add more rules here as needed.
const RULES_SUPPRESSED_BY_REACT_COMPILER = new Set(['react/jsx-no-constructed-context-values', 'rulesdir/no-inline-useOnyx-selector']);

// react-hooks/exhaustive-deps warnings that suggest useCallback/useMemo are
// false positives in compiled files, since React Compiler auto-memoizes.
// We only suppress the "wrap in useCallback/useMemo" suggestions, NOT warnings
// about genuinely missing dependencies.
const EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN = /\buseCallback\(\) Hook\b|\buseMemo\(\) Hook\b/;

// Per-file compilation results, populated in preprocess, consumed in postprocess.
const compilationResults = new Map();

const processor = {
    meta: {
        name: 'react-compiler-compat',
        version: '1.0.0',
    },
    supportsAutofix: true,

    preprocess(text, filename) {
        // Skip files that React Compiler wouldn't compile anyway
        if (filename.includes('/tests/') || filename.includes('node_modules/')) {
            compilationResults.set(filename, false);
        } else {
            compilationResults.set(filename, didBothCompilersMemoizeFile(text, filename));
        }

        // Pass the source through unchanged as a single code block
        return [text];
    },

    postprocess(messages, filename) {
        const bothMemoized = compilationResults.get(filename);
        compilationResults.delete(filename);

        if (bothMemoized) {
            return _.filter(messages[0], (msg) => {
                if (RULES_SUPPRESSED_BY_REACT_COMPILER.has(msg.ruleId)) {
                    return false;
                }
                if (msg.ruleId === 'react-hooks/exhaustive-deps' && EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN.test(msg.message)) {
                    return false;
                }
                return true;
            });
        }

        return messages[0];
    },
};

export default processor;
