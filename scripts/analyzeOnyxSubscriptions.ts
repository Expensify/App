#!/usr/bin/env bun

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/**
 * Classifies every `useOnyx()` subscription in `src/` by whether the subscribed value is actually
 * read on the render path, and reports the `connectWithoutView()` call sites that are nothing more
 * than module-level caches.
 *
 * The motivating question is which subscriptions exist only so a component can hand a value to a
 * side effect (an `onPress`, an effect, a lib action). Those components re-render whenever the key
 * changes even though nothing they render depends on it, and — for collection keys — every such
 * subscriber re-runs its selector over the whole collection on any member change. Those are the
 * subscriptions an event-time read (`Onyx.get()`) would remove outright.
 *
 * The analysis is purely syntactic: each file is parsed on its own with the TypeScript parser and
 * no program/type-checker is constructed. That keeps a full pass over ~1,400 files fast enough to
 * run on demand, at the cost of resolving references by name within the declaring function rather
 * than through the symbol table. Shadowed names are therefore over-counted, which biases a binding
 * towards `render` — the safe direction, since a false `bridge` label is the one that would justify
 * an unsafe refactor.
 *
 * The same ancestor walk backs the proposed `no-onyx-get-in-render` lint rule, inverted: here it
 * asks "is this subscribed value read during render?", there it asks "is this read happening during
 * render?".
 *
 * Run with `bun` from the E/App checkout (it resolves `typescript` from the repo's node_modules).
 * Point `--src` at the checkout to run it from anywhere.
 *
 * Usage:
 *   bun analyzeOnyxSubscriptions.ts                    # summary + ranked candidate tiers
 *   bun analyzeOnyxSubscriptions.ts --json             # machine-readable, full per-binding data
 *   bun analyzeOnyxSubscriptions.ts --hot-only         # restrict tables to hot (churny) keys
 *   bun analyzeOnyxSubscriptions.ts --whole-collection
 *   bun analyzeOnyxSubscriptions.ts --file src/hooks/useBulkDuplicateReportAction.ts
 *   bun analyzeOnyxSubscriptions.ts --connect          # connectWithoutView cache-vs-work split
 *   bun analyzeOnyxSubscriptions.ts --src ~/dev/expensify-app/src
 */

const argv = process.argv.slice(2);

function argValue(flag: string): string | undefined {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv.at(index + 1);
}

const SRC_DIR = argValue('--src') ?? 'src';

/**
 * Keys that churn during ordinary use — pusher traffic, optimistic writes, search results. A
 * subscription to a cold key costs little no matter how it is used, so ranking candidates by
 * impact means ranking by how much hot data they hold.
 */
const HOT_KEY_PATTERNS = [
    /COLLECTION\.REPORT\b/,
    /COLLECTION\.REPORT_ACTIONS/,
    /COLLECTION\.REPORT_NAME_VALUE_PAIRS/,
    /COLLECTION\.REPORT_DRAFT/,
    /COLLECTION\.TRANSACTION\b/,
    /COLLECTION\.TRANSACTION_DRAFT/,
    /COLLECTION\.TRANSACTION_VIOLATIONS/,
    /COLLECTION\.SNAPSHOT/,
    /COLLECTION\.NEXT_STEP/,
    /COLLECTION\.POLICY\b/,
    /PERSONAL_DETAILS_LIST/,
];

/**
 * A bare collection key (no member suffix) subscribes to the entire collection, so Onyx hands the
 * subscriber the whole cached collection on any member change. These singletons behave the same
 * way: one large object rewritten wholesale.
 */
const BIG_SINGLETON_KEYS = new Set(['ONYXKEYS.PERSONAL_DETAILS_LIST', 'ONYXKEYS.CARD_LIST', 'ONYXKEYS.BANK_ACCOUNT_LIST', 'ONYXKEYS.LOGINS']);

const BARE_COLLECTION_KEY = /^ONYXKEYS\.COLLECTION\.[A-Z0-9_]+$/;

/** Hooks whose callback argument runs during render, so a read inside one is a render-path read. */
const RENDER_TIME_HOOKS = new Set(['useMemo']);

