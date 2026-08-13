/**
 * Turns one source file into the pieces of a call graph: its function units, the calls each unit
 * makes, the synchronous Onyx reads each unit performs, and the exports and re-exports that connect it
 * to other files. `checkRenderReachability.ts` stitches the per-file results into a graph and
 * `renderReachability.ts` searches it.
 *
 * Two things decide what a unit is, and both mirror `eslint-plugin-local-rules/no-onyx-get-in-render`:
 *
 * - A function boundary that defers execution starts a new unit: a component body, a hook body, an
 *   event handler, a plain function.
 * - A boundary that defers nothing is transparent, so the code inside it belongs to the unit that
 *   encloses it: an IIFE, a synchronous `map`/`filter`/`reduce` callback, a `useMemo` callback. This is
 *   the case the earlier subscription classifier got wrong, and it is why a call inside `ids.map(...)`
 *   in a component body counts as a call the component makes while rendering.
 *
 * The logic is duplicated rather than shared with the lint rule because ESLint loads rules as plain
 * JavaScript and cannot import a TypeScript module. `tests/unit/CallGraphFromSourceTest.ts` and
 * `tests/unit/NoOnyxGetInRenderRuleTest.ts` cover the same shapes on both sides, so a divergence shows
 * up as a failing test rather than as a quiet disagreement.
 *
 * Scope and variable resolution comes from ESLint's own scope analysis, so an alias, a shadowed name and
 * an `import {x as y}` all resolve the way they do at runtime rather than by matching text.
 */
import type {Rule, Scope} from 'eslint';

import tsParser from '@typescript-eslint/parser';
import {Linter} from 'eslint';

/** Import sources that resolve to the Onyx library. */
const ONYX_MODULE_PREFIX = 'react-native-onyx';

/** Synchronous read APIs on the Onyx surface. */
const SYNC_READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

/** Array methods whose callback runs in the caller's own tick. */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

/** Hooks whose callback runs during render. */
const RENDER_TIME_HOOK_NAMES = new Set(['useMemo']);

/** Calls that wrap a component without deferring it. */
const COMPONENT_WRAPPER_NAMES = new Set(['memo', 'forwardRef']);

/** Name of the unit that is the module body itself, which runs once at import time rather than at render. */
const MODULE_UNIT_NAME = '<module>';

/** Rule id the collector is registered under. Nothing is reported; the rule exists to walk the AST. */
const COLLECTOR_RULE_ID = 'collector/collect';

/**
 * A permissive view of the AST. The parser's own node types are not a direct dependency, JSX nodes are
 * absent from ESTree's union anyway, and every field read here has the same shape in every dialect, so
 * one optional-field type covers them.
 */
type AstNode = {
    type: string;
    name?: string;
    computed?: boolean;
    value?: unknown;
    id?: AstNode | null;
    key?: AstNode;
    init?: AstNode | null;
    body?: AstNode | AstNode[];
    callee?: AstNode;
    arguments?: AstNode[];
    object?: AstNode;
    property?: AstNode;
    argument?: AstNode | null;
    source?: AstNode | null;
    specifiers?: AstNode[];
    local?: AstNode;
    imported?: AstNode;
    exported?: AstNode;
    declaration?: AstNode | null;
    properties?: AstNode[];
    loc?: {start: {line: number}};
};

/** Why a call could not be resolved. */
type UnresolvedReason = 'global' | 'dynamic' | 'member' | 'unknown';

/** What a call resolves to. `module` crosses a file boundary and is resolved by the caller. */
type CalleeRef = {kind: 'local'; unitId: string} | {kind: 'module'; source: string; name: string} | {kind: 'unresolved'; reason: UnresolvedReason};

/** A function unit: a node of the call graph. */
type SourceUnit = {
    id: string;

    /** Dotted name chain, for example `SearchPage.onPress`, or `<module>` for the module body. */
    name: string;

    isRenderEntry: boolean;
    line: number;
};

/** A call that runs whenever its unit runs. */
type SourceCall = {
    from: string;
    callee: CalleeRef;
    line: number;
};

/** A synchronous Onyx read, attributed to the unit that performs it. */
type SourceRead = {
    unitId: string;
    method: string;
    line: number;
};

/** `export {name} from './other'`, or `export * from './other'` with name `*`. */
type ReExport = {
    name: string;
    source: string;
};

