#!/usr/bin/env bun

/**
 * Answers "how much work is wave 1" for the `Onyx.get()` proposal, and answers it with a list rather
 * than a number: every `useOnyx()` binding in `src/` that could be deleted in favour of an event-time
 * read, each with a verdict saying whether the mechanical conditions clear it outright or a human has
 * to look.
 *
 * `analyzeOnyxSubscriptions.ts` already reports which bindings are never read during render. That set
 * is a superset of the convertible one: a binding can be off the render path and still be the wrong
 * thing to convert. The three shapes that matter, none of which the non-render classification
 * separates out:
 *
 *   - the subscription is the trigger, not the data source. A value referenced only inside a
 *     `useEffect` callback or a dependency array is there so the effect re-runs when the key changes.
 *     Delete the subscription and the effect stops firing. This is the proposal's sixth condition,
 *     event-time freshness, and it is the one condition that is a judgment call rather than a rule.
 *   - the binding is never referenced at all. Dead, so it should be deleted rather than converted, and
 *     counting it as conversion work overstates the wave.
 *   - the handler that consumes the value writes to Onyx. Moving the read inside it can put the read
 *     after the write, where `merge` and `update` have not applied yet. That is the proposal's third
 *     condition.
 *
 * What a `CERTAIN` verdict does and does not claim. It claims the four mechanical conditions hold for
 * the conversion that keeps the read in this file: the value never reaches rendered output, every
 * reference sits in event-position code, no reference is an effect trigger, and the consuming function
 * performs no Onyx write the read could land behind. It does not claim anything about pushing the read
 * further down into a callee in another file, which changes that callee's safety class and needs the
 * forward sweep in the onyx-get skill; `--callee-names` prints every callee to sweep. And it
 * cannot speak to the proposal's fourth condition, mixing a source key with a key derived from it,
 * because that depends on which keys the converted function ends up reading.
 *
 * The analysis is syntactic, one file at a time, with no type-checker, so references resolve by name
 * inside the declaring function. A shadowed name is over-counted, which pushes a binding towards
 * `render` and out of the candidate set. Every inaccuracy therefore shrinks the list, which is the
 * safe direction: this is a lower bound on the work, not an upper one.
 *
 * Usage:
 *   bun scripts/trackOnyxGetMigration.ts --status        # where the migration stands, counts and % of all bindings
 *   bun scripts/trackOnyxGetMigration.ts                 # summary, then the whole-file candidates
 *   bun scripts/trackOnyxGetMigration.ts --certain       # just the CERTAIN bindings, one per line
 *   bun scripts/trackOnyxGetMigration.ts --verdicts      # every non-render binding and why
 *   bun scripts/trackOnyxGetMigration.ts --callee-names  # every callee to run the caller sweep on
 *   bun scripts/trackOnyxGetMigration.ts --file <path>   # one file, per-binding verdict
 *   bun scripts/trackOnyxGetMigration.ts --json
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);

function argValue(flag: string): string | undefined {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv.at(index + 1);
}

/**
 * Hooks whose callback runs during render, so crossing into one does not defer the read. Kept in step
 * with `RENDER_TIME_HOOK_NAMES` in `eslint-plugin-local-rules/no-unsafe-onyx-read.js`, which decides
 * the same question for the read side.
 */
const RENDER_TIME_HOOKS = new Set(['useMemo']);

/** Hooks that return a memoized value, so a name bound to one has an identity that changes with its deps. */
const MEMO_HOOKS = new Set(['useCallback', 'useMemo']);

/** Hooks taking a dependency array as their last argument. */
const HOOKS_WITH_DEPS = new Set(['useMemo', 'useCallback', 'useEffect', 'useLayoutEffect', 'useFocusEffect', 'useImperativeHandle']);

/**
 * Hooks whose callback re-runs because a dependency changed. A value referenced inside one of these,
 * or in its dependency array, is a subscription used as a trigger.
 */
const EFFECT_HOOKS = new Set(['useEffect', 'useLayoutEffect', 'useFocusEffect', 'useInsertionEffect']);

/** Array methods that invoke their callback in place, so they defer nothing. */
const SYNCHRONOUS_CALLBACK_METHODS = new Set([
    'map',
    'flatMap',
    'filter',
    'reduce',
    'reduceRight',
    'forEach',
    'find',
    'findLast',
    'findIndex',
    'findLastIndex',
    'some',
    'every',
    'sort',
    'flat',
]);

/**
 * Calls that end a synchronous stretch. The `Onyx.get()` rule is one read block per stretch, not per
 * function: code after a deferral runs in a later tick and is meant to see the writes the earlier stretch
 * made, so it has to do its own reads. Nothing catches a read hoisted across one of these, which is why a
 * consuming function containing one needs a placement decision rather than a mechanical conversion.
 */
const DEFERRAL_CALLS = new Set(['runAfterTransitions', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'runAfterInteractions', 'then', 'finally', 'queueMicrotask', 'setImmediate']);

/** Onyx calls that write. A read moved in behind one of these is the read-after-write hazard. */
const ONYX_WRITE_METHODS = new Set(['set', 'multiSet', 'merge', 'mergeCollection', 'setCollection', 'update', 'clear']);

/**
 * Whether a node is itself an Onyx write. Three shapes, and the third is the one that matters: the action
 * layer almost never calls `Onyx.merge` directly, it builds `optimisticData` descriptors carrying
 * `onyxMethod: Onyx.METHOD.MERGE` and hands them to `API.write`. Detecting only the direct call finds
 * nothing, which is why `openReport` looked write-free on the first pass.
 *
 * Any call on `API` counts, not just `write`: every entry point on it (`write`, the
 * `writeWithNoDuplicates*` family, `makeRequestWithSideEffects`, `read`, `paginate`) takes an `onyxData`
 * argument that can carry optimistic data.
 */
/** Import sources that resolve to the Onyx library. Kept in step with the `no-unsafe-onyx-read` rule. */
const ONYX_MODULE_PREFIX = 'react-native-onyx';

/** Synchronous read APIs on the Onyx surface. None of them subscribe, so each one is a converted read. */
const SYNC_READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

