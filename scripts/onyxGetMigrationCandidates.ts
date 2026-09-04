#!/usr/bin/env bun
/**
 * Onyx.get() migration candidate finder.
 *
 * Scans `src/` for `useOnyx()` subscriptions whose value never reaches render, which are the only ones
 * `Onyx.get()` can replace. For every subscription it resolves the ONYXKEYS path being read, follows every
 * reference to the destructured value, and classifies the position each reference sits in with the same
 * render/event/module-scope model as `rulesdir/no-unsafe-onyx-read`.
 *
 * The output is a work list, not a verdict. What the script can decide on its own is the mechanical part:
 * whether the key is one of the Search snapshot keys the rule refuses outright, whether the key is even
 * statically resolvable (the rule refuses the rest), and whether any reference to the value is reachable
 * from render. What it cannot decide is stated per candidate as a caveat, and the hazards no static pass
 * catches are listed as a manual checklist in the report.
 *
 * Usage:
 *   bun scripts/onyxGetMigrationCandidates.ts                       # writes the report and the PR map into .context/
 *   bun scripts/onyxGetMigrationCandidates.ts --prs plan.md         # write the PR map somewhere else
 *   bun scripts/onyxGetMigrationCandidates.ts --out report.md       # write somewhere else
 *   bun scripts/onyxGetMigrationCandidates.ts --json data.json      # also emit the raw findings
 *   bun scripts/onyxGetMigrationCandidates.ts src/libs src/pages    # restrict the scan
 */
import type {NodePath} from '@babel/traverse';
import type {CallExpression, Function as FunctionNode, Identifier, Node, ObjectExpression} from '@babel/types';

import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import fs from 'fs';
import path from 'path';

const DEFAULT_INPUTS = ['src'];
const DEFAULT_OUTPUT = path.join('.context', 'onyx-get-migration-candidates.md');
const DEFAULT_PR_OUTPUT = path.join('.context', 'onyx-get-migration-prs.md');
const FILE_EXTENSIONS = new Set(['.ts', '.tsx']);

const HOOK_NAME = 'useOnyx';
const ONYXKEYS_ROOT = 'ONYXKEYS';

/** Where the Search snapshot key list lives, and how to pull it out. Kept identical to the lint rule so the two cannot disagree. */
const SNAPSHOT_KEYS_SOURCE = 'src/CONST/runtimeConfigured.ts';
const SNAPSHOT_KEYS_DECLARATION = /SEARCH_SNAPSHOT_ONYX_KEYS:\s*\[([^\]]*)\]/;

/** Array methods that call their callback synchronously, so a read inside one cannot be awaited without restructuring the caller. */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

/** Hook arguments React runs while rendering, by argument index. */
const RENDER_TIME_HOOK_ARGUMENTS = new Map([
    ['useMemo', new Set([0])],
    ['useState', new Set([0])],
    ['useReducer', new Set([2])],
    ['useSyncExternalStore', new Set([1, 2])],
]);

/** Names a callback carries when it is meant to be attached to an event rather than called by the receiver. */
const EVENT_CALLBACK_NAME = /^(on|handle)[A-Z]/;

const COMPONENT_WRAPPER_NAMES = new Set(['memo', 'forwardRef']);
const SYNCHRONOUS_EXECUTOR_NAMES = new Set(['Promise']);
const RENDER_TIME_OPTION_NAMES = new Set(['selector']);

/**
 * `useOnyx` options that change what the subscription returns compared to a plain read, so a conversion
 * cannot be judged mechanically. `selector` is handled separately because reapplying it at the read site is
 * a known, small fix; these are not.
 */
const SHAPE_CHANGING_OPTIONS = new Set(['initWithStoredValues', 'allowStaleData', 'initialValue']);

/** Where a reference to a subscribed value sits, in the order of how much it rules out. */
type ReferenceKind = 'render' | 'dependency-array' | 'synchronous' | 'event';

type ReferenceSite = {
    kind: ReferenceKind;
    line: number;
    /** The name of the enclosing callback, or the prop/hook it is passed to, so a reviewer can find it. */
    context: string;
};

type Caveat =
    | 'has-selector'
    | 'has-default-value'
    | 'derived-key'
    | 'collection-key'
    | 'synchronous-reference'
    | 'non-event-prop'
    | 'parked-in-state'
    | 'escapes-via-return'
    | 'shape-changing-options'
    | 'uses-metadata'
    | 'in-dependency-array'
    | 'trigger-chain'
    | 'not-array-destructured';

/** The verdicts that are work items: the three the report lists, and the only ones the JSON keeps. */
const CONVERTIBLE_VERDICTS = new Set<Verdict>(['drop-in', 'needs-fix', 'needs-decision']);

/** Caveats that a reviewer has to resolve by reading the code, rather than by applying a known fix. */
const BLOCKING_CAVEATS = new Set<Caveat>(['uses-metadata', 'in-dependency-array', 'trigger-chain', 'not-array-destructured', 'shape-changing-options']);

type Verdict = 'drop-in' | 'needs-fix' | 'needs-decision' | 'render-bound' | 'unreferenced' | 'blocked-snapshot-key' | 'blocked-unresolvable-key';

type Finding = {
    file: string;
    line: number;
    /** The variable the value is destructured into, or null when the call is not array-destructured. */
    valueName: string | null;
    /** The key expression as written, e.g. `` `${ONYXKEYS.COLLECTION.POLICY}${policyID}` ``. */
    keySource: string;
    /** The resolved `ONYXKEYS` access path, e.g. `COLLECTION.POLICY`, or null when it could not be resolved. */
    keyPath: string | null;
    verdict: Verdict;
    /**
     * For a blocked subscription, the verdict it would carry if the key were readable. It answers what the
     * Search snapshot ban costs, which is the number that changes when the snapshot redirect goes away.
     */
    verdictIfUnblocked?: Verdict;
    caveats: Caveat[];
    references: ReferenceSite[];
};

/** Reads the Search snapshot key paths out of the runtime config, the same source the lint rule reads. */
function resolveSnapshotKeyPaths(repoRoot: string): Set<string> {
    const source = fs.readFileSync(path.join(repoRoot, SNAPSHOT_KEYS_SOURCE), 'utf8');
    const declaration = SNAPSHOT_KEYS_DECLARATION.exec(source);

    if (!declaration) {
        throw new Error(`Could not read SEARCH_SNAPSHOT_ONYX_KEYS from ${SNAPSHOT_KEYS_SOURCE}. Without it this scan would propose banned keys as candidates.`);
    }

    return new Set([...declaration[1].matchAll(/ONYXKEYS\.([A-Z0-9_.]+)/g)].map((match) => match[1]));
}

function collectFiles(inputs: readonly string[]): string[] {
    const files: string[] = [];

    const visit = (target: string) => {
        const stats = fs.statSync(target);

        if (stats.isFile()) {
            if (FILE_EXTENSIONS.has(path.extname(target)) && !target.endsWith('.d.ts')) {
                files.push(target);
            }
            return;
        }

        for (const entry of fs.readdirSync(target, {withFileTypes: true})) {
            visit(path.join(target, entry.name));
        }
    };

    for (const input of inputs) {
        visit(input);
    }

    return files.sort();
}

function getStaticName(node: Node | null | undefined, computed: boolean): string | null {
    if (!computed && node?.type === 'Identifier') {
        return node.name;
    }

    return node?.type === 'StringLiteral' ? node.value : null;
}

