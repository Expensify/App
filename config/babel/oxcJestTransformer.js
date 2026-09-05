const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const {transformSync} = require('oxc-transform-react');

const babelJest = require('babel-jest');
const BABEL_CORE_VERSION = require('@babel/core/package.json').version;
const DYNAMIC_IMPORT_PLUGIN_VERSION = require('@babel/plugin-transform-dynamic-import/package.json').version;
const CJS_PLUGIN_VERSION = require('@babel/plugin-transform-modules-commonjs/package.json').version;
const JEST_HOIST_VERSION = require('babel-plugin-jest-hoist/package.json').version;
const OXC_TRANSFORM_REACT_VERSION = require('oxc-transform-react/package.json').version;
const BaseReactCompilerConfig = require('./reactCompilerConfig');

const babelTransformer = babelJest.createTransformer();

const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;
const TESTS_RE = /[/\\]tests[/\\]/;
const JEST_SETUP_RE = /[/\\]jest[/\\]/;
const MOCKS_RE = /[/\\]__mocks__[/\\]/;
const JEST_HOIST_RE = /\bjest\s*\.\s*(mock|unmock|deepUnmock|disableAutomock|enableAutomock)\b/;

const TRANSFORMER_SOURCE = fs.readFileSync(__filename);
const REACT_COMPILER_CONFIG_KEY = JSON.stringify(BaseReactCompilerConfig);

const REACT_COMPILER_OPTIONS = {
    ...BaseReactCompilerConfig,
    panicThreshold: 'none',
    eslintSuppressionRules: [],
};

const CJS_PLUGIN_OPTIONS = {loose: true, strictMode: false};
const CJS_PLUGINS = ['@babel/plugin-transform-dynamic-import', ['@babel/plugin-transform-modules-commonjs', CJS_PLUGIN_OPTIONS]];
const CJS_AND_HOIST_PLUGINS = [...CJS_PLUGINS, 'babel-plugin-jest-hoist'];

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
    return !NODE_MODULES_RE.test(filename);
}

function shouldRunReactCompiler(filename) {
    return !TESTS_RE.test(filename) && !JEST_SETUP_RE.test(filename) && !MOCKS_RE.test(filename);
}

function toCommonJS(code, sourcePath, inputSourceMap) {
    const plugins = JEST_HOIST_RE.test(code) ? CJS_AND_HOIST_PLUGINS : CJS_PLUGINS;
    const result = babel.transformSync(code, {
        filename: sourcePath,
        ast: false,
        code: true,
        babelrc: false,
        configFile: false,
        compact: false,
        sourceType: 'module',
        sourceMaps: true,
        inputSourceMap: inputSourceMap ?? undefined,
        plugins,
    });

    if (!result?.code) {
        return {code, map: inputSourceMap};
    }

    return {code: result.code, map: result.map ?? inputSourceMap};
}

function processWithOxc(sourceText, sourcePath) {
    const oxcResult = transformSync(sourcePath, sourceText, {
        lang: getLang(sourcePath),
        sourcemap: true,
        jsx: {runtime: 'automatic', development: true},
        reactCompiler: shouldRunReactCompiler(sourcePath) ? REACT_COMPILER_OPTIONS : false,
    });

    if (oxcResult.fatal || !oxcResult.code) {
        return null;
    }

    return toCommonJS(oxcResult.code, sourcePath, oxcResult.map);
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
            .update(JSON.stringify(CJS_PLUGIN_OPTIONS))
            .update(BABEL_CORE_VERSION)
            .update(DYNAMIC_IMPORT_PLUGIN_VERSION)
            .update(CJS_PLUGIN_VERSION)
            .update(JEST_HOIST_VERSION)
            .update(OXC_TRANSFORM_REACT_VERSION)
            .digest('hex');
    },
    process(sourceText, sourcePath, transformOptions) {
        if (shouldUseOxc(sourcePath)) {
            try {
                const result = processWithOxc(sourceText, sourcePath);
                if (result) {
                    return result;
                }
            } catch {
                // Fall through to babel-jest for syntax OXC or the CJS pass cannot parse.
            }
        }

        return babelTransformer.process(sourceText, sourcePath, transformOptions);
    },
};
