const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const {transformSync} = require('oxc-transform-react');

const babelJest = require('babel-jest');
const OXC_TRANSFORM_REACT_VERSION = require('oxc-transform-react/package.json').version;
const BaseReactCompilerConfig = require('./reactCompilerConfig');

const babelTransformer = babelJest.createTransformer();

const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;
const TESTS_RE = /[/\\]tests[/\\]/;
const JEST_SETUP_RE = /[/\\]jest[/\\]/;
const MOCKS_RE = /[/\\]__mocks__[/\\]/;

const TRANSFORMER_SOURCE = fs.readFileSync(__filename);
const REACT_COMPILER_CONFIG_KEY = JSON.stringify(BaseReactCompilerConfig);

const REACT_COMPILER_OPTIONS = {
    ...BaseReactCompilerConfig,
    panicThreshold: 'none',
    eslintSuppressionRules: [],
};

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
    return !NODE_MODULES_RE.test(filename) && !TESTS_RE.test(filename) && !JEST_SETUP_RE.test(filename) && !MOCKS_RE.test(filename);
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

    return {code: cjs.code, map: cjs.map};
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