function getStaticPropertyName(node: Node): string | null {
    return node.type === 'MemberExpression' ? getStaticName(node.property, node.computed) : null;
}

function getCalleeName(callee: Node): string | null {
    if (callee.type === 'Identifier') {
        return callee.name;
    }

    return callee.type === 'MemberExpression' ? getStaticPropertyName(callee) : null;
}

/** Unwraps type-only wrappers and the leading interpolation of a collection member key template. */
function unwrapKeyExpression(node: Node): Node {
    // The TypeScript-only wrappers a key arrives in, all of which carry the real expression on `.expression`,
    // e.g. `` `${ONYXKEYS.COLLECTION.REPORT}${id}` as const ``.
    if (
        node.type === 'TSAsExpression' ||
        node.type === 'TSSatisfiesExpression' ||
        node.type === 'TSNonNullExpression' ||
        node.type === 'TSInstantiationExpression' ||
        node.type === 'TSTypeAssertion'
    ) {
        return unwrapKeyExpression(node.expression);
    }

    if (node.type !== 'TemplateLiteral') {
        return node;
    }

    const leadingExpression = node.expressions.at(0);

    // cspell:disable-next-line -- quasis is the Babel name for the static chunks of a template literal
    if (!leadingExpression || node.quasis.at(0)?.value.cooked !== '') {
        return node;
    }

    return unwrapKeyExpression(leadingExpression as Node);
}

/** Resolves an identifier through a single `const` declaration, which is as far as a static read can be trusted. */
function getConstInitializer(name: string, scopePath: NodePath): Node | null {
    const binding = scopePath.scope.getBinding(name);

    if (!binding || binding.kind !== 'const' || binding.constantViolations.length > 0) {
        return null;
    }

    const declaration = binding.path;

    return declaration.node.type === 'VariableDeclarator' ? (declaration.node.init ?? null) : null;
}

/** Turns `ONYXKEYS.COLLECTION.REPORT` into `COLLECTION.REPORT`, and returns null for anything not rooted at `ONYXKEYS`. */
function getOnyxKeyPath(node: Node | null | undefined, scopePath: NodePath, seen = new Set<string>()): string | null {
    if (!node) {
        return null;
    }

    const segments: string[] = [];
    let current: Node | null = unwrapKeyExpression(node);

    if (current.type === 'Identifier' && current.name !== ONYXKEYS_ROOT) {
        if (seen.has(current.name)) {
            return null;
        }

        seen.add(current.name);
        const initializer = getConstInitializer(current.name, scopePath);

        return initializer ? getOnyxKeyPath(initializer, scopePath, seen) : null;
    }

    while (current?.type === 'MemberExpression') {
        const propertyName = getStaticPropertyName(current);

        if (!propertyName) {
            return null;
        }

        segments.unshift(propertyName);
        current = current.object;
    }

    if (current?.type !== 'Identifier' || current.name !== ONYXKEYS_ROOT || segments.length === 0) {
        return null;
    }

    return segments.join('.');
}

function isHookName(name: string): boolean {
    return /^use[A-Z0-9]/.test(name);
}

function isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
}

function getFunctionName(functionPath: NodePath<FunctionNode>): string | null {
    const node = functionPath.node;

    if (node.type === 'FunctionDeclaration' && node.id) {
        return node.id.name;
    }

    const parent = functionPath.parent;

    if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return parent.id.name;
    }

    if (parent.type === 'ObjectProperty' && !parent.computed && parent.key.type === 'Identifier') {
        return parent.key.name;
    }

    return null;
}

function returnsJSX(functionPath: NodePath<FunctionNode>): boolean {
    const body = functionPath.node.body;

    if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
        return true;
    }

    if (body.type !== 'BlockStatement') {
        return false;
    }

    return body.body.some((statement) => statement.type === 'ReturnStatement' && (statement.argument?.type === 'JSXElement' || statement.argument?.type === 'JSXFragment'));
}

/** Whether an options object property sits in a call to something named like a hook. */
function isHookOption(propertyPath: NodePath): boolean {
    const objectPath = propertyPath.parentPath;
    const callPath = objectPath?.parentPath;

    if (!callPath || callPath.node.type !== 'CallExpression' || !objectPath) {
        return false;
    }

    if (!callPath.node.arguments.some((argument) => argument === objectPath.node)) {
        return false;
    }

    const calleeName = getCalleeName(callPath.node.callee);

    return !!calleeName && isHookName(calleeName);
}

/**
 * How a function runs relative to render: `render` when React calls it while rendering, `synchronous` when
 * the caller runs it in the same stretch and cannot await, `deferred` when it runs later on an event.
 */
function classifyFunctionBoundary(functionPath: NodePath<FunctionNode>): 'render' | 'synchronous' | 'deferred' {
    const parentPath = functionPath.parentPath;
    const parent = parentPath?.node;

    if (
        parent?.type === 'ObjectProperty' &&
        parent.value === functionPath.node &&
        RENDER_TIME_OPTION_NAMES.has(getStaticName(parent.key, parent.computed) ?? '') &&
        isHookOption(parentPath)
    ) {
        return 'render';
    }

    if (parent?.type === 'NewExpression' && parent.arguments.at(0) === functionPath.node && SYNCHRONOUS_EXECUTOR_NAMES.has(getCalleeName(parent.callee as Node) ?? '')) {
        return 'synchronous';
    }

    if (parent?.type === 'CallExpression') {
        if (parent.callee === functionPath.node) {
            return 'synchronous';
        }

        const argumentIndex = parent.arguments.findIndex((argument) => argument === functionPath.node);

        if (argumentIndex >= 0) {
            const calleeName = getCalleeName(parent.callee as Node);

            if (calleeName && COMPONENT_WRAPPER_NAMES.has(calleeName)) {
                return 'render';
            }

            if (calleeName && RENDER_TIME_HOOK_ARGUMENTS.get(calleeName)?.has(argumentIndex)) {
                return 'render';
            }

            if (parent.callee.type === 'MemberExpression' && calleeName && SYNCHRONOUS_CALLBACK_METHODS.has(calleeName)) {
                return 'synchronous';
            }

            return 'deferred';
        }
    }

    const functionName = getFunctionName(functionPath);

    if (functionName && (isHookName(functionName) || isComponentName(functionName))) {
        return 'render';
    }

    return returnsJSX(functionPath) ? 'render' : 'deferred';
}

/** The name a reviewer would identify the reference site by: the prop, the hook, or the enclosing function. */
function describeFunctionContext(functionPath: NodePath<FunctionNode>): string {
    const parent = functionPath.parentPath?.node;

    if (parent?.type === 'JSXExpressionContainer' && functionPath.parentPath?.parentPath?.node.type === 'JSXAttribute') {
        const attribute = functionPath.parentPath.parentPath.node;
        return attribute.name.type === 'JSXIdentifier' ? `${attribute.name.name} prop` : 'JSX prop';
    }

    if (parent?.type === 'CallExpression') {
        const calleeName = getCalleeName(parent.callee as Node);

        if (calleeName) {
            return `${calleeName}()`;
        }
    }

    if (parent?.type === 'ObjectProperty' && parent.key.type === 'Identifier') {
        return `${parent.key.name} prop`;
    }

    return getFunctionName(functionPath) ?? 'anonymous callback';
}