/** Hooks that take a dependency array as their last argument. */
const HOOKS_WITH_DEPS = new Set(['useMemo', 'useCallback', 'useEffect', 'useLayoutEffect', 'useFocusEffect', 'useImperativeHandle']);

/**
 * Array methods that invoke their callback synchronously, in place. A read inside one of these
 * happens whenever the surrounding code runs, so it does not defer anything.
 */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'flatMap', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findLast', 'findIndex', 'some', 'every', 'sort', 'flat']);

/** Path fragments suggesting a component is rendered once per row, where per-render cost multiplies. */
const LIST_ITEM_HINTS = [/ListItem/, /\/Cell/, /Row\.tsx$/, /Preview/, /Item\.tsx$/];

type RefKind = 'render' | 'deferred' | 'deps';
type BindingClass = 'render' | 'bridge' | 'deps';

type Binding = {
    file: string;
    line: number;
    name: string;
    key: string;
    hasSelector: boolean;
    isHot: boolean;
    isWholeCollection: boolean;
    /**
     * Every reference indexes straight into the value (`allPolicies?.[policyID]`), so the whole
     * collection is subscribed to in order to read a single member. These are the highest-confidence
     * conversions: an event-time read of the member key alone is exactly equivalent.
     */
    readsSingleMemberOnly: boolean;
    class: BindingClass;
};

type FileSummary = {
    file: string;
    render: number;
    bridge: number;
    deps: number;
    hotRender: number;
    hotBridge: number;
    wholeCollectionBridge: number;
    isListItem: boolean;
};

function collectSourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectSourceFiles(full, out);
        } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
            out.push(full);
        }
    }
    return out;
}

function parse(file: string): ts.SourceFile {
    return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, /* setParentNodes */ true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}

function forEachDescendant(node: ts.Node, visit: (node: ts.Node) => void): void {
    visit(node);
    node.forEachChild((child) => forEachDescendant(child, visit));
}

function calleeName(node: ts.CallExpression): string {
    return ts.isIdentifier(node.expression) ? node.expression.text : node.expression.getText();
}

/**
 * True when a function expression runs at the point it is written rather than later: an IIFE
 * (`const x = (() => { ... })()`, a common way to scope a derivation during render) or the callback
 * of a synchronous array method. Neither defers the read, so neither is a boundary.
 */
function runsImmediately(fn: ts.Node): boolean {
    let outer: ts.Node = fn;
    while (outer.parent && ts.isParenthesizedExpression(outer.parent)) {
        outer = outer.parent;
    }

    const parent = outer.parent;
    if (!parent || !ts.isCallExpression(parent)) {
        return false;
    }

    // `(() => {...})()` — the function is the thing being called.
    if (parent.expression === outer) {
        return true;
    }

    // `items.map(item => ...)` — the function is an argument to a synchronous array method.
    return ts.isPropertyAccessExpression(parent.expression) && SYNCHRONOUS_CALLBACK_METHODS.has(parent.expression.name.text);
}

/**
 * Walks from a reference up to the boundary of the declaring function, deciding whether the value
 * is read while rendering.
 *
 * Crossing a function boundary means the read is deferred to whenever that function is invoked —
 * an event handler, an effect — unless the function is the callback of a render-time hook. A
 * reference that only appears in a dependency array is classified separately: it does not read the
 * value during render, but it does make the memoized identity churn, so it is neither a true bridge
 * nor a true render read.
 */
