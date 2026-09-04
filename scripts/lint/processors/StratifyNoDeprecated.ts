import {parse} from '@babel/parser';
import {file} from 'bun';

import type {LintMessage} from '../types';

import Processor from '../Processor';

const NO_DEPRECATED_RULE_ID = '@typescript-eslint/no-deprecated';
const NON_CHILD_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments']);
const MEMBER_LIKE_TYPES = new Set(['MemberExpression', 'OptionalMemberExpression', 'TSQualifiedName']);

type ASTNode = {
    type: string;
    start: number;
    end: number;
    [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

const isASTNode = (value: unknown): value is ASTNode => {
    if (!isRecord(value)) {
        return false;
    }
    return typeof value.type === 'string' && typeof value.start === 'number' && typeof value.end === 'number';
};

function* astChildren(node: ASTNode): Generator<ASTNode> {
    for (const [key, value] of Object.entries(node)) {
        if (NON_CHILD_KEYS.has(key)) {
            continue;
        }
        for (const child of Array.isArray(value) ? value : [value]) {
            if (isASTNode(child)) {
                yield child;
            }
        }
    }
}

function lineColumnToOffset(source: string, line: number, column: number): number {
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

function findASTPathAtOffset(root: ASTNode, offset: number): ASTNode[] | null {
    if (offset < 0 || offset < root.start || offset > root.end) {
        return null;
    }
    const path = [root];
    while (true) {
        const current = path.at(-1);
        if (!current) {
            return path;
        }
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

function topOfMemberChain(path: ASTNode[]): ASTNode {
    let topIndex = path.length - 1;
    while (topIndex > 0 && MEMBER_LIKE_TYPES.has(path.at(topIndex - 1)?.type ?? '')) {
        topIndex--;
    }
    const top = path.at(topIndex);
    if (!top) {
        throw new Error('empty AST path');
    }
    return top;
}

function parseSourceOrNull(source: string): ASTNode | null {
    try {
        const parsed: unknown = parse(source, {sourceType: 'module', plugins: ['typescript', 'jsx']});
        return isASTNode(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

function getDeprecatedExpressionFromSource(source: string, ast: ASTNode, message: LintMessage): string | null {
    const offset = lineColumnToOffset(source, message.line, message.column);
    const path = findASTPathAtOffset(ast, offset);
    if (!path) {
        return null;
    }
    const top = topOfMemberChain(path);
    return source.slice(top.start, top.end);
}

function getSymbolNameFromMessage(message: LintMessage): string | null {
    const match = /^`([^`]+)`/.exec(message.message);
    return match ? (match.at(1) ?? null) : null;
}

function toRuleIDSuffix(apiName: string): string {
    return apiName.trim().replaceAll(/[\s/]+/g, '_');
}

function stratifyMessages(messages: LintMessage[], source: string | null): LintMessage[] {
    const hasNoDeprecatedMessages = messages.some((message) => message.ruleID === NO_DEPRECATED_RULE_ID);
    const ast = source && hasNoDeprecatedMessages ? parseSourceOrNull(source) : null;

    return messages.map((message) => {
        if (message.ruleID !== NO_DEPRECATED_RULE_ID) {
            return message;
        }
        const apiName = (source !== null && ast !== null ? getDeprecatedExpressionFromSource(source, ast, message) : null) ?? getSymbolNameFromMessage(message);
        if (!apiName) {
            return message;
        }
        return {...message, ruleID: `${NO_DEPRECATED_RULE_ID}/${toRuleIDSuffix(apiName)}`};
    });
}

/**
 * Rewrite `@typescript-eslint/no-deprecated` into per-API rule IDs so the
 * ratchet can tighten each deprecated symbol independently. Only files that
 * actually carry a `no-deprecated` message are re-parsed.
 */
class StratifyNoDeprecated extends Processor {
    readonly name = 'stratify-no-deprecated';

    process(messages: LintMessage[]): Promise<LintMessage[]> {
        return stratifyNoDeprecated(messages);
    }
}

async function stratifyNoDeprecated(messages: LintMessage[]): Promise<LintMessage[]> {
    const filesNeedingSource = new Set<string>();
    for (const message of messages) {
        if (message.ruleID === NO_DEPRECATED_RULE_ID) {
            filesNeedingSource.add(message.filePath);
        }
    }
    if (filesNeedingSource.size === 0) {
        return messages;
    }

    const sources = new Map<string, string | null>();
    await Promise.all(
        [...filesNeedingSource].map(async (filename) => {
            try {
                sources.set(filename, await file(filename).text());
            } catch {
                sources.set(filename, null);
            }
        }),
    );

    const byFile = new Map<string, LintMessage[]>();
    for (const message of messages) {
        const list = byFile.get(message.filePath) ?? [];
        list.push(message);
        byFile.set(message.filePath, list);
    }

    const rewritten: LintMessage[] = [];
    for (const [filename, fileMessages] of byFile) {
        rewritten.push(...stratifyMessages(fileMessages, sources.get(filename) ?? null));
    }
    return rewritten;
}

export default StratifyNoDeprecated;
export {NO_DEPRECATED_RULE_ID, stratifyMessages, stratifyNoDeprecated, toRuleIDSuffix};