/** Whether the array is the dependency list of a hook call, i.e. the last argument of a `use*` call. */
function isDependencyArray(arrayPath: NodePath): boolean {
    const callPath = arrayPath.parentPath;

    if (!callPath || callPath.node.type !== 'CallExpression') {
        return false;
    }

    const call = callPath.node;
    const calleeName = getCalleeName(call.callee as Node);

    if (!calleeName || !isHookName(calleeName)) {
        return false;
    }

    return call.arguments.at(-1) === arrayPath.node;
}

/**
 * Classifies one reference to a subscribed value. Dependency-array membership is checked first: such a
 * reference sits in the component body, so the position walk would call it render and hide the fact that the
 * subscription is what re-runs the effect.
 */
function classifyReference(referencePath: NodePath<Identifier>): ReferenceSite {
    const line = referencePath.node.loc?.start.line ?? 0;
    let sawJSXExpression = false;

    for (let current: NodePath | null = referencePath.parentPath; current; current = current.parentPath) {
        if (current.node.type === 'ArrayExpression' && isDependencyArray(current)) {
            const callee = current.parentPath?.node.type === 'CallExpression' ? getCalleeName(current.parentPath.node.callee as Node) : null;
            return {kind: 'dependency-array', line, context: callee ? `${callee}() deps` : 'hook deps'};
        }

        if (current.node.type === 'JSXExpressionContainer') {
            sawJSXExpression = true;
            continue;
        }

        if (!current.isFunction()) {
            continue;
        }

        const functionPath = current;

        if (sawJSXExpression) {
            return {kind: 'render', line, context: 'JSX'};
        }

        const boundary = classifyFunctionBoundary(functionPath);
        const context = describeFunctionContext(functionPath);

        if (boundary === 'deferred') {
            return {kind: 'event', line, context};
        }

        return {kind: boundary, line, context};
    }

    return {kind: 'render', line, context: 'module scope'};
}

/**
 * Reclassifies a reference by where the function holding it is actually called, one hop out. A value used
 * inside a plain local helper looks like event-time code on its own, and stays event-time only while every
 * call to that helper is. One call from render is enough to make the read a render read, and the position
 * walk cannot see it because it stops at the helper's own boundary.
 *
 * One hop is deliberate: a helper called by a helper is left to the reviewer, and the checklist says so.
 */
function classifyByCallSites(referencePath: NodePath<Identifier>, site: ReferenceSite): ReferenceSite {
    for (let current: NodePath | null = referencePath.parentPath; current; current = current.parentPath) {
        if (!current.isFunction()) {
            continue;
        }

        const functionPath = current;
        const name = getFunctionName(functionPath);
        const declaration = functionPath.node.type === 'FunctionDeclaration' ? functionPath : functionPath.parentPath;

        if (!name || declaration?.node.type === 'ObjectProperty') {
            return site;
        }

        const binding = functionPath.scope.getBinding(name);

        for (const usage of binding?.referencePaths ?? []) {
            if (!usage.isIdentifier() || usage.parentPath?.node.type !== 'CallExpression' || usage.parentPath.node.callee !== usage.node) {
                continue;
            }

            const callSite = classifyReference(usage);

            if (callSite.kind === 'render' || callSite.kind === 'dependency-array') {
                return {kind: callSite.kind, line: site.line, context: `${site.context} called from ${callSite.context}`};
            }
        }

        return site;
    }

    return site;
}

/**
 * Whether the callback holding the reference is handed to a component as a prop that is not named for an
 * event. A child is free to call such a prop during its own render, which would put the read back on the
 * render path from a different file.
 */
function isPassedAsNonEventProp(referencePath: NodePath<Identifier>): boolean {
    const isEventPropName = (name: string) => EVENT_CALLBACK_NAME.test(name);

    for (let current: NodePath | null = referencePath.parentPath; current; current = current.parentPath) {
        if (!current.isFunction()) {
            continue;
        }

        const parent = current.parentPath;

        if (parent?.node.type === 'JSXExpressionContainer' && parent.parentPath?.node.type === 'JSXAttribute') {
            const attributeName = parent.parentPath.node.name;
            return attributeName.type === 'JSXIdentifier' && !isEventPropName(attributeName.name);
        }

        if (parent?.node.type === 'VariableDeclarator' && parent.node.id.type === 'Identifier') {
            const binding = parent.scope.getBinding(parent.node.id.name);

            return !!binding?.referencePaths.some((usage) => {
                const container = usage.parentPath;

                if (container?.node.type !== 'JSXExpressionContainer' || container.parentPath?.node.type !== 'JSXAttribute') {
                    return false;
                }

                const attributeName = container.parentPath.node.name;
                return attributeName.type === 'JSXIdentifier' && !isEventPropName(attributeName.name);
            });
        }

        return false;
    }

    return false;
}

/**
 * Names that appear in a dependency array anywhere in the file. A memoized callback holding the read whose
 * own name shows up here is a link in a trigger chain: dropping the subscription makes the callback stable
 * and whatever depends on it stops re-running.
 */
function collectDependencyArrayNames(programPath: NodePath): Set<string> {
    const names = new Set<string>();

    programPath.traverse({
        ArrayExpression(arrayPath) {
            if (!isDependencyArray(arrayPath)) {
                return;
            }

            for (const element of arrayPath.node.elements) {
                if (element?.type === 'Identifier') {
                    names.add(element.name);
                }
            }
        },
    });

    return names;
}

/** The variable a memoized callback holding the reference is bound to, if any. */
function getEnclosingMemoizedName(referencePath: NodePath<Identifier>): string | null {
    for (let current: NodePath | null = referencePath.parentPath; current; current = current.parentPath) {
        if (!current.isFunction()) {
            continue;
        }

        const declarator = current.parentPath?.node.type === 'CallExpression' ? current.parentPath.parentPath : current.parentPath;

        if (declarator?.node.type === 'VariableDeclarator' && declarator.node.id.type === 'Identifier') {
            return declarator.node.id.name;
        }

        return null;
    }

    return null;
}

/**
 * Whether the value is handed to a state setter or written into a ref inside the callback. The value then
 * reaches render through the store rather than directly, and the screen shows the moment of the read.
 */
function isParkedWhereRenderReads(referencePath: NodePath<Identifier>): boolean {
    for (let current: NodePath | null = referencePath.parentPath; current; current = current.parentPath) {
        if (current.isFunction()) {
            return false;
        }

        if (current.node.type === 'AssignmentExpression' && current.node.left.type === 'MemberExpression' && getStaticPropertyName(current.node.left) === 'current') {
            return true;
        }

        if (current.node.type !== 'CallExpression') {
            continue;
        }

        const calleeName = getCalleeName(current.node.callee as Node);

        if (calleeName && /^set[A-Z]/.test(calleeName)) {
            return true;
        }
    }

    return false;
}

/** Whether the reference is the value of a prop or an object field named for an event, e.g. `onPress={handler}`. */
function isEventPropValue(nodePath: NodePath): boolean {
    const parent = nodePath.parentPath;

    if (parent?.node.type === 'ObjectProperty' && parent.node.key.type === 'Identifier') {
        return EVENT_CALLBACK_NAME.test(parent.node.key.name);
    }

    if (parent?.node.type !== 'JSXExpressionContainer' || parent.parentPath?.node.type !== 'JSXAttribute') {
        return false;
    }

    const attributeName = parent.parentPath.node.name;

    return attributeName.type === 'JSXIdentifier' && EVENT_CALLBACK_NAME.test(attributeName.name);
}

