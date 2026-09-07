const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const esbuild = require('esbuild');
const {transformSync} = require('oxc-transform-react');

const babelJest = require('babel-jest');
const BABEL_CORE_VERSION = require('@babel/core/package.json').version;
const OXC_TRANSFORM_REACT_VERSION = require('oxc-transform-react/package.json').version;
const BaseReactCompilerConfig = require('./reactCompilerConfig');

const babelTransformer = babelJest.createTransformer();

const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;
const TESTS_RE = /[/\\]tests[/\\]/;
const JEST_SETUP_RE = /[/\\]jest[/\\]/;
const MOCKS_RE = /[/\\]__mocks__[/\\]/;
const JEST_HOIST_RE = /\bjest\s*\.\s*(mock|unmock|deepUnmock|disableAutomock|enableAutomock)\b/;
const HOISTABLE_JEST_FNS = new Set(['mock', 'unmock', 'deepUnmock', 'disableAutomock', 'enableAutomock']);

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
    return !NODE_MODULES_RE.test(filename);
}

function shouldRunReactCompiler(filename) {
    return !TESTS_RE.test(filename) && !JEST_SETUP_RE.test(filename) && !MOCKS_RE.test(filename);
}

function isJestIdentifier(expression) {
    return expression.isIdentifier({name: 'jest'}) && !expression.scope.hasBinding('jest');
}

function isHoistableJestCall(expression) {
    if (!expression.isCallExpression()) {
        return false;
    }

    const callee = expression.get('callee');
    if (!callee.isMemberExpression() || callee.node.computed) {
        return false;
    }

    const object = callee.get('object');
    const property = callee.get('property');
    if (!property.isIdentifier() || !HOISTABLE_JEST_FNS.has(property.node.name)) {
        return false;
    }

    return isJestIdentifier(object) || isHoistableJestCall(object);
}

function hoistJestMocksPlugin() {
    return {
        name: 'oxc-jest-hoist-mocks',
        visitor: {
            Program(program) {
                const mockStatements = [];
                for (const statement of program.get('body')) {
                    if (statement.isExpressionStatement() && isHoistableJestCall(statement.get('expression'))) {
                        mockStatements.push(statement.node);
                        statement.remove();
                    }
                }
                if (mockStatements.length > 0) {
                    program.unshiftContainer('body', mockStatements);
                }
            },
        },
    };
}

function hoistJestMocks(code, sourcePath) {
    if (!JEST_HOIST_RE.test(code)) {
        return code;
    }

    const result = babel.transformSync(code, {
        filename: sourcePath,
        ast: false,
        code: true,
        babelrc: false,
        configFile: false,
        compact: false,
        sourceType: 'script',
        plugins: [hoistJestMocksPlugin],
    });

    return result?.code ?? code;
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

    const cjs = esbuild.transformSync(oxcResult.code, {
        loader: 'js',
        format: 'cjs',
        supported: {'dynamic-import': false},
        sourcefile: sourcePath,
        sourcemap: true,
    });

    return {code: hoistJestMocks(cjs.code, sourcePath), map: cjs.map};
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
            .update(BABEL_CORE_VERSION)
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
                // Fall through to babel-jest for syntax OXC, esbuild, or the hoist pass cannot parse.
            }
        }

        return babelTransformer.process(sourceText, sourcePath, transformOptions);
    },
};