type FileAnalysis = {
    file: string;
    units: SourceUnit[];
    calls: SourceCall[];
    reads: SourceRead[];
    reExports: ReExport[];

    /** Unit id of the file's default export, when that export is a function. */
    defaultExportUnitId: string | null;
};

function isAstNode(value: unknown): value is AstNode {
    return typeof value === 'object' && value !== null && typeof Reflect.get(value, 'type') === 'string';
}

function toAstNode(value: unknown): AstNode | null {
    return isAstNode(value) ? value : null;
}

/** Keep only the nodes, in order. ESLint hands back its own node types, which this module reads structurally. */
function toAstNodes(values: readonly unknown[]): AstNode[] {
    const nodes: AstNode[] = [];

    for (const value of values) {
        if (isAstNode(value)) {
            nodes.push(value);
        }
    }

    return nodes;
}

function isFunctionNode(node: AstNode | null | undefined): boolean {
    return node?.type === 'FunctionDeclaration' || node?.type === 'FunctionExpression' || node?.type === 'ArrowFunctionExpression';
}

function isHookName(functionName: string): boolean {
    return /^use[A-Z0-9]/.test(functionName);
}

function isComponentName(functionName: string): boolean {
    return /^[A-Z]/.test(functionName);
}

function getStaticName(keyNode: AstNode | undefined | null, computed: boolean | undefined): string | null {
    if (!keyNode) {
        return null;
    }

    if (!computed && keyNode.type === 'Identifier' && keyNode.name) {
        return keyNode.name;
    }

    if (keyNode.type === 'Literal' && typeof keyNode.value === 'string') {
        return keyNode.value;
    }

    return null;
}

function getStaticPropertyName(memberExpression: AstNode): string | null {
    return getStaticName(memberExpression.property, memberExpression.computed);
}

function matchesCalleeName(callee: AstNode | undefined | null, names: ReadonlySet<string>): boolean {
    if (!callee) {
        return false;
    }

    if (callee.type === 'Identifier') {
        return !!callee.name && names.has(callee.name);
    }

    if (callee.type === 'MemberExpression') {
        const propertyName = getStaticPropertyName(callee);
        return !!propertyName && names.has(propertyName);
    }

    return false;
}

function returnsJSX(functionNode: AstNode): boolean {
    const body = functionNode.body;

    if (!body || Array.isArray(body)) {
        return false;
    }

    if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
        return true;
    }

    if (body.type !== 'BlockStatement' || !Array.isArray(body.body)) {
        return false;
    }

    return body.body.some((statement) => statement.type === 'ReturnStatement' && (statement.argument?.type === 'JSXElement' || statement.argument?.type === 'JSXFragment'));
}

/** True when the boundary defers nothing, so the code inside it belongs to the enclosing unit. */
function isTransparentBoundary(functionNode: AstNode, parent: AstNode | null): boolean {
    if (parent?.type !== 'CallExpression') {
        return false;
    }

    // An IIFE runs where it is written.
    if (parent.callee === functionNode) {
        return true;
    }

    if (!parent.arguments?.includes(functionNode)) {
        return false;
    }

    // A useMemo callback runs during render, so it is not a unit of its own. A component wrapped in
    // memo() or forwardRef() is a unit: it is the component body, and it takes the wrapper's name.
    if (matchesCalleeName(parent.callee, RENDER_TIME_HOOK_NAMES)) {
        return true;
    }

    return parent.callee?.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS);
}

/**
 * The name a function is known by. A function passed to a call takes the name of the binding that call
 * is assigned to, so `const Row = memo(() => ...)` is `Row` and `const onPress = useCallback(...)` is
 * `onPress`.
 */
function getFunctionName(functionNode: AstNode, ancestors: readonly AstNode[], index: number): string | null {
    if (functionNode.id?.type === 'Identifier' && functionNode.id.name) {
        return functionNode.id.name;
    }

    let parentIndex = index - 1;
    let parent = parentIndex >= 0 ? (ancestors.at(parentIndex) ?? null) : null;

    while (parent?.type === 'CallExpression' && parentIndex > 0) {
        parentIndex -= 1;
        parent = ancestors.at(parentIndex) ?? null;
    }

    if (parent?.type === 'VariableDeclarator' && parent.id?.type === 'Identifier' && parent.id.name) {
        return parent.id.name;
    }

    if (parent?.type === 'Property') {
        return getStaticName(parent.key, parent.computed);
    }

    if (parent?.type === 'ExportDefaultDeclaration') {
        return 'default';
    }

    return null;
}

