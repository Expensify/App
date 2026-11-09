/**
 * Parses rule fixtures with Oxc's TypeScript ESTree nodes and TypeScript scope analysis, without a
 * compiler. Babel supplies the ESLint tokens and comments that Oxc's parser API does not expose.
 */
const babelParser = require('@babel/eslint-parser');
const {analyze} = require('@typescript-eslint/scope-manager');

// Node can load Oxc's ESM entry point; Jest's CommonJS module loader cannot.
const {parseSync, visitorKeys} = process.getBuiltinModule('module').createRequire(__filename)('oxc-parser');

/**
 * Oxc provides UTF-16 ranges, while ESLint also requires line and column locations on every node.
 * @param {Object} node an Oxc ESTree node
 * @param {Number[]} lineStarts UTF-16 offsets at the start of each line
 * @returns {void}
 */
function addLocations(node, lineStarts) {
    function getPosition(offset) {
        let low = 0;
        let high = lineStarts.length;
        while (low + 1 < high) {
            const middle = Math.floor((low + high) / 2);
            if (lineStarts[middle] <= offset) {
                low = middle;
            } else {
                high = middle;
            }
        }
        return {line: low + 1, column: offset - lineStarts[low]};
    }

    Object.assign(node, {loc: {start: getPosition(node.start), end: getPosition(node.end)}});
    for (const key of visitorKeys[node.type] ?? []) {
        const children = Array.isArray(node[key]) ? node[key] : [node[key]];
        for (const child of children) {
            if (child) {
                addLocations(child, lineStarts);
            }
        }
    }
}

module.exports = {
    meta: {name: 'expensify-rule-test-parser', version: '1.0.0'},
    parseForESLint(code, options) {
        const tokenized = babelParser.parse(code, {
            ...options,
            requireConfigFile: false,
            babelOptions: {
                babelrc: false,
                configFile: false,
                parserOpts: {
                    plugins: ['typescript', 'jsx', 'decorators', 'decoratorAutoAccessors'],
                    // Oxc validates syntax. Babel only supplies tokens, so allow its recoverable error
                    // for TypeScript parameter decorators, which standard JavaScript decorators forbid.
                    errorRecovery: true,
                },
            },
        });

        const parsed = parseSync(options.filePath ?? 'fixture.tsx', code, {
            lang: options.ecmaFeatures?.jsx ? 'tsx' : 'ts',
            sourceType: options.sourceType,
            range: true,
            preserveParens: false,
        });
        if (parsed.errors.length > 0) {
            throw new SyntaxError(parsed.errors.map((error) => error.message).join('\n'));
        }

        const ast = parsed.program;
        const lineStarts = [0];
        for (const match of code.matchAll(/\r\n|[\n\r\u2028\u2029]/g)) {
            lineStarts.push(match.index + match[0].length);
        }
        addLocations(ast, lineStarts);
        ast.tokens = tokenized.tokens;
        ast.comments = tokenized.comments;

        return {
            ast,
            visitorKeys,
            scopeManager: analyze(ast, {
                sourceType: options.sourceType,
                childVisitorKeys: visitorKeys,
                jsxPragma: null,
                jsxFragmentName: null,
            }),
        };
    },
};
