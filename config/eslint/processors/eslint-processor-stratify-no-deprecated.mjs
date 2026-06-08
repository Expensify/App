/**
 * Rewrites `@typescript-eslint/no-deprecated` messages into per-API rule IDs
 * (e.g. `@typescript-eslint/no-deprecated/StyleSheet.absoluteFillObject`) so
 * eslint-seatbelt can ratchet each deprecated API independently.
 */
import {parse} from '@babel/parser';

const NO_DEPRECATED_RULE_ID = '@typescript-eslint/no-deprecated';

// AST keys to ignore while walking children: positions, comments, etc.
const NON_CHILD_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments']);

// Node types whose children are part of a single dotted/qualified expression
// (e.g. `Foo.bar`, `Foo?.bar`, `Foo.bar` in TS type position).
const MEMBER_LIKE_TYPES = new Set(['MemberExpression', 'OptionalMemberExpression', 'TSQualifiedName']);

const sourceByFilename = new Map();

const isAstNode = (value) => !!value && typeof value === 'object' && typeof value.type === 'string' && typeof value.start === 'number' && typeof value.end === 'number';

/** Iterate over a node's direct AST children, skipping non-child metadata. */
function* astChildren(node) {
    for (const [key, value] of Object.entries(node)) {
        if (NON_CHILD_KEYS.has(key)) {
            continue;
        }
        for (const child of Array.isArray(value) ? value : [value]) {
            if (isAstNode(child)) {
                yield child;
            }
        }
    }
}

/** Convert ESLint's 1-based (line, column) into a 0-based source offset, or -1 if line is out of range. */
function lineColumnToOffset(source, line, column) {
    let lineStart = 0;
    for (let currentLine = 1; currentLine < line; currentLine++) {
        const nextNewline = source.indexOf('\n', lineStart);
        if (nextNewline < 0) {
            return -1;
        }
        lineStart = nextNewline + 1;
    }
    return lineStart + column - 1;
}

/**
 * Walk down the AST following children whose range contains `offset`.
 * Returns the ancestor path (root → deepest) or `null` if the offset is out of range.
 */
function findAstPathAtOffset(root, offset) {
    if (offset < 0 || offset < root.start || offset > root.end) {
        return null;
    }
    const path = [root];
    while (true) {
        const current = path.at(-1);
        let descended = false;
        for (const child of astChildren(current)) {
            if (offset >= child.start && offset <= child.end) {
                path.push(child);
                descended = true;
                break;
            }
        }
        if (!descended) {
            return path;
        }
    }
}

/** Walk a path upward through any wrapping member/qualified expression and return the topmost. */
function topOfMemberChain(path) {
    let topIndex = path.length - 1;
    while (topIndex > 0 && MEMBER_LIKE_TYPES.has(path.at(topIndex - 1).type)) {
        topIndex--;
    }
    return path.at(topIndex);
}

function parseSourceOrNull(source) {
    try {
        return parse(source, {sourceType: 'module', plugins: ['typescript', 'jsx']});
    } catch {
        return null;
    }
}

/** Slice the full deprecated expression (e.g. `StyleSheet.absoluteFillObject`) at the lint location, or null on miss. */
function getDeprecatedExpressionFromSource(source, ast, message) {
    const offset = lineColumnToOffset(source, message.line, message.column);
    const path = findAstPathAtOffset(ast, offset);
    if (!path) {
        return null;
    }
    const top = topOfMemberChain(path);
    return source.slice(top.start, top.end);
}

/** Fallback: parse the symbol name out of the lint message text. */
function getSymbolNameFromMessage(message) {
    const match = /^`([^`]+)`/.exec(message.message);
    return match ? match.at(1) : null;
}

/** Trim; collapse whitespace and `/` to `_`. Preserves `.`, `#`, `$`, `@`. */
function toRuleIdSuffix(apiName) {
    return apiName.trim().replaceAll(/[\s/]+/g, '_');
}

/**
 * @param {import('eslint').Linter.LintMessage[]} messages
 * @param {string | null} source
 * @returns {import('eslint').Linter.LintMessage[]}
 */
function stratifyMessages(messages, source) {
    const hasNoDeprecatedMessages = messages.some((message) => message.ruleId === NO_DEPRECATED_RULE_ID);
    const ast = source && hasNoDeprecatedMessages ? parseSourceOrNull(source) : null;

    return messages.map((message) => {
        if (message.ruleId !== NO_DEPRECATED_RULE_ID) {
            return message;
        }
        const apiName = (ast && getDeprecatedExpressionFromSource(source, ast, message)) || getSymbolNameFromMessage(message);
        if (!apiName) {
            return message;
        }
        return {...message, ruleId: `${NO_DEPRECATED_RULE_ID}/${toRuleIdSuffix(apiName)}`};
    });
}

const processor = {
    meta: {
        name: 'stratify-no-deprecated',
        version: '1.0.0',
    },
    supportsAutofix: true,

    preprocess(text, filename) {
        sourceByFilename.set(filename, text);
        return [text];
    },

    postprocess(messagesPerBlock, filename) {
        const source = sourceByFilename.get(filename) ?? null;
        sourceByFilename.delete(filename);
        return stratifyMessages(messagesPerBlock[0], source);
    },
};

export default processor;
