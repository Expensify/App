#!/usr/bin/env bun

// cSpell:ignore callees fixpoint

/**
 * Lists every `useOnyx()` binding in `src/` that an event-time `Onyx.get()` could replace, with a verdict per
 * binding. Source of the counts in ONYX-GET-ASYNC-PROPOSAL.md and of the task list in ONYX-GET-WAVE1-TASKS.md.
 *
 * `BLOCKED` is not a verdict about the binding at all. `@libs/OnyxUtils.get` refuses the Search snapshot keys,
 * whatever the call site looks like, so a binding on one of them has no conversion to weigh and leaves the
 * candidate set before any other condition is checked.
 *
 * A `CERTAIN` verdict claims only that the mechanical conditions hold: the value never reaches rendered output,
 * every reference sits in event-position code, no reference is an effect trigger, the consuming function performs
 * no Onyx write the read could land behind and none after it either, the binding reads no `selector` the read site
 * would have to reproduce, the function the read would move into neither returns a value nor is an optimistic
 * builder, and no file calls the callee it forwards to during render. It does not claim the conversion is correct:
 * mixing a source key with a key derived from it stays invisible here.
 *
 * The last three of those are what an asynchronous read adds over a synchronous one. Awaiting inside a function
 * turns it `async`, so a caller consuming its return value has to change, and a write it makes after the read now
 * lands a microtask later than the caller's next statement. Optimistic builders sidestep both by staying
 * synchronous and taking their Onyx values as parameters, so a read cannot move into one.
 *
 * Syntactic, one file at a time, no type-checker, so references resolve by name inside the declaring function.
 * A shadowed name is over-counted, which pushes a binding towards `render` and out of the candidate set. Every
 * inaccuracy therefore shrinks the list, which is the safe direction: a lower bound on the work, not an upper one.
 *
 * Usage:
 *   bun scripts/trackOnyxGetMigration.ts [--status]     # counts, why REVIEW, and the entirely-CERTAIN files
 *   bun scripts/trackOnyxGetMigration.ts --certain      # just the CERTAIN bindings, one per line
 *   bun scripts/trackOnyxGetMigration.ts --tasks        # wave 1 split into callee tasks and file-local tasks
 *   bun scripts/trackOnyxGetMigration.ts --file <path>  # one file, per-binding verdict
 */
import ts from '@typescript/typescript6';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);

function argValue(flag: string): string | undefined {
    const index = argv.indexOf(flag);
    return index === -1 ? undefined : argv.at(index + 1);
}

/**
 * Hooks whose callback runs during render, so crossing into one does not defer the read. Kept in step with
 * `RENDER_TIME_HOOK_NAMES` in `eslint-plugin-local-rules/no-unsafe-onyx-read.js`.
 */
const RENDER_TIME_HOOKS = new Set(['useMemo']);

/** Hooks that return a memoized value, so a name bound to one has an identity that changes with its deps. */
const MEMO_HOOKS = new Set(['useCallback', 'useMemo']);

/** Hooks taking a dependency array as their last argument. */
const HOOKS_WITH_DEPS = new Set(['useMemo', 'useCallback', 'useEffect', 'useLayoutEffect', 'useFocusEffect', 'useImperativeHandle']);

/** Hooks whose callback re-runs because a dependency changed, so a value inside one is a trigger. */
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
 * Calls that end a synchronous stretch. The `Onyx.get()` rule is one read block per stretch, not per function,
 * so a consuming function containing one needs a placement decision rather than a mechanical conversion.
 */
const DEFERRAL_CALLS = new Set(['runAfterTransitions', 'setTimeout', 'setInterval', 'requestAnimationFrame', 'runAfterInteractions', 'then', 'finally', 'queueMicrotask', 'setImmediate']);

/** Onyx calls that write. A read moved in behind one of these is the read-after-write hazard. */
const ONYX_WRITE_METHODS = new Set(['set', 'multiSet', 'merge', 'mergeCollection', 'setCollection', 'update', 'clear']);

/**
 * Whether a node is itself an Onyx write. The action layer rarely calls `Onyx.merge` directly, it builds
 * `optimisticData` descriptors carrying `onyxMethod: Onyx.METHOD.MERGE` and hands them to `API.write`, so both
 * shapes count. Any call on `API` counts, not just `write`: every entry point takes an `onyxData` argument.
 */
