const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const babelJest = require('babel-jest');
const oxcReactCompilerConfig = require('./oxcReactCompilerConfig');

const babelTransformer = babelJest.createTransformer();

/**
 * esbuild and oxc-transform-react are native modules, loaded once per worker. Requiring them lazily
 * keeps a run that never takes the OXC path from paying for them at all.
 *
 * @returns {{esbuild: typeof import('esbuild'), transformSync: Function, oxcVersion: string}}
 */
let oxcPipeline;
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

// esbuild emits two CJS interop helpers verbatim, both of which behave differently from Babel's:
// its export getters are non-configurable, so `jest.spyOn` cannot redefine them, and they read the
// binding directly, so a circular import throws where Babel's interop returned undefined.
// The patterns are regexes because esbuild renames helper locals when the module already binds that
// name (`name` becomes `name2`), so an exact string match misses those files.
const ESBUILD_HELPERS = [
    {
        marker: 'var __defProp',
        pattern: /var (__defProp\d*) = Object\.defineProperty;/,
        replace: (_match, defProp) => `var ${defProp} = (target, key, descriptor) => Object.defineProperty(target, key, {...descriptor, configurable: true});`,
    },
    {
        marker: 'var __export',
        pattern: /var (__export\d*) = \(target, all\) => \{\s*for \(var (\w+) in all\)\s*(__defProp\d*)\(target, \2, \{ get: all\[\2\], enumerable: true \}\);\s*\};/,
        replace: (_match, exportName, _loopVar, defProp) =>
            `var ${exportName} = (target, all) => {\n  for (const key of Object.keys(all))\n    ${defProp}(target, key, {get: () => {try {return all[key]();} catch (e) {if (e instanceof ReferenceError) {return undefined;} throw e;}}, enumerable: true});\n};`,
    },
];

/**
 * Apply the helper rewrites above. A helper is absent whenever a module does not need it, but one
 * that is present in a shape we do not recognize means esbuild changed it and the patch is now a
 * silent no-op, so fail instead.
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

/**
 * Coverage instruments whatever the transformer returns, so the OXC path would run OXC, esbuild and
 * then istanbul on every file, where babel-jest emits the instrumentation in the pass it is already
 * doing. Measured on one CI shard that is slower and holds more memory, so a `--coverage` run stays
 * on babel-jest.
 */
function shouldUseOxc(filename, transformOptions) {
    if (transformOptions?.instrument) {
        return false;
    }
    return !NODE_MODULES_RE.test(filename) && !TESTS_RE.test(filename) && !JEST_SETUP_RE.test(filename) && !MOCKS_RE.test(filename) && !TEST_FILE_RE.test(filename);
}

function processWithOxc(sourceText, sourcePath) {
    const {esbuild, transformSync} = getOxcPipeline();
    const oxcResult = transformSync(sourcePath, sourceText, {
        lang: getLang(sourcePath),
        sourcemap: true,
        jsx: {runtime: 'automatic', development: true},
        reactCompiler: REACT_COMPILER_OPTIONS,
    });

    if (oxcResult.fatal || !oxcResult.code) {
        return null;
    }

    const cjs = esbuild.transformSync(oxcResult.code, {
        loader: 'js',
        format: 'cjs',
        supported: {'dynamic-import': false},
        sourcefile: sourcePath,
        sourcemap: true,
    });

    return {code: patchEsbuildHelpers(cjs.code, sourcePath), map: cjs.map};
}

module.exports = {
    canInstrument: false,
    getCacheKey(sourceText, sourcePath, transformOptions) {
        if (!shouldUseOxc(sourcePath, transformOptions)) {
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
            .digest('hex');
    },
    process(sourceText, sourcePath, transformOptions) {
        if (shouldUseOxc(sourcePath, transformOptions)) {
            const result = processWithOxc(sourceText, sourcePath);
            if (result) {
                return result;
            }
        }

        return babelTransformer.process(sourceText, sourcePath, transformOptions);
    },
};