/** Whether a `return` hands its value out of a component or a hook, rather than out of a local callback. */
function isReturnFromComponentOrHook(returnPath: NodePath): boolean {
    const owner = returnPath.getFunctionParent();

    if (!owner) {
        return false;
    }

    const ownerName = getFunctionName(owner);

    return (!!ownerName && (isHookName(ownerName) || isComponentName(ownerName))) || returnsJSX(owner);
}

/** Whether the path sits inside a value a component or a hook returns. */
function isReturnedOutOfComponent(nodePath: NodePath): boolean {
    for (let current: NodePath | null = nodePath; current; current = current.parentPath) {
        if (current.node.type === 'ReturnStatement') {
            return isReturnFromComponentOrHook(current);
        }
    }

    return false;
}

/**
 * Whether the callback holding the reference leaves the component or the hook through its return value,
 * which puts the decision about when it runs in a file this scan cannot see. Every caller has to be checked
 * by hand. A callback returned out of a local helper does not count: it has not left the component yet, and
 * the walk keeps going until it reaches the component or hook boundary.
 */
function escapesViaReturn(referencePath: NodePath<Identifier>): boolean {
    for (let current: NodePath | null = referencePath.parentPath; current; current = current.parentPath) {
        if (!current.isFunction()) {
            continue;
        }

        const parent = current.parentPath;
        const boundName = parent?.node.type === 'ObjectProperty' && parent.node.key.type === 'Identifier' ? parent.node.key.name : getFunctionName(current);

        // A callback named for an event is attached to one by whoever receives it, which is the shape the
        // philosophy allows. Only a callback the receiver is free to call in its own body is worth flagging.
        if (boundName && EVENT_CALLBACK_NAME.test(boundName)) {
            return false;
        }

        if (isReturnedOutOfComponent(current)) {
            return true;
        }

        const declarator = parent?.node.type === 'CallExpression' ? parent.parentPath : parent;

        if (declarator?.node.type !== 'VariableDeclarator' || declarator.node.id.type !== 'Identifier') {
            return false;
        }

        const binding = declarator.scope.getBinding(declarator.node.id.name);

        return !!binding?.referencePaths.some((usage) => !isEventPropValue(usage) && isReturnedOutOfComponent(usage));
    }

    return false;
}

function getOptionsObject(call: CallExpression): ObjectExpression | null {
    const optionsArgument = call.arguments.at(1);

    return optionsArgument?.type === 'ObjectExpression' ? optionsArgument : null;
}

function getOptionNames(options: ObjectExpression | null): Set<string> {
    const names = new Set<string>();

    for (const property of options?.properties ?? []) {
        if (property.type === 'ObjectProperty') {
            const name = getStaticName(property.key, property.computed);

            if (name) {
                names.add(name);
            }
        }
    }

    return names;
}

/** Where the value is used, independent of whether the key is readable at all. */
function classifyByUse(finding: Omit<Finding, 'verdict'>): Verdict {
    if (finding.references.some((reference) => reference.kind === 'render')) {
        return 'render-bound';
    }

    if (finding.references.length === 0) {
        return 'unreferenced';
    }

    if (finding.caveats.some((caveat) => BLOCKING_CAVEATS.has(caveat))) {
        return 'needs-decision';
    }

    return finding.caveats.length === 0 ? 'drop-in' : 'needs-fix';
}

/**
 * The verdict, plus what the verdict would have been without the ban. A blocked key is reported as blocked
 * whatever its uses look like, since the lint rule refuses it either way.
 */
function decideVerdict(finding: Omit<Finding, 'verdict'>, isSnapshotKey: boolean): Pick<Finding, 'verdict' | 'verdictIfUnblocked'> {
    const byUse = classifyByUse(finding);

    if (!finding.keyPath) {
        return {verdict: 'blocked-unresolvable-key', verdictIfUnblocked: byUse};
    }

    return isSnapshotKey ? {verdict: 'blocked-snapshot-key', verdictIfUnblocked: byUse} : {verdict: byUse};
}

function analyzeFile(file: string, source: string, snapshotKeyPaths: Set<string>): Finding[] {
    const ast = parse(source, {
        sourceType: 'module',
        errorRecovery: true,
        plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties', 'optionalChaining', 'nullishCoalescingOperator', 'explicitResourceManagement'],
    });

    const findings: Finding[] = [];
    let dependencyArrayNames: Set<string> | null = null;

    traverse(ast, {
        Program(programPath) {
            dependencyArrayNames = collectDependencyArrayNames(programPath);
        },
        CallExpression(callPath) {
            const call = callPath.node;

            if (getCalleeName(call.callee as Node) !== HOOK_NAME) {
                return;
            }

            const keyArgument = call.arguments.at(0) as Node | undefined;
            const keyPath = getOnyxKeyPath(keyArgument, callPath);
            const keySource = keyArgument?.start != null && keyArgument.end != null ? source.slice(keyArgument.start, keyArgument.end) : '<unknown>';
            const line = call.loc?.start.line ?? 0;

            const optionNames = getOptionNames(getOptionsObject(call));
            const caveats = new Set<Caveat>();

            if (optionNames.has('selector')) {
                caveats.add('has-selector');
            }

            for (const option of optionNames) {
                if (SHAPE_CHANGING_OPTIONS.has(option)) {
                    caveats.add('shape-changing-options');
                }
            }

            if (keyPath?.startsWith('DERIVED.')) {
                caveats.add('derived-key');
            }

            if (keyPath?.startsWith('COLLECTION.')) {
                caveats.add('collection-key');
            }

            // The ban is unconditional, so the uses are still read: they say what lifting it would be worth.
            const isSnapshotKey = !!keyPath && snapshotKeyPaths.has(keyPath);
            const pushFinding = (partial: Omit<Finding, 'verdict'>) => findings.push({...partial, ...decideVerdict(partial, isSnapshotKey)});

            const declaratorPath = callPath.parentPath;

            if (declaratorPath?.node.type !== 'VariableDeclarator') {
                caveats.add('not-array-destructured');
                pushFinding({file, line, valueName: null, keySource, keyPath, caveats: [...caveats], references: []});
                return;
            }

            const pattern = declaratorPath.node.id;

            if (pattern.type !== 'ArrayPattern') {
                caveats.add('not-array-destructured');
                pushFinding({file, line, valueName: null, keySource, keyPath, caveats: [...caveats], references: []});
                return;
            }

            const valueElement = pattern.elements.at(0);
            const metadataElement = pattern.elements.at(1);
            const valueIdentifier = valueElement?.type === 'AssignmentPattern' ? valueElement.left : valueElement;

            if (valueElement?.type === 'AssignmentPattern') {
                caveats.add('has-default-value');
            }

            if (metadataElement?.type === 'Identifier' && (declaratorPath.scope.getBinding(metadataElement.name)?.referencePaths.length ?? 0) > 0) {
                caveats.add('uses-metadata');
            }

            if (valueIdentifier?.type !== 'Identifier') {
                caveats.add('not-array-destructured');
                pushFinding({file, line, valueName: null, keySource, keyPath, caveats: [...caveats], references: []});
                return;
            }

            const binding = declaratorPath.scope.getBinding(valueIdentifier.name);
            const references: ReferenceSite[] = [];

            for (const referencePath of binding?.referencePaths ?? []) {
                if (!referencePath.isIdentifier()) {
                    continue;
                }

                const identifierPath = referencePath;
                const directSite = classifyReference(identifierPath);
                const site = directSite.kind === 'event' ? classifyByCallSites(identifierPath, directSite) : directSite;
                references.push(site);

                if (site.kind === 'dependency-array') {
                    caveats.add('in-dependency-array');
                }

                if (site.kind === 'synchronous') {
                    caveats.add('synchronous-reference');
                }

                if (site.kind === 'event') {
                    if (isPassedAsNonEventProp(identifierPath)) {
                        caveats.add('non-event-prop');
                    }

                    if (isParkedWhereRenderReads(identifierPath)) {
                        caveats.add('parked-in-state');
                    }

                    if (escapesViaReturn(identifierPath)) {
                        caveats.add('escapes-via-return');
                    }

                    const memoizedName = getEnclosingMemoizedName(identifierPath);

                    if (memoizedName && dependencyArrayNames?.has(memoizedName)) {
                        caveats.add('trigger-chain');
                    }
                }
            }

            if (dependencyArrayNames?.has(valueIdentifier.name)) {
                caveats.add('in-dependency-array');
            }

            pushFinding({file, line, valueName: valueIdentifier.name, keySource, keyPath, caveats: [...caveats], references});
        },
    });

    return findings;
}