function isOnyxWrite(node: ts.Node): boolean {
    // `optimisticData.push({onyxMethod: Onyx.METHOD.MERGE, ...})` — building a write descriptor.
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'METHOD' && node.expression.getText() === 'Onyx') {
        return true;
    }

    if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression)) {
        return false;
    }

    const target = node.expression.expression.getText();
    if (target === 'Onyx' && ONYX_WRITE_METHODS.has(node.expression.name.text)) {
        return true;
    }

    return target === 'API';
}

/**
 * Files that can run before Onyx has hydrated, where a synchronous read returns `undefined` for a key
 * that is still only on disk. The proposal's fifth condition. Deliberately a short list of the app's
 * own boot path rather than a guess at what a handler might be called from at startup.
 */
const STARTUP_PATH_HINTS = [/^src\/setup\//, /^src\/App\.tsx$/, /^src\/Expensify\.tsx$/, /^src\/HybridAppHandler\.tsx$/, /^src\/libs\/actions\/App\.ts$/, /^src\/libs\/E2E\//];

type ReferenceKind =
    /** Read while rendering: in JSX, or reached without crossing a deferring function boundary. */
    | 'render'
    /** In the dependency array of an effect, so the subscription is what schedules the effect. */
    | 'effectDeps'
    /** In the dependency array of a `useMemo` or `useCallback`, which schedules nothing. */
    | 'memoDeps'
    /**
     * Inside a memoized function whose own identity feeds an effect's dependency array. The value does not
     * reach the effect, but changing it churns the callback, which re-runs the effect, so the subscription
     * is a trigger one hop removed.
     */
    | 'indirectEffect'
    /**
     * Inside a function that the scope returns to its caller. Whether that caller invokes it during render
     * is a cross-file question, so it cannot be cleared here.
     */
    | 'escapes'
    /** Inside an effect callback, so the subscription is what makes the effect fire. */
    | 'effect'
    /** Inside a function that runs later: a handler, a callback, a non-render hook body. */
    | 'deferred';

type Verdict =
    /** Reaches rendered output. Not part of this migration. */
    | 'NOT_CANDIDATE'
    /** Never referenced. Delete the binding; there is nothing to convert. */
    | 'DEAD'
    /** Off the render path, but a mechanical condition needs a human. */
    | 'REVIEW'
    /** Every mechanical condition holds for an in-file conversion. */
    | 'CERTAIN';

type Binding = {
    file: string;
    line: number;
    name: string;
    key: string;
    referenceCount: number;
    kinds: ReferenceKind[];
    /** Every reference indexes straight into the value, so a member-key read is exactly equivalent. */
    readsSingleMemberOnly: boolean;
    /** Functions the value is handed to, as `name` or `object.name`. Where the read would move. */
    calleeNames: string[];
    /** Onyx write methods called inside a consuming function, ahead of the reference. */
    writesAhead: string[];
    /** Deferral points inside the consuming function, which split it into several synchronous stretches. */
    deferrals: string[];
    verdict: Verdict;
    /** Why the verdict is not `CERTAIN`. Empty when it is. */
    reasons: string[];
};

function listSourceFiles(): string[] {
    const output = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src'], {cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024});
    return output
        .split('\n')
        .filter(Boolean)
        .filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.d.ts'));
}

function parse(file: string): ts.SourceFile {
    const absolute = path.isAbsolute(file) ? file : path.join(projectRoot, file);
    return ts.createSourceFile(file, fs.readFileSync(absolute, 'utf8'), ts.ScriptTarget.Latest, /* setParentNodes */ true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}

function forEachDescendant(node: ts.Node, visit: (node: ts.Node) => void): void {
    visit(node);
    node.forEachChild((child) => forEachDescendant(child, visit));
}

function isFunctionLike(node: ts.Node): node is ts.ArrowFunction | ts.FunctionDeclaration | ts.FunctionExpression | ts.MethodDeclaration {
    return ts.isArrowFunction(node) || ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node);
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

function calleeName(node: ts.CallExpression): string {
    return ts.isIdentifier(node.expression) ? node.expression.text : node.expression.getText();
}

/**
 * The bare name a call is made through, so `React.useEffect` matches `useEffect`. Matching the full
 * text instead leaves a member-expression hook call unrecognized, and an unrecognized hook makes a
 * dependency-array reference look like a render read.
 */
function hookName(node: ts.CallExpression): string {
    if (ts.isIdentifier(node.expression)) {
        return node.expression.text;
    }
    return ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : node.expression.getText();
}

/**
 * True when a function expression runs where it is written rather than later: an IIFE, or the callback
 * of a synchronous array method. Neither is a boundary, and treating them as one is what mis-labelled
 * 99 bindings in an early version of the subscription classifier.
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

    if (parent.expression === outer) {
        return true;
    }

    return ts.isPropertyAccessExpression(parent.expression) && SYNCHRONOUS_CALLBACK_METHODS.has(parent.expression.name.text);
}

/**
 * The hook a call belongs to, seeing through the `useFocusEffect(useCallback(fn, deps))` idiom.
 *
 * React Navigation's `useFocusEffect` requires its callback to be memoized, so the effect's real
 * dependency array is written on the inner `useCallback`. Read literally, that array belongs to a memo
 * hook and looks harmless, which is how `selectionMode` in `useSearchBackPress/index.android.ts` cleared
 * every gate while genuinely driving a focus effect.
 */
function effectiveHookName(call: ts.CallExpression): string {
    const name = hookName(call);
    if (!MEMO_HOOKS.has(name)) {
        return name;
    }

    let outer: ts.Node = call;
    while (outer.parent && ts.isParenthesizedExpression(outer.parent)) {
        outer = outer.parent;
    }
    const parent = outer.parent;
    if (parent && ts.isCallExpression(parent) && parent.arguments.some((argument) => argument === outer) && EFFECT_HOOKS.has(hookName(parent))) {
        return hookName(parent);
    }

    return name;
}

/** The hook call a function expression is an argument to, if any: `useEffect(() => ...)` gives `useEffect`. */
function enclosingHookCall(fn: ts.Node): string | undefined {
    const parent = fn.parent;
    if (!parent || !ts.isCallExpression(parent)) {
        return undefined;
    }
    return effectiveHookName(parent);
}

/**
 * True for a function React itself calls while rendering to produce an initial value: the lazy initializer
 * of `useState`, or the third argument of `useReducer`. Both run on the first render, so a read inside one
 * is a render read. `reportNameValuePairs` in `ReportsSplitNavigator.tsx` sits in a `useState(() => ...)`
 * and looked deferred until this was added.
 *
 * `useReducer`'s first argument is excluded on purpose: a reducer runs on dispatch, which is an event.
 */
function isRenderTimeInitializer(fn: ts.Node): boolean {
    const parent = fn.parent;
    if (!parent || !ts.isCallExpression(parent)) {
        return false;
    }

    const name = hookName(parent);
    const index = parent.arguments.findIndex((argument) => argument === fn);

    if (name === 'useState') {
        return index === 0;
    }
    return name === 'useReducer' && index === 2;
}

/**
 * True for a function passed as the `selector` of a `useOnyx` call. Onyx runs a selector while the
 * subscription is being evaluated, so a read inside one happens during render and the boundary is
 * transparent, exactly like a `useMemo` callback.
 */
function isSelectorCallback(fn: ts.Node): boolean {
    const parent = fn.parent;
    return !!parent && ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name) && parent.name.text === 'selector';
}

/**
 * Local functions in `scope` that are called while the scope itself is rendering, so their bodies are
 * render positions rather than deferred ones.
 *
 * This is the shape that produced a false `CERTAIN` for `cardList` in `MoneyRequestHeader.tsx`: a plain
 * `const getStatusBarProps = () => {...}` read the value, and the component called it a few lines later
 * and rendered the result. It is neither an IIFE nor an array callback nor a `useMemo`, so every
 * transparency test missed it and the read looked deferred.
 *
 * Resolved to a fixed point, because a render-invoked function's own body is a render position too, so
 * anything it calls is render-invoked as well. Names resolve syntactically, so a shadowed local name
 * over-matches, which marks a function render-invoked when it might not be. That direction removes
 * candidates rather than adding them.
 */
function renderInvokedFunctions(scope: ts.Node): Set<ts.Node> {
    /** Local name to the function it is bound to, for both `const f = () => {}` and `function f() {}`. */
    const declared = new Map<string, ts.Node>();
    forEachDescendant(scope, (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
            declared.set(node.name.text, node);
            return;
        }
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && isFunctionLike(node.initializer)) {
            declared.set(node.name.text, node.initializer);
        }
    });

    if (declared.size === 0) {
        return new Set();
    }

    /** Call sites of each local function, by name. */
    const callSites = new Map<string, ts.CallExpression[]>();
    /**
     * Local functions React itself runs during render because they were handed over by name rather than
     * called: `useState(getCountry)` and `useOnyx(key, {selector: mySelector})`. There is no call
     * expression to find, so the call-site scan alone misses them, which is how `countryByIp` in
     * `SelectCountryStep.tsx` cleared every gate while being read on the first render.
     */
    const invokedByReact = new Set<ts.Node>();

    forEachDescendant(scope, (node) => {
        if (!ts.isIdentifier(node)) {
            return;
        }
        const fn = declared.get(node.text);
        if (!fn || node === (ts.isVariableDeclaration(node.parent) ? node.parent.name : undefined)) {
            return;
        }

        const parent = node.parent;
        if (parent && ts.isCallExpression(parent) && parent.expression !== node) {
            const index = parent.arguments.findIndex((argument) => argument === node);
            const name = hookName(parent);
            if ((name === 'useState' && index === 0) || (name === 'useReducer' && index === 2)) {
                invokedByReact.add(fn);
                return;
            }
        }

        // `{selector: mySelector}` — Onyx runs it while evaluating the subscription.
        if (parent && ts.isPropertyAssignment(parent) && parent.initializer === node && ts.isIdentifier(parent.name) && parent.name.text === 'selector') {
            invokedByReact.add(fn);
        }
    });

    forEachDescendant(scope, (node) => {
        if (!ts.isCallExpression(node) || !ts.isIdentifier(node.expression)) {
            return;
        }
        const name = node.expression.text;
        if (declared.has(name)) {
            callSites.set(name, [...(callSites.get(name) ?? []), node]);
        }
    });

    const renderInvoked = new Set<ts.Node>(invokedByReact);

    /** Whether a node sits at render position, given what is currently known to be render-invoked. */
    const isAtRenderPosition = (from: ts.Node): boolean => {
        let node: ts.Node | undefined = from.parent;
        while (node && node !== scope) {
            if (isFunctionLike(node) && !runsImmediately(node) && !renderInvoked.has(node)) {
                const hook = enclosingHookCall(node);
                if ((!hook || !RENDER_TIME_HOOKS.has(hook)) && !isSelectorCallback(node) && !isRenderTimeInitializer(node)) {
                    return false;
                }
            }
            node = node.parent;
        }
        return true;
    };

    let changed = true;
    while (changed) {
        changed = false;
        for (const [name, fn] of declared) {
            if (renderInvoked.has(fn)) {
                continue;
            }
            if ((callSites.get(name) ?? []).some(isAtRenderPosition)) {
                renderInvoked.add(fn);
                changed = true;
            }
        }
    }

    return renderInvoked;
}

