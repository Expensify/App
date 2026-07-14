/**
 * React Compiler analysis via oxc-transform (sync).
 *
 * Shared 3-state API for ESLint processor and future CI compliance check migration.
 * Mirrors web build options from config/rsbuild/rsbuild.common.ts.
 */
const path = require('node:path');
const {transformSync} = require('oxc-transform');

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
    const reason = (error.message ?? 'Unknown compiler error').replace(/^\[ReactCompiler\]\s*/u, '');
    const label = error.labels?.[0];
    const loc = label?.start !== undefined ? offsetToLoc(source, label.start) : undefined;

    return {
        reason,
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
            panicThreshold: 'none',
        },
    };

    try {
        const result = transformSync(filename, source, transformOptions);

        const reactCompilerErrors = (result.errors ?? []).filter((error) => error.message?.includes('[ReactCompiler]'));
        const fatalReactCompilerErrors = reactCompilerErrors.filter((error) => (error.severity ?? 'Error') === 'Error');

        if (fatalReactCompilerErrors.length > 0 || (!result.code && reactCompilerErrors.length > 0)) {
            return {
                status: 'failed',
                errors: reactCompilerErrors.map((error) => mapOxcError(error, source)),
            };
        }

        if (result.code && REACT_COMPILER_MARKER_PATTERN.test(result.code)) {
            return {
                status: 'compiled',
                errors: [],
            };
        }

        // Hook-only .ts files compile successfully without emitting _c(...) markers.
        // Compare against a plain transform to detect compiler activity.
        const plainResult = transformSync(filename, source, {lang});
        if (result.code && plainResult.code && result.code !== plainResult.code) {
            return {
                status: 'compiled',
                errors: [],
            };
        }

        return {
            status: 'no-components',
            errors: [],
        };
    } catch (error) {
        return {
            status: 'failed',
            errors: [
                {
                    reason: error instanceof Error ? error.message : String(error),
                    severity: 'Error',
                },
            ],
        };
    }
}

function didReactCompilerCompileFile(source, filename) {
    return checkReactCompilerWithOxc(source, filename).status === 'compiled';
}

module.exports = {
    checkReactCompilerWithOxc,
    didReactCompilerCompileFile,
};
