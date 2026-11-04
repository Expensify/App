const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const babelJest = require('babel-jest');
const oxcReactCompilerConfig = require('./oxcReactCompilerConfig');

const babelTransformer = babelJest.createTransformer();

let oxcPipeline;
/**
 * esbuild and oxc-transform-react are native modules, loaded once per worker. Requiring them lazily
 * keeps a run that never takes the OXC path from paying for them at all.
 *
 * @returns {{esbuild: typeof import('esbuild'), transformSync: Function, oxcVersion: string}}
 */
function getOxcPipeline() {
    if (!oxcPipeline) {
        oxcPipeline = {
            esbuild: require('esbuild'),
            transformSync: require('oxc-transform-react').transformSync,
            oxcVersion: require('oxc-transform-react/package.json').version,
        };
    }
    return oxcPipeline;
}

const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;
const TESTS_RE = /[/\\]tests[/\\]/;
const JEST_SETUP_RE = /[/\\]jest[/\\]/;
const MOCKS_RE = /[/\\]__mocks__[/\\]/;
// Test files live under tests/ today, but a colocated one would lose `jest.mock` hoisting silently.
const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$/;

// esbuild's export helpers act differently from Babel's: `jest.spyOn` can't override their exports,
// and a circular import throws instead of giving `undefined`. Patch both to act like Babel. Regexes,
// because esbuild renames the helper's variables (`name` becomes `name2`) when the name is taken.
const ESBUILD_HELPERS = [
    {
        marker: 'var __defProp',
        pattern: /var (__defProp\d*) = Object\.defineProperty;/,
        replace: (_match, defProp) => `var ${defProp} = (target, key, descriptor) => Object.defineProperty(target, key, {...descriptor, configurable: true});`,
    },
    {
        marker: 'var __export',
        pattern: /var (__export\d*) = \(target, all\) => \{\s*for \(var (\w+) in all\)\s*(__defProp\d*)\(target, \2, \{ get: all\[\2\], enumerable: true \}\);\s*\};/,
        // Keep this to 4 lines, like esbuild's helper: patching runs after the source map is made.
        replace: (_match, exportName, _loopVar, defProp) => `var ${exportName} = (target, all) => {
  for (const key of Object.keys(all))
    ${defProp}(target, key, {get: () => {try {return all[key]();} catch (e) {if (e instanceof ReferenceError) {return undefined;} throw e;}}, enumerable: true});
};`,
    },
];

/**
 * Patch the esbuild helpers above. A missing helper is fine (the module doesn't need it), but one
 * we can't match means esbuild changed it and the patch would silently do nothing, so throw.
 *
 * @param {string} code
 * @param {string} sourcePath
 * @returns {string}
 */
function patchEsbuildHelpers(code, sourcePath) {
    let patched = code;
    for (const {marker, pattern, replace} of ESBUILD_HELPERS) {
        if (!patched.includes(marker)) {
            continue;
        }
        const next = patched.replace(pattern, replace);
        if (next === patched) {
            throw new Error(`oxcJestTransformer: esbuild interop helper changed shape, update ESBUILD_HELPERS (while transforming ${sourcePath})`);
        }
        patched = next;
    }
    return patched;
}

const TRANSFORMER_SOURCE = fs.readFileSync(__filename);
const REACT_COMPILER_CONFIG_KEY = JSON.stringify(oxcReactCompilerConfig());

const REACT_COMPILER_OPTIONS = oxcReactCompilerConfig();

const COVERAGE_PACKAGES = ['@babel/core', 'babel-plugin-istanbul', '@babel/plugin-transform-modules-commonjs', '@babel/plugin-transform-dynamic-import'];

let coverageVersionsKey;
// The coverage pass output depends on these packages, so a bump must miss the Jest cache.
function getCoverageVersionsKey() {
    if (!coverageVersionsKey) {
        coverageVersionsKey = COVERAGE_PACKAGES.map((name) => `${name}@${require(`${name}/package.json`).version}`).join(',');
    }
    return coverageVersionsKey;
}

function getLang(filename) {
    const ext = path.extname(filename).slice(1);
    if (ext === 'tsx') {
        return 'tsx';
    }
    if (ext === 'ts') {
        return 'ts';
    }
    return 'jsx';
}