/**
 * The callback bodies of memoized declarations whose own name appears in an effect's dependency array.
 *
 * This is the shape that made `preferredLocale` in `GoogleSignIn/index.tsx` a false `CERTAIN`: the value
 * is read inside a `useCallback`, and that callback is what a `useEffect` depends on. The value never
 * touches the effect, so a direct effect check clears it, yet deleting the subscription stops the effect
 * re-running. Same hazard as a direct effect dependency, one hop further out.
 */
function indirectEffectCallbacks(scope: ts.Node): Set<ts.Node> {
    /** Local name to the memoized callback it is bound to. */
    const memoized = new Map<string, ts.Node>();
    /**
     * Local name to the names its own identity depends on. `debouncedCalculateMentionSuggestion` depends on
     * `calculateMentionSuggestion`, which depends on `getUserMentionOptions`, which depends on the Onyx
     * value. Collected from every dependency array nested anywhere in the declaration's initializer, so
     * wrappers such as `useDebounce(useCallback(fn, deps), wait)` are followed too.
     */
    const identityDependsOn = new Map<string, Set<string>>();
    /** Names appearing directly in an effect's dependency array. */
    const reachesEffect = new Set<string>();

    forEachDescendant(scope, (node) => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
            const name = node.name.text;
            const dependencies = new Set<string>();
            let holdsMemo = false;

            forEachDescendant(node.initializer, (child) => {
                if (!ts.isCallExpression(child) || !HOOKS_WITH_DEPS.has(hookName(child))) {
                    return;
                }
                if (MEMO_HOOKS.has(hookName(child))) {
                    holdsMemo = true;
                    const callback = child.arguments.at(0);
                    if (callback && isFunctionLike(callback) && !memoized.has(name)) {
                        memoized.set(name, callback);
                    }
                }
                const deps = child.arguments.at(child.arguments.length - 1);
                if (child.arguments.length > 1 && deps && ts.isArrayLiteralExpression(deps)) {
                    for (const element of deps.elements) {
                        if (ts.isIdentifier(element)) {
                            dependencies.add(element.text);
                        }
                    }
                }
            });

            if (holdsMemo) {
                identityDependsOn.set(name, dependencies);
            }
            return;
        }

        if (!ts.isCallExpression(node) || !EFFECT_HOOKS.has(hookName(node))) {
            return;
        }
        const deps = node.arguments.at(node.arguments.length - 1);
        if (node.arguments.length < 2 || !deps || !ts.isArrayLiteralExpression(deps)) {
            return;
        }
        for (const element of deps.elements) {
            if (ts.isIdentifier(element)) {
                reachesEffect.add(element.text);
            }
        }
    });

    // Walk the identity chain to a fixed point. A name whose identity feeds something that feeds an effect
    // schedules that effect just as surely as a direct dependency does, and the chain in
    // `SuggestionMention.tsx` is three links long.
    let changed = true;
    while (changed) {
        changed = false;
        for (const [name, dependencies] of identityDependsOn) {
            if (!reachesEffect.has(name)) {
                continue;
            }
            for (const dependency of dependencies) {
                if (!reachesEffect.has(dependency)) {
                    reachesEffect.add(dependency);
                    changed = true;
                }
            }
        }
    }

    const callbacks = new Set<ts.Node>();
    for (const [name, callback] of memoized) {
        if (reachesEffect.has(name)) {
            callbacks.add(callback);
        }
    }
    return callbacks;
}

