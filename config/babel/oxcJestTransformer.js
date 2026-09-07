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
const JEST_HOIST_RE = /\bjest\s*\.\s*(mock|unmock|deepUnmock|disableAutomock|enableAutomock)\b/;
const HOISTABLE_JEST_CALL_RE = /^jest\s*\.\s*(mock|unmock|deepUnmock|disableAutomock|enableAutomock)\b/;

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

function skipString(code, start, quote) {
    let index = start + 1;
    while (index < code.length) {
        if (code[index] === '\\') {
            index += 2;
            continue;
        }
        if (code[index] === quote) {
            return index + 1;
        }
        index += 1;
    }
    return index;
}

function skipLineComment(code, start) {
    let index = start;
    while (index < code.length && code[index] !== '\n') {
        index += 1;
    }
    return index;
}

function skipBlockComment(code, start) {
    let index = start + 2;
    while (index < code.length && !(code[index] === '*' && code[index + 1] === '/')) {
        index += 1;
    }
    return index + 2;
}

function skipTemplate(code, start) {
    let index = start + 1;
    while (index < code.length) {
        if (code[index] === '\\') {
            index += 2;
            continue;
        }
        if (code[index] === '`') {
            return index + 1;
        }
        if (code[index] === '$' && code[index + 1] === '{') {
            // eslint-disable-next-line no-use-before-define -- skipTemplate and skipDelimited recurse for nested templates
            index = skipDelimited(code, index + 1, '{', '}');
            continue;
        }
        index += 1;
    }
    return index;
}

function skipDelimited(code, start, open, close) {
    let depth = 1;
    let index = start + 1;
    while (index < code.length && depth > 0) {
        const char = code[index];
        if (char === "'" || char === '"') {
            index = skipString(code, index, char);
            continue;
        }
        if (char === '`') {
            index = skipTemplate(code, index);
            continue;
        }
        if (char === '/' && code[index + 1] === '/') {
            index = skipLineComment(code, index);
            continue;
        }
        if (char === '/' && code[index + 1] === '*') {
            index = skipBlockComment(code, index);
            continue;
        }
        if (char === open) {
            depth += 1;
        } else if (char === close) {
            depth -= 1;
        }
        index += 1;
    }
    return index;
}

function skipWhitespaceAndComments(code, start) {
    let index = start;
    while (index < code.length) {
        const char = code[index];
        if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
            index += 1;
            continue;
        }
        if (char === '/' && code[index + 1] === '/') {
            index = skipLineComment(code, index);
            continue;
        }
        if (char === '/' && code[index + 1] === '*') {
            index = skipBlockComment(code, index);
            continue;
        }
        break;
    }
    return index;
}

function skipIdentifier(code, start) {
    let index = start;
    while (index < code.length && /\w/.test(code[index])) {
        index += 1;
    }
    return index;
}

function skipJestCallChain(code, start) {
    let index = skipIdentifier(code, start);
    index = skipWhitespaceAndComments(code, index);
    while (index < code.length && code[index] === '.') {
        index += 1;
        index = skipWhitespaceAndComments(code, index);
        index = skipIdentifier(code, index);
        index = skipWhitespaceAndComments(code, index);
        if (code[index] === '(') {
            index = skipDelimited(code, index, '(', ')');
            index = skipWhitespaceAndComments(code, index);
        }
    }
    if (code[index] === ';') {
        index += 1;
    }
    return index;
}

function hoistJestMocks(code) {
    if (!JEST_HOIST_RE.test(code)) {
        return code;
    }

    const hoisted = [];
    const rest = [];
    let i = 0;
    let cursor = 0;
    while (i < code.length) {
        i = skipWhitespaceAndComments(code, i);
        if (i >= code.length) {
            break;
        }
        if (HOISTABLE_JEST_CALL_RE.test(code.slice(i))) {
            if (i > cursor) {
                rest.push(code.slice(cursor, i));
            }
            const end = skipJestCallChain(code, i);
            hoisted.push(code.slice(i, end).trim());
            cursor = end;
            i = end;
            continue;
        }

        const char = code[i];
        if (char === "'" || char === '"') {
            i = skipString(code, i, char);
            continue;
        }
        if (char === '`') {
            i = skipTemplate(code, i);
            continue;
        }
        if (char === '(') {
            i = skipDelimited(code, i, '(', ')');
            continue;
        }
        if (char === '{') {
            i = skipDelimited(code, i, '{', '}');
            continue;
        }
        if (char === '[') {
            i = skipDelimited(code, i, '[', ']');
            continue;
        }
        i += 1;
    }
    if (cursor < code.length) {
        rest.push(code.slice(cursor));
    }

    if (hoisted.length === 0) {
        return code;
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
