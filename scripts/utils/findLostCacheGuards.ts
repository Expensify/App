/**
 * Finds calls that React Compiler cached on the base branch but runs on every render on this branch.
 * A file can keep compiling while a refactor moves a computation out of its cache guard, which is how
 * Expensify/App#104522 slowed the app down without failing the compliance check.
 */
import type {ReactCompilerOptions} from 'oxc-transform-react';

import {parse} from '@babel/parser';
import path from 'node:path';
import {transformSync} from 'oxc-transform-react';

import type {ASTNode} from './BabelASTUtils';

import oxcReactCompilerConfig from '../../config/babel/oxcReactCompilerConfig';
import BabelASTUtils from './BabelASTUtils';

type CallCounts = {
    guarded: number;
    unguarded: number;
};

type FunctionCalls = {
    isCompiled: boolean;

    /** Number of `if` blocks that read the `$` cache, including ones that only cache a callback or object */
    cacheGuardCount: number;
    calls: Map<string, CallCounts>;
};

type LostCacheGuard = {
    functionName: string;

    /** The callee as written in the compiled output, or `<Name>` for a JSX element, or undefined when the whole function stopped compiling */
    call?: string;
};

type TraversalContext = {
    functionCalls: FunctionCalls;
    cacheName: string;
    isGuarded: boolean;
};

const NON_CHILD_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments', 'comments']);
const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ObjectMethod', 'ClassMethod']);
const JSX_RUNTIME_CALL_PREFIX = '_jsx';
const NEW_EXPRESSION_PREFIX = 'new ';

// Babel parses optional chaining (`items?.filter(...)`) as optional node types, and `new Set(items)` caches work
// the same way a call does, so all of them are counted or moving one out of a guard would go unnoticed.
const CALL_TYPES = new Set(['CallExpression', 'OptionalCallExpression', 'NewExpression']);
const MEMBER_TYPES = new Set(['MemberExpression', 'OptionalMemberExpression']);
const HOOK_NAME_PATTERN = /^use[A-Z0-9]/;
const COMPILER_TEMPORARY_PATTERN = /^t\d+$/;
const ANONYMOUS_FUNCTION_NAME = '<anonymous>';

function compile(source: string, filename: string): string | undefined {
    const extension = path.extname(filename).slice(1);
    try {
        const result = transformSync(filename, source, {
            lang: extension === 'tsx' ? 'tsx' : 'ts',
            reactCompiler: oxcReactCompilerConfig() as ReactCompilerOptions,
        });
        return result.fatal || !result.code ? undefined : result.code;
    } catch {
        return undefined;
    }
}

function getMemberChainName(node: unknown): string | undefined {
    if (!BabelASTUtils.isASTNode(node)) {
        return undefined;
    }
    if (node.type === 'Identifier' && typeof node.name === 'string') {
        // The compiler numbers its temporaries in emit order, so the same value gets a different name after an unrelated edit.
        return COMPILER_TEMPORARY_PATTERN.test(node.name) ? 't' : node.name;
    }
    if (node.type === 'ThisExpression') {
        return 'this';
    }
    if (MEMBER_TYPES.has(node.type) && !node.computed && BabelASTUtils.isASTNode(node.property) && typeof node.property.name === 'string') {
        const objectName = getMemberChainName(node.object);
        return objectName === undefined ? undefined : `${objectName}.${node.property.name}`;
    }
    return undefined;
}

function getCallName(node: ASTNode): string | undefined {
    const calleeName = getMemberChainName(node.callee);
    if (calleeName === undefined) {
        return undefined;
    }
    if (node.type === 'NewExpression') {
        return `${NEW_EXPRESSION_PREFIX}${calleeName}`;
    }
    if (calleeName.startsWith(JSX_RUNTIME_CALL_PREFIX)) {
        const elementType = Array.isArray(node.arguments) ? (node.arguments.at(0) as unknown) : undefined;
        if (BabelASTUtils.isASTNode(elementType) && elementType.type === 'StringLiteral' && typeof elementType.value === 'string') {
            return `<${elementType.value}>`;
        }
        const elementName = getMemberChainName(elementType);
        return elementName === undefined ? undefined : `<${elementName}>`;
    }
    const lastSegment = calleeName.split('.').at(-1) ?? '';
    if (calleeName === '_c' || calleeName === 'Symbol.for' || HOOK_NAME_PATTERN.test(lastSegment)) {
        return undefined;
    }
    return calleeName;
}

/** The name of the `$` cache array when the function's body starts with `const $ = _c(n)`, which only compiled functions do */
function getCacheName(functionNode: ASTNode): string | undefined {
    const body = functionNode.body;
    if (!BabelASTUtils.isASTNode(body) || body.type !== 'BlockStatement' || !Array.isArray(body.body)) {
        return undefined;
    }
    const firstStatement: unknown = body.body.at(0);
    if (!BabelASTUtils.isASTNode(firstStatement) || firstStatement.type !== 'VariableDeclaration' || !Array.isArray(firstStatement.declarations)) {
        return undefined;
    }
    const declarator: unknown = firstStatement.declarations.at(0);
    if (!BabelASTUtils.isASTNode(declarator) || !BabelASTUtils.isASTNode(declarator.id) || !BabelASTUtils.isASTNode(declarator.init)) {
        return undefined;
    }
    const init = declarator.init;
    if (init.type !== 'CallExpression' || getMemberChainName(init.callee) !== '_c' || typeof declarator.id.name !== 'string') {
        return undefined;
    }
    return declarator.id.name;
}