function isOnyxWrite(node: ts.Node): boolean {
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
 * Files that can run before Onyx has hydrated, where a synchronous read returns `undefined` for a key that is
 * still only on disk. Deliberately the app's own boot path rather than a guess at what a handler is called from.
 */
const STARTUP_PATH_HINTS = [/^src\/setup\//, /^src\/App\.tsx$/, /^src\/Expensify\.tsx$/, /^src\/HybridAppHandler\.tsx$/, /^src\/libs\/actions\/App\.ts$/, /^src\/libs\/E2E\//];

type ReferenceKind =
    /** Read while rendering: in JSX, or reached without crossing a deferring function boundary. */
    | 'render'
    /** In the dependency array of an effect, so the subscription is what schedules the effect. */
    | 'effectDeps'
    /** In the dependency array of a `useMemo` or `useCallback`, which schedules nothing. */
    | 'memoDeps'
    /** Inside a memoized function whose own identity feeds an effect's dependency array, so a trigger one hop out. */
    | 'indirectEffect'
    /** Inside a function the scope returns to its caller, whose render position is a cross-file question. */
    | 'escapes'
    /** Inside an effect callback, so the subscription is what makes the effect fire. */
    | 'effect'
    /** Inside a function that runs later: a handler, a callback, a non-render hook body. */
    | 'deferred';

type Verdict =
    /** Reaches rendered output. Not part of this migration. */
    | 'NOT_CANDIDATE'
    /** Reads a key `@libs/OnyxUtils.get` refuses, so there is no conversion to review. */
    | 'BLOCKED'
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
    /** Functions the value is handed to, as `name` or `object.name`. Where the read would move. */
    calleeNames: string[];
    /** The file each callee is declared in. The binding's own file when the callee is not imported. */
    calleeOwners: Record<string, string>;
    /** Which argument position the value is forwarded as, per callee, so the parameter can be named. */
    forwardedAt: Record<string, number>;
    /** The name each callee is exported under, which is what to look up when the import is aliased. */
    calleeExportedNames: Record<string, string>;
    /** Functions in this file that consume the value, which is where a file-local read lands. */
    consumerNames: string[];
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

/** The bare name a call is made through, so `React.useEffect` matches `useEffect` rather than going unrecognized. */
function hookName(node: ts.CallExpression): string {
    if (ts.isIdentifier(node.expression)) {
        return node.expression.text;
    }
    return ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : node.expression.getText();
}

/** True when a function expression runs where it is written: an IIFE, or a synchronous array-method callback. */
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
 * The hook a call belongs to, seeing through the `useFocusEffect(useCallback(fn, deps))` idiom: the effect's real
 * dependency array is written on the inner `useCallback`, which read literally looks harmless.
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

/** The hook call a function expression is an argument to: `useEffect(() => ...)` gives `useEffect`. */
function enclosingHookCall(fn: ts.Node): string | undefined {
    const parent = fn.parent;
    if (!parent || !ts.isCallExpression(parent)) {
        return undefined;
    }
    return effectiveHookName(parent);
}

/**
 * True for a function React runs while rendering to produce an initial value: the lazy initializer of `useState`,
 * or the third argument of `useReducer`. `useReducer`'s first argument is excluded, since a reducer runs on dispatch.
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

/** True for a `useOnyx` `selector`, which Onyx runs during render, so the boundary is transparent like a `useMemo`. */
function isSelectorCallback(fn: ts.Node): boolean {
    const parent = fn.parent;
    return !!parent && ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name) && parent.name.text === 'selector';
}

/** True when crossing into this function defers nothing, because React or Onyx runs it during the render pass. */
function isTransparentBoundary(fn: ts.Node): boolean {
    const hook = enclosingHookCall(fn);
    return (!!hook && RENDER_TIME_HOOKS.has(hook)) || isSelectorCallback(fn) || isRenderTimeInitializer(fn);
}

/** True when a function boundary defers the code inside it, which is what a converted read has to sit behind. */
function isDeferringBoundary(fn: ts.Node, renderInvoked: Set<ts.Node>): boolean {
    return isFunctionLike(fn) && !runsImmediately(fn) && !renderInvoked.has(fn) && !isTransparentBoundary(fn);
}

/**
 * Local functions in `scope` that are called while the scope itself is rendering, so their bodies are render
 * positions. A plain `const getStatusBarProps = () => {...}` called a few lines down is neither an IIFE nor an
 * array callback nor a `useMemo`, so every transparency test misses it and the read looks deferred.
 *
 * Resolved to a fixed point, because a render-invoked function's body is a render position too. Names resolve
 * syntactically, so a shadowed local over-matches, which removes candidates rather than adding them.
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
     * Local functions React runs during render because they were handed over by name rather than called:
     * `useState(getCountry)` and `useOnyx(key, {selector: mySelector})`. There is no call expression to find.
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
            if (isDeferringBoundary(node, renderInvoked)) {
                return false;
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
 * The callback bodies of memoized declarations whose own name appears in an effect's dependency array. The value
 * never touches the effect, so a direct effect check clears it, yet deleting the subscription stops the effect
 * re-running: the same hazard as a direct effect dependency, one hop further out.
 */
function indirectEffectCallbacks(scope: ts.Node): Set<ts.Node> {
    /** Local name to the memoized callback it is bound to. */
    const memoized = new Map<string, ts.Node>();
    /**
     * Local name to the names its own identity depends on, collected from every dependency array nested anywhere
     * in the declaration's initializer, so wrappers such as `useDebounce(useCallback(fn, deps), wait)` are followed.
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

    // Walk the identity chain to a fixed point: a name whose identity feeds something that feeds an effect
    // schedules that effect just as surely as a direct dependency does.
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
 * Local functions the scope hands back to its caller, as `return {onPress}` or `return [handler]`, where whether
 * the consumer calls them during render cannot be answered from this file. A function passed down as a JSX prop is
 * deliberately excluded: that is the ordinary handler shape, and the child invoking it is an event.
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

        // `return ( <View /> )` is a parenthesized expression, so the JSX test has to look through it, or every
        // `onPress={handler}` in a component's own JSX counts as an escape.
        let returned: ts.Expression = node.expression;
        while (ts.isParenthesizedExpression(returned)) {
            returned = returned.expression;
        }
        if (ts.isJsxElement(returned) || ts.isJsxFragment(returned) || ts.isJsxSelfClosingElement(returned)) {
            return;
        }

        forEachDescendant(returned, (child) => {
            // `return () => {...}` and `return {getter: () => ...}` hand back a function that was never named,
            // so resolving identifiers alone misses them.
            if (isFunctionLike(child)) {
                escaping.add(child);
                return;
            }

            if (!ts.isIdentifier(child)) {
                return;
            }
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
 * Walks from a reference up to the declaring function, deciding when the value is read. `effect` wins over
 * `deferred` because an effect callback is deferred too, and the distinction is the whole point: one consumes the
 * value, the other is woken by it.
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

        if (isDeferringBoundary(node, renderInvoked)) {
            crossedFunctionBoundary = true;
            const hook = enclosingHookCall(node);
            if (hook && EFFECT_HOOKS.has(hook)) {
                inEffect = true;
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
    // An effect's dependency array is a trigger even when the body never reads the value, so it outranks
    // `deferred`. A `useMemo` or `useCallback` dependency array is not: the conversion deletes the dependency
    // along with the subscription.
    if (inDepsArray === 'effectDeps') {
        return 'effectDeps';
    }
    // Both of these only qualify a read that is otherwise deferred, since a `useMemo` callback runs during render
    // whether or not its result escapes.
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

/** The nearest function around a reference that actually defers it, which is the body the read would move into. */
function consumingFunction(reference: ts.Node, scope: ts.Node, renderInvoked: Set<ts.Node>): ts.Node | undefined {
    let node: ts.Node | undefined = reference.parent;
    while (node && node !== scope) {
        if (isDeferringBoundary(node, renderInvoked)) {
            return node;
        }
        node = node.parent;
    }
    return undefined;
}

/**
 * The name a function is known by, which is what a task points at alongside its file. An anonymous callback takes
 * its enclosing function's name, so the pointer lands somewhere a reader can open.
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

type FileImports = {
    /** Local name to module specifier, so a callee can be traced to the file it came from. */
    specifiers: Map<string, string>;
    /**
     * Local name to the name the module exports it under, so an aliased import resolves in the owner file:
     * `import {flagComment as flagCommentUtil}` has to be looked up as `flagComment`. A default or namespace import
     * maps to `default`, which the parameter lookup resolves through the file's default export.
     */
    exportedNames: Map<string, string>;
};

function collectImports(sourceFile: ts.SourceFile): FileImports {
    const specifiers = new Map<string, string>();
    const exportedNames = new Map<string, string>();

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.importClause || !ts.isStringLiteral(statement.moduleSpecifier)) {
            continue;
        }
        const specifier = statement.moduleSpecifier.text;
        const {name, namedBindings} = statement.importClause;
        if (name) {
            specifiers.set(name.text, specifier);
            exportedNames.set(name.text, 'default');
        }
        if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            specifiers.set(namedBindings.name.text, specifier);
            exportedNames.set(namedBindings.name.text, 'default');
        }
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            for (const element of namedBindings.elements) {
                specifiers.set(element.name.text, specifier);
                exportedNames.set(element.name.text, (element.propertyName ?? element.name).text);
            }
        }
    }

    return {specifiers, exportedNames};
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