function classifyReference(reference: ts.Node, scope: ts.Node): RefKind {
    let node: ts.Node | undefined = reference.parent;
    let crossedFunctionBoundary = false;
    let inDepsArray = false;

    while (node && node !== scope) {
        if (ts.isJsxExpression(node) || ts.isJsxAttribute(node)) {
            return 'render';
        }

        if (isFunctionLike(node)) {
            const parent: ts.Node | undefined = node.parent;
            const isRenderTimeHookCallback = !!parent && ts.isCallExpression(parent) && RENDER_TIME_HOOKS.has(calleeName(parent));
            if (!isRenderTimeHookCallback && !runsImmediately(node)) {
                crossedFunctionBoundary = true;
            }
        }

        if (ts.isArrayLiteralExpression(node)) {
            const arrayLiteral: ts.ArrayLiteralExpression = node;
            const parent: ts.Node | undefined = arrayLiteral.parent;
            if (parent && ts.isCallExpression(parent) && HOOKS_WITH_DEPS.has(calleeName(parent))) {
                const args: ts.NodeArray<ts.Expression> = parent.arguments;
                if (args.length > 1 && args[args.length - 1] === arrayLiteral) {
                    inDepsArray = true;
                }
            }
        }

        node = node.parent;
    }

    if (crossedFunctionBoundary) {
        return 'deferred';
    }
    return inDepsArray ? 'deps' : 'render';
}

/** Identifiers that merely spell a name rather than read the binding. */
function isNamePositionOnly(id: ts.Identifier): boolean {
    const parent = id.parent;
    if (!parent) {
        return false;
    }
    if (ts.isPropertyAccessExpression(parent) && parent.name === id) {
        return true;
    }
    if (ts.isPropertyAssignment(parent) && parent.name === id) {
        return true;
    }
    if (ts.isBindingElement(parent) && parent.propertyName === id) {
        return true;
    }
    if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) {
        return true;
    }
    return false;
}

/**
 * The first element of the array pattern is the value; the second is `useOnyx` metadata whose use
 * (loading flags and the like) says nothing about whether the value itself reaches the UI.
 */
function getValueBinding(declaration: ts.VariableDeclaration): ts.Identifier | undefined {
    const name = declaration.name;
    if (ts.isIdentifier(name)) {
        return name;
    }
    if (ts.isArrayBindingPattern(name)) {
        const first = name.elements.at(0);
        if (first && ts.isBindingElement(first) && ts.isIdentifier(first.name)) {
            return first.name;
        }
    }
    return undefined;
}

function isFunctionLike(node: ts.Node): node is ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression {
    return ts.isArrowFunction(node) || ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node);
}

function findAncestor<T extends ts.Node>(node: ts.Node, predicate: (candidate: ts.Node) => candidate is T): T | undefined {
    let current: ts.Node | undefined = node.parent;
    while (current) {
        if (predicate(current)) {
            return current;
        }
        current = current.parent;
    }
    return undefined;
}

function analyzeFile(file: string): Binding[] {
    const sourceFile = parse(file);
    const bindings: Binding[] = [];

    forEachDescendant(sourceFile, (node) => {
        if (!ts.isCallExpression(node) || calleeName(node) !== 'useOnyx') {
            return;
        }

        const declaration = findAncestor(node, ts.isVariableDeclaration);
        if (!declaration) {
            return;
        }

        const valueBinding = getValueBinding(declaration);
        if (!valueBinding) {
            return;
        }

        const key = node.arguments.at(0)?.getText(sourceFile).replaceAll(/\s+/g, '') ?? '';
        const options = node.arguments.at(1)?.getText(sourceFile) ?? '';

        const declaringFunction = findAncestor(node, isFunctionLike);
        const scope: ts.Node = declaringFunction?.body ?? sourceFile;

        const kinds = new Set<RefKind>();
        let referenceCount = 0;
        let indexedReferenceCount = 0;
        forEachDescendant(scope, (candidate) => {
            if (!ts.isIdentifier(candidate) || candidate.text !== valueBinding.text || candidate === valueBinding || isNamePositionOnly(candidate)) {
                return;
            }
            kinds.add(classifyReference(candidate, scope));
            referenceCount += 1;
            const parent = candidate.parent;
            if (parent && ts.isElementAccessExpression(parent) && parent.expression === candidate) {
                indexedReferenceCount += 1;
            }
        });

        // An unread binding cannot be driving a render, and removing it is trivially safe.
        let bindingClass: BindingClass = 'bridge';
        if (kinds.has('render')) {
            bindingClass = 'render';
        } else if (!kinds.has('deferred') && kinds.has('deps')) {
            bindingClass = 'deps';
        }

        bindings.push({
            file,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            name: valueBinding.text,
            key,
            hasSelector: /\bselector\s*:/.test(options),
            isHot: HOT_KEY_PATTERNS.some((pattern) => pattern.test(key)),
            isWholeCollection: BARE_COLLECTION_KEY.test(key) || BIG_SINGLETON_KEYS.has(key),
            readsSingleMemberOnly: referenceCount > 0 && referenceCount === indexedReferenceCount,
            class: bindingClass,
        });
    });

    return bindings;
}