function readsCache(node: ASTNode, cacheName: string): boolean {
    if (node.type === 'MemberExpression' && BabelASTUtils.isASTNode(node.object) && node.object.type === 'Identifier' && node.object.name === cacheName) {
        return true;
    }
    for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
        if (readsCache(child, cacheName)) {
            return true;
        }
    }
    return false;
}

function getFunctionName(node: ASTNode, nameHint: string | undefined): string {
    if (BabelASTUtils.isASTNode(node.id) && typeof node.id.name === 'string') {
        return node.id.name;
    }
    if (BabelASTUtils.isASTNode(node.key) && typeof node.key.name === 'string') {
        return node.key.name;
    }
    return nameHint ?? ANONYMOUS_FUNCTION_NAME;
}

function recordCall(context: TraversalContext, name: string): void {
    const counts = context.functionCalls.calls.get(name) ?? {guarded: 0, unguarded: 0};
    if (context.isGuarded) {
        counts.guarded += 1;
    } else {
        counts.unguarded += 1;
    }
    context.functionCalls.calls.set(name, counts);
}

function collectFunctionCalls(code: string): Map<string, FunctionCalls> | undefined {
    let program: unknown;
    try {
        program = parse(code, {sourceType: 'module'});
    } catch {
        return undefined;
    }
    if (!BabelASTUtils.isASTNode(program)) {
        return undefined;
    }

    const functions = new Map<string, FunctionCalls>();

    const visit = (node: ASTNode, context: TraversalContext | undefined, nameHint: string | undefined): void => {
        if (FUNCTION_TYPES.has(node.type)) {
            const functionName = getFunctionName(node, nameHint);
            const cacheName = getCacheName(node);
            const functionCalls = functions.get(functionName) ?? {isCompiled: false, cacheGuardCount: 0, calls: new Map<string, CallCounts>()};
            functionCalls.isCompiled ||= cacheName !== undefined;
            functions.set(functionName, functionCalls);

            // Calls inside callbacks run when the callback runs, not on render, so only the compiled body itself is tracked.
            const functionContext = cacheName === undefined ? undefined : {functionCalls, cacheName, isGuarded: false};
            for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
                visit(child, functionContext, undefined);
            }
            return;
        }

        if (node.type === 'IfStatement' && context && BabelASTUtils.isASTNode(node.test) && readsCache(node.test, context.cacheName)) {
            context.functionCalls.cacheGuardCount += 1;
            visit(node.test, context, nameHint);
            // The else branch only reads cached values back from `$`, so it holds no calls to count.
            if (BabelASTUtils.isASTNode(node.consequent)) {
                visit(node.consequent, {...context, isGuarded: true}, nameHint);
            }
            return;
        }

        if (CALL_TYPES.has(node.type) && context) {
            const callName = getCallName(node);
            if (callName !== undefined) {
                recordCall(context, callName);
            }
        }

        let childNameHint = nameHint;
        if (node.type === 'VariableDeclarator' && BabelASTUtils.isASTNode(node.id) && typeof node.id.name === 'string') {
            childNameHint = node.id.name;
        } else if (node.type === 'ExportDefaultDeclaration') {
            childNameHint = 'default';
        }
        for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
            visit(child, context, childNameHint);
        }
    };

    visit(program, undefined, undefined);
    return functions;
}

/**
 * Compiles both versions of a file and lists every call that moved from inside a cache guard on the base
 * branch to outside one, plus every function that cached something on the base branch and is no longer
 * compiled. Functions that were renamed or removed are not compared.
 *
 * `baseFilename` is the file's path on the base branch, so a file renamed between `.ts` and `.tsx` parses each
 * version with its own syntax.
 */
function findLostCacheGuards(baseSource: string, branchSource: string, filename: string, baseFilename = filename): LostCacheGuard[] {
    const baseCode = compile(baseSource, baseFilename);
    const branchCode = compile(branchSource, filename);
    if (baseCode === undefined || branchCode === undefined) {
        return [];
    }
    const baseFunctions = collectFunctionCalls(baseCode);
    const branchFunctions = collectFunctionCalls(branchCode);
    if (!baseFunctions || !branchFunctions) {
        return [];
    }

    const lostGuards: LostCacheGuard[] = [];
    for (const [functionName, baseFunction] of baseFunctions) {
        const branchFunction = branchFunctions.get(functionName);
        if (!baseFunction.isCompiled || !branchFunction || functionName === ANONYMOUS_FUNCTION_NAME) {
            continue;
        }
        if (!branchFunction.isCompiled) {
            // Counting guards, not guarded calls, also catches a function that only cached callbacks or objects.
            // A function with no guard on main cached nothing, so the compiler skipping it now loses nothing.
            if (baseFunction.cacheGuardCount > 0) {
                lostGuards.push({functionName});
            }
            continue;
        }
        for (const [call, baseCounts] of baseFunction.calls) {
            const branchCounts = branchFunction.calls.get(call) ?? {guarded: 0, unguarded: 0};
            // Requiring both counts to move ignores a new uncached call next to cached ones that are still there.
            if (branchCounts.guarded < baseCounts.guarded && branchCounts.unguarded > baseCounts.unguarded) {
                lostGuards.push({functionName, call});
            }
        }
    }
    return lostGuards;
}

export default findLostCacheGuards;
export type {LostCacheGuard};
