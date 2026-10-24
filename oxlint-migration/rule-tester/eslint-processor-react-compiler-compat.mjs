/**
 * ESLint processor that conditionally suppresses lint rules which are unnecessary
 * for files that BOTH React Compilers memoize.
 *
 * React Compiler automatically memoizes components and hooks, making rules like
 * `react/jsx-no-constructed-context-values` redundant for memoized files. But the app
 * runs two different compilers -- Babel (babel-plugin-react-compiler) on native/Jest and
 * OXC (oxc-transform-react) on web -- and they don't always agree. A file that only one compiler
 * memoizes still ships without memoization on the other platform, so the manual memoization
 * (and the lint rules that enforce it) is still needed there.
 *
 * This processor therefore:
 * 1. Runs BOTH React Compilers on each file during the `preprocess` phase
 * 2. Only if BOTH compilers memoize the file, filters out messages from rules that
 *    React Compiler makes unnecessary in `postprocess`
 * 3. Otherwise (either compiler skips memoization, or a file fails to compile) preserves
 *    all lint messages as-is
 *
 * The app's own lint run does this in the pipeline instead, not in a processor
 * (`scripts/lint/processors/ReactCompilerFilter.ts`). The processor form survives here because the
 * rule-tester harness drives `npx eslint` against a generated config, and a processor is the only
 * place that stock ESLint will run the compilers from.
 */
import _ from 'lodash';

import {didBothCompilersMemoizeFile} from '../../config/reactCompiler/checkBoth.mjs';
import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN, RULES_SUPPRESSED_BY_REACT_COMPILER} from '../../config/reactCompiler/suppressedRules.mjs';

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
