const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const {transformSync} = require('oxc-transform-react');

const babelJest = require('babel-jest');
const OXC_TRANSFORM_REACT_VERSION = require('oxc-transform-react/package.json').version;
const oxcReactCompilerConfig = require('./oxcReactCompilerConfig');

const babelTransformer = babelJest.createTransformer();

const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;
const TESTS_RE = /[/\\]tests[/\\]/;
const JEST_SETUP_RE = /[/\\]jest[/\\]/;
const MOCKS_RE = /[/\\]__mocks__[/\\]/;
// Test files live under tests/ today, but a colocated one would lose `jest.mock` hoisting silently.
const TEST_FILE_RE = /\.(test|spec)\.[jt]sx?$/;

// esbuild emits two CJS interop helpers verbatim, both of which behave differently from Babel's:
// its export getters are non-configurable, so `jest.spyOn` cannot redefine them, and they read the
// binding directly, so a circular import throws where Babel's interop returned undefined.
const ESBUILD_HELPERS = [
    {
        from: 'var __defProp = Object.defineProperty;',
        to: 'var __defProp = (target, key, descriptor) => Object.defineProperty(target, key, {...descriptor, configurable: true});',
    },
    {
        from: ['var __export = (target, all) => {', '  for (var name in all)', '    __defProp(target, name, { get: all[name], enumerable: true });', '};'].join('\n'),
        to: [
            'var __export = (target, all) => {',
            '  for (const name of Object.keys(all))',
            '    __defProp(target, name, {get: () => {try {return all[name]();} catch (e) {if (e instanceof ReferenceError) {return undefined;} throw e;}}, enumerable: true});',
            '};',
        ].join('\n'),
    },
];

/**
 * Apply the helper rewrites above. A helper is absent whenever a module does not need it, but one
 * that is present in a shape we do not recognise means esbuild changed it and the patch is now a
 * silent no-op, so fail instead.
 *
 * @param {string} code
 * @param {string} sourcePath
 * @returns {string}
 */
function patchEsbuildHelpers(code, sourcePath) {
    let patched = code;
    for (const {from, to} of ESBUILD_HELPERS) {
        if (patched.includes(from)) {
            patched = patched.replace(from, to);
        } else if (patched.includes(`${from.slice(0, from.indexOf(' ='))} =`)) {
            throw new Error(`oxcJestTransformer: esbuild interop helper changed shape, update ESBUILD_HELPERS (while transforming ${sourcePath})`);
        }
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

function shouldUseOxc(filename) {
    return !NODE_MODULES_RE.test(filename) && !TESTS_RE.test(filename) && !JEST_SETUP_RE.test(filename) && !MOCKS_RE.test(filename) && !TEST_FILE_RE.test(filename);
}

function processWithOxc(sourceText, sourcePath) {
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
        if (!shouldUseOxc(sourcePath)) {
            return babelTransformer.getCacheKey(sourceText, sourcePath, transformOptions);
        }

        return crypto
            .createHash('sha1')
            .update(sourceText)
            .update('\0', 'utf8')
            .update(sourcePath)
            .update(TRANSFORMER_SOURCE)
            .update(REACT_COMPILER_CONFIG_KEY)
            .update(esbuild.version)
            .update(OXC_TRANSFORM_REACT_VERSION)
            .digest('hex');
    },
    process(sourceText, sourcePath, transformOptions) {
        if (shouldUseOxc(sourcePath)) {
            const result = processWithOxc(sourceText, sourcePath);
            if (result) {
                return result;
            }
        }

        return babelTransformer.process(sourceText, sourcePath, transformOptions);
    },
};