/**
 * Local functions the scope hands back to its caller, as `return {onPress}` or `return [handler]`.
 *
 * A hook that returns a function has given it to an unknown consumer, and whether that consumer calls it
 * during render cannot be answered from this file. A function passed down as a JSX prop is deliberately
 * not included: that is the ordinary handler shape, and the child invoking it is an event, not a render.
 */
function escapingFunctions(scope: ts.Node): Set<ts.Node> {
    /** Local name to the function it is bound to. */
    const declared = new Map<string, ts.Node>();
    forEachDescendant(scope, (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
            declared.set(node.name.text, node);
            return;
        }
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
            if (isFunctionLike(node.initializer)) {
                declared.set(node.name.text, node.initializer);
                return;
            }
            // `const f = useCallback(cb, deps)` binds the name to the memoized callback.
            if (ts.isCallExpression(node.initializer) && MEMO_HOOKS.has(hookName(node.initializer))) {
                const callback = node.initializer.arguments.at(0);
                if (callback && isFunctionLike(callback)) {
                    declared.set(node.name.text, callback);
                }
            }
        }
    });

    const escaping = new Set<ts.Node>();

    forEachDescendant(scope, (node) => {
        if (!ts.isReturnStatement(node) || !node.expression) {
            return;
        }

        // Only the scope's own returns count. A return inside a nested function returns from that function.
        let owner: ts.Node | undefined = node.parent;
        while (owner && owner !== scope && !isFunctionLike(owner)) {
            owner = owner.parent;
        }
        if (owner !== scope) {
            return;
        }

        // `return ( <View /> )` is a parenthesized expression, so the JSX test has to look through it.
        // Without the unwrap every `onPress={handler}` in a component's own JSX counted as an escape.
        let returned: ts.Expression = node.expression;
        while (ts.isParenthesizedExpression(returned)) {
            returned = returned.expression;
        }
        if (ts.isJsxElement(returned) || ts.isJsxFragment(returned) || ts.isJsxSelfClosingElement(returned)) {
            return;
        }

        forEachDescendant(returned, (child) => {
            // `return () => {...}` and `return {getter: () => ...}` hand back a function that was never
            // given a name, so resolving identifiers alone misses them. `useChangeBankAccount` and
            // `useSelectedExpenseReports` are both this shape.
            if (isFunctionLike(child)) {
                escaping.add(child);
                return;
            }

            if (!ts.isIdentifier(child)) {
                return;
            }
            // A name handed to a child as a prop is the ordinary handler shape, not an escape.
            if (findAncestor(child, ts.isJsxAttribute)) {
                return;
            }
            const fn = declared.get(child.text);
            if (fn) {
                escaping.add(fn);
            }
        });
    });

    return escaping;
}

/**
 * Walks from a reference up to the declaring function, deciding when the value is read. `effect` wins
 * over `deferred` because an effect callback is deferred too, and the distinction is the whole point:
 * one consumes the value, the other is woken by it.
 */
