#!/usr/bin/env bun

/**
 * Answers "how much work is wave 1" for the `Onyx.get()` proposal, and answers it with a list rather
 * than a number: every `useOnyx()` binding in `src/` that could be deleted in favour of an event-time
 * read, each with a verdict saying whether the mechanical conditions clear it outright or a human has
 * to look.
 *
 * Superset of the convertible cases: a binding can be off the render path and still be the wrong
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
 *   - the file renders inside a Search scope, where `@hooks/useOnyx` redirects the snapshot keys to
 *     `snapshot_<hash>`. The binding and the read then have different sources, and the read's is usually
 *     empty rather than stale, because a search returns entities this client never loaded.
 *
 * What a `CERTAIN` verdict does and does not claim. It claims the mechanical conditions hold: the value
 * never reaches rendered output, every reference sits in event-position code, no reference is an effect
 * trigger, the consuming function performs no Onyx write the read could land behind, the binding reads no
 * `selector` the read site would have to reproduce, and no file calls the callee it forwards to during
 * render. That last one is a cross-file sweep, so it only runs over the whole list: `--file` reports the
 * in-file verdict alone, and `--callees` prints what the sweep found. It still cannot speak to the
 * proposal's fourth condition, mixing a source key with a key derived from it, because that depends on
 * which keys the converted function ends up reading.
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
 *   bun scripts/trackOnyxGetMigration.ts --callees       # each callee a CERTAIN binding feeds, and its caller set
 *   bun scripts/trackOnyxGetMigration.ts --callee-names  # every callee to run the caller sweep on
 *   bun scripts/trackOnyxGetMigration.ts --scope         # bindings held out because a Search scope redirects the key
 *   bun scripts/trackOnyxGetMigration.ts --tasks         # wave 1 split into callee tasks and file-local tasks
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
    /** The file each callee is declared in, when the import resolves. Empty when it does not. */
    calleeOwners: Record<string, string>;
    /** Which argument position the value is forwarded as, per callee, so the parameter can be named. */
    forwardedAt: Record<string, number>;
    /** The name each callee is exported under, which is what to look for in its own file when the import is aliased. */
    calleeExportedNames: Record<string, string>;
    /** Functions in this file that consume the value, which is where a file-local read lands. */
    consumerNames: string[];
    /** The binding reads through a `selector`, so the read site has to reproduce it rather than copy the key. */
    hasSelector: boolean;
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

/**
 * The name a function is known by, which is what a task has to point at alongside its file: its own
 * identifier, the variable or property it is assigned to, or the JSX attribute it is passed as. An anonymous
 * callback inside another function takes that function's name, so the pointer lands somewhere a reader can
 * open rather than nowhere.
 */
function functionName(node: ts.Node, sourceFile: ts.SourceFile): string | undefined {
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isMethodDeclaration(node)) && node.name) {
        return node.name.getText(sourceFile);
    }

    let current: ts.Node | undefined = node.parent;
    while (current) {
        if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
            return current.name.text;
        }
        if (ts.isPropertyAssignment(current) && ts.isIdentifier(current.name)) {
            return current.name.text;
        }
        if (ts.isJsxAttribute(current)) {
            return current.name.getText(sourceFile);
        }
        if (isFunctionLike(current)) {
            return functionName(current, sourceFile);
        }
        current = current.parent;
    }

    return undefined;
}

/**
 * Local name to the name the module exports it under, so an aliased import resolves in the owner file:
 * `import {flagComment as flagCommentUtil}` has to be looked up as `flagComment`. A default or namespace
 * import maps to `default`, which the parameter lookup resolves through the file's default export.
 */