const CAVEAT_EXPLANATIONS = new Map<Caveat, string>([
    ['has-selector', 'the subscription projects the value through a selector, which must be reapplied to the read result'],
    ['has-default-value', 'the destructure supplies a default, which becomes a `??` at the read site'],
    ['derived-key', 'a DERIVED key: it and its sources are a revision apart in a tick that wrote either'],
    ['collection-key', 'a collection key: the read returns every member, and resolves frozen'],
    ['synchronous-reference', 'the value is used in a callback the caller runs synchronously, so awaiting a read needs the caller restructured'],
    ['non-event-prop', 'the callback holding the use is passed as a prop not named for an event, so a child may call it during render'],
    ['parked-in-state', 'the value is handed to a state setter or written into a ref, so it reaches render indirectly'],
    ['escapes-via-return', 'the callback holding the use is returned out of the component or hook, so its callers have to be checked by hand'],
    ['shape-changing-options', 'the subscription passes options that change what it returns compared to a plain read'],
    ['uses-metadata', 'the subscription result status is used, and a read has no status'],
    ['in-dependency-array', 'the value is in a hook dependency array, so the subscription may exist to trigger work rather than to supply a value'],
    ['trigger-chain', 'the value feeds a memoized callback that something else depends on, which is a trigger chain'],
    ['not-array-destructured', 'the call result is not destructured into a value binding, so its uses could not be followed'],
]);

const VERDICT_TITLES = new Map<Verdict, string>([
    ['drop-in', 'Drop-in'],
    ['needs-fix', 'Needs a fix'],
    ['needs-decision', 'Needs a decision'],
    ['render-bound', 'Render-bound (not convertible)'],
    ['unreferenced', 'Value never referenced'],
    ['blocked-snapshot-key', 'Blocked: Search snapshot key'],
    ['blocked-unresolvable-key', 'Blocked: key not statically resolvable'],
]);

function formatReferences(references: readonly ReferenceSite[]): string {
    if (references.length === 0) {
        return 'no uses';
    }

    // The same line and context can appear more than once when a handler reads the value repeatedly, and the
    // repetition says nothing a reviewer needs.
    return [...new Set(references.map((reference) => `L${reference.line} ${reference.context}`))].join(', ');
}

function groupByKey(findings: readonly Finding[]): Map<string, Finding[]> {
    const grouped = new Map<string, Finding[]>();

    for (const finding of findings) {
        const key = finding.keyPath ? `${ONYXKEYS_ROOT}.${finding.keyPath}` : '<unresolvable>';
        const group = grouped.get(key) ?? [];
        group.push(finding);
        grouped.set(key, group);
    }

    return new Map([...grouped.entries()].sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0])));
}

function renderCandidateSection(title: string, description: string, findings: readonly Finding[]): string {
    const lines = [`## ${title}`, '', description, '', `${findings.length} subscription${findings.length === 1 ? '' : 's'}.`, ''];

    if (findings.length === 0) {
        return `${lines.join('\n')}\n`;
    }

    for (const [key, group] of groupByKey(findings)) {
        lines.push(`### \`${key}\` — ${group.length}`, '');
        lines.push('| Site | Value | Uses | Caveats |', '| --- | --- | --- | --- |');

        for (const finding of group) {
            const caveats = finding.caveats.length > 0 ? finding.caveats.map((caveat) => `\`${caveat}\``).join(' ') : '—';
            lines.push(`| \`${finding.file}:${finding.line}\` | \`${finding.valueName ?? '—'}\` | ${formatReferences(finding.references)} | ${caveats} |`);
        }

        lines.push('');
    }

    return `${lines.join('\n')}\n`;
}