function classifyReference(reference: ts.Node, scope: ts.Node, renderInvoked: Set<ts.Node>, indirectEffects: Set<ts.Node>, escaping: Set<ts.Node>): ReferenceKind {
    let node: ts.Node | undefined = reference.parent;
    let crossedFunctionBoundary = false;
    let inEffect = false;
    let inIndirectEffect = false;
    let inEscapingFunction = false;
    let inDepsArray: 'effectDeps' | 'memoDeps' | undefined;

    while (node && node !== scope) {
        if (ts.isJsxExpression(node) || ts.isJsxAttribute(node)) {
            return 'render';
        }

        if (isFunctionLike(node) && !runsImmediately(node) && !renderInvoked.has(node)) {
            const hook = enclosingHookCall(node);
            if ((hook && RENDER_TIME_HOOKS.has(hook)) || isSelectorCallback(node) || isRenderTimeInitializer(node)) {
                // A `useMemo` callback and a `useOnyx` selector both run during render, so neither is a boundary.
            } else {
                crossedFunctionBoundary = true;
                if (hook && EFFECT_HOOKS.has(hook)) {
                    inEffect = true;
                }
            }
        }

        if (isFunctionLike(node) && indirectEffects.has(node)) {
            inIndirectEffect = true;
        }

        if (isFunctionLike(node) && escaping.has(node)) {
            inEscapingFunction = true;
        }

        if (ts.isArrayLiteralExpression(node)) {
            const arrayLiteral: ts.ArrayLiteralExpression = node;
            const parent: ts.Node | undefined = arrayLiteral.parent;
            if (parent && ts.isCallExpression(parent) && HOOKS_WITH_DEPS.has(hookName(parent))) {
                const owningHook = effectiveHookName(parent);
                const args: ts.NodeArray<ts.Expression> = parent.arguments;
                if (args.length > 1 && args[args.length - 1] === arrayLiteral) {
                    inDepsArray = EFFECT_HOOKS.has(owningHook) ? 'effectDeps' : 'memoDeps';
                }
            }
        }

        node = node.parent;
    }

    if (inEffect) {
        return 'effect';
    }
    // A dependency array of an effect is a trigger even when the body never reads the value, so it
    // outranks `deferred`. A `useMemo` or `useCallback` dependency array is not: it only decides when an
    // identity is recomputed, and the conversion deletes the dependency along with the subscription.
    if (inDepsArray === 'effectDeps') {
        return 'effectDeps';
    }
    // Both of these only qualify a read that is otherwise deferred. A `useMemo` callback runs during
    // render whether or not its result escapes, so the render verdict has to win.
    if (crossedFunctionBoundary) {
        if (inIndirectEffect) {
            return 'indirectEffect';
        }
        if (inEscapingFunction) {
            return 'escapes';
        }
        return 'deferred';
    }
    if (inDepsArray === 'memoDeps') {
        return 'memoDeps';
    }
    return 'render';
}

/**
 * The nearest function around a reference that actually defers it, which is the body the read would
 * move into. Transparent boundaries are skipped for the same reason `classifyReference` skips them.
 */
function consumingFunction(reference: ts.Node, scope: ts.Node, renderInvoked: Set<ts.Node>): ts.Node | undefined {
    let node: ts.Node | undefined = reference.parent;
    while (node && node !== scope) {
        if (isFunctionLike(node) && !runsImmediately(node) && !renderInvoked.has(node)) {
            const hook = enclosingHookCall(node);
            if ((!hook || !RENDER_TIME_HOOKS.has(hook)) && !isSelectorCallback(node) && !isRenderTimeInitializer(node)) {
                return node;
            }
        }
        node = node.parent;
    }
    return undefined;
}

/** Local name to module specifier for every import in a file, so a callee can be traced to where it came from. */
function collectImports(sourceFile: ts.SourceFile): Map<string, string> {
    const imports = new Map<string, string>();

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.importClause || !ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }
        const specifier = statement.moduleSpecifier.text;
        const {name, namedBindings} = statement.importClause;
        if (name) {
            imports.set(name.text, specifier);
        }
        if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            imports.set(namedBindings.name.text, specifier);
        }
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            for (const element of namedBindings.elements) {
                imports.set(element.name.text, specifier);
            }
        }
    }

    return imports;
}

/** The root identifier a call goes through: `IOU.requestMoney()` gives `IOU`, `save()` gives `save`. */
function callRootName(call: ts.CallExpression): string | undefined {
    let expression: ts.Expression = call.expression;
    while (ts.isPropertyAccessExpression(expression)) {
        expression = expression.expression;
    }
    return ts.isIdentifier(expression) ? expression.text : undefined;
}

/** The name being called on the module: `IOU.requestMoney()` gives `requestMoney`, `save()` gives `save`. */
function callMemberName(call: ts.CallExpression): string | undefined {
    if (ts.isIdentifier(call.expression)) {
        return call.expression.text;
    }
    return ts.isPropertyAccessExpression(call.expression) ? call.expression.name.text : undefined;
}

/** Path alias prefixes, longest first so `@libs/actions/` wins over `@libs/`. */
const PATH_ALIASES: Array<[string, string]> = [
    ['@userActions/', 'src/libs/actions/'],
    ['@libs/', 'src/libs/'],
    ['@hooks/', 'src/hooks/'],
    ['@components/', 'src/components/'],
    ['@pages/', 'src/pages/'],
    ['@src/', 'src/'],
];

/** The file an import specifier names, if it is one this script can resolve without a type-checker. */
function resolveModule(specifier: string, importingFile: string): string | undefined {
    let base: string | undefined;

    for (const [alias, target] of PATH_ALIASES) {
        if (specifier.startsWith(alias)) {
            base = target + specifier.slice(alias.length);
            break;
        }
    }

    if (!base && specifier.startsWith('.')) {
        base = path.posix.join(path.posix.dirname(importingFile), specifier);
    }

    if (!base) {
        return undefined;
    }

    for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
        if (fs.existsSync(path.join(projectRoot, candidate))) {
            return candidate;
        }
    }

    return undefined;
}

/**
 * Names in a module whose body writes Onyx, found by scanning each top-level function for a literal
 * `Onyx.<write>` call and then propagating across same-file calls until nothing new is found. Cached,
 * because the action layer is imported from everywhere.
 *
 * One module deep, deliberately. A write reached only by calling out to a third module is invisible
 * here, which is why an unresolved or unknown callee stays a hazard rather than being cleared.
 */
const writerCache = new Map<string, Set<string>>();

