/**
 * React Compiler analysis via babel-plugin-react-compiler (sync).
 *
 * Shared API mirroring the Metro/Jest build pipeline (babel.config.js). Consumed by the
 * CI compliance check and (via checkBoth) the ESLint processor so both tools agree on
 * what Babel does with a file.
 *
 * Returns two independent signals:
 * - `status` ('compiled' | 'failed' | 'no-components'): compile health, driven by the
 *   compiler's CompileSuccess/CompileError events. This mirrors "does it obey the Rules of React".
 * - `memoized` (boolean): whether the compiler actually memoized anything, derived from the
 *   `memoBlocks` count on the CompileSuccess event. A file can be `compiled` without being
 *   `memoized` (e.g. a trivial hook that just calls useContext), so this is the signal that
 *   matters when comparing against OXC to find cross-platform memoization gaps.
 *
 * Analysis runs with `noEmit: true` (no code generation) so it stays cheap enough to run on
 * every file in the repo from the ESLint processor.
 */
import {transformSync} from '@babel/core';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

const ReactCompilerConfig = require('../babel/reactCompilerConfig');

/**
 * Check a source string with the Babel React Compiler.
 * @returns {{status: 'compiled' | 'failed' | 'no-components', memoized: boolean, errors: Array<{reason: string, severity: string, loc?: unknown, fnLoc?: unknown}>}}
 */
function checkReactCompilerWithBabel(source, filename) {
    let hasError = false;
    let hasSuccess = false;
    let memoBlocks = 0;
    const errors = [];

    try {
        transformSync(source, {
            filename,
            ast: false,
            code: false,
            configFile: false,
            babelrc: false,
            parserOpts: {
                plugins: ['typescript', 'jsx'],
            },
            plugins: [
                [
                    'babel-plugin-react-compiler',
                    {
                        ...ReactCompilerConfig,
                        panicThreshold: 'none',
                        noEmit: true,
                        logger: {
                            logEvent(_filename, event) {
                                if (event.kind === 'CompileError') {
                                    hasError = true;
                                    if (event.detail?.reason) {
                                        errors.push({
                                            reason: event.detail.reason ?? 'Unknown compiler error',
                                            severity: event.detail.severity ?? 'Error',
                                            loc: event.detail.loc,
                                            fnLoc: event.fnLoc,
                                        });
                                    }
                                }
                                if (event.kind === 'CompileSuccess') {
                                    hasSuccess = true;
                                    memoBlocks += event.memoBlocks ?? 0;
                                }
                            },
                        },
                    },
                ],
            ],
        });
    } catch (error) {
        hasError = true;
        errors.push({
            reason: error instanceof Error ? error.message : String(error),
            severity: 'Error',
        });
    }

    const memoized = memoBlocks > 0;

    let status;
    if (hasError) {
        status = 'failed';
    } else if (hasSuccess) {
        status = 'compiled';
    } else {
        status = 'no-components';
    }

    return {status, memoized, errors: status === 'failed' ? errors : []};
}

export default checkReactCompilerWithBabel;