function renderReport(findings: readonly Finding[], inputs: readonly string[], snapshotKeyPaths: Set<string>, fileCount: number): string {
    const byVerdict = (verdict: Verdict) => findings.filter((finding) => finding.verdict === verdict);
    const blocked = findings.filter((finding) => finding.verdict === 'blocked-snapshot-key' || finding.verdict === 'blocked-unresolvable-key');
    const blockedButConvertible = blocked.filter((finding) => !!finding.verdictIfUnblocked && CONVERTIBLE_VERDICTS.has(finding.verdictIfUnblocked));
    const convertible = findings.filter((finding) => CONVERTIBLE_VERDICTS.has(finding.verdict));
    const dropIn = byVerdict('drop-in');
    const needsFix = byVerdict('needs-fix');
    const needsDecision = byVerdict('needs-decision');

    const sections: string[] = [];

    sections.push(
        [
            '# `Onyx.get()` migration candidates',
            '',
            `Generated by \`bun scripts/onyxGetMigrationCandidates.ts ${inputs.join(' ')}\`.`,
            '',
            `Scanned ${fileCount} files and found ${findings.length} \`useOnyx()\` subscriptions.`,
            '',
            '## What the scan decides, and what it does not',
            '',
            'A `useOnyx()` subscription can become an `await Onyx.get()` read only when nothing about the value reaches render.',
            'This scan resolves the `ONYXKEYS` path of every subscription, follows every reference to the destructured value, and',
            'classifies the position each reference sits in with the same render/event model as `rulesdir/no-unsafe-onyx-read`.',
            '',
            'Decided mechanically:',
            '',
            '- **Search snapshot keys are out.** `@hooks/useOnyx` rewrites these keys to `snapshot_<hash>` inside a `SearchScopeProvider` subtree, so a read would swap snapshot data for live data. The lint rule fails the build on them, and they are excluded here rather than proposed.',
            '- **Keys that cannot be resolved statically are out.** The rule refuses them too, since a caller could route a snapshot key through a variable or a helper.',
            '- **A value referenced anywhere render can reach is out.** JSX, the component body, a `selector`, a `useMemo` factory, a `useState` initializer, or a `memo`/`forwardRef` wrapper.',
            '',
            'Left to the reviewer, per candidate, as a caveat column, and for every candidate as the checklist at the end.',
            '',
            `Search snapshot keys read from \`${SNAPSHOT_KEYS_SOURCE}\`: ${[...snapshotKeyPaths].map((key) => `\`${ONYXKEYS_ROOT}.${key}\``).join(', ')}.`,
            '',
            '## Summary',
            '',
            'Only the three convertible verdicts are listed after this table. The rest are counted here and nowhere else, since nothing about them is a work item.',
            '',
            '| Verdict | Subscriptions | Meaning |',
            '| --- | --- | --- |',
            `| Drop-in | ${dropIn.length} | every use is at event time, and no caveat applies |`,
            `| Needs a fix | ${needsFix.length} | every use is at event time, with a caveat that has a known fix |`,
            `| Needs a decision | ${needsDecision.length} | every use is at event time, but a caveat has to be settled by reading the code |`,
            `| Render-bound | ${byVerdict('render-bound').length} | the value reaches render, so the subscription stays |`,
            `| Value never referenced | ${byVerdict('unreferenced').length} | nothing reads the value, so the subscription is either vestigial or a trigger |`,
            `| Blocked: snapshot key | ${byVerdict('blocked-snapshot-key').length} | banned by \`rulesdir/no-unsafe-onyx-read\` |`,
            `| Blocked: unresolvable key | ${byVerdict('blocked-unresolvable-key').length} | banned by \`rulesdir/no-unsafe-onyx-read\` |`,
            '',
            `Of the ${blocked.length} blocked subscriptions, ${blockedButConvertible.length} would be candidates if the key were readable, so that is what the Search snapshot ban and the unresolvable keys cost today. Counting them, ${convertible.length + blockedButConvertible.length} of the ${findings.length} subscriptions never reach render.`,
            '',
        ].join('\n'),
    );

    sections.push(
        renderCandidateSection(
            'Drop-in candidates',
            'Every reference to the value sits in a function that runs on an event, the key is neither a snapshot key nor unresolvable, and no caveat applies. Convert the read where it is used, and work through the checklist at the end before opening the PR.',
            dropIn,
        ),
    );

    sections.push(
        renderCandidateSection(
            'Needs a fix',
            'Every reference is at event time, but something about the subscription changes at the read site. Each caveat has a known fix; the caveat names are explained below the tables.',
            needsFix,
        ),
    );

    sections.push(
        renderCandidateSection(
            'Needs a decision',
            'Every reference is at event time, but the subscription carries something a static pass cannot settle: a status the read does not have, or a dependency-array use that may mean the subscription exists to trigger work rather than to supply a value.',
            needsDecision,
        ),
    );

    sections.push(
        [
            '## Caveat reference',
            '',
            '| Caveat | What it means |',
            '| --- | --- |',
            ...[...CAVEAT_EXPLANATIONS].map(([caveat, explanation]) => `| \`${caveat}\` | ${explanation} |`),
            '',
            '## Manual checklist for every conversion',
            '',
            'These are the hazards no static pass catches. They come from `contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md`.',
            '',
            '1. **Source or trigger?** A subscription that exists to re-run work when a key changes stops doing that when it becomes a read. Follow the value through `useCallback` wrappers and dependency arrays before deleting it.',
            '2. **Reads before the first write in the tick.** `Onyx.get()` samples the cache when it is called, so a read after a write in the same synchronous stretch resolves to the pre-write value. Awaiting the read does not fix it; await the write, or read first.',
            '3. **One read block per synchronous stretch.** Code after an `await` or a `runAfterTransitions` is meant to see the earlier writes, so do not hoist its read above the deferral.',
            '4. **Do not mutate the result.** A single-key read resolves to the cached object itself, so assigning to a property writes the cache with no subscriber told.',
            '5. **Was the value on screen?** Conversion moves the sample from the last render to the moment the handler runs. A dialog confirming an amount must act on the amount it displayed.',
            '6. **Check every caller.** A read placed in a shared function becomes a render read the moment a component or hook calls that function. One render call site anywhere in `src/` settles it. This scan follows calls one hop inside the same file, so a helper called by a helper, or from another file, is still yours to check.',
            '',
        ].join('\n'),
    );

    return sections.join('\n');
}

/**
 * A conversion is written per file, so a file is the unit a PR can own: two PRs touching the same file would
 * conflict in the same callback. Files are therefore assigned to exactly one PR, and grouped by the work the
 * conversion actually takes, which is what the caveats already say.
 */
type PullRequestBucket = {
    id: string;
    title: string;
    /** What the conversion involves for every file in the bucket. */
    change: string;
    /** What has to be exercised before the PR is trusted, beyond the shared checks. */
    test: readonly string[];
};

/**
 * Ordered from the conversion that is purely mechanical to the one that changes control flow. A file lands in
 * the bucket of its hardest subscription, so a PR never mixes a one-line change with a restructure.
 */
const PULL_REQUEST_BUCKETS: readonly PullRequestBucket[] = [
    {
        id: 'mechanical',
        title: 'Mechanical reads',
        change: 'Delete the `useOnyx` line and `await Onyx.get(key)` inside the handler that uses it. A destructuring default becomes a `??` at the read site. Nothing else about the file changes.',
        test: [
            'Exercise each handler listed in the Uses column and confirm it acts on the same value it did before.',
            'Repeat once offline, so the read is served from a hydrated cache with no network in flight.',
        ],
    },
    {
        id: 'selector',
        title: 'Reads with a selector to reapply',
        change: 'Move the read into the handler and call the same selector on the result: `selector(await Onyx.get(key))`. `Onyx.get` returns the stored value, so dropping the selector compiles and silently changes the shape.',
        test: [
            'Assert the projected shape at the read site, not the stored one: a selector that returned a boolean must still yield a boolean.',
            'Exercise each handler listed in the Uses column.',
        ],
    },
    {
        id: 'collection',
        title: 'Collection and derived reads',
        change: 'Move the read into the handler. A collection key resolves to every member, exactly as the subscription did, and resolves frozen. A `DERIVED` key needs the tick checked: the source and the derived value are a revision apart in a tick that wrote either.',
        test: [
            'Confirm nothing mutates the result. A collection read throws on mutation; a single-key read would write the cache silently.',
            'For a `DERIVED` key, add or extend a test that writes the source and then reads both, asserting the post-write value.',
        ],
    },
    {
        id: 'caller-audit',
        title: 'Reads behind a callback that leaves the file',
        change: 'Move the read into the handler, then check the receiving side: the callback is returned out of the hook, passed as a prop not named for an event, or its value is parked in state or a ref. Every consumer has to attach it to an event rather than call it while rendering.',
        test: [
            'Open each consumer of the returned callback or prop and confirm it is attached to an event, never invoked in a body, in JSX, or in a `useMemo`.',
            'Where the value was parked in state or a ref, confirm the screen still shows what the user acted on.',
        ],
    },
    {
        id: 'async-restructure',
        title: 'Reads inside synchronous callbacks',
        change: 'The use sits in a callback its caller runs synchronously (a `map`, a `filter`, a `Promise` executor), so the read cannot simply be awaited in place. Hoist the read above the synchronous stretch, or make the caller await. Take this bucket last.',
        test: [
            'Confirm the read happens before the first write in the same synchronous stretch, and that each deferral does its own read.',
            'Cover the reordering with a test that asserts the post-write value, since ordering is what this bucket changes.',
        ],
    },
];

/** Caveats that decide the bucket, hardest first. The first match wins. */
const BUCKET_BY_CAVEAT = new Map<Caveat, string>([
    ['synchronous-reference', 'async-restructure'],
    ['escapes-via-return', 'caller-audit'],
    ['non-event-prop', 'caller-audit'],
    ['parked-in-state', 'caller-audit'],
    ['collection-key', 'collection'],
    ['derived-key', 'collection'],
    ['has-selector', 'selector'],
]);