const SNAPSHOT_PREFIXES_FILE = 'src/CONST/runtimeDefaults.ts';
const ONYXKEYS_FILE = 'src/ONYXKEYS.ts';

let bannedPrefixesCache: string[] | undefined;

/**
 * The key prefixes `@libs/OnyxUtils.get` refuses, read out of `SEARCH_SNAPSHOT_ONYX_KEYS` rather than copied
 * here so the list cannot drift. `@hooks/useOnyx` swaps these for `snapshot_<hash>` inside a Search scope and
 * `Onyx.get` cannot see that, so the wrapper refuses them everywhere rather than only where a Search scope is
 * reachable. This follows the wrapper, not the Search tree.
 */
function bannedPrefixes(): string[] {
    if (bannedPrefixesCache) {
        return bannedPrefixesCache;
    }

    const prefixes: string[] = [];
    const sourceFile = parse(SNAPSHOT_PREFIXES_FILE);

    forEachDescendant(sourceFile, (node) => {
        // Either a standalone `const SEARCH_SNAPSHOT_ONYX_KEYS = [...] as const` or a property of the same name,
        // so moving the array between the two shapes does not silently empty this list.
        if ((!ts.isVariableDeclaration(node) && !ts.isPropertyAssignment(node)) || node.name.getText(sourceFile) !== 'SEARCH_SNAPSHOT_ONYX_KEYS' || !node.initializer) {
            return;
        }
        const array = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
        if (!ts.isArrayLiteralExpression(array)) {
            return;
        }
        for (const element of array.elements) {
            if (ts.isStringLiteral(element)) {
                prefixes.push(element.text);
            }
        }
    });

    // An empty list clears every binding instead of blocking any, which is how the earlier version of this check
    // went unnoticed for weeks after the array moved behind a reference. Fail instead of under-reporting.
    if (prefixes.length === 0) {
        throw new Error(`No SEARCH_SNAPSHOT_ONYX_KEYS array literal in ${SNAPSHOT_PREFIXES_FILE}`);
    }

    bannedPrefixesCache = prefixes;
    return prefixes;
}