function summarizeByFile(bindings: Binding[]): Map<string, FileSummary> {
    const byFile = new Map<string, FileSummary>();

    for (const binding of bindings) {
        let summary = byFile.get(binding.file);
        if (!summary) {
            summary = {
                file: binding.file,
                render: 0,
                bridge: 0,
                deps: 0,
                hotRender: 0,
                hotBridge: 0,
                wholeCollectionBridge: 0,
                isListItem: LIST_ITEM_HINTS.some((hint) => hint.test(binding.file)),
            };
            byFile.set(binding.file, summary);
        }

        summary[binding.class] += 1;
        if (binding.isHot) {
            if (binding.class === 'render') {
                summary.hotRender += 1;
            } else {
                summary.hotBridge += 1;
            }
        }
        if (binding.isWholeCollection && binding.class !== 'render') {
            summary.wholeCollectionBridge += 1;
        }
    }

    return byFile;
}

/**
 * Splits `connectWithoutView()` call sites into those whose callback only assigns the value to a
 * module-level variable — a hand-rolled cache that an event-time read replaces one-for-one — and
 * those that do real work on change and must keep their subscription.
 */
function isPlainAssignment(expression: ts.Expression): boolean {
    let node: ts.Expression = expression;
    while (ts.isParenthesizedExpression(node)) {
        node = node.expression;
    }
    return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

/**
 * A callback is a cache if it does nothing but write the incoming value somewhere — no branching,
 * no calls, no notifications. Anything else is behaviour that genuinely needs to run on change and
 * must keep its subscription.
 */
function isCacheOnlyCallback(callback: ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration): boolean {
    const body = callback.body;
    if (!body) {
        return false;
    }
    if (!ts.isBlock(body)) {
        return isPlainAssignment(body);
    }
    if (body.statements.length === 0) {
        return false;
    }
    return body.statements.every((statement) => ts.isExpressionStatement(statement) && isPlainAssignment(statement.expression));
}

function getCallbackFunction(options: ts.Expression): ts.ArrowFunction | ts.FunctionExpression | ts.MethodDeclaration | undefined {
    if (!ts.isObjectLiteralExpression(options)) {
        return undefined;
    }
    for (const property of options.properties) {
        const name = property.name && ts.isIdentifier(property.name) ? property.name.text : undefined;
        if (name !== 'callback') {
            continue;
        }
        if (ts.isMethodDeclaration(property)) {
            return property;
        }
        if (ts.isPropertyAssignment(property) && (ts.isArrowFunction(property.initializer) || ts.isFunctionExpression(property.initializer))) {
            return property.initializer;
        }
    }
    return undefined;
}

type ConnectApi = 'onyxConnect' | 'connectWithoutView';

type ConnectSummary = {
    cacheOnly: string[];
    realWork: string[];
    cacheFiles: number;
    total: number;
};

/**
 * Splits subscription call sites into those whose callback only writes the value to an outer
 * variable — a hand-rolled cache that an event-time read replaces one-for-one — and those that do
 * real work on change and must keep their subscription.
 *
 * The two APIs are reported separately because they mean different things. `Onyx.connect()` is the
 * open backlog of the deprecation project: references still to be triaged. `connectWithoutView()`
 * is the closed set: references already reviewed and deliberately kept as non-UI subscriptions.
 * Summing them would merge a shrinking queue with a growing set of settled decisions.
 */
function analyzeConnectCallSites(files: string[]): Record<ConnectApi, ConnectSummary> {
    const result: Record<ConnectApi, ConnectSummary> = {
        onyxConnect: {cacheOnly: [], realWork: [], cacheFiles: 0, total: 0},
        connectWithoutView: {cacheOnly: [], realWork: [], cacheFiles: 0, total: 0},
    };

    for (const file of files) {
        const contents = fs.readFileSync(file, 'utf8');
        if (!contents.includes('connectWithoutView') && !contents.includes('.connect(')) {
            continue;
        }

        forEachDescendant(parse(file), (node) => {
            if (!ts.isCallExpression(node)) {
                return;
            }

            const callee = calleeName(node);
            let api: ConnectApi;
            if (callee.endsWith('connectWithoutView')) {
                api = 'connectWithoutView';
            } else if (callee.endsWith('.connect') || callee === 'connect') {
                api = 'onyxConnect';
            } else {
                return;
            }

            const bucket = result[api];
            bucket.total += 1;

            const options = node.arguments.at(0);
            const callback = options ? getCallbackFunction(options) : undefined;
            if (callback && isCacheOnlyCallback(callback)) {
                bucket.cacheOnly.push(file);
            } else {
                bucket.realWork.push(file);
            }
        });
    }

    for (const summary of Object.values(result)) {
        summary.cacheFiles = new Set(summary.cacheOnly).size;
    }

    return result;
}

function percent(part: number, total: number): string {
    return total === 0 ? '0.0%' : `${((100 * part) / total).toFixed(1)}%`;
}

/** Extract the `key:` option of every subscription call in a source text, without touching disk. */
function extractSubscriptionKeys(fileName: string, text: string, matchCallee: (callee: string) => boolean): Array<{file: string; key: string}> {
    const found: Array<{file: string; key: string}> = [];
    let sourceFile: ts.SourceFile;
    try {
        sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    } catch {
        return found;
    }

    forEachDescendant(sourceFile, (node) => {
        if (!ts.isCallExpression(node) || !matchCallee(calleeName(node))) {
            return;
        }
        const options = node.arguments.at(0);
        let key = '?';
        if (options && ts.isObjectLiteralExpression(options)) {
            for (const property of options.properties) {
                const name = property.name && ts.isIdentifier(property.name) ? property.name.text : undefined;
                if (name === 'key' && ts.isPropertyAssignment(property)) {
                    key = property.initializer.getText(sourceFile).replaceAll(/\s+/g, '');
                }
            }
        }
        found.push({file: fileName, key});
    });

    return found;
}

/**
 * Answers where today's `connectWithoutView()` sites came from.
 *
 * `connectWithoutView` did not exist before mid-2025, so a commit from before it was introduced is a
 * clean baseline: every subscription in the codebase at that point was an `Onyx.connect()`. A site is
 * counted as *migrated* only when the very same file already subscribed to the very same key back
 * then. Everything else appeared after the deprecation began.
 *
 * Sites in a file that has other `Onyx.connect()` calls at baseline but not this key are reported
 * separately as uncertain, because the key expression may simply have been rewritten rather than the
 * subscription being new.
 */
function analyzeProvenance(baseRef: string) {
    const git = (args: string[]) => execFileSync('git', args, {maxBuffer: 268_435_456}).toString();

    const baselineTree = new Set(git(['ls-tree', '-r', '--name-only', baseRef, 'src']).trim().split('\n'));
    const baselineConnectFiles = new Set(
        git(['grep', '-l', String.raw`Onyx\.connect(`, baseRef, '--', 'src'])
            .trim()
            .split('\n')
            .map((line) => line.replace(`${baseRef}:`, '')),
    );

    const baselinePairs = new Map<string, number>();
    for (const file of baselineConnectFiles) {
        let text: string;
        try {
            text = git(['show', `${baseRef}:${file}`]);
        } catch {
            continue;
        }
        for (const site of extractSubscriptionKeys(file, text, (callee) => callee.endsWith('.connect') || callee === 'connect')) {
            const id = `${site.file}|${site.key}`;
            baselinePairs.set(id, (baselinePairs.get(id) ?? 0) + 1);
        }
    }

    const current = collectSourceFiles(SRC_DIR)
        .filter((file) => fs.readFileSync(file, 'utf8').includes('connectWithoutView'))
        .flatMap((file) => extractSubscriptionKeys(file, fs.readFileSync(file, 'utf8'), (callee) => callee.endsWith('connectWithoutView')));

    let migrated = 0;
    let newFile = 0;
    let existingFileNeverConnected = 0;
    let uncertain = 0;
    const newFileList: string[] = [];

    for (const site of current) {
        const id = `${site.file}|${site.key}`;
        const remaining = baselinePairs.get(id) ?? 0;
        if (remaining > 0) {
            baselinePairs.set(id, remaining - 1);
            migrated += 1;
        } else if (!baselineTree.has(site.file)) {
            newFile += 1;
            newFileList.push(site.file);
        } else if (!baselineConnectFiles.has(site.file)) {
            existingFileNeverConnected += 1;
        } else {
            uncertain += 1;
        }
    }

    return {total: current.length, migrated, newFile, existingFileNeverConnected, uncertain, newFiles: [...new Set(newFileList)].sort()};
}

function main(): void {
    const asJson = argv.includes('--json');
    const hotOnly = argv.includes('--hot-only');
    const wholeCollectionOnly = argv.includes('--whole-collection');
    const singleFile = argValue('--file');
    const connectOnly = argv.includes('--connect');
    const provenanceRef = argValue('--provenance');

    const files = collectSourceFiles(SRC_DIR);

    if (provenanceRef) {
        const {total, migrated, newFile, existingFileNeverConnected, uncertain, newFiles} = analyzeProvenance(provenanceRef);
        const netNew = newFile + existingFileNeverConnected;
        console.log(`=== provenance of connectWithoutView sites (baseline ${provenanceRef}) ===`);
        console.log(`current call sites                                   : ${total}`);
        console.log(`MIGRATED  same file already connected this key        : ${migrated} (${percent(migrated, total)})`);
        console.log(`NET-NEW   file did not exist at baseline              : ${newFile} (${percent(newFile, total)})`);
        console.log(`NET-NEW   file existed with no Onyx.connect at all    : ${existingFileNeverConnected} (${percent(existingFileNeverConnected, total)})`);
        console.log(`UNCERTAIN file had other connects; key may have moved : ${uncertain} (${percent(uncertain, total)})`);
        console.log('');
        console.log(`confident net-new  : ${netNew} (${percent(netNew, total)})`);
        console.log(`confident migrated : ${migrated} (${percent(migrated, total)})`);
        if (argv.includes('--verbose')) {
            console.log(`\n--- files absent at baseline (${newFiles.length}) ---`);
            for (const file of newFiles) {
                console.log(`  ${file}`);
            }
        }
        return;
    }

    if (connectOnly) {
        const summaries = analyzeConnectCallSites(files);
        const labels: Record<ConnectApi, string> = {
            onyxConnect: 'Onyx.connect()  — open backlog, still being triaged',
            connectWithoutView: 'connectWithoutView()  — already reviewed and deliberately kept',
        };

        for (const api of ['onyxConnect', 'connectWithoutView'] as ConnectApi[]) {
            const {cacheOnly, realWork, cacheFiles, total} = summaries[api];
            console.log(`=== ${labels[api]} ===`);
            console.log(`total call sites                            : ${total}`);
            console.log(`module-level cache (Onyx.get would replace) : ${cacheOnly.length} in ${cacheFiles} files (${percent(cacheOnly.length, total)})`);
            console.log(`real work in callback (keep)                : ${realWork.length}`);
            if (argv.includes('--verbose')) {
                console.log('--- cache-only sites ---');
                for (const file of [...new Set(cacheOnly)].sort()) {
                    console.log(`  ${file}`);
                }
            }
            console.log('');
        }
        return;
    }

    if (argv.includes('--file')) {
        if (!singleFile) {
            console.error('--file requires a path');
            process.exit(1);
        }
        for (const binding of analyzeFile(singleFile)) {
            console.log(`${binding.class.padEnd(6)} ${binding.hasSelector ? 'sel' : 'RAW'} ${binding.isHot ? 'HOT' : '   '} ${binding.name} <- ${binding.key} (:${binding.line})`);
        }
        return;
    }

    let bindings = files.flatMap(analyzeFile);
    const totalAnalyzed = bindings.length;

    if (hotOnly) {
        bindings = bindings.filter((binding) => binding.isHot);
    }
    if (wholeCollectionOnly) {
        bindings = bindings.filter((binding) => binding.isWholeCollection);
    }

    const byFile = summarizeByFile(bindings);

    if (asJson) {
        console.log(JSON.stringify({bindings, files: [...byFile.values()]}, null, 2));
        return;
    }

    const render = bindings.filter((binding) => binding.class === 'render').length;
    const bridge = bindings.filter((binding) => binding.class === 'bridge').length;
    const deps = bindings.filter((binding) => binding.class === 'deps').length;
    const bridgeNoSelector = bindings.filter((binding) => binding.class === 'bridge' && !binding.hasSelector).length;
    const wholeCollectionBridge = bindings.filter((binding) => binding.class !== 'render' && binding.isWholeCollection);

    console.log('=== useOnyx subscriptions ===');
    console.log(`files scanned            : ${files.length}`);
    console.log(`bindings analysed        : ${bindings.length}${bindings.length === totalAnalyzed ? '' : ` (of ${totalAnalyzed} total)`}`);
    console.log(`render-reachable         : ${render} (${percent(render, bindings.length)})`);
    console.log(`BRIDGE-ONLY              : ${bridge} (${percent(bridge, bindings.length)})  — no selector: ${bridgeNoSelector}`);
    console.log(`deps-array-only          : ${deps}`);
    console.log(`whole-collection bridge  : ${wholeCollectionBridge.length}  — no selector: ${wholeCollectionBridge.filter((b) => !b.hasSelector).length}`);
    console.log(`  ...of which the whole collection is subscribed only to index one member: ${wholeCollectionBridge.filter((b) => b.readsSingleMemberOnly).length}`);

    const summaries = [...byFile.values()];
    const tierA = summaries.filter((summary) => summary.render === 0 && summary.bridge + summary.deps > 0);
    const tierB = summaries.filter((summary) => summary.hotRender === 0 && summary.hotBridge > 0);
    const tierC = tierB.filter((summary) => summary.isListItem);

    console.log('\n=== candidate tiers ===');
    console.log(`Tier A — every subscription is non-render (convert whole file) : ${tierA.length} files`);
    console.log(`Tier B — all hot-key subscriptions are non-render             : ${tierB.length} files`);
    console.log(`Tier C — Tier B and rendered per list row                     : ${tierC.length} files`);

    const rank = (summary: FileSummary) => summary.hotBridge * 10 + summary.wholeCollectionBridge * 3 + summary.bridge;

    console.log('\n--- Tier A, top 25 (removable = bridge + deps) ---');
    for (const summary of tierA.sort((a, b) => b.bridge + b.deps - (a.bridge + a.deps)).slice(0, 25)) {
        console.log(`${String(summary.bridge + summary.deps).padStart(3)}  hot=${summary.hotBridge}  ${summary.file}`);
    }

    console.log('\n--- Tier B, top 25 (F = also fully unsubscribes) ---');
    for (const summary of tierB.sort((a, b) => rank(b) - rank(a)).slice(0, 25)) {
        const fully = summary.render === 0 ? 'F' : ' ';
        console.log(
            `${fully} hot=${String(summary.hotBridge).padStart(2)} whole=${String(summary.wholeCollectionBridge).padStart(2)} render=${String(summary.render).padStart(2)}  ${summary.file}`,
        );
    }

    if (tierC.length > 0) {
        console.log('\n--- Tier C (per-row cost multiplies) ---');
        for (const summary of tierC.sort((a, b) => rank(b) - rank(a))) {
            console.log(`  hot=${summary.hotBridge} render=${summary.render}  ${summary.file}`);
        }
    }
}

main();