function writersIn(file: string): Set<string> {
    const cached = writerCache.get(file);
    if (cached) {
        return cached;
    }

    // Seed the cache before scanning, so a module that imports itself in a cycle terminates.
    const writers = new Set<string>();
    writerCache.set(file, writers);

    let sourceFile: ts.SourceFile;
    try {
        sourceFile = parse(file);
    } catch {
        return writers;
    }

    /** Every top-level name, with the Onyx write methods and each same-file callee found in its body. */
    const bodies = new Map<string, {writes: boolean; calls: Set<string>}>();
    /** `export * from './x'`, whose whole writer set belongs to this module's surface too. */
    const starReExports: string[] = [];
    /** `export {a, b}` and `export {a} from './x'`, as local name to the module it actually came from. */
    const namedReExports = new Map<string, string>();
    const moduleImports = collectImports(sourceFile);

    for (const statement of sourceFile.statements) {
        if (ts.isExportDeclaration(statement)) {
            const from = statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : undefined;
            const {exportClause} = statement;

            if (!exportClause && from) {
                const resolved = resolveModule(from, file);
                if (resolved && resolved !== file) {
                    starReExports.push(resolved);
                }
            }

            if (exportClause && ts.isNamedExports(exportClause)) {
                for (const element of exportClause.elements) {
                    // `export {inner as outer}` re-exports `inner`, so that is the name to look up.
                    const original = (element.propertyName ?? element.name).text;
                    // A bare `export {x}` block re-exports whatever `x` was imported as, which is the shape
                    // the action barrels use. Without this, every function in a barrel looks write-free.
                    const specifier = from ?? moduleImports.get(original);
                    const resolved = specifier ? resolveModule(specifier, file) : undefined;
                    if (resolved && resolved !== file) {
                        namedReExports.set(element.name.text, `${resolved}#${original}`);
                    }
                }
            }
        }

        const named = ts.isFunctionDeclaration(statement) ? statement.name?.text : undefined;
        const declared = ts.isVariableStatement(statement) ? statement.declarationList.declarations : [];

        for (const [name, node] of [
            ...(named ? [[named, statement] as const] : []),
            ...declared.flatMap((declaration) => (ts.isIdentifier(declaration.name) && declaration.initializer ? [[declaration.name.text, declaration.initializer] as const] : [])),
        ]) {
            const entry = {writes: false, calls: new Set<string>()};
            forEachDescendant(node, (child) => {
                if (isOnyxWrite(child)) {
                    entry.writes = true;
                    return;
                }
                if (ts.isCallExpression(child)) {
                    const callee = callRootName(child);
                    if (callee) {
                        entry.calls.add(callee);
                    }
                }
            });
            bodies.set(name, entry);
        }
    }

    for (const [name, entry] of bodies) {
        if (entry.writes) {
            writers.add(name);
        }
    }

    // A function that calls a writer is a writer. Iterate to a fixed point rather than recursing, so a
    // mutual recursion in the action layer cannot run away.
    let changed = true;
    while (changed) {
        changed = false;
        for (const [name, entry] of bodies) {
            if (writers.has(name)) {
                continue;
            }
            if ([...entry.calls].some((callee) => writers.has(callee))) {
                writers.add(name);
                changed = true;
            }
        }
    }

    for (const reExport of starReExports) {
        for (const name of writersIn(reExport)) {
            writers.add(name);
        }
    }

    for (const [exported, source] of namedReExports) {
        const [sourceFileName, originalName] = source.split('#');
        if (writersIn(sourceFileName).has(originalName)) {
            writers.add(exported);
        }
    }

    return writers;
}

/**
 * Writes inside `fn` that start before `reference` does, which is the read-after-write hazard: move the
 * read into this function and it can land behind a `merge` or an `update` that has not applied yet.
 * Position, not control flow: a write in a branch the reference never runs under still counts, because
 * deciding otherwise is the judgment this script is refusing to make.
 *
 * A literal `Onyx.merge` in a component handler is rare, because components write through the action
 * layer, so a call whose target writes counts as a write too. The target is resolved: an early version
 * counted every call into `src/libs/actions` and flagged 828 bindings, all of them on that rule alone
 * and including read-only helpers like `isAnonymousUser()`, which is a gate that says nothing.
 *
 * The resolution is one module deep and alias-based, with no type-checker, so a callee it cannot resolve
 * is reported as unknown rather than cleared: the reason a read is unsafe is exactly the call whose
 * target could not be read.
 */
function writesAhead(fn: ts.Node, reference: ts.Node, imports: Map<string, string>, importingFile: string): string[] {
    const found: string[] = [];

    forEachDescendant(fn, (node) => {
        if (node.getStart() >= reference.getStart()) {
            return;
        }

        if (isOnyxWrite(node)) {
            found.push(node.getText().split('(').at(0) ?? 'Onyx write');
            return;
        }

        if (!ts.isCallExpression(node)) {
            return;
        }

        const root = callRootName(node);
        const specifier = root ? imports.get(root) : undefined;
        if (!specifier) {
            // A local function, or something from a module this file does not import. Local functions are
            // covered by the same scan when the read moves, so they are not a hazard on their own.
            return;
        }

        const target = resolveModule(specifier, importingFile);
        if (!target) {
            return;
        }

        const member = callMemberName(node);
        if (member && writersIn(target).has(member)) {
            found.push(`${calleeName(node)}()`);
        }
    });

    return [...new Set(found)];
}

/**
 * Deferral points inside `fn`, meaning the conversion has more than one synchronous stretch to choose
 * between when placing the read. An `await` counts, and so does any call that takes a callback to run
 * later.
 */
function deferralsIn(fn: ts.Node): string[] {
    const found: string[] = [];

    forEachDescendant(fn, (node) => {
        if (ts.isAwaitExpression(node)) {
            found.push('await');
            return;
        }
        if (!ts.isCallExpression(node)) {
            return;
        }
        let name: string | undefined;
        if (ts.isPropertyAccessExpression(node.expression)) {
            name = node.expression.name.text;
        } else if (ts.isIdentifier(node.expression)) {
            name = node.expression.text;
        }
        if (name && DEFERRAL_CALLS.has(name)) {
            found.push(`${name}()`);
        }
    });

    return [...new Set(found)];
}

/** The function a value is handed to, when the reference is a bare argument: `doThing(policy)`. */
function argumentCallee(reference: ts.Node): string | undefined {
    const parent = reference.parent;
    if (!parent || !ts.isCallExpression(parent) || !parent.arguments.some((argument) => argument === reference)) {
        return undefined;
    }
    return calleeName(parent);
}

/** The identifier a `useOnyx` result is bound to: the first element of the destructuring, or the whole name. */
function getValueBinding(declaration: ts.VariableDeclaration): ts.Identifier | undefined {
    const {name} = declaration;
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

/**
 * True for an identifier that names something rather than reading it: a property name, a declaration,
 * a shorthand property's key half. Counting these as reads inflates the reference count.
 */
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
    return ts.isVariableDeclaration(parent) && parent.name === id;
}

