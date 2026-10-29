/**
 * ESLint processor that suppresses lint rules which are unnecessary for files React Compiler
 * memoizes.
 *
 * React Compiler automatically memoizes components and hooks, making rules like
 * `react/jsx-no-constructed-context-values` redundant for memoized files. Every build compiles
 * with the OXC React Compiler (oxc-transform-react), so its verdict is the only one that matters.
 *
 * This processor therefore:
 * 1. Runs the compiler on each file during the `preprocess` phase
 * 2. Only if the compiler memoizes the file, filters out messages from rules that
 *    React Compiler makes unnecessary in `postprocess`
 * 3. Otherwise (the compiler skips memoization, or the file fails to compile) preserves
 *    all lint messages as-is
 *
 * The app's own lint run does this in the pipeline instead, not in a processor
 * (`scripts/lint/processors/ReactCompilerFilter.ts`). The processor form survives here because the
 * rule-tester harness drives `npx eslint` against a generated config, and a processor is the only
 * place that stock ESLint will run the compilers from.
 */
import _ from 'lodash';

import {isFileMemoized} from '../../config/reactCompiler/checkWithOxc.mjs';
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
        compilationResults.set(filename, isFileMemoized(text, filename));

        // Pass the source through unchanged as a single code block
        return [text];
    },

    postprocess(messages, filename) {
        const memoized = compilationResults.get(filename);
        compilationResults.delete(filename);

        if (memoized) {
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