function shouldUseOxc(filename) {
    return !NODE_MODULES_RE.test(filename) && !TESTS_RE.test(filename) && !JEST_SETUP_RE.test(filename) && !MOCKS_RE.test(filename) && !TEST_FILE_RE.test(filename);
}

/** Compile with OXC (TS, JSX and React Compiler). Returns null on a fatal error so the caller falls back to babel-jest. */
function compileWithOxc(sourceText, sourcePath) {
    const {transformSync} = getOxcPipeline();
    const oxcResult = transformSync(sourcePath, sourceText, {
        lang: getLang(sourcePath),
        sourcemap: true,
        jsx: {runtime: 'automatic', development: true},
        reactCompiler: REACT_COMPILER_OPTIONS,
    });

    if (oxcResult.fatal || !oxcResult.code) {
        return null;
    }
    return oxcResult;
}

/**
 * Coverage runs: OXC compiles as usual, then one light Babel pass converts to CommonJS and adds the
 * istanbul counters, reading OXC's source map so coverage points at the original lines. That replaces
 * esbuild rather than adding a third pass after it.
 */
function processWithOxcForCoverage(sourceText, sourcePath, transformOptions) {
    const oxcResult = compileWithOxc(sourceText, sourcePath);
    if (!oxcResult) {
        return null;
    }

    const result = require('@babel/core').transformSync(oxcResult.code, {
        filename: sourcePath,
        configFile: false,
        babelrc: false,
        inputSourceMap: oxcResult.map,
        sourceMaps: true,
        auxiliaryCommentBefore: ' istanbul ignore next ',
        plugins: [
            [require.resolve('babel-plugin-istanbul'), {cwd: transformOptions.config.cwd, exclude: []}],
            [require.resolve('@babel/plugin-transform-modules-commonjs'), {strictMode: false}],
            require.resolve('@babel/plugin-transform-dynamic-import'),
        ],
    });

    return result?.code ? {code: result.code, map: result.map} : null;
}

function processWithOxc(sourceText, sourcePath) {
    const oxcResult = compileWithOxc(sourceText, sourcePath);
    if (!oxcResult) {
        return null;
    }

    const {esbuild} = getOxcPipeline();
    // esbuild chains an inline input map, so its output maps straight back to the original file.
    const inputMap = Buffer.from(JSON.stringify(oxcResult.map)).toString('base64');
    const cjs = esbuild.transformSync(`${oxcResult.code}\n//# sourceMappingURL=data:application/json;base64,${inputMap}`, {
        loader: 'js',
        format: 'cjs',
        supported: {'dynamic-import': false},
        sourcefile: sourcePath,
        sourcemap: true,
    });

    return {code: patchEsbuildHelpers(cjs.code, sourcePath), map: cjs.map};
}

module.exports = {
    // Coverage is instrumented here (istanbul plugin in the OXC coverage pass), so Jest must not instrument again.
    canInstrument: true,
    getCacheKey(sourceText, sourcePath, transformOptions) {
        if (!shouldUseOxc(sourcePath)) {
            return babelTransformer.getCacheKey(sourceText, sourcePath, transformOptions);
        }

        const {esbuild, oxcVersion} = getOxcPipeline();

        return crypto
            .createHash('sha1')
            .update(sourceText)
            .update('\0', 'utf8')
            .update(sourcePath)
            .update(TRANSFORMER_SOURCE)
            .update(REACT_COMPILER_CONFIG_KEY)
            .update(esbuild.version)
            .update(oxcVersion)
            .update(transformOptions?.instrument ? `instrument:${getCoverageVersionsKey()}` : '')
            .digest('hex');
    },
    process(sourceText, sourcePath, transformOptions) {
        if (shouldUseOxc(sourcePath)) {
            const result = transformOptions?.instrument ? processWithOxcForCoverage(sourceText, sourcePath, transformOptions) : processWithOxc(sourceText, sourcePath);
            if (result) {
                return result;
            }
        }

        return babelTransformer.process(sourceText, sourcePath, transformOptions);
    },
};