function collectImportedNames(sourceFile: ts.SourceFile): Map<string, string> {
    const names = new Map<string, string>();

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.importClause) {
            continue;
        }
        const {name, namedBindings} = statement.importClause;
        if (name) {
            names.set(name.text, 'default');
        }
        if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            names.set(namedBindings.name.text, 'default');
        }
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            for (const element of namedBindings.elements) {
                names.set(element.name.text, (element.propertyName ?? element.name).text);
            }
        }
    }

    return names;
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
 * The keys `@hooks/useOnyx` redirects to the Search snapshot, read out of `CONST.SEARCH.SNAPSHOT_ONYX_KEYS`
 * rather than copied here, so the list cannot drift from the hook's behaviour. Inside a `SearchScopeProvider`
 * subtree the hook subscribes to `snapshot_<hash>` and extracts the requested key out of that blob, while
 * `Onyx.get` always reads the global key. Converting such a binding therefore changes the data source, and
 * usually to an absent value rather than a stale one, because a search returns reports and transactions this
 * client never loaded.
 */
const SNAPSHOT_KEYS_FILE = 'src/CONST/index.ts';

let snapshotKeyPathsCache: Set<string> | undefined;

function snapshotKeyPaths(): Set<string> {
    if (snapshotKeyPathsCache) {
        return snapshotKeyPathsCache;
    }

    const paths = new Set<string>();
    const sourceFile = parse(SNAPSHOT_KEYS_FILE);

    forEachDescendant(sourceFile, (node) => {
        if (!ts.isPropertyAssignment(node) || node.name.getText(sourceFile) !== 'SNAPSHOT_ONYX_KEYS' || !ts.isArrayLiteralExpression(node.initializer)) {
            return;
        }
        for (const element of node.initializer.elements) {
            paths.add(element.getText(sourceFile).replaceAll(/\s+/g, ''));
        }
    });

    snapshotKeyPathsCache = paths;
    return paths;
}

/**
 * The `ONYXKEYS` path a key expression names, or the key text unchanged when there is nothing to strip. A
 * collection member reads as its collection, since that is the granularity `SNAPSHOT_ONYX_KEYS` is written at:
 * `` `${ONYXKEYS.COLLECTION.REPORT}${reportID}` `` gives `ONYXKEYS.COLLECTION.REPORT`. Only a template that
 * opens with its prefix counts, matching the same rule in `no-unsafe-onyx-read.js`.
 */