/** What a plan covers: which verdicts it converts, and what the report says about the ones it leaves out. */
type PlanScope = {
    verdicts: readonly Verdict[];
    /** How the covered set is described in the first line. */
    label: string;
    /** What the plan says about the candidates it excludes, and what excluding them costs. */
    exclusionNote: string;
};

/** The two scopes a plan is written for: everything convertible in one sweep, or the drop-in tier alone. */
const PLAN_SCOPES = {
    full: {
        verdicts: ['drop-in', 'needs-fix'],
        label: 'drop-in and needs-a-fix candidates',
        exclusionNote: 'The needs-a-decision candidates are deliberately absent. Each of them turns on a question a reviewer has to answer first, so they cannot be batched by shape.',
    },
    dropInOnly: {
        verdicts: ['drop-in'],
        label: 'drop-in candidates only',
        exclusionNote:
            'This is the narrow scope: only subscriptions with no caveat at all. Every conversion here is the same one-line move, which makes the wave uniform to review and to test. The cost is that most of these files also hold needs-a-fix subscriptions, so the next wave reopens them later; each PR below states how many of its files come back.',
    },
} as const satisfies Record<string, PlanScope>;

/** How large a PR may get before it is split, in files and in subscriptions. */
const MAX_FILES_PER_PULL_REQUEST = 10;
const MAX_SUBSCRIPTIONS_PER_PULL_REQUEST = 24;

/** An area smaller than this is folded into its bucket's mixed PR rather than getting one of its own. */
const MIN_FILES_PER_AREA = 3;

type PullRequest = {
    bucket: PullRequestBucket;
    area: string;
    part: number;
    partCount: number;
    files: Array<{file: string; findings: Finding[]}>;
};

function getBucketId(caveats: readonly Caveat[]): string {
    for (const [caveat, bucketId] of BUCKET_BY_CAVEAT) {
        if (caveats.includes(caveat)) {
            return bucketId;
        }
    }

    return 'mechanical';
}

/** The feature area a file belongs to, at the depth the codebase groups reviewers by. */
function getArea(file: string): string {
    return path.dirname(file).split('/').slice(0, 3).join('/');
}

function groupFindingsByFile(findings: readonly Finding[]): Map<string, Finding[]> {
    const byFile = new Map<string, Finding[]>();

    for (const finding of findings) {
        const group = byFile.get(finding.file) ?? [];
        group.push(finding);
        byFile.set(finding.file, group);
    }

    return byFile;
}

/** Splits a bucket's files into PRs of a reviewable size, keeping each area together where it is big enough. */
function buildPullRequests(findings: readonly Finding[]): PullRequest[] {
    const byFile = groupFindingsByFile(findings);
    const byBucket = new Map<string, Array<{file: string; findings: Finding[]}>>();

    for (const [file, fileFindings] of byFile) {
        const bucketId = fileFindings
            .map((finding) => getBucketId(finding.caveats))
            .reduce((hardest, current) => {
                const order = PULL_REQUEST_BUCKETS.map((bucket) => bucket.id);
                return order.indexOf(current) > order.indexOf(hardest) ? current : hardest;
            }, 'mechanical');

        const group = byBucket.get(bucketId) ?? [];
        group.push({file, findings: fileFindings});
        byBucket.set(bucketId, group);
    }

    const pullRequests: PullRequest[] = [];

    for (const bucket of PULL_REQUEST_BUCKETS) {
        const bucketFiles = byBucket.get(bucket.id) ?? [];
        const byArea = new Map<string, Array<{file: string; findings: Finding[]}>>();

        for (const entry of bucketFiles) {
            const area = getArea(entry.file);
            const group = byArea.get(area) ?? [];
            group.push(entry);
            byArea.set(area, group);
        }

        const mixed: Array<{file: string; findings: Finding[]}> = [];
        const areas: Array<[string, Array<{file: string; findings: Finding[]}>]> = [];

        for (const [area, entries] of [...byArea.entries()].sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))) {
            if (entries.length < MIN_FILES_PER_AREA) {
                mixed.push(...entries);
                continue;
            }

            areas.push([area, entries]);
        }

        if (mixed.length > 0) {
            areas.push(['mixed areas', mixed.sort((left, right) => left.file.localeCompare(right.file))]);
        }

        for (const [area, entries] of areas) {
            const batches: Array<Array<{file: string; findings: Finding[]}>> = [[]];

            for (const entry of entries.sort((left, right) => left.file.localeCompare(right.file))) {
                const current = batches.at(-1) ?? [];
                const subscriptions = current.reduce((total, batched) => total + batched.findings.length, 0);

                if (current.length >= MAX_FILES_PER_PULL_REQUEST || (current.length > 0 && subscriptions + entry.findings.length > MAX_SUBSCRIPTIONS_PER_PULL_REQUEST)) {
                    batches.push([entry]);
                    continue;
                }

                current.push(entry);
            }

            for (const [index, batch] of batches.entries()) {
                if (batch.length === 0) {
                    continue;
                }

                pullRequests.push({bucket, area, part: index + 1, partCount: batches.length, files: batch});
            }
        }
    }

    return pullRequests;
}

function countSubscriptions(pullRequest: PullRequest): number {
    return pullRequest.files.reduce((total, entry) => total + entry.findings.length, 0);
}

function getKeyPaths(pullRequest: PullRequest): string[] {
    const keys = new Set<string>();

    for (const entry of pullRequest.files) {
        for (const finding of entry.findings) {
            keys.add(`${ONYXKEYS_ROOT}.${finding.keyPath ?? '<unresolvable>'}`);
        }
    }

    return [...keys].sort();
}