function isRenderEntryFunction(functionNode: AstNode, simpleName: string | null): boolean {
    if (simpleName && (isHookName(simpleName) || isComponentName(simpleName))) {
        return true;
    }

    return returnsJSX(functionNode);
}

/**
 * The unit a node belongs to, found by walking outwards and skipping transparent boundaries. A node with
 * no enclosing function belongs to the module unit, which runs at import time rather than at render.
 */
function getUnitChain(ancestors: readonly AstNode[], file: string): SourceUnit {
    const names: string[] = [];
    let innermostNode: AstNode | null = null;
    let innermostSimpleName: string | null = null;

    for (let index = 0; index < ancestors.length; index++) {
        const ancestor = ancestors.at(index);

        if (!ancestor || !isFunctionNode(ancestor)) {
            continue;
        }

        const parent = index > 0 ? (ancestors.at(index - 1) ?? null) : null;

        if (isTransparentBoundary(ancestor, parent)) {
            continue;
        }

        const simpleName = getFunctionName(ancestor, ancestors, index);
        names.push(simpleName ?? `anonymous:${ancestor.loc?.start.line ?? 0}`);
        innermostNode = ancestor;
        innermostSimpleName = simpleName;
    }

    if (!innermostNode) {
        return {id: `${file}#${MODULE_UNIT_NAME}`, name: MODULE_UNIT_NAME, isRenderEntry: false, line: 1};
    }

    const name = names.join('.');
    return {
        id: `${file}#${name}`,
        name,
        isRenderEntry: isRenderEntryFunction(innermostNode, innermostSimpleName),
        line: innermostNode.loc?.start.line ?? 0,
    };
}

function isOnyxModuleSource(sourceValue: unknown): boolean {
    return typeof sourceValue === 'string' && (sourceValue === ONYX_MODULE_PREFIX || sourceValue.startsWith(`${ONYX_MODULE_PREFIX}/`));
}

/** The import a resolved variable came from, or null when it is not an import. `imported` is null for a default or namespace import. */
function getImportDefinition(variable: Scope.Variable | null): {source: string; imported: string | null} | null {
    const definition = variable?.defs.at(0);

    if (definition?.type !== 'ImportBinding') {
        return null;
    }

    const source = toAstNode(definition.parent.source)?.value;
    const specifier = toAstNode(definition.node);

    if (typeof source !== 'string' || !specifier) {
        return null;
    }

    if (specifier.type === 'ImportSpecifier') {
        return {source, imported: getStaticName(specifier.imported, false)};
    }

    // A default or namespace import binds the module object, so the call site decides the target name.
    return {source, imported: null};
}

/** The function a resolved variable is bound to, covering `function f`, `const f = () => {}` and `const C = memo(...)`. */
function getFunctionForVariable(variable: Scope.Variable | null): AstNode | null {
    const definition = variable?.defs.at(0);

    // A parameter's definition node is the function that declares it, so accepting every definition kind
    // would resolve `props.onDone()` to the component that received `props`.
    if (definition?.type !== 'FunctionName' && definition?.type !== 'Variable') {
        return null;
    }

    const definitionNode = toAstNode(definition.node);

    if (!definitionNode) {
        return null;
    }

    if (isFunctionNode(definitionNode)) {
        return definitionNode;
    }

    if (definitionNode.type !== 'VariableDeclarator') {
        return null;
    }

    if (isFunctionNode(definitionNode.init)) {
        return definitionNode.init ?? null;
    }

    if (definitionNode.init?.type === 'CallExpression' && matchesCalleeName(definitionNode.init.callee, COMPONENT_WRAPPER_NAMES)) {
        return definitionNode.init.arguments?.find((argument) => isFunctionNode(argument)) ?? null;
    }

    return null;
}

