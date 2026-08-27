/**
 * React Compiler analysis via oxc-transform-react (sync).
 *
 * Shared 3-state API for the ESLint processor and the CI compliance check.
 * Mirrors web build options from config/rsbuild/rsbuild.common.ts.
 *
 * `panicThreshold: 'critical_errors'` is what splits the two kinds of diagnostic apart:
 * a Rules-of-React violation aborts the whole transform, while a
 * compiler limitation the code can't do anything about stays a `Warning` and still emits code.
 * Only the former counts as `failed`, so contributors are never blocked by a gap in the compiler itself.
 *
 * A file where one function violates the Rules of React reports `memoized: false`,
 * rather than the partial memoization the compiler would otherwise emit for its remaining functions.
 * `didBothCompilersMemoizeFile` relies on that, since it will only suppress manual-memoization lint rules when the whole file is memoized.
 *
 * `status` and `memoized` answer different questions and are derived separately. `memoized` comes
 * only from the emitted memo cache: targeting React 19 the compiler can memoize solely by importing
 * `react/compiler-runtime` and allocating `_c(n)` slots, so the marker below is exact. `status`
 * additionally counts a file the compiler rewrote without memoizing it as `compiled`. Deriving
 * `memoized` from that same rewrite would overstate it -- the compiler perturbs output for reasons
 * that have nothing to do with memoization, such as expanding a concise arrow body or dropping a
 * comment, and Babel reports no memo blocks for every file in `src/` where it does.
 */
import path from 'node:path';
import {transformSync} from 'oxc-transform-react';

// Any file compiled by React Compiler will have a _c marker in it
const REACT_COMPILER_MARKER_PATTERN = /_c\(|react\/compiler-runtime/;

function getLang(ext) {
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'ts') {
        return 'ts';
    }
    return 'jsx';
}

function offsetToLoc(source, offset) {
    if (offset < 0 || offset > source.length) {
        return undefined;
    }

    let line = 1;
    let column = 0;
    for (let i = 0; i < offset; i++) {
        if (source[i] === '\n') {
            line += 1;
            column = 0;
        } else {
            column += 1;
        }
    }

    return {
        start: {line, column},
        end: {line, column},
    };
}

function mapOxcError(error, source) {
    const label = error.labels?.[0];
    const loc = label?.start !== undefined ? offsetToLoc(source, label.start) : undefined;

    return {
        reason: error.message ?? 'Unknown compiler error',
        severity: error.severity ?? 'Error',
        loc,
    };
}

function checkReactCompilerWithOxc(source, filename) {
    const ext = path.extname(filename).slice(1);
    const lang = getLang(ext);
    const transformOptions = {
        lang,
        reactCompiler: {
            target: '19',
            panicThreshold: 'critical_errors',
            // Kept in sync with the web build: see the `eslintSuppressionRules` comment in
            // config/rsbuild/rsbuild.common.ts.
            eslintSuppressionRules: [],
        },
    };

    try {
        const result = transformSync(filename, source, transformOptions);

        const fatalErrors = (result.errors ?? []).filter((error) => error.severity === 'Error');

        if (result.fatal || fatalErrors.length > 0) {
            return {
                status: 'failed',
                memoized: false,
                errors: fatalErrors.map((error) => mapOxcError(error, source)),
            };
        }

        if (result.code && REACT_COMPILER_MARKER_PATTERN.test(result.code)) {
            return {
                status: 'compiled',
                memoized: true,
                errors: [],
            };
        }

        // No memo cache, but the compiler may still have processed the file -- a hook that only wraps
        // useState compiles cleanly with nothing worth memoizing. Diffing against a plain transform
        // separates that from a file the compiler found nothing to do in, which is what lets the
        // compliance check tell "compiled on main, broken on this branch" from "never compiled".
        const plainResult = transformSync(filename, source, {lang, reactCompiler: false});
        if (result.code && plainResult.code && result.code !== plainResult.code) {
            return {
                status: 'compiled',
                memoized: false,
                errors: [],
            };
        }

        return {
            status: 'no-components',
            memoized: false,
            errors: [],
        };
    } catch (error) {
        return {
            status: 'failed',
            memoized: false,
            errors: [
                {
                    reason: error instanceof Error ? error.message : String(error),
                    severity: 'Error',
                },
            ],
        };
    }
}

export default checkReactCompilerWithOxc;
