/**
 * ESLint processor that conditionally suppresses lint rules which are unnecessary
 * for files that React Compiler successfully compiles.
 *
 * React Compiler automatically memoizes components and hooks, making rules like
 * `react/jsx-no-constructed-context-values` redundant for compiled files.
 *
 * This processor:
 * 1. Runs React Compiler on each file during the `preprocess` phase
 * 2. If all functions/components compile successfully, filters out messages
 *    from rules that React Compiler makes unnecessary in `postprocess`
 * 3. If any function fails to compile, preserves all lint messages as-is
 */
import _ from 'lodash';

import {didReactCompilerCompileFile} from '../../reactCompiler/checkWithOxc.mjs';

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
            compilationResults.set(filename, didReactCompilerCompileFile(text, filename));
        }

        // Pass the source through unchanged as a single code block
        return [text];
    },

    postprocess(messages, filename) {
        const allCompiled = compilationResults.get(filename);
        compilationResults.delete(filename);

        if (allCompiled) {
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
