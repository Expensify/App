const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const {parseSync} = require('oxc-parser');
const {transformSync} = require('oxc-transform-react');

const babelJest = require('babel-jest');
const OXC_PARSER_VERSION = require('oxc-parser/package.json').version;
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
    return expression?.type === 'Identifier' && expression.name === 'jest';
}

function isHoistableJestCall(expression) {
    if (expression?.type !== 'CallExpression' || expression.optional) {
        return false;
    }

    const callee = expression.callee;
    if (callee?.type !== 'MemberExpression' || callee.computed || callee.optional) {
        return false;
    }

    if (callee.property?.type !== 'Identifier' || !HOISTABLE_JEST_FNS.has(callee.property.name)) {
        return false;
    }

    return isJestIdentifier(callee.object) || isHoistableJestCall(callee.object);
}

function statementSpan(statement) {
    return statement.range ?? [statement.start, statement.end];
}

function hoistJestMocks(code) {
    if (!JEST_HOIST_RE.test(code)) {
        return code;
    }

    const {program, errors} = parseSync('hoist.js', code, {sourceType: 'script', range: true});
    if (errors.length > 0) {
        return code;
    }

    const hoisted = [];
    const rest = [];
    let cursor = 0;

    for (const statement of program.body) {
        const [start, end] = statementSpan(statement);
        if (statement.type === 'ExpressionStatement' && isHoistableJestCall(statement.expression)) {
            if (start > cursor) {
                rest.push(code.slice(cursor, start));
            }
            hoisted.push(code.slice(start, end).trim());
            cursor = end;
        }
    }

    if (hoisted.length === 0) {
        return code;
    }

    if (cursor < code.length) {
        rest.push(code.slice(cursor));
    }

    return `${hoisted.join('\n')}\n${rest.join('')}`;
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

    return {code: hoistJestMocks(cjs.code), map: cjs.map};
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
            .update(OXC_PARSER_VERSION)
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
                // Fall through to babel-jest for syntax OXC or esbuild cannot parse.
            }
        }

        return babelTransformer.process(sourceText, sourcePath, transformOptions);
    },
};