function onyxKeyPath(keyText: string): string {
    if (!keyText.startsWith('`')) {
        return keyText;
    }
    return /^`\$\{([^}]+)\}/.exec(keyText)?.at(1) ?? '';
}

/** The root identifier of a JSX tag: `<Foo>` gives `Foo`, `<Foo.Bar>` gives `Foo`. */
function jsxTagRootName(tagName: ts.JsxTagNameExpression): string | undefined {
    let expression: ts.Node = tagName;
    while (ts.isPropertyAccessExpression(expression)) {
        expression = expression.expression;
    }
    return ts.isIdentifier(expression) ? expression.text : undefined;
}

const SEARCH_SCOPE_PROVIDER = 'SearchScopeProvider';

/** What a `SearchScopeProvider` element does to the subtree under it. `isOnSearch={false}` opts it out. */
function providerDisposition(node: ts.JsxOpeningLikeElement, sourceFile: ts.SourceFile): 'scoped' | 'excluded' | undefined {
    if (jsxTagRootName(node.tagName) !== SEARCH_SCOPE_PROVIDER) {
        return undefined;
    }

    const optsOut = node.attributes.properties.some(
        (property) =>
            ts.isJsxAttribute(property) &&
            property.name.getText(sourceFile) === 'isOnSearch' &&
            !!property.initializer &&
            ts.isJsxExpression(property.initializer) &&
            property.initializer.expression?.kind === ts.SyntaxKind.FalseKeyword,
    );

    return optsOut ? 'excluded' : 'scoped';
}

/**
 * The nearest `SearchScopeProvider` a node sits lexically inside, which is what decides the node's scope: an
 * `isOnSearch={false}` mount nested in a default one opts its own subtree back out, and the other way round.
 */
function enclosingProvider(node: ts.Node, sourceFile: ts.SourceFile): 'scoped' | 'excluded' | undefined {
    let current: ts.Node | undefined = node.parent;

    while (current) {
        if (ts.isJsxElement(current)) {
            const disposition = providerDisposition(current.openingElement, sourceFile);
            if (disposition) {
                return disposition;
            }
        }
        current = current.parent;
    }

    return undefined;
}

/** The local name a JSX element is stored under, so `const content = <Foo />` and `content = <Foo />` both give `content`. */
function holdingVariableName(node: ts.Node): string | undefined {
    let current: ts.Node | undefined = node.parent;

    while (current) {
        if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
            return current.name.text;
        }
        if (ts.isBinaryExpression(current) && current.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isIdentifier(current.left)) {
            return current.left.text;
        }
        current = current.parent;
    }

    return undefined;
}

/** How an edge in the renders-graph carries scope to the file it points at. */
type EdgeScope =
    /** Inside a default-scoped provider, so the target renders in a Search scope however its file was reached. */
    | 'scoped'
    /** Inside an `isOnSearch={false}` provider, so this path grants the target nothing. */
    | 'excluded'
    /** Under no provider, so the target inherits whatever the rendering file has. */
    | 'inherit';

/**
 * Files whose components can render inside a Search scope, so a `useOnyx` on a snapshot key in one of them
 * is reading `snapshot_<hash>` rather than the global key.
 *
 * A renders-graph over every `.tsx`: each JSX tag resolves through its file's own imports to the file that
 * declares it, and each edge is labelled by the nearest `SearchScopeProvider` it sits inside. Edges under a
 * default-scoped provider seed the walk, edges under no provider carry the rendering file's own status, and
 * edges under `isOnSearch={false}` carry nothing. A file therefore leaves the set when the opt-out is its only
 * way in, and joins it as soon as any other path reaches it. A provider mount does not put its own file in the
 * set, because a provider in a JSX return governs the children, not the hooks above it in the same body. That
 * is the distinction `PayActionCell` turns on: the `isOnSearch={false}` covers `SettlementButton` downward,
 * while its own subscriptions sat in the body, inside the scope its parents put it in.
 *
 * Provider children usually arrive through a variable rather than lexically, as `searchListContent` does in
 * `src/components/Search/index.tsx`, so an element assigned to a name counts as scoped when that name is
 * referenced inside a provider subtree. Edges this cannot place stay `inherit`, which keeps a mount file's
 * unplaceable JSX out of the set rather than guessing it in.
 *
 * The remaining gap is one-directional: a component reached through `React.lazy`, a component map, or a prop
 * whose JSX is built somewhere this does not look is an edge the graph misses. That is why `useIsOnSearch` in a
 * file counts on its own, since such a file already knows it renders in a Search scope.
 */
let searchScopedFilesCache: Set<string> | undefined;

function searchScopedFiles(): Set<string> {
    if (searchScopedFilesCache) {
        return searchScopedFilesCache;
    }

    const edges = new Map<string, Map<string, EdgeScope>>();
    const scoped = new Set<string>();
    /** Seeds: files that declare their own scope, plus every target of a `scoped` edge. */
    const queue: string[] = [];

    for (const file of listSourceFiles()) {
        const text = fs.readFileSync(path.join(projectRoot, file), 'utf8');

        // A file that reads the scope itself already knows it can render inside one, whatever the graph says.
        if (text.includes('useIsOnSearch')) {
            queue.push(file);
        }

        if (!file.endsWith('.tsx')) {
            continue;
        }

        // Only a file that mounts the provider can hold a labelled edge, and walking every identifier's
        // ancestors is the expensive part of this pass, so the rest skip straight to their plain edges.
        const mountsProvider = text.includes(SEARCH_SCOPE_PROVIDER);
        const sourceFile = parse(file);
        const imports = collectImports(sourceFile);
        const fileEdges = new Map<string, EdgeScope>();
        /** Targets whose scope depends on where the name holding them is rendered, keyed by that name. */
        const heldTargets = new Map<string, Set<string>>();
        /** Names referenced inside a provider subtree in this file, and what that subtree does. */
        const referencedInProvider = new Map<string, 'scoped' | 'excluded'>();

        const addEdge = (target: string, scope: EdgeScope) => {
            // `scoped` outranks `inherit`, which outranks `excluded`: one path into the scope is enough.
            const existing = fileEdges.get(target);
            if (existing === 'scoped' || (existing === 'inherit' && scope === 'excluded')) {
                return;
            }
            fileEdges.set(target, scope);
        };

        forEachDescendant(sourceFile, (node) => {
            if (ts.isIdentifier(node)) {
                const disposition = mountsProvider ? enclosingProvider(node, sourceFile) : undefined;
                if (disposition && referencedInProvider.get(node.text) !== 'scoped') {
                    referencedInProvider.set(node.text, disposition);
                }
                return;
            }

            if (!ts.isJsxOpeningElement(node) && !ts.isJsxSelfClosingElement(node)) {
                return;
            }

            const tagName = jsxTagRootName(node.tagName);
            const specifier = tagName ? imports.get(tagName) : undefined;
            const target = specifier ? resolveModule(specifier, file) : undefined;
            if (!target) {
                return;
            }

            const disposition = mountsProvider ? enclosingProvider(node, sourceFile) : undefined;
            if (disposition) {
                addEdge(target, disposition);
                return;
            }

            const holder = mountsProvider ? holdingVariableName(node) : undefined;
            if (!holder) {
                addEdge(target, 'inherit');
                return;
            }

            heldTargets.set(holder, new Set([...(heldTargets.get(holder) ?? []), target]));
        });

        for (const [holder, targets] of heldTargets) {
            for (const target of targets) {
                addEdge(target, referencedInProvider.get(holder) ?? 'inherit');
            }
        }

        edges.set(file, fileEdges);
    }

    for (const fileEdges of edges.values()) {
        for (const [target, scope] of fileEdges) {
            if (scope === 'scoped') {
                queue.push(target);
            }
        }
    }

    while (queue.length > 0) {
        const file = queue.shift();
        if (!file || scoped.has(file)) {
            continue;
        }
        scoped.add(file);
        for (const [target, scope] of edges.get(file) ?? []) {
            if (scope !== 'excluded') {
                queue.push(target);
            }
        }
    }

    searchScopedFilesCache = scoped;
    return scoped;
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

/** Which argument the value is passed as, so the callee's parameter at that position can be named. */
function argumentIndex(reference: ts.Node): number | undefined {
    const parent = reference.parent;
    if (!parent || !ts.isCallExpression(parent)) {
        return undefined;
    }
    const index = parent.arguments.findIndex((argument) => argument === reference);
    return index === -1 ? undefined : index;
}

/**
 * The name of the parameter a callee takes at a given position, which is what a conversion deletes. Looks for
 * the declaration by its own name, so a member call such as `AccountUtils.hasValidateCodeExtendedAccess`
 * resolves on the last segment. Returns undefined when the declaration is not one of the two plain shapes,
 * which keeps a guess out of the task list.
 */
const parameterNameCache = new Map<string, ts.SourceFile>();

function parameterName(ownerFile: string, callee: string, index: number): string | undefined {
    if (!fs.existsSync(path.join(projectRoot, ownerFile))) {
        return undefined;
    }

    const sourceFile = parameterNameCache.get(ownerFile) ?? parse(ownerFile);
    parameterNameCache.set(ownerFile, sourceFile);

    // `default` means the caller imported it without a name, so the declaration is whatever the file exports
    // by default, which is either the function itself or an identifier pointing at one.
    let wanted = callee;
    if (wanted === 'default') {
        for (const statement of sourceFile.statements) {
            if (ts.isExportAssignment(statement) && ts.isIdentifier(statement.expression)) {
                wanted = statement.expression.text;
            }
            if (ts.isFunctionDeclaration(statement) && statement.name && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword)) {
                wanted = statement.name.text;
            }
        }
    }

    let parameters: ts.NodeArray<ts.ParameterDeclaration> | undefined;

    forEachDescendant(sourceFile, (node) => {
        if (parameters) {
            return;
        }
        if (ts.isFunctionDeclaration(node) && node.name?.text === wanted) {
            parameters = node.parameters;
            return;
        }
        if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) || node.name.text !== wanted || !node.initializer) {
            return;
        }
        if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
            parameters = node.initializer.parameters;
        }
    });

    const parameter = parameters?.at(index);
    return parameter ? parameter.name.getText(sourceFile) : undefined;
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

/** Where a shared callee is called from, across every file. */
type CalleeSweep = {
    callSites: number;
    /** `file:line` of every call that runs during a component or hook render. */
    renderCallSites: string[];
    /** Files holding a call site, so a callee's caller set can be compared with its `CERTAIN` set. */
    files: Set<string>;
};

/** True for a function whose body runs during render: a component or a hook. Nothing else does. */
function isRenderScope(fn: ts.Node): boolean {
    let named: ts.Node | undefined = fn;
    // `const Foo = forwardRef(() => ...)` and `const useFoo = () => ...` both put the name one or two hops up.
    if (named.parent && ts.isCallExpression(named.parent)) {
        named = named.parent;
    }
    if (ts.isFunctionDeclaration(fn) && fn.name) {
        return /^[A-Z]/.test(fn.name.text) || /^use[A-Z]/.test(fn.name.text);
    }
    const declaration = named?.parent;
    if (declaration && ts.isVariableDeclaration(declaration) && ts.isIdentifier(declaration.name)) {
        return /^[A-Z]/.test(declaration.name.text) || /^use[A-Z]/.test(declaration.name.text);
    }
    return false;
}

/**
 * True when this call runs during a render pass, so a read moved inside the callee would run there too.
 *
 * Deliberately not `classifyReference`: that returns `render` for anything under a JSX expression, which
 * is the safe direction for a value reference but wrong for a call, since `onPress={() => f()}` is an
 * event. Here a function boundary wins over JSX position, and the walk only reports render once it
 * reaches a component or hook, so a call at statement level in `src/libs/` is not mistaken for one.
 */
function callRunsDuringRender(call: ts.CallExpression, renderInvoked: Set<ts.Node>): boolean {
    let node: ts.Node | undefined = call.parent;

    while (node) {
        if (isFunctionLike(node) && !runsImmediately(node) && !renderInvoked.has(node)) {
            const hook = enclosingHookCall(node);
            const transparent = (!!hook && RENDER_TIME_HOOKS.has(hook)) || isSelectorCallback(node) || isRenderTimeInitializer(node);
            if (!transparent) {
                // A handler, an effect callback, a deferred callback: the call does not run at render time.
                return isRenderScope(node);
            }
        }
        node = node.parent;
    }

    return false;
}

/**
 * The forward sweep the per-file analysis cannot do. A `CERTAIN` verdict clears keeping the read in the
 * file it is already in; moving it down into a shared callee is a different question, because that
 * callee's own callers decide whether the read would then run during render. Matching is by bare callee
 * name with no type resolution, so a same-named local function in another file also matches: that
 * over-counts render call sites, which pushes bindings out of the candidate set rather than into it.
 */
function sweepCallees(files: string[], names: Set<string>): Map<string, CalleeSweep> {
    const sweeps = new Map<string, CalleeSweep>();
    const shortNames = new Map<string, string>();
    for (const name of names) {
        sweeps.set(name, {callSites: 0, renderCallSites: [], files: new Set()});
        shortNames.set(name, name.split('.').at(-1) ?? name);
    }

    for (const file of files) {
        const absolute = path.isAbsolute(file) ? file : path.join(projectRoot, file);
        const text = fs.readFileSync(absolute, 'utf8');
        if (![...shortNames.values()].some((shortName) => text.includes(shortName))) {
            continue;
        }

        const sourceFile = parse(file);
        // Whole file at once: the walk leaves the nearest scope, so a set built per scope would leave an
        // outer render-invoked function looking like a real boundary, which is the permissive direction.
        const renderInvoked = renderInvokedFunctions(sourceFile);

        forEachDescendant(sourceFile, (node) => {
            if (!ts.isCallExpression(node)) {
                return;
            }
            const sweep = sweeps.get(calleeName(node));
            if (!sweep) {
                return;
            }

            sweep.callSites += 1;
            sweep.files.add(file);
            if (callRunsDuringRender(node, renderInvoked)) {
                sweep.renderCallSites.push(`${file}:${sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1}`);
            }
        });
    }

    return sweeps;
}

function analyzeFile(file: string): Binding[] {
    const sourceFile = parse(file);
    const bindings: Binding[] = [];
    const isStartupPath = STARTUP_PATH_HINTS.some((hint) => hint.test(file));
    const isSearchScoped = searchScopedFiles().has(file);
    const imports = collectImports(sourceFile);
    const importedNames = collectImportedNames(sourceFile);
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

        const options = node.arguments.at(1);
        const hasSelector = !!options && ts.isObjectLiteralExpression(options) && options.properties.some((property) => property.name?.getText(sourceFile) === 'selector');
        const key = node.arguments.at(0)?.getText(sourceFile).replaceAll(/\s+/g, '') ?? '';
        const readsSnapshotInSearch = isSearchScoped && snapshotKeyPaths().has(onyxKeyPath(key));

        const kinds = new Set<ReferenceKind>();
        const calleeNames = new Set<string>();
        const forwardedAt: Record<string, number> = {};
        const consumerNames = new Set<string>();
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
                const index = argumentIndex(candidate);
                if (index !== undefined && !(callee in forwardedAt)) {
                    forwardedAt[callee] = index;
                }
            }

            const consumer = consumingFunction(candidate, scope, renderInvoked);
            if (consumer) {
                const consumerName = functionName(consumer, sourceFile);
                if (consumerName) {
                    consumerNames.add(consumerName);
                }
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
            if (hasSelector) {
                verdict = 'REVIEW';
                reasons.push('binding reads through a selector, so the read site has to reproduce it rather than copy the key');
            }
            if (readsSnapshotInSearch) {
                verdict = 'REVIEW';
                reasons.push(`file renders inside a Search scope, where useOnyx redirects ${onyxKeyPath(key)} to snapshot_<hash> and Onyx.get would not`);
            }
        }

        bindings.push({
            file,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            name: valueBinding.text,
            key,
            referenceCount,
            kinds: [...kinds],
            readsSingleMemberOnly: referenceCount > 0 && referenceCount === indexedReferenceCount,
            calleeNames: [...calleeNames],
            calleeOwners: Object.fromEntries(
                [...calleeNames].flatMap((callee) => {
                    const root = callee.split('.').at(0) ?? callee;
                    const specifier = imports.get(root);
                    // Not imported means declared here, whether at top level or inside the component, so the
                    // conversion never leaves the file and the task is file-local rather than a callee task.
                    const owner = specifier ? resolveModule(specifier, file) : file;
                    return owner ? [[callee, owner] as const] : [];
                }),
            ),
            forwardedAt,
            calleeExportedNames: Object.fromEntries(
                [...calleeNames].map((callee) => {
                    const root = callee.split('.').at(0) ?? callee;
                    // A member call names the export itself, so only a bare call can be an alias.
                    const exported = callee.includes('.') ? (callee.split('.').at(-1) ?? callee) : (importedNames.get(root) ?? callee);
                    return [callee, exported] as const;
                }),
            ),
            consumerNames: [...consumerNames],
            hasSelector,
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

    // Second pass: a binding can clear every in-file condition and still forward its value to a function
    // that some other file calls during render, where a read moved inside it would run at render time.
    // Only reachable with the whole file list, so `--file` reports the in-file verdict on its own.
    const sweepFiles = singleFile ? listSourceFiles() : files;
    // Swept for every off-render binding, not only the `CERTAIN` ones, so `--callees` also answers the
    // question for a callee a later wave wants: can a read live inside it at all. Only `CERTAIN` verdicts
    // are changed by the result.
    const sweepNames = new Set(bindings.filter((binding) => binding.verdict !== 'NOT_CANDIDATE').flatMap((binding) => binding.calleeNames));
    const sweeps = sweepCallees(sweepFiles, sweepNames);

    for (const binding of bindings) {
        if (binding.verdict !== 'CERTAIN') {
            continue;
        }
        for (const callee of binding.calleeNames) {
            const sweep = sweeps.get(callee);
            const renderCallSite = sweep?.renderCallSites.at(0);
            if (!renderCallSite) {
                continue;
            }
            binding.verdict = 'REVIEW';
            binding.reasons.push(`callee ${callee} runs during render at ${renderCallSite}, so the read cannot move into it`);
        }
    }

    // Third pass: a callee whose callers outside this set still forward a value cannot lose its parameter, so
    // the conversion would leave it reading Onyx *and* taking the parameter, one source for the converted
    // callers and another for the rest. That is a design decision about the callee's signature, not a
    // mechanical move, so the bindings feeding it are not clear. Repeated to a fixpoint, because demoting one
    // binding lowers the feeding count of every callee it fed, which can hold back a callee that had just
    // enough feeders a moment ago.
    for (let settled = false; !settled; ) {
        settled = true;
        const feeding = new Map<string, number>();
        for (const binding of bindings.filter((candidate) => candidate.verdict === 'CERTAIN')) {
            for (const callee of binding.calleeNames) {
                feeding.set(callee, (feeding.get(callee) ?? 0) + 1);
            }
        }

        for (const binding of bindings) {
            if (binding.verdict !== 'CERTAIN') {
                continue;
            }
            for (const callee of binding.calleeNames) {
                const callSites = sweeps.get(callee)?.callSites ?? 0;
                if (callSites > 0 && callSites <= (feeding.get(callee) ?? 0)) {
                    continue;
                }
                binding.verdict = 'REVIEW';
                binding.reasons.push(
                    `callee ${callee} is called from ${callSites} site(s) but fed by ${feeding.get(callee) ?? 0} clear binding(s), so it would keep its parameter and need a fallback read`,
                );
                settled = false;
            }
        }
    }

    const nonRender = bindings.filter((binding) => binding.verdict !== 'NOT_CANDIDATE');
    const certain = bindings.filter((binding) => binding.verdict === 'CERTAIN');
    const review = bindings.filter((binding) => binding.verdict === 'REVIEW');

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
        console.log(row('  of REVIEW: callee runs during render', review.filter((binding) => binding.reasons.some((reason) => reason.includes('runs during render at'))).length));
        console.log(row('  of REVIEW: binding reads through a selector', review.filter((binding) => binding.hasSelector).length));
        console.log(row('  of REVIEW: Search scope redirects the key', review.filter((binding) => binding.reasons.some((reason) => reason.includes('Search scope'))).length));
        console.log(row('  of REVIEW: callee would keep its parameter', review.filter((binding) => binding.reasons.some((reason) => reason.includes('keep its parameter'))).length));
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

    if (argv.includes('--callees')) {
        // Every callee a CERTAIN binding forwards to, with what the forward sweep found. A callee whose
        // caller set is wider than its CERTAIN set keeps its parameters, since the rest keep subscribing.
        const forwardingByCallee = new Map<string, {bindings: number; certain: number; files: Set<string>}>();
        for (const binding of nonRender) {
            for (const callee of binding.calleeNames) {
                const entry = forwardingByCallee.get(callee) ?? {bindings: 0, certain: 0, files: new Set<string>()};
                entry.bindings += 1;
                entry.certain += binding.verdict === 'CERTAIN' ? 1 : 0;
                entry.files.add(binding.file);
                forwardingByCallee.set(callee, entry);
            }
        }
        for (const [callee, entry] of [...forwardingByCallee.entries()].sort((a, b) => b[1].bindings - a[1].bindings)) {
            const sweep = sweeps.get(callee);
            const renderCallSite = sweep?.renderCallSites.at(0);
            const blocked = renderCallSite ? `  BLOCKED, runs during render at ${renderCallSite}` : '';
            console.log(
                `${String(entry.bindings).padStart(4)} bindings (${String(entry.certain)} CERTAIN) in ${String(entry.files.size)} file(s) feed ${callee}, called from ${String(sweep?.callSites ?? 0)} site(s)${blocked}`,
            );
        }
        return;
    }

    if (argv.includes('--tasks')) {
        // Wave 1 as issues rather than as a list of bindings. Two kinds, because they have different revert
        // units: a callee task changes one function and every file that calls it, so it cannot be split by
        // file, while a file-local task is bounded by its own file. Callee tasks print first because a callee
        // PR's diff is a superset of what a file-local PR in the same file would touch.
        const calleeTasks = new Map<string, {owner: string; bindings: Binding[]}>();
        const fileTasks = new Map<string, Binding[]>();

        for (const binding of certain) {
            // A callee declared in the binding's own file changes nothing outside it, so it belongs with the
            // file-local tasks however the value reaches it.
            const crossFileCallees = binding.calleeNames.filter((callee) => binding.calleeOwners[callee] !== binding.file);
            if (crossFileCallees.length === 0) {
                fileTasks.set(binding.file, [...(fileTasks.get(binding.file) ?? []), binding]);
                continue;
            }
            for (const callee of crossFileCallees) {
                const entry = calleeTasks.get(callee) ?? {owner: binding.calleeOwners[callee] ?? 'unresolved', bindings: []};
                entry.bindings.push(binding);
                calleeTasks.set(callee, entry);
            }
        }

        console.log(`=== Wave 1 tasks, ${certain.length} CERTAIN bindings ===`);
        // Every callee reaching this point loses its parameter with the read: a callee that would keep one has
        // already taken its feeding bindings out of `CERTAIN`, so there is nothing left here to filter.
        console.log('');
        console.log(`--- A. Callee tasks, ${calleeTasks.size}. The read moves into the function and its parameter goes with it ---`);
        for (const [callee, entry] of [...calleeTasks.entries()].sort((a, b) => b[1].bindings.length - a[1].bindings.length)) {
            // The parameters the conversion deletes, named at the callee rather than at the call sites: every
            // caller is in this wave, which is what put the callee here, so the signature loses them outright.
            const parameters = [
                ...new Set(
                    entry.bindings.flatMap((binding) => {
                        const index = binding.forwardedAt[callee];
                        const exported = binding.calleeExportedNames[callee] ?? callee;
                        return index === undefined ? [] : [parameterName(entry.owner, exported, index) ?? `argument ${index}, declaration not resolved`];
                    }),
                ),
            ];
            console.log(`${callee}  (${entry.owner})  removes ${parameters.join(', ') || 'no resolvable parameter'}`);
        }

        console.log('');
        console.log(`--- B. File-local tasks, ${fileTasks.size}. Value consumed in its own file, so the file is the unit ---`);
        for (const [file, fileBindings] of [...fileTasks.entries()].sort((a, b) => b[1].length - a[1].length)) {
            console.log(`${file}   ${fileBindings.length} binding(s)`);
            for (const binding of fileBindings) {
                console.log(`    :${binding.line}  ${binding.name} <- ${binding.key}   in ${binding.consumerNames.join(', ') || 'unnamed function'}`);
            }
        }

        const fileLocal = [...fileTasks.values()].reduce((total, fileBindings) => total + fileBindings.length, 0);
        const calleeFed = new Set([...calleeTasks.values()].flatMap((entry) => entry.bindings)).size;
        console.log('');
        console.log(
            `Wave 1 covers all ${certain.length} CERTAIN bindings: ${calleeFed} through ${calleeTasks.size} callee task(s), ${fileLocal} through ${fileTasks.size} file-local task(s).`,
        );
        return;
    }

    if (argv.includes('--scope')) {
        // Bindings held out because the file renders inside a Search scope. Each one is a subscription to
        // `snapshot_<hash>` that a conversion would silently point at the global key instead.
        const scoped = bindings.filter((binding) => binding.reasons.some((reason) => reason.includes('Search scope')));
        for (const binding of scoped) {
            console.log(`${binding.file}:${binding.line}  ${binding.name} <- ${binding.key}`);
        }
        console.log('');
        console.log(
            `${scoped.length} binding(s) in ${new Set(scoped.map((binding) => binding.file)).size} file(s), out of ${searchScopedFiles().size} file(s) reachable from a Search scope.`,
        );
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