let onyxKeyValuesCache: Map<string, string> | undefined;

/**
 * Every dotted `ONYXKEYS` path mapped to the string it holds, so a key argument can be compared the way the
 * runtime guard compares it, on the value, rather than on the spelling of the path.
 */
function onyxKeyValues(): Map<string, string> {
    if (onyxKeyValuesCache) {
        return onyxKeyValuesCache;
    }

    const values = new Map<string, string>();
    const sourceFile = parse(ONYXKEYS_FILE);

    const collect = (object: ts.ObjectLiteralExpression, prefix: string): void => {
        for (const property of object.properties) {
            if (!ts.isPropertyAssignment(property)) {
                continue;
            }
            const dotted = `${prefix}.${property.name.getText(sourceFile)}`;
            if (ts.isStringLiteral(property.initializer)) {
                values.set(dotted, property.initializer.text);
            } else if (ts.isObjectLiteralExpression(property.initializer)) {
                collect(property.initializer, dotted);
            }
        }
    };

    forEachDescendant(sourceFile, (node) => {
        if (!ts.isVariableDeclaration(node) || node.name.getText(sourceFile) !== 'ONYXKEYS' || !node.initializer) {
            return;
        }
        const object = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
        if (ts.isObjectLiteralExpression(object)) {
            collect(object, 'ONYXKEYS');
        }
    });

    onyxKeyValuesCache = values;
    return values;
}

/**
 * The `ONYXKEYS` path a key argument names, or the text unchanged when there is nothing to strip. A collection
 * member reads as its collection, which is the granularity the prefix list is written at.
 */