function analyzeFile(file: string): Binding[] {
    const sourceFile = parse(file);
    const bindings: Binding[] = [];
    const isStartupPath = STARTUP_PATH_HINTS.some((hint) => hint.test(file));
    const imports = collectImports(sourceFile);
    /** One analysis per scope, since several bindings usually share a component body. */
    const renderInvokedScopes = new Map<ts.Node, Set<ts.Node>>();
    const indirectEffectScopes = new Map<ts.Node, Set<ts.Node>>();
    const escapingScopes = new Map<ts.Node, Set<ts.Node>>();

    forEachDescendant(sourceFile, (node) => {
        if (!ts.isCallExpression(node) || calleeName(node) !== 'useOnyx') {
            return;
        }

        const declaration = findAncestor(node, ts.isVariableDeclaration);
        const valueBinding = declaration ? getValueBinding(declaration) : undefined;
        if (!valueBinding) {
            return;
        }

        const declaringFunction = findAncestor(node, isFunctionLike);
        const scope: ts.Node = declaringFunction?.body ?? sourceFile;
        const renderInvoked = renderInvokedScopes.get(scope) ?? renderInvokedFunctions(scope);
        renderInvokedScopes.set(scope, renderInvoked);
        const indirectEffects = indirectEffectScopes.get(scope) ?? indirectEffectCallbacks(scope);
        indirectEffectScopes.set(scope, indirectEffects);
        const escaping = escapingScopes.get(scope) ?? escapingFunctions(scope);
        escapingScopes.set(scope, escaping);

        const kinds = new Set<ReferenceKind>();
        const calleeNames = new Set<string>();
        const priorWrites = new Set<string>();
        const deferrals = new Set<string>();
        let referenceCount = 0;
        let indexedReferenceCount = 0;

        forEachDescendant(scope, (candidate) => {
            if (!ts.isIdentifier(candidate) || candidate.text !== valueBinding.text || candidate === valueBinding || isNamePositionOnly(candidate)) {
                return;
            }

            referenceCount += 1;
            const kind = classifyReference(candidate, scope, renderInvoked, indirectEffects, escaping);
            kinds.add(kind);

            if (ts.isElementAccessExpression(candidate.parent) && candidate.parent.expression === candidate) {
                indexedReferenceCount += 1;
            }

            const callee = argumentCallee(candidate);
            if (callee) {
                calleeNames.add(callee);
            }

            const consumer = consumingFunction(candidate, scope, renderInvoked);
            if (consumer) {
                for (const write of writesAhead(consumer, candidate, imports, file)) {
                    priorWrites.add(write);
                }
                for (const deferral of deferralsIn(consumer)) {
                    deferrals.add(deferral);
                }
            }
        });

        const reasons: string[] = [];
        let verdict: Verdict = 'CERTAIN';

        if (kinds.has('render')) {
            verdict = 'NOT_CANDIDATE';
            reasons.push('read during render');
        } else if (referenceCount === 0) {
            verdict = 'DEAD';
            reasons.push('never referenced, so delete rather than convert');
        } else {
            if (kinds.has('effect')) {
                verdict = 'REVIEW';
                reasons.push('referenced inside an effect, so the subscription is the trigger');
            }
            if (kinds.has('effectDeps')) {
                verdict = 'REVIEW';
                reasons.push('in an effect dependency array, so the subscription schedules the effect');
            }
            if (kinds.has('indirectEffect')) {
                verdict = 'REVIEW';
                reasons.push('inside a memoized callback that an effect depends on, so the subscription schedules that effect');
            }
            if (kinds.has('escapes')) {
                verdict = 'REVIEW';
                reasons.push('inside a function returned to the caller, so render position needs the caller sweep');
            }
            if (priorWrites.size > 0) {
                verdict = 'REVIEW';
                reasons.push(`consuming function writes Onyx first (${[...priorWrites].join(', ')})`);
            }
            if (deferrals.size > 0) {
                verdict = 'REVIEW';
                reasons.push(`consuming function spans more than one synchronous stretch (${[...deferrals].join(', ')}), so the read needs placing by hand`);
            }
            if (isStartupPath) {
                verdict = 'REVIEW';
                reasons.push('file is on the boot path, where a read can precede hydration');
            }
        }

        bindings.push({
            file,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            name: valueBinding.text,
            key: node.arguments.at(0)?.getText(sourceFile).replaceAll(/\s+/g, '') ?? '',
            referenceCount,
            kinds: [...kinds],
            readsSingleMemberOnly: referenceCount > 0 && referenceCount === indexedReferenceCount,
            calleeNames: [...calleeNames],
            writesAhead: [...priorWrites],
            deferrals: [...deferrals],
            verdict,
            reasons,
        });
    });

    return bindings;
}

/**
 * Counts the synchronous Onyx reads already in `src/`, which is the migration's numerator: every one of
 * them is a subscription that no longer exists. Only files that name the Onyx module are parsed, and a
 * call counts only when its object is the Onyx import, so a local `get()` is not mistaken for one.
 */
function countSyncReads(files: string[]): {reads: number; files: number} {
    let reads = 0;
    let touched = 0;

    for (const file of files) {
        const absolute = path.isAbsolute(file) ? file : path.join(projectRoot, file);
        if (!fs.readFileSync(absolute, 'utf8').includes(ONYX_MODULE_PREFIX)) {
            continue;
        }
        const sourceFile = parse(file);
        const onyxNames = new Set([...collectImports(sourceFile).entries()].filter(([, specifier]) => specifier.startsWith(ONYX_MODULE_PREFIX)).map(([localName]) => localName));
        if (onyxNames.size === 0) {
            continue;
        }

        let inFile = 0;
        forEachDescendant(sourceFile, (node) => {
            if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression) || !ts.isIdentifier(node.expression.expression)) {
                return;
            }
            if (onyxNames.has(node.expression.expression.text) && SYNC_READ_METHODS.has(node.expression.name.text)) {
                inFile += 1;
            }
        });

        reads += inFile;
        if (inFile > 0) {
            touched += 1;
        }
    }

    return {reads, files: touched};
}

function percent(part: number, total: number): string {
    return total === 0 ? '0%' : `${((part / total) * 100).toFixed(1)}%`;
}

