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
 * - `memoized` (boolean): whether the emitted output actually contains React Compiler
 *   memoization (a `_c(...)` cache from `react/compiler-runtime`). A file can be `compiled`
 *   without being `memoized` (e.g. a trivial hook that just calls useContext), so this is the
 *   signal that matters when comparing against OXC to find cross-platform memoization gaps.
 */
import {transformSync} from '@babel/core';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

const ReactCompilerConfig = require('../babel/reactCompilerConfig');

// Matches the memoization output emitted by both babel-plugin-react-compiler and oxc-transform.
const REACT_COMPILER_MARKER_PATTERN = /_c\(|react\/compiler-runtime/;

/**
 * Check a source string with the Babel React Compiler.
 * @returns {{status: 'compiled' | 'failed' | 'no-components', memoized: boolean, errors: Array<{reason: string, severity: string, loc?: unknown, fnLoc?: unknown}>}}
 */
function checkReactCompilerWithBabel(source, filename) {
    let hasError = false;
    let hasSuccess = false;
    let emittedCode;
    const errors = [];

    try {
        // Emit code (rather than noEmit) so we can inspect the output for memoization markers.
        // With panicThreshold 'none', Rules-of-React violations are reported via the logger
        // instead of thrown, so error reporting is identical to the previous noEmit approach.
        const result = transformSync(source, {
            filename,
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
                                }
                            },
                        },
                    },
                ],
            ],
        });
        emittedCode = result?.code ?? undefined;
    } catch (error) {
        hasError = true;
        errors.push({
            reason: error instanceof Error ? error.message : String(error),
            severity: 'Error',
        });
    }

    const memoized = !!emittedCode && REACT_COMPILER_MARKER_PATTERN.test(emittedCode);

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

function didReactCompilerCompileFile(source, filename) {
    return checkReactCompilerWithBabel(source, filename).status === 'compiled';
}

function didBabelMemoizeFile(source, filename) {
    return checkReactCompilerWithBabel(source, filename).memoized;
}

export {checkReactCompilerWithBabel, didReactCompilerCompileFile, didBabelMemoizeFile};