function onyxKeyPath(keyText: string): string {
    if (!keyText.startsWith('`')) {
        return keyText;
    }
    return /^`\$\{([^}]+)\}/.exec(keyText)?.at(1) ?? '';
}

/**
 * Mirrors `isSnapshotCompatibleKey` in `src/libs/OnyxUtils/index.ts`, the check the wrapper makes before it
 * delegates. A key the wrapper refuses cannot be converted however the rest of the binding looks, so it leaves
 * the candidate set rather than joining the review pile. A key that does not resolve to a literal is not blocked,
 * which is the permissive direction and the reason lint checks the same thing at the call site.
 */
function isBannedKey(keyText: string): boolean {
    const value = onyxKeyValues().get(onyxKeyPath(keyText));
    if (value === undefined) {
        return false;
    }

    const snapshotCollection = onyxKeyValues().get('ONYXKEYS.COLLECTION.SNAPSHOT') ?? 'snapshot_';
    return !value.startsWith(snapshotCollection) && bannedPrefixes().some((prefix) => value.startsWith(prefix));
}

const writerCache = new Map<string, Set<string>>();

/**
 * Names in a module whose body writes Onyx, found by scanning each top-level function for a literal `Onyx.<write>`
 * call and then propagating across same-file calls until nothing new is found. One module deep, deliberately: a
 * write reached only through a third module is invisible here, which is why an unresolved callee stays a hazard.
 */
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
    const moduleImports = collectImports(sourceFile).specifiers;

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
                    // A bare `export {x}` block re-exports whatever `x` was imported as, the shape the action
                    // barrels use. Without this, every function in a barrel looks write-free.
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

    // A function that calls a writer is a writer. Iterate to a fixed point rather than recursing, so a mutual
    // recursion in the action layer cannot run away.
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
 * Writes inside `fn` that start before `reference` does, which is the read-after-write hazard: move the read into
 * this function and it can land behind a `merge` or an `update` that has not applied yet. Position, not control
 * flow: a write in a branch the reference never runs under still counts, because deciding otherwise is the
 * judgment this script refuses to make.
 *
 * Components write through the action layer rather than calling `Onyx.merge`, so a call whose target writes counts
 * as a write too. Resolution is one module deep and alias-based, so a callee it cannot resolve is skipped rather
 * than guessed at.
 */
function writesAhead(fn: ts.Node, reference: ts.Node, imports: Map<string, string>, importingFile: string): string[] {
    return onyxWritesIn(fn, imports, importingFile, (node) => node.getStart() < reference.getStart());
}

/**
 * Writes inside `fn` that start at or after `reference`, which is the mirror hazard and only exists once the read
 * is asynchronous. An action that reads, builds and writes in one tick publishes its optimistic data before its
 * caller's next statement runs; await the read first and that write lands a microtask later, so a caller that
 * navigates or reads straight after the call now runs before the optimistic data exists.
 *
 * Already-async functions are exempt: their callers deal with a promise today.
 */
function writesBehind(fn: ts.Node, reference: ts.Node, imports: Map<string, string>, importingFile: string): string[] {
    if (isAsyncFunction(fn)) {
        return [];
    }
    return onyxWritesIn(fn, imports, importingFile, (node) => node.getStart() >= reference.getStart());
}

/** The scan both directions share. `accept` decides which positions count. */
function onyxWritesIn(fn: ts.Node, imports: Map<string, string>, importingFile: string, accept: (node: ts.Node) => boolean): string[] {
    const found: string[] = [];

    forEachDescendant(fn, (node) => {
        if (!accept(node)) {
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
            // A local function, or something from a module this file does not import. Local functions are covered
            // by the same scan when the read moves, so they are not a hazard on their own.
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
 * Deferral points inside `fn`, meaning the conversion has more than one synchronous stretch to choose between when
 * placing the read. An `await` counts, and so does any call that takes a callback to run later.
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

const calleeFileCache = new Map<string, ts.SourceFile>();

/**
 * The declaration of a callee in the file that owns it, or undefined when it is not one of the two plain shapes.
 * Everything that has to look past the binding's own file goes through here, so an unresolved callee produces no
 * verdict rather than a guess.
 */
function calleeDeclaration(ownerFile: string, callee: string): {fn: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression; sourceFile: ts.SourceFile} | undefined {
    if (!fs.existsSync(path.join(projectRoot, ownerFile))) {
        return undefined;
    }

    const sourceFile = calleeFileCache.get(ownerFile) ?? parse(ownerFile);
    calleeFileCache.set(ownerFile, sourceFile);

    // `default` means the caller imported it without a name, so the declaration is whatever the file exports by
    // default, which is either the function itself or an identifier pointing at one.
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

    let found: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression | undefined;

    forEachDescendant(sourceFile, (node) => {
        if (found) {
            return;
        }
        if (ts.isFunctionDeclaration(node) && node.name?.text === wanted) {
            found = node;
            return;
        }
        if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) || node.name.text !== wanted || !node.initializer) {
            return;
        }
        if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
            found = node.initializer;
        }
    });

    return found ? {fn: found, sourceFile} : undefined;
}

/**
 * The name of the parameter a callee takes at a given position, which is what a conversion deletes. Returns
 * undefined when the declaration is not one of the two plain shapes, which keeps a guess out of the task list.
 */
function parameterName(ownerFile: string, callee: string, index: number): string | undefined {
    const declaration = calleeDeclaration(ownerFile, callee);
    const parameter = declaration?.fn.parameters.at(index);
    return parameter ? parameter.name.getText(declaration?.sourceFile) : undefined;
}

/**
 * Optimistic builders, by the convention the 80 of them in `src/` are named under. These stay synchronous: they
 * construct an `optimisticData` payload that the caller hands to `API.write` in the same tick, so a read moved
 * inside one would have to be awaited and the payload would no longer be built by the time it is needed. The read
 * belongs in the helper that calls the builder, which is a placement decision rather than a mechanical move.
 */
function isOptimisticBuilder(name: string): boolean {
    return /^(build|get)[A-Za-z]*Optimistic/.test(name.split('.').at(-1) ?? name);
}

/** True for a function declared `async`, whose callers already deal with a promise. */
function isAsyncFunction(fn: ts.Node): boolean {
    return isFunctionLike(fn) && !!fn.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword);
}

/**
 * True when a function hands a value back to its caller. Nested functions are skipped, since their returns are
 * their own. This is the condition an asynchronous read turns into a signature change: a `void` function that
 * becomes `async` is invisible to a caller that ignores it, while one that returns a value forces every call site
 * to await, which is exactly what the proposal's "no caller consumes the return value synchronously" excludes.
 */
function returnsValue(fn: ts.Node): boolean {
    if (!isFunctionLike(fn) || !fn.body) {
        return false;
    }
    const {body} = fn;
    // A concise arrow body is the returned value.
    if (!ts.isBlock(body)) {
        return true;
    }

    let found = false;
    const walk = (node: ts.Node): void => {
        if (found || isFunctionLike(node)) {
            return;
        }
        if (ts.isReturnStatement(node)) {
            found = !!node.expression;
            return;
        }
        node.forEachChild(walk);
    };
    body.forEachChild(walk);
    return found;
}

/** True when awaiting a read inside this function would change what its callers see. */
function returnBlocksAwait(fn: ts.Node): boolean {
    return !isAsyncFunction(fn) && returnsValue(fn);
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

/** True for an identifier that names something rather than reading it, which would inflate the reference count. */
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
 * Deliberately not `classifyReference`: that returns `render` for anything under a JSX expression, which is right
 * for a value reference but wrong for a call, since `onPress={() => f()}` is an event. Here a function boundary
 * wins over JSX position, and the walk only reports render once it reaches a component or hook.
 */
function callRunsDuringRender(call: ts.CallExpression, renderInvoked: Set<ts.Node>): boolean {
    let node: ts.Node | undefined = call.parent;

    while (node) {
        if (isDeferringBoundary(node, renderInvoked)) {
            // A component or hook body runs at render time; a handler, effect or deferred callback does not.
            return isRenderScope(node);
        }
        node = node.parent;
    }

    return false;
}

/**
 * The forward sweep the per-file analysis cannot do. A `CERTAIN` verdict clears keeping the read in the file it is
 * already in; moving it into a shared callee is a different question, because that callee's own callers decide
 * whether the read would then run during render. Matching is by bare callee name, so a same-named local function
 * elsewhere also matches: that over-counts render call sites, which pushes bindings out of the candidate set.
 */
function sweepCallees(files: string[], names: Set<string>): Map<string, CalleeSweep> {
    const sweeps = new Map<string, CalleeSweep>();
    const shortNames = new Map<string, string>();
    for (const name of names) {
        sweeps.set(name, {callSites: 0, renderCallSites: []});
        shortNames.set(name, name.split('.').at(-1) ?? name);
    }

    for (const file of files) {
        const absolute = path.isAbsolute(file) ? file : path.join(projectRoot, file);
        const text = fs.readFileSync(absolute, 'utf8');
        if (![...shortNames.values()].some((shortName) => text.includes(shortName))) {
            continue;
        }

        const sourceFile = parse(file);
        // Whole file at once: the walk leaves the nearest scope, so a set built per scope would leave an outer
        // render-invoked function looking like a real boundary, which is the permissive direction.
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
    const {specifiers: imports, exportedNames: importedNames} = collectImports(sourceFile);
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
        const readsBannedKey = isBannedKey(key);

        const kinds = new Set<ReferenceKind>();
        const calleeNames = new Set<string>();
        const forwardedAt: Record<string, number> = {};
        const consumerNames = new Set<string>();
        const priorWrites = new Set<string>();
        const deferrals = new Set<string>();
        /** Consuming functions in this file that hand a value back, where the read cannot be awaited in place. */
        const returningConsumers = new Set<string>();
        /** Callees that are optimistic builders, which stay synchronous, so the read cannot move into them. */
        const optimisticCallees = new Set<string>();
        /** Writes the consuming function makes after the read, which an awaited read would push past a microtask. */
        const laterWrites = new Set<string>();
        let referenceCount = 0;

        forEachDescendant(scope, (candidate) => {
            if (!ts.isIdentifier(candidate) || candidate.text !== valueBinding.text || candidate === valueBinding || isNamePositionOnly(candidate)) {
                return;
            }

            referenceCount += 1;
            kinds.add(classifyReference(candidate, scope, renderInvoked, indirectEffects, escaping));

            const callee = argumentCallee(candidate);
            if (callee) {
                calleeNames.add(callee);
                if (isOptimisticBuilder(callee)) {
                    optimisticCallees.add(callee);
                }
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
                if (returnBlocksAwait(consumer)) {
                    returningConsumers.add(consumerName ?? 'unnamed function');
                }
                for (const write of writesBehind(consumer, candidate, imports, file)) {
                    laterWrites.add(write);
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
        } else if (readsBannedKey) {
            verdict = 'BLOCKED';
            reasons.push(`${onyxKeyPath(key)} is a Search snapshot key, which ReadableOnyxKey excludes from @libs/OnyxUtils.get`);
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
            if (optimisticCallees.size > 0) {
                verdict = 'REVIEW';
                reasons.push(`value is forwarded into an optimistic builder (${[...optimisticCallees].join(', ')}), which stays synchronous, so the read lands in the helper that calls it`);
            }
            if (returningConsumers.size > 0) {
                verdict = 'REVIEW';
                reasons.push(`consuming function returns a value (${[...returningConsumers].join(', ')}), so awaiting a read inside it changes every call site`);
            }
            if (laterWrites.size > 0) {
                verdict = 'REVIEW';
                reasons.push(`consuming function writes Onyx after the read (${[...laterWrites].join(', ')}), so an awaited read publishes the optimistic data a tick later`);
            }
        }

        bindings.push({
            file,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            name: valueBinding.text,
            key,
            calleeNames: [...calleeNames],
            calleeOwners: Object.fromEntries(
                [...calleeNames].flatMap((callee) => {
                    const root = callee.split('.').at(0) ?? callee;
                    const specifier = imports.get(root);
                    // Not imported means declared here, so the conversion never leaves the file and the task is
                    // file-local rather than a callee task.
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
            verdict,
            reasons,
        });
    });

    return bindings;
}

function percent(part: number, total: number): string {
    return total === 0 ? '0%' : `${((part / total) * 100).toFixed(1)}%`;
}

/**
 * A reason with its specifics stripped, so the counts aggregate per condition rather than per callee or per key.
 * These four are the numbers the proposal quotes for the checks that reach past one file.
 */
function reasonLabel(reason: string): string {
    if (reason.includes('runs during render at')) {
        return 'callee runs during render, so the read cannot move into it';
    }
    if (reason.includes('keep its parameter')) {
        return 'callee would keep its parameter and need a fallback read';
    }
    if (reason.includes('optimistic builder')) {
        return 'value is forwarded into an optimistic builder, which stays synchronous';
    }
    if (reason.includes('returns a value')) {
        return 'the function the read would move into returns a value, so every call site has to await';
    }
    if (reason.includes('writes Onyx after the read')) {
        return 'the function the read would move into writes Onyx after it, so an await delays the optimistic write';
    }
    if (reason.includes('more than one synchronous stretch')) {
        return 'consuming function spans more than one synchronous stretch, so the read needs placing by hand';
    }
    return reason.replace(/ \(.*\)$/, '');
}

function main(): void {
    const singleFile = argValue('--file');
    const files = singleFile ? [singleFile] : listSourceFiles();
    const bindings = files.flatMap(analyzeFile);

    // Second pass: a binding can clear every in-file condition and still forward its value to a function that
    // some other file calls during render, where a read moved inside it would run at render time.
    const sweepFiles = singleFile ? listSourceFiles() : files;
    const sweepNames = new Set(bindings.filter((binding) => binding.verdict === 'CERTAIN' || binding.verdict === 'REVIEW').flatMap((binding) => binding.calleeNames));
    const sweeps = sweepCallees(sweepFiles, sweepNames);

    for (const binding of bindings) {
        if (binding.verdict !== 'CERTAIN') {
            continue;
        }
        for (const callee of binding.calleeNames) {
            const renderCallSite = sweeps.get(callee)?.renderCallSites.at(0);
            if (!renderCallSite) {
                continue;
            }
            binding.verdict = 'REVIEW';
            binding.reasons.push(`callee ${callee} runs during render at ${renderCallSite}, so the read cannot move into it`);
        }
    }

    // Third pass: with an asynchronous read, the function the read lands in becomes `async`. A caller sees nothing
    // change only when it does not consume the return value, so a callee that hands one back is a signature change
    // across every call site rather than a mechanical move. Needs the owner file, which is why it is not in
    // `analyzeFile` alongside the same check on the binding's own consuming function.
    for (const binding of bindings) {
        if (binding.verdict !== 'CERTAIN') {
            continue;
        }
        for (const callee of binding.calleeNames) {
            const owner = binding.calleeOwners[callee];
            const declaration = owner ? calleeDeclaration(owner, binding.calleeExportedNames[callee] ?? callee) : undefined;
            if (!declaration) {
                continue;
            }
            if (returnBlocksAwait(declaration.fn)) {
                binding.verdict = 'REVIEW';
                binding.reasons.push(`callee ${callee} returns a value, so awaiting a read inside it changes every call site`);
            }
            const calleeWrites = writesBehind(declaration.fn, declaration.fn, collectImports(declaration.sourceFile).specifiers, owner ?? '');
            if (calleeWrites.length > 0) {
                binding.verdict = 'REVIEW';
                binding.reasons.push(`callee ${callee} writes Onyx after the read (${calleeWrites.join(', ')}), so an awaited read publishes the optimistic data a tick later`);
            }
        }
    }

    // Fourth pass: a callee whose callers outside this set still forward a value cannot lose its parameter, so the
    // conversion would leave it reading Onyx *and* taking the parameter, one source for the converted callers and
    // another for the rest. That is a design decision about the signature, not a mechanical move. Repeated to a
    // fixpoint, because demoting one binding lowers the feeding count of every callee it fed.
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
    const blocked = bindings.filter((binding) => binding.verdict === 'BLOCKED');
    const certain = bindings.filter((binding) => binding.verdict === 'CERTAIN');
    const review = bindings.filter((binding) => binding.verdict === 'REVIEW');

    if (singleFile) {
        for (const binding of bindings) {
            console.log(
                `${binding.verdict.padEnd(13)} :${String(binding.line).padStart(4)}  ${binding.name} <- ${binding.key}${binding.reasons.length > 0 ? `  (${binding.reasons.join('; ')})` : ''}`,
            );
        }
        return;
    }

    if (argv.includes('--certain')) {
        for (const binding of certain) {
            console.log(`${binding.file}:${binding.line}  ${binding.name} <- ${binding.key}`);
        }
        return;
    }

    if (argv.includes('--tasks')) {
        // Wave 1 as issues rather than as a list of bindings. Two kinds, because they have different revert units:
        // a callee task changes one function and every file that calls it, so it cannot be split by file, while a
        // file-local task is bounded by its own file. Callee tasks print first because a callee PR's diff is a
        // superset of what a file-local PR in the same file would touch.
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
        console.log('');
        console.log(`--- A. Callee tasks, ${calleeTasks.size}. The read moves into the function and its parameter goes with it ---`);
        for (const [callee, entry] of [...calleeTasks.entries()].sort((a, b) => b[1].bindings.length - a[1].bindings.length)) {
            // Every caller of a callee reaching this point is in this wave, which is what put it here, so the
            // signature loses these parameters outright.
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

    // Default, also reachable as `--status`: one place the migration is measured from, so two runs never disagree
    // about its size.
    const byFile = new Map<string, Binding[]>();
    for (const binding of bindings) {
        byFile.set(binding.file, [...(byFile.get(binding.file) ?? []), binding]);
    }
    // A file where every binding is CERTAIN loses all its subscriptions in one commit, which is the cheapest thing
    // to review: nothing is left half-converted for a reader to reason about.
    const wholeCertain = [...byFile.entries()].filter(([, fileBindings]) => fileBindings.every((binding) => binding.verdict === 'CERTAIN'));
    const row = (label: string, count: number) => `${label.padEnd(44)}: ${String(count).padStart(5)}  (${percent(count, bindings.length).padStart(6)})`;

    console.log('=== Onyx read migration, current state ===');
    console.log(row('useOnyx bindings in src/', bindings.length));
    console.log(row('  render-reachable, must stay on useOnyx', bindings.length - nonRender.length));
    console.log(row('  off the render path', nonRender.length));
    console.log(row('      BLOCKED, key the wrapper refuses', blocked.length));
    console.log(row('      CERTAIN, mechanically clear', certain.length));
    console.log(row('      REVIEW, a condition needs a person', review.length));
    console.log('');
    console.log('--- why REVIEW, by reason (a binding can have more than one) ---');
    const reasonCounts = new Map<string, number>();
    for (const binding of review) {
        for (const reason of binding.reasons) {
            reasonCounts.set(reasonLabel(reason), (reasonCounts.get(reasonLabel(reason)) ?? 0) + 1);
        }
    }
    for (const [reason, count] of [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])) {
        console.log(`${String(count).padStart(4)}  ${reason}`);
    }

    console.log('');
    console.log(
        `--- cheapest next PRs: ${wholeCertain.length} file(s) where every binding is CERTAIN, ${wholeCertain.reduce((sum, [, fileBindings]) => sum + fileBindings.length, 0)} bindings ---`,
    );
    for (const [file, fileBindings] of wholeCertain.sort((a, b) => b[1].length - a[1].length)) {
        console.log(`${String(fileBindings.length).padStart(3)}  ${file}`);
    }

    console.log('');
    console.log('Percentages are of every useOnyx binding in src/. CERTAIN means no mechanical condition objects,');
    console.log('not that a conversion is correct, so it is a review shortlist rather than a work-list. REVIEW is not');
    console.log('a backlog either: an effect trigger, or a value the user saw, should keep its subscription.');
}

main();