function renderPullRequestPlan(findings: readonly Finding[], scope: PlanScope): string {
    const candidates = findings.filter((finding) => scope.verdicts.includes(finding.verdict));
    const pullRequests = buildPullRequests(candidates);
    const fileCount = groupFindingsByFile(candidates).size;

    // A file left with convertible subscriptions this plan does not cover comes back in a later PR, which is
    // the cost of a narrower scope and is worth stating per PR rather than discovering during review.
    const bucketCount = new Set(pullRequests.map((pullRequest) => pullRequest.bucket.id)).size;
    const revisitedFiles = new Set(findings.filter((finding) => CONVERTIBLE_VERDICTS.has(finding.verdict) && !scope.verdicts.includes(finding.verdict)).map((finding) => finding.file));

    const lines = [
        '# `Onyx.get()` migration: PR map',
        '',
        `Generated by \`bun scripts/onyxGetMigrationCandidates.ts\` from the ${scope.label}: ${candidates.length} subscriptions across ${fileCount} files, split into ${pullRequests.length} PRs.`,
        '',
        scope.exclusionNote,
        '',
        '## How the split works',
        '',
        `- **A PR owns whole files.** A conversion is written inside the callback that uses the value, so two PRs touching one file would conflict. Every file below appears in exactly one PR.`,
        ...(bucketCount > 1
            ? [
                  '- **A PR owns one kind of work.** A file lands in the bucket of its hardest subscription, so a PR is either all one-line moves or all restructures, never both. That is what makes the test plan per PR short.',
              ]
            : ['- **Every PR is the same conversion.** This scope holds one kind of work, so the change and the test steps below are identical in each PR.']),
        `- **A PR stays inside one feature area** where the area has at least ${MIN_FILES_PER_AREA} files, so one reviewer can own it. Smaller areas are collected into the mixed PR.`,
        `- **A PR is capped** at ${MAX_FILES_PER_PULL_REQUEST} files and ${MAX_SUBSCRIPTIONS_PER_PULL_REQUEST} subscriptions, and split into parts beyond that.`,
        ...(bucketCount > 1 ? ['- **Waves run in bucket order.** Each wave is more invasive than the last, so land the earlier ones first and let them sit before starting the next.'] : []),
        '',
        bucketCount > 1 ? '## Waves' : '## Size',
        '',
        '| Wave | Bucket | PRs | Files | Subscriptions |',
        '| --- | --- | --- | --- | --- |',
    ];

    let wave = 0;

    for (const bucket of PULL_REQUEST_BUCKETS) {
        const bucketPullRequests = pullRequests.filter((pullRequest) => pullRequest.bucket.id === bucket.id);

        if (bucketPullRequests.length === 0) {
            continue;
        }

        wave++;
        const files = bucketPullRequests.reduce((total, pullRequest) => total + pullRequest.files.length, 0);
        const subscriptions = bucketPullRequests.reduce((total, pullRequest) => total + countSubscriptions(pullRequest), 0);
        lines.push(`| ${wave} | ${bucket.title} | ${bucketPullRequests.length} | ${files} | ${subscriptions} |`);
    }

    const pilot = pullRequests
        .filter((pullRequest) => pullRequest.bucket.id === 'mechanical')
        .sort((left, right) => countSubscriptions(left) - countSubscriptions(right))
        .at(0);

    lines.push(
        '',
        '## Shared checks, every PR',
        '',
        '1. `npm run lint-changed` — `rulesdir/no-unsafe-onyx-read` is the gate that refuses a render read, a module-scope read, and a Search snapshot key.',
        '2. `npm run typecheck`.',
        '3. Run the existing Jest tests that touch the changed files.',
        '4. Walk the manual checklist in `.context/onyx-get-migration-candidates.md`: trigger vs source, read before the first write in the tick, no mutation of the result, and whether the value was on screen.',
        '',
    );

    if (pilot) {
        lines.push(
            '## Start here',
            '',
            `PR ${pullRequests.indexOf(pilot) + 1} (\`${pilot.bucket.title}: ${pilot.area}\`) is the smallest mechanical batch: ${pilot.files.length} files, ${countSubscriptions(pilot)} subscriptions. Land it first to settle the review shape, the PR description template, and the test steps before the bigger batches follow.`,
            '',
        );
    }

    for (const [index, pullRequest] of pullRequests.entries()) {
        const part = pullRequest.partCount > 1 ? ` (part ${pullRequest.part} of ${pullRequest.partCount})` : '';
        const revisited = pullRequest.files.filter((entry) => revisitedFiles.has(entry.file)).length;

        lines.push(
            `## PR ${index + 1} — ${pullRequest.bucket.title}: \`${pullRequest.area}\`${part}`,
            '',
            `${pullRequest.files.length} file${pullRequest.files.length === 1 ? '' : 's'}, ${countSubscriptions(pullRequest)} subscription${countSubscriptions(pullRequest) === 1 ? '' : 's'}. Keys: ${getKeyPaths(
                pullRequest,
            )
                .map((key) => `\`${key}\``)
                .join(', ')}.`,
            '',
            `**Change.** ${pullRequest.bucket.change}`,
            '',
        );

        if (revisited > 0) {
            lines.push(`**Comes back.** ${revisited} of these ${pullRequest.files.length} files hold convertible subscriptions this plan leaves behind, so a later PR opens them again.`, '');
        }

        lines.push('**Test.**', '');

        for (const step of pullRequest.bucket.test) {
            lines.push(`- ${step}`);
        }

        lines.push('', '| Site | Value | Key | Uses | Caveats |', '| --- | --- | --- | --- | --- |');

        for (const entry of pullRequest.files) {
            for (const finding of entry.findings) {
                const caveats = finding.caveats.length > 0 ? finding.caveats.map((caveat) => `\`${caveat}\``).join(' ') : '—';
                lines.push(
                    `| \`${finding.file}:${finding.line}\` | \`${finding.valueName ?? '—'}\` | \`${ONYXKEYS_ROOT}.${finding.keyPath ?? '<unresolvable>'}\` | ${formatReferences(finding.references)} | ${caveats} |`,
                );
            }
        }

        lines.push('');
    }

    return `${lines.join('\n')}\n`;
}

function parseArguments(argv: readonly string[]): {inputs: string[]; output: string; json: string | null; prs: string} {
    const inputs: string[] = [];
    let output = DEFAULT_OUTPUT;
    let json: string | null = null;
    let prs = DEFAULT_PR_OUTPUT;

    for (let index = 0; index < argv.length; index++) {
        const argument = argv.at(index);

        if (argument === undefined) {
            continue;
        }

        if (argument === '--out') {
            output = argv[++index] ?? DEFAULT_OUTPUT;
            continue;
        }

        if (argument === '--json') {
            json = argv[++index] ?? null;
            continue;
        }

        if (argument === '--prs') {
            prs = argv[++index] ?? DEFAULT_PR_OUTPUT;
            continue;
        }

        inputs.push(argument);
    }

    return {inputs: inputs.length > 0 ? inputs : [...DEFAULT_INPUTS], output, json, prs};
}

function main() {
    const {inputs, output, json, prs} = parseArguments(process.argv.slice(2));
    const repoRoot = process.cwd();
    const snapshotKeyPaths = resolveSnapshotKeyPaths(repoRoot);
    const files = collectFiles(inputs);
    const findings: Finding[] = [];
    const failures: Array<{file: string; message: string}> = [];

    for (const file of files) {
        const source = fs.readFileSync(file, 'utf8');

        if (!source.includes(`${HOOK_NAME}(`)) {
            continue;
        }

        try {
            findings.push(...analyzeFile(file, source, snapshotKeyPaths));
        } catch (error) {
            failures.push({file, message: error instanceof Error ? error.message : String(error)});
        }
    }

    const report = renderReport(findings, inputs, snapshotKeyPaths, files.length);
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, report);

    fs.mkdirSync(path.dirname(prs), {recursive: true});
    fs.writeFileSync(prs, renderPullRequestPlan(findings, PLAN_SCOPES.full));

    const dropInPrs = prs.replace(/\.md$/, '-drop-in-only.md');
    fs.writeFileSync(dropInPrs, renderPullRequestPlan(findings, PLAN_SCOPES.dropInOnly));

    if (json) {
        fs.mkdirSync(path.dirname(json), {recursive: true});
        const candidates = findings.filter((finding) => CONVERTIBLE_VERDICTS.has(finding.verdict));
        fs.writeFileSync(json, `${JSON.stringify(candidates, null, 2)}\n`);
    }

    const counts = new Map<Verdict, number>();

    for (const finding of findings) {
        counts.set(finding.verdict, (counts.get(finding.verdict) ?? 0) + 1);
    }

    console.log(`Scanned ${files.length} files, found ${findings.length} useOnyx() subscriptions.`);

    for (const [verdict, title] of VERDICT_TITLES) {
        console.log(`  ${title}: ${counts.get(verdict) ?? 0}`);
    }

    console.log(`Report written to ${output}, PR maps to ${prs} and ${dropInPrs}${json ? `, findings to ${json}` : ''}.`);

    for (const failure of failures) {
        console.warn(`Could not analyze ${failure.file}: ${failure.message}`);
    }
}

main();