function main(): void {
    const singleFile = argValue('--file');
    const files = singleFile ? [singleFile] : listSourceFiles();
    const bindings = files.flatMap(analyzeFile);

    const nonRender = bindings.filter((binding) => binding.verdict !== 'NOT_CANDIDATE');
    const certain = bindings.filter((binding) => binding.verdict === 'CERTAIN');
    const review = bindings.filter((binding) => binding.verdict === 'REVIEW');
    const dead = bindings.filter((binding) => binding.verdict === 'DEAD');

    if (argv.includes('--json')) {
        console.log(JSON.stringify({bindings}, null, 2));
        return;
    }

    if (argv.includes('--status')) {
        // One place the migration is measured from, so two runs never disagree about its size.
        const byFileAll = new Map<string, Binding[]>();
        for (const binding of bindings) {
            byFileAll.set(binding.file, [...(byFileAll.get(binding.file) ?? []), binding]);
        }
        const wholeCertain = [...byFileAll.values()].filter((fileBindings) => fileBindings.every((binding) => binding.verdict === 'CERTAIN'));
        const converted = countSyncReads(files);
        const row = (label: string, count: number) => `${label.padEnd(44)}: ${String(count).padStart(5)}  (${percent(count, bindings.length).padStart(6)})`;

        console.log('=== Onyx read migration, current state ===');
        console.log(row('useOnyx bindings in src/', bindings.length));
        console.log(row('  render-reachable, must stay on useOnyx', bindings.length - nonRender.length));
        console.log(row('  off the render path', nonRender.length));
        console.log(row('      CERTAIN, mechanically clear', certain.length));
        console.log(row('      REVIEW, a condition needs a person', review.length));
        console.log(row('      DEAD, delete rather than convert', dead.length));
        console.log('');
        console.log(`synchronous Onyx reads present today        : ${String(converted.reads).padStart(5)} in ${converted.files} file(s)`);
        console.log(
            `cheapest next PRs, files entirely CERTAIN   : ${String(wholeCertain.length).padStart(5)} files, ${wholeCertain.reduce((sum, fileBindings) => sum + fileBindings.length, 0)} bindings`,
        );
        console.log('');
        console.log('Percentages are of every useOnyx binding in src/. CERTAIN means no mechanical condition objects,');
        console.log('not that a conversion is correct, so it is a review shortlist rather than a work-list. REVIEW is not');
        console.log('a backlog either: an effect trigger, or a value the user saw, should keep its subscription.');
        return;
    }

    if (argv.includes('--certain')) {
        for (const binding of certain) {
            console.log(`${binding.file}:${binding.line}  ${binding.name} <- ${binding.key}`);
        }
        return;
    }

    if (argv.includes('--callee-names')) {
        // Every function a CERTAIN binding hands its value to, so the read can be pushed past this file.
        // Run the forward caller sweep on these before moving a read into one.
        for (const callee of [...new Set(certain.flatMap((binding) => binding.calleeNames))].sort()) {
            console.log(callee);
        }
        return;
    }

    if (singleFile) {
        for (const binding of bindings) {
            console.log(
                `${binding.verdict.padEnd(13)} :${String(binding.line).padStart(4)}  ${binding.name} <- ${binding.key}${binding.reasons.length > 0 ? `  (${binding.reasons.join('; ')})` : ''}`,
            );
        }
        return;
    }

    console.log('=== useOnyx bindings in src/ ===');
    console.log(`files scanned                  : ${files.length}`);
    console.log(`bindings                       : ${bindings.length}`);
    console.log(`reach rendered output          : ${bindings.length - nonRender.length} (${percent(bindings.length - nonRender.length, bindings.length)})`);
    console.log(`off the render path            : ${nonRender.length} (${percent(nonRender.length, bindings.length)})`);
    console.log('');
    console.log('--- of those, split by what the mechanical conditions say ---');
    console.log(`CERTAIN  convert                : ${certain.length} in ${new Set(certain.map((binding) => binding.file)).size} files`);
    console.log(`REVIEW   a condition needs eyes : ${review.length} in ${new Set(review.map((binding) => binding.file)).size} files`);
    console.log(`DEAD     delete, nothing to move: ${dead.length} in ${new Set(dead.map((binding) => binding.file)).size} files`);

    const reasonCounts = new Map<string, number>();
    for (const binding of review) {
        for (const reason of binding.reasons) {
            const label = reason.replace(/ \(.*\)$/, '');
            reasonCounts.set(label, (reasonCounts.get(label) ?? 0) + 1);
        }
    }
    console.log('\n--- why REVIEW, by reason (a binding can have more than one) ---');
    for (const [reason, count] of [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])) {
        console.log(`${String(count).padStart(4)}  ${reason}`);
    }

    // A file where every binding is CERTAIN loses all its subscriptions in one commit, which is the
    // cheapest thing to review: nothing is left half-converted for a reader to reason about.
    const byFile = new Map<string, Binding[]>();
    for (const binding of bindings) {
        byFile.set(binding.file, [...(byFile.get(binding.file) ?? []), binding]);
    }
    const wholeFile = [...byFile.entries()].filter(([, fileBindings]) => fileBindings.every((binding) => binding.verdict === 'CERTAIN'));
    const partial = [...byFile.entries()].filter(
        ([, fileBindings]) => fileBindings.some((binding) => binding.verdict === 'CERTAIN') && fileBindings.some((binding) => binding.verdict !== 'CERTAIN'),
    );

    console.log('\n=== the wave-1 work-list ===');
    console.log(`whole-file conversions (every binding CERTAIN) : ${wholeFile.length} files, ${wholeFile.reduce((sum, [, fileBindings]) => sum + fileBindings.length, 0)} bindings`);
    console.log(
        `partial conversions (some bindings stay)       : ${partial.length} files, ${partial.reduce((sum, [, fileBindings]) => sum + fileBindings.filter((binding) => binding.verdict === 'CERTAIN').length, 0)} bindings`,
    );

    console.log('\n--- whole-file conversions, most bindings first ---');
    for (const [file, fileBindings] of wholeFile.sort((a, b) => b[1].length - a[1].length)) {
        const single = fileBindings.filter((binding) => binding.readsSingleMemberOnly).length;
        console.log(`${String(fileBindings.length).padStart(3)}  ${single > 0 ? `member-only=${single}  ` : ''}${file}`);
    }

    if (argv.includes('--verdicts')) {
        console.log('\n--- every binding off the render path ---');
        for (const binding of nonRender.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
            console.log(
                `${binding.verdict.padEnd(13)} ${binding.file}:${binding.line}  ${binding.name} <- ${binding.key}${binding.reasons.length > 0 ? `  (${binding.reasons.join('; ')})` : ''}`,
            );
        }
    }
}

main();