function findVariable(scope: Scope.Scope | null, variableName: string): Scope.Variable | null {
    let currentScope = scope;

    while (currentScope) {
        const variable = currentScope.variables.find((scopeVariable) => scopeVariable.name === variableName);

        if (variable) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
}

/**
 * Analyse one file. Calls that cross a file boundary come back as `{kind: 'module'}` for the caller to
 * resolve once every file has been analysed.
 */
function analyzeSource(file: string, code: string): FileAnalysis {
    const units = new Map<string, SourceUnit>();
    const unitIdByFunctionNode = new Map<AstNode, string>();
    const reads: SourceRead[] = [];
    const reExports: ReExport[] = [];
    const onyxImportLocalNames = new Set<string>();
    const onyxReadAliases = new Set<string>();

    /**
     * Calls are resolved after traversal rather than at the call site: a call to a hoisted function
     * declared further down the file has no unit id yet at the moment the call is visited.
     */
    const pendingCalls: Array<{from: string; line: number; calleeFunction: AstNode | null; moduleRef: {source: string; name: string} | null; reason: UnresolvedReason}> = [];
    let defaultExportFunction: AstNode | null = null;

    function recordUnit(unit: SourceUnit): void {
        if (units.has(unit.id)) {
            return;
        }

        units.set(unit.id, unit);
    }

    const collector: Rule.RuleModule = {
        create(context) {
            const sourceCode = context.sourceCode;

            function ancestorsOf(node: Rule.Node): AstNode[] {
                return toAstNodes(sourceCode.getAncestors(node));
            }

            function unitOf(node: Rule.Node): SourceUnit {
                const unit = getUnitChain(ancestorsOf(node), file);
                recordUnit(unit);
                return unit;
            }

            /** Register a function as a unit, unless the boundary is transparent. */
            function onFunction(node: Rule.Node): void {
                const functionNode = toAstNode(node);
                const ancestors = ancestorsOf(node);

                if (!functionNode || isTransparentBoundary(functionNode, ancestors.at(-1) ?? null)) {
                    return;
                }

                // The chain for a function's own body is the chain of the function itself.
                const unit = getUnitChain([...ancestors, functionNode], file);
                recordUnit(unit);
                unitIdByFunctionNode.set(functionNode, unit.id);
            }

            return {
                FunctionDeclaration: onFunction,
                FunctionExpression: onFunction,
                ArrowFunctionExpression: onFunction,
                ImportDeclaration(node) {
                    const declaration = toAstNode(node);

                    if (!isOnyxModuleSource(declaration?.source?.value)) {
                        return;
                    }

                    for (const specifier of declaration?.specifiers ?? []) {
                        if ((specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') && specifier.local?.name) {
                            onyxImportLocalNames.add(specifier.local.name);
                        }
                    }
                },
                ExportNamedDeclaration(node) {
                    const declaration = toAstNode(node);
                    const source = declaration?.source?.value;

                    if (typeof source !== 'string') {
                        return;
                    }

                    for (const specifier of declaration?.specifiers ?? []) {
                        const exportedName = getStaticName(specifier.exported, false) ?? getStaticName(specifier.local, false);

                        if (exportedName) {
                            reExports.push({name: exportedName, source});
                        }
                    }
                },
                ExportAllDeclaration(node) {
                    const source = toAstNode(node)?.source?.value;

                    if (typeof source === 'string') {
                        reExports.push({name: '*', source});
                    }
                },
                ExportDefaultDeclaration(node) {
                    const declaration = toAstNode(node)?.declaration;

                    if (isFunctionNode(declaration)) {
                        defaultExportFunction = declaration ?? null;
                        return;
                    }

                    if (declaration?.type === 'Identifier' && declaration.name) {
                        defaultExportFunction = getFunctionForVariable(findVariable(sourceCode.getScope(node), declaration.name));
                    }
                },
                VariableDeclarator(node) {
                    const declarator = toAstNode(node);
                    const init = declarator?.init;

                    // const {get} = OnyxUtils;
                    if (declarator?.id?.type === 'ObjectPattern' && init?.type === 'Identifier' && init.name && onyxImportLocalNames.has(init.name)) {
                        for (const property of declarator.id.properties ?? []) {
                            const keyName = getStaticName(property.key, property.computed);
                            const valueNode = toAstNode(property.value);

                            if (keyName && SYNC_READ_METHODS.has(keyName) && valueNode?.type === 'Identifier' && valueNode.name) {
                                onyxReadAliases.add(valueNode.name);
                            }
                        }
                        return;
                    }

                    // const readOnyx = OnyxUtils.get;
                    if (
                        declarator?.id?.type === 'Identifier' &&
                        declarator.id.name &&
                        init?.type === 'MemberExpression' &&
                        init.object?.type === 'Identifier' &&
                        init.object.name &&
                        onyxImportLocalNames.has(init.object.name)
                    ) {
                        const methodName = getStaticPropertyName(init);

                        if (methodName && SYNC_READ_METHODS.has(methodName)) {
                            onyxReadAliases.add(declarator.id.name);
                        }
                    }
                },
                CallExpression(node) {
                    const callExpression = toAstNode(node);
                    const callee = callExpression?.callee;
                    const line = callExpression?.loc?.start.line ?? 0;
                    const unit = unitOf(node);
                    const scope = sourceCode.getScope(node);

                    // A synchronous Onyx read, through the module object or through an alias of one of its methods.
                    if (callee?.type === 'MemberExpression' && callee.object?.type === 'Identifier' && callee.object.name && onyxImportLocalNames.has(callee.object.name)) {
                        const methodName = getStaticPropertyName(callee);

                        if (methodName && SYNC_READ_METHODS.has(methodName)) {
                            reads.push({unitId: unit.id, method: methodName, line});
                            return;
                        }
                    }

                    if (callee?.type === 'Identifier' && callee.name && onyxReadAliases.has(callee.name)) {
                        reads.push({unitId: unit.id, method: callee.name, line});
                        return;
                    }

                    if (callee?.type === 'Identifier' && callee.name) {
                        const variable = findVariable(scope, callee.name);
                        const importDefinition = getImportDefinition(variable);

                        if (importDefinition) {
                            pendingCalls.push({
                                from: unit.id,
                                line,
                                calleeFunction: null,
                                moduleRef: {source: importDefinition.source, name: importDefinition.imported ?? 'default'},
                                reason: 'unknown',
                            });
                            return;
                        }

                        // No binding anywhere means a global: Object, Number, setTimeout, require.
                        pendingCalls.push({from: unit.id, line, calleeFunction: getFunctionForVariable(variable), moduleRef: null, reason: variable ? 'dynamic' : 'global'});
                        return;
                    }

                    if (callee?.type === 'MemberExpression' && callee.object?.type === 'Identifier' && callee.object.name) {
                        const methodName = getStaticPropertyName(callee);
                        const importDefinition = getImportDefinition(findVariable(scope, callee.object.name));

                        // A default or namespace import used as an object: Navigation.navigate().
                        if (methodName && importDefinition && !importDefinition.imported) {
                            pendingCalls.push({from: unit.id, line, calleeFunction: null, moduleRef: {source: importDefinition.source, name: methodName}, reason: 'unknown'});
                            return;
                        }

                        // A method on a local object, which may still be a function this file declares.
                        const localFunction = getFunctionForVariable(findVariable(scope, callee.object.name));

                        if (localFunction) {
                            pendingCalls.push({from: unit.id, line, calleeFunction: localFunction, moduleRef: null, reason: 'member'});
                            return;
                        }
                    }

                    pendingCalls.push({from: unit.id, line, calleeFunction: null, moduleRef: null, reason: callee?.type === 'MemberExpression' ? 'member' : 'unknown'});
                },
            };
        },
    };

    const linter = new Linter();
    const messages = linter.verify(
        code,
        {
            // Required: without a matching `files` pattern the linter reports "No matching configuration found" and runs nothing.
            files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
            languageOptions: {
                parser: tsParser,
                sourceType: 'module',
                parserOptions: {ecmaFeatures: {jsx: true}},
            },
            plugins: {collector: {rules: {collect: collector}}},
            rules: {[COLLECTOR_RULE_ID]: 'error'},
        },
        file,
    );

    const fatal = messages.find((message) => message.fatal);
    if (fatal) {
        throw new Error(`Failed to parse ${file}: ${fatal.message} (line ${fatal.line})`);
    }

    const calls: SourceCall[] = pendingCalls.map((pending) => {
        if (pending.moduleRef) {
            return {from: pending.from, callee: {kind: 'module', source: pending.moduleRef.source, name: pending.moduleRef.name}, line: pending.line};
        }

        const unitId = pending.calleeFunction ? unitIdByFunctionNode.get(pending.calleeFunction) : undefined;

        if (unitId) {
            return {from: pending.from, callee: {kind: 'local', unitId}, line: pending.line};
        }

        return {from: pending.from, callee: {kind: 'unresolved', reason: pending.reason}, line: pending.line};
    });

    return {
        file,
        units: [...units.values()],
        calls,
        reads,
        reExports,
        defaultExportUnitId: defaultExportFunction ? (unitIdByFunctionNode.get(defaultExportFunction) ?? null) : null,
    };
}

export {analyzeSource, isTransparentBoundary, MODULE_UNIT_NAME, ONYX_MODULE_PREFIX, SYNC_READ_METHODS};
export type {AstNode, CalleeRef, FileAnalysis, ReExport, SourceCall, SourceRead, SourceUnit, UnresolvedReason};
