// Node's ESM loader does not add file extensions, so the helper import needs `.js`, which import/extensions reports
/* eslint-disable import/extensions */
import {
    createOnyxReadTracker,
    getCalleeName,
    getDeclaredVariable,
    getRepoRelativePath,
    getStaticName,
    matchesCalleeName,
    ONYX_MODULE,
    TYPE_ONLY_EXPRESSIONS,
    unwrapTypeOnlyExpressions,
} from './utils/onyxReadUtils.js';
/* eslint-enable import/extensions */

const name = 'no-unsafe-onyx-read';

const TESTS_DIRECTORY = 'tests/';

const READ_ALLOWED_DIRECTORIES = ['src/components/', 'src/pages/', 'src/hooks/', TESTS_DIRECTORY];

// Test suites, Jest setup and the root __mocks__/ directory may use the Onyx object as a value, as the `...Onyx` in
// __mocks__/react-native-onyx.ts does. A nested __mocks__/ directory does not count.
const TEST_INFRASTRUCTURE_DIRECTORIES = [TESTS_DIRECTORY, '__mocks__/', 'jest/'];

const READ_ALLOWED_FILES = new Set([]);

// Hooks that run their callback after render, mapped to the argument index of that callback
const EFFECT_HOOK_CALLBACK_INDICES = new Map([
    ['useEffect', 0],
    ['useLayoutEffect', 0],
    ['useInsertionEffect', 0],
    ['useFocusEffect', 0],
    ['useImperativeHandle', 1],
]);

const CALLBACK_HOOK_NAMES = new Set(['useCallback', 'useEffectEvent']);

const EFFECT_CONTINUATION_NAMES = new Set([
    'then',
    'catch',
    'finally',
    'setTimeout',
    'setInterval',
    'requestAnimationFrame',
    'requestIdleCallback',
    'queueMicrotask',
    'runAfterInteractions',
    'runAfterTransitions',
    'startTransition',
    'setNavigationActionToMicrotaskQueue',
]);

const SYNCHRONOUS_CALLBACK_METHODS = new Set([
    'from',
    'map',
    'filter',
    'reduce',
    'reduceRight',
    'forEach',
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'flatMap',
    'some',
    'every',
    'sort',
]);

const RENDER_TIME_HOOK_ARGUMENTS = new Map([
    ['useMemo', new Set([0])],
    ['useState', new Set([0])],
    ['useReducer', new Set([2])],
    ['useSyncExternalStore', new Set([1, 2])],
]);

const RENDER_TIME_OPTION_NAMES = new Set(['selector']);

const DEV_CONSOLE_GLOBALS = new Set(['window', 'globalThis']);

// The one property react-native-onyx.d.ts declares on Window
const DEV_CONSOLE_PROPERTY = 'Onyx';

const COMPONENT_WRAPPER_NAMES = new Set(['memo', 'forwardRef']);

const SYNCHRONOUS_EXECUTOR_NAMES = new Set(['Promise']);

const RENDER = 'render';
const DEFERRED = 'deferred';
const SYNCHRONOUS = 'synchronous';

const MODULE_SCOPE = 'moduleScope';
const EVENT = 'event';
const EFFECT = 'effect';

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow Onyx.get and Onyx.multiGet outside components, pages, hooks and tests, outside a component or hook body in those source directories, during render, inside effects or at module scope, and disallow using the Onyx object as a value instead of through its members. no-onyx-get-snapshot-key checks which keys they read.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxReadInRender:
            'Do not read Onyx during render. Onyx.get() and Onyx.multiGet() do not subscribe, so the component keeps showing the value it read after the key changes.\n\n' +
            'Use useOnyx() for anything the component renders, and keep Onyx.get() and Onyx.multiGet() for event handlers that render does not call.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. The module body runs once at import, so a value read there never updates when the key changes.\n\n' +
            'Move the read into the function that needs the value, so it reads the current value when that function runs. If the module must track a key, subscribe with Onyx.connectWithoutView().',
        noOnyxReadOutsideAllowedPath:
            'Onyx.get() and Onyx.multiGet() are only allowed in src/components, src/pages, src/hooks and tests. Outside them this rule cannot tell whether a read runs during render, in an effect or in an event handler.\n\n' +
            'Take the value as a parameter or keep the Onyx.connectWithoutView() subscription. Reviewers accept a new READ_ALLOWED_FILES entry only in a PR that removes an Onyx.connectWithoutView() from that file.',
        noOnyxReadInEffect:
            'Do not read Onyx inside an effect or in a function an effect calls. If the value is an effect dependency, its useOnyx subscription is what re-runs the effect, and a one-shot read stops that.\n\n' +
            'Keep the useOnyx subscription. This rule cannot yet tell whether the value is a dependency, so it reports every read in an effect.',
        noOnyxReadOutsideComponentOrHook:
            'Do not call Onyx.get() or Onyx.multiGet() in a module-level helper. Files in src/libs can import the helper, and these reads are banned there.\n\n' +
            'Read inside the component or hook that needs the value, or in a handler defined inside it, and pass the value to the helper as a parameter.',
        noOnyxReadByReference:
            'Do not use Onyx.get or Onyx.multiGet other than as a direct call, as in Onyx.get.call, Onyx.get.bind, keys.map(Onyx.get), const read = Onyx.get, const {get} = Onyx or Onyx[name]. Such a reference hides the key from no-onyx-get-snapshot-key and the call site from this rule.\n\n' +
            'Call Onyx.get() or Onyx.multiGet() directly.',
        noOnyxObjectAsValue:
            'Do not pass, spread, alias, return or export the Onyx object. Reads made through such a value can escape this rule and the key check of no-onyx-get-snapshot-key.\n\n' +
            'Use Onyx through its members, such as Onyx.get() or Onyx.merge(). The one allowed value use is window.Onyx = Onyx or globalThis.Onyx = Onyx for the dev console.',
    },
};

function isFunctionNode(node) {
    return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
}

function isHookName(functionName) {
    return /^use[A-Z0-9]/.test(functionName);
}

function isComponentName(functionName) {
    return /^[A-Z]/.test(functionName);
}

function isComponentOrHookName(functionName) {
    return !!functionName && (isHookName(functionName) || isComponentName(functionName));
}

/** The name a function is declared or assigned under, or null. An object key such as `APPROVE` or `Enter` does not count, because it does not name a component or hook. */
function getFunctionName(functionNode, parent) {
    if (functionNode.id?.type === 'Identifier') {
        return functionNode.id.name;
    }

    if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return parent.id.name;
    }

    return null;
}

/** True for JSX written directly, or behind `cond ? <A /> : null`, `cond && <A />` or a TS cast. */
function isJSXExpression(node) {
    if (!node) {
        return false;
    }

    if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
        return true;
    }

    if (node.type === 'ConditionalExpression') {
        return isJSXExpression(node.consequent) || isJSXExpression(node.alternate);
    }

    if (node.type === 'LogicalExpression') {
        return isJSXExpression(node.left) || isJSXExpression(node.right);
    }

    return TYPE_ONLY_EXPRESSIONS.has(node.type) && isJSXExpression(node.expression);
}

/** True when the function body is JSX or has a top-level `return` of JSX. A `return` nested in a block is not checked. */
function returnsJSX(functionNode) {
    const body = functionNode.body;

    if (!body) {
        return false;
    }

    if (body.type !== 'BlockStatement') {
        return isJSXExpression(body);
    }

    return body.body.some((statement) => statement.type === 'ReturnStatement' && isJSXExpression(statement.argument));
}

function getRenderTimeArgumentIndices(callee) {
    const calleeName = getCalleeName(callee);

    return calleeName ? (RENDER_TIME_HOOK_ARGUMENTS.get(calleeName) ?? null) : null;
}

function getOutermostTypeOnlyWrapper(node) {
    let current = node;

    while (current?.parent && TYPE_ONLY_EXPRESSIONS.has(current.parent.type)) {
        current = current.parent;
    }

    return current;
}

function isHookArgument(node, call) {
    if (call?.type !== 'CallExpression' || !call.arguments.includes(node)) {
        return false;
    }

    const calleeName = getCalleeName(call.callee);

    return !!calleeName && isHookName(calleeName);
}

/** True when `property` sits in the options object of a hook call, inline as in `useOnyx(key, {selector})` or through `const options = {selector}; useOnyx(key, options)`, with TS casts on either side. */
function isHookOption(property, sourceCode) {
    const holder = getOutermostTypeOnlyWrapper(property.parent);

    if (isHookArgument(holder, holder?.parent)) {
        return true;
    }

    const declarator = holder?.parent;

    if (declarator?.type !== 'VariableDeclarator' || declarator.init !== holder || declarator.id.type !== 'Identifier') {
        return false;
    }

    const variable = getDeclaredVariable(declarator, declarator.id.name, sourceCode);

    return (
        !!variable &&
        variable.references.some((reference) => {
            const argument = getOutermostTypeOnlyWrapper(reference.identifier);

            return isHookArgument(argument, argument.parent);
        })
    );
}

function isRenderTimeUsage(identifier, sourceCode) {
    const parent = identifier.parent;

    if (parent?.type === 'Property' && parent.value === identifier && RENDER_TIME_OPTION_NAMES.has(getStaticName(parent.key, parent.computed)) && isHookOption(parent, sourceCode)) {
        return true;
    }

    if (parent?.type !== 'CallExpression' || !parent.arguments.includes(identifier)) {
        return false;
    }

    return matchesCalleeName(parent.callee, COMPONENT_WRAPPER_NAMES) || !!getRenderTimeArgumentIndices(parent.callee)?.has(parent.arguments.indexOf(identifier));
}

/** How the function can be referred to: `{declaration, name}` for a named function or variable, `{definition, classBody, key}` for a class member, `{definition, holder, key}` for a property of a `const` or `let` object, or null. */
function getFunctionBinding(functionNode, parent) {
    if (functionNode.type === 'FunctionDeclaration' && functionNode.id?.type === 'Identifier') {
        return {declaration: functionNode, name: functionNode.id.name};
    }

    if (parent?.type === 'VariableDeclarator' && parent.init === functionNode && parent.id.type === 'Identifier') {
        return {declaration: parent, name: parent.id.name};
    }

    const key = parent && parent.value === functionNode ? getStaticName(parent.key, parent.computed) : null;

    if (!key) {
        return null;
    }

    if (parent.type === 'PropertyDefinition' || parent.type === 'MethodDefinition') {
        return {definition: parent, classBody: parent.parent, key};
    }

    const holder = parent.type === 'Property' ? parent.parent.parent : null;

    if (holder?.type === 'VariableDeclarator' && holder.init === parent.parent && holder.id.type === 'Identifier' && (holder.parent.kind === 'const' || holder.parent.kind === 'let')) {
        return {definition: parent, holder: {declaration: holder, name: holder.id.name}, key};
    }

    return null;
}

function getReadIdentifiers(declaration, boundName, sourceCode) {
    const variable = getDeclaredVariable(declaration, boundName, sourceCode);

    return variable ? variable.references.filter((reference) => reference.isRead()).map((reference) => reference.identifier) : [];
}

function isNamedMember(node, key) {
    return node?.type === 'MemberExpression' && getStaticName(node.property, node.computed) === key;
}

/** Collects the `this.key` uses inside `classBody` into `uses`. Skips nested non-arrow functions and classes, which rebind `this`, but still enters the methods of `classBody`. */
function collectThisMemberUses(node, classBody, key, sourceCode, uses) {
    if (isNamedMember(node, key) && node.object.type === 'ThisExpression') {
        uses.push(node);
    }

    const rebindsThis = (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') && node.parent?.parent !== classBody;

    if (rebindsThis || (node.type === 'ClassBody' && node !== classBody)) {
        return;
    }

    for (const childKey of sourceCode.visitorKeys[node.type] ?? []) {
        for (const child of [node[childKey]].flat()) {
            if (child) {
                collectThisMemberUses(child, classBody, key, sourceCode, uses);
            }
        }
    }
}

/** Every place the bound function is referred to: a read of its variable, `holder.key`, or `this.key` inside its class. */
function getBindingUses(binding, sourceCode, seen) {
    const seenKey = binding.definition ?? getDeclaredVariable(binding.declaration, binding.name, sourceCode);

    if (!seenKey || seen.has(seenKey)) {
        return [];
    }

    seen.add(seenKey);

    if (binding.classBody) {
        const uses = [];
        collectThisMemberUses(binding.classBody, binding.classBody, binding.key, sourceCode, uses);
        return uses;
    }

    if (binding.holder) {
        return getReadIdentifiers(binding.holder.declaration, binding.holder.name, sourceCode)
            .map((identifier) => identifier.parent)
            .filter((member) => isNamedMember(member, binding.key));
    }

    return getReadIdentifiers(binding.declaration, binding.name, sourceCode);
}

/** The `run` binding of `const run = useCallback(load, [])` or `const run = useEffectEvent(load)`, which names the same function as `load`, or null. */
function getCallbackHookAlias(node) {
    const call = node.parent;
    const declarator = call?.parent;

    if (call?.type !== 'CallExpression' || call.arguments.at(0) !== node || !matchesCalleeName(call.callee, CALLBACK_HOOK_NAMES)) {
        return null;
    }

    return declarator?.type === 'VariableDeclarator' && declarator.init === call && declarator.id.type === 'Identifier' ? {declaration: declarator, name: declarator.id.name} : null;
}

/** The binding of another name for the same function, from `const run = load` or a callback hook wrapping `load`, or null. */
function getAliasBinding(use) {
    const parent = use.parent;

    if (parent?.type === 'VariableDeclarator' && parent.init === use && parent.id.type === 'Identifier') {
        return {declaration: parent, name: parent.id.name};
    }

    return getCallbackHookAlias(use);
}

/**
 * RENDER or MODULE_SCOPE when some use of the bound function runs it there, otherwise null. A use counts when it is a
 * render-time slot, or a call, synchronous array callback or Promise executor that sits in a render body or at module
 * scope, or an alias used in one of those ways. `classifyCall` runs classifyPosition on a call site; it is passed in
 * because classifyPosition also calls this function.
 */
function getEscalatedPosition(binding, sourceCode, seen, classifyCall) {
    for (const use of getBindingUses(binding, sourceCode, seen)) {
        if (isRenderTimeUsage(use, sourceCode)) {
            return RENDER;
        }

        const parent = use.parent;

        // `const value = helper();` written in a render body or at module scope runs the helper right there
        if (parent?.type === 'CallExpression' && parent.callee === use) {
            const position = classifyCall(parent);

            if (position === RENDER || position === MODULE_SCOPE) {
                return position;
            }

            continue;
        }

        // `ids.map(helper)` or `new Promise(helper)` runs the helper where that call runs; a timer or `.then` defers it
        const isSynchronousCallback =
            parent?.type === 'CallExpression' &&
            parent.arguments.includes(use) &&
            parent.callee.type === 'MemberExpression' &&
            matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS);
        const isExecutor = parent?.type === 'NewExpression' && parent.arguments.at(0) === use && matchesCalleeName(parent.callee, SYNCHRONOUS_EXECUTOR_NAMES);

        if (isSynchronousCallback || isExecutor) {
            const position = classifyCall(parent);

            if (position === RENDER || position === MODULE_SCOPE) {
                return position;
            }

            continue;
        }

        const alias = getAliasBinding(use);
        const position = alias ? getEscalatedPosition(alias, sourceCode, seen, classifyCall) : null;

        if (position) {
            return position;
        }
    }

    return null;
}

function isEffectHookCallbackArgument(call, argument) {
    const calleeName = getCalleeName(call.callee);

    return !!calleeName && EFFECT_HOOK_CALLBACK_INDICES.get(calleeName) === call.arguments.indexOf(argument);
}

/** True for an effect hook callback, passed directly as in `useEffect(fn)` or through `useEffect(useCallback(fn, []))`. */
function isEffectCallback(functionNode, parent, grandparent) {
    if (parent?.type !== 'CallExpression' || !parent.arguments.includes(functionNode)) {
        return false;
    }

    if (isEffectHookCallbackArgument(parent, functionNode)) {
        return true;
    }

    return (
        parent.arguments.at(0) === functionNode &&
        matchesCalleeName(parent.callee, CALLBACK_HOOK_NAMES) &&
        grandparent?.type === 'CallExpression' &&
        isEffectHookCallbackArgument(grandparent, parent)
    );
}

/** True for a function the enclosing one returns: `return () => {...}`, or an arrow whose body is the function. */
function isReturnedFunction(functionNode, parent) {
    return parent?.type === 'ReturnStatement' || (isFunctionNode(parent) && parent.body === functionNode);
}

/** The `read` binding of `const read = useMemo(() => () => Onyx.get(key), [])`, for the function the factory returns, or null. */
function getMemoizedFunctionBinding(functionNode, parent) {
    if (!isReturnedFunction(functionNode, parent)) {
        return null;
    }

    let factory = parent;

    while (factory && !isFunctionNode(factory)) {
        factory = factory.parent;
    }

    const call = factory?.parent;
    const declarator = call?.parent;

    if (call?.type !== 'CallExpression' || call.arguments.at(0) !== factory || getCalleeName(call.callee) !== 'useMemo') {
        return null;
    }

    return declarator?.type === 'VariableDeclarator' && declarator.init === call && declarator.id.type === 'Identifier' ? {declaration: declarator, name: declarator.id.name} : null;
}

function getHandlerBinding(functionNode, parent) {
    const binding = getFunctionBinding(functionNode, parent);

    return binding ?? getCallbackHookAlias(functionNode);
}

/** True when the function runs with the code around it: called at once, a synchronous array callback or a Promise executor. For the effect search, a callback passed to `.then()`, `setTimeout()` or another EFFECT_CONTINUATION_NAMES call counts too. */
function runsWithEnclosingCode(functionNode, parent) {
    if (parent?.type === 'NewExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_EXECUTOR_NAMES)) {
        return true;
    }

    if (parent?.type !== 'CallExpression') {
        return false;
    }

    if (parent.callee === functionNode) {
        return true;
    }

    return (
        parent.arguments.includes(functionNode) &&
        (matchesCalleeName(parent.callee, EFFECT_CONTINUATION_NAMES) || (parent.callee.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS)))
    );
}

/** True when the read at the innermost ancestor runs inside an effect callback or its cleanup, or in a named handler, possibly through aliases, that an effect calls. */
function isReachedFromEffect(ancestors, fromIndex, sourceCode, seen) {
    function isHandlerInvokedFromEffect(binding) {
        return getBindingUses(binding, sourceCode, seen).some((use) => {
            const parent = use.parent;

            if (parent?.type === 'CallExpression' && parent.arguments.includes(use) && isEffectCallback(use, parent, parent.parent)) {
                return true;
            }

            const alias = getAliasBinding(use);

            if (alias) {
                return isHandlerInvokedFromEffect(alias);
            }

            const isCalled = parent?.type === 'CallExpression' && parent.callee === use;

            if (!isCalled && !runsWithEnclosingCode(use, parent)) {
                return false;
            }

            const referenceAncestors = sourceCode.getAncestors(use);

            return isReachedFromEffect(referenceAncestors, referenceAncestors.length - 1, sourceCode, seen);
        });
    }

    for (let index = fromIndex; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (!isFunctionNode(ancestor)) {
            continue;
        }

        const parent = ancestors[index - 1] ?? null;
        const grandparent = ancestors[index - 2] ?? null;

        if (isEffectCallback(ancestor, parent, grandparent)) {
            return true;
        }

        const binding = getHandlerBinding(ancestor, parent);

        if (binding) {
            return isHandlerInvokedFromEffect(binding);
        }

        // A function returned from an effect callback is its cleanup, which React runs from the effect too; a function
        // returned from anything else is a value whose call site decides
        if (isReturnedFunction(ancestor, parent)) {
            const memoized = getMemoizedFunctionBinding(ancestor, parent);

            if (memoized) {
                return isHandlerInvokedFromEffect(memoized);
            }

            const enclosingIndex = ancestors.findLastIndex((candidate, candidateIndex) => candidateIndex < index && isFunctionNode(candidate));

            return enclosingIndex !== -1 && isEffectCallback(ancestors[enclosingIndex], ancestors[enclosingIndex - 1] ?? null, ancestors[enclosingIndex - 2] ?? null);
        }

        if (!runsWithEnclosingCode(ancestor, parent)) {
            return false;
        }
    }

    return false;
}

/** True for a file under the allowed directories or listed in READ_ALLOWED_FILES. Also true for a file the rule cannot place in the repo. */
function isReadAllowedInFile(filename) {
    const relativePath = getRepoRelativePath(filename);

    if (!relativePath) {
        return true;
    }

    return READ_ALLOWED_DIRECTORIES.some((directory) => relativePath.startsWith(directory)) || READ_ALLOWED_FILES.has(relativePath);
}

/** True for a file under `src/components`, `src/pages` or `src/hooks`, where a read must sit inside a component or hook. Test suites are exempt, because their reads sit in module-level `it` blocks. */
function requiresComponentOrHookScope(filename) {
    const relativePath = getRepoRelativePath(filename);

    return !!relativePath && !relativePath.startsWith(TESTS_DIRECTORY) && READ_ALLOWED_DIRECTORIES.some((directory) => relativePath.startsWith(directory));
}

/** True when some enclosing function is named like a component or hook. The function memo() or forwardRef() wraps counts too. */
function isInsideComponentOrHook(ancestors) {
    return ancestors.some((ancestor, index) => {
        if (!isFunctionNode(ancestor)) {
            return false;
        }

        const parent = ancestors[index - 1] ?? null;

        if (isComponentOrHookName(getFunctionName(ancestor, parent))) {
            return true;
        }

        return parent?.type === 'CallExpression' && parent.arguments.at(0) === ancestor && matchesCalleeName(parent.callee, COMPONENT_WRAPPER_NAMES);
    });
}

/**
 * How the function a read sits in is run. RENDER and MODULE_SCOPE are final. SYNCHRONOUS means it runs with the
 * enclosing code, so the caller keeps walking outward. DEFERRED means a handler or other later callback. `classifyCall`
 * runs classifyPosition on a call site, so getEscalatedPosition can classify where a helper is called.
 */
function classifyFunctionBoundary(functionNode, parent, sourceCode, seen, classifyCall) {
    if (parent?.type === 'Property' && parent.value === functionNode && RENDER_TIME_OPTION_NAMES.has(getStaticName(parent.key, parent.computed)) && isHookOption(parent, sourceCode)) {
        return RENDER;
    }

    if (parent?.type === 'NewExpression' && parent.arguments.at(0) === functionNode && matchesCalleeName(parent.callee, SYNCHRONOUS_EXECUTOR_NAMES)) {
        return SYNCHRONOUS;
    }

    if (parent?.type === 'CallExpression') {
        if (parent.callee === functionNode) {
            return SYNCHRONOUS;
        }

        if (parent.arguments.includes(functionNode)) {
            if (matchesCalleeName(parent.callee, COMPONENT_WRAPPER_NAMES)) {
                return RENDER;
            }

            if (getRenderTimeArgumentIndices(parent.callee)?.has(parent.arguments.indexOf(functionNode))) {
                return RENDER;
            }

            if (parent.callee.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS)) {
                return SYNCHRONOUS;
            }

            // `const read = useCallback(() => Onyx.get(key), []); read();` in a render body
            const handler = getHandlerBinding(functionNode, parent);

            return (handler && getEscalatedPosition(handler, sourceCode, seen, classifyCall)) ?? (returnsJSX(functionNode) ? RENDER : DEFERRED);
        }
    }

    const binding = getFunctionBinding(functionNode, parent) ?? getMemoizedFunctionBinding(functionNode, parent);
    const escalated = binding ? getEscalatedPosition(binding, sourceCode, seen, classifyCall) : null;

    if (escalated) {
        return escalated;
    }

    if (isComponentOrHookName(getFunctionName(functionNode, parent))) {
        return RENDER;
    }

    return returnsJSX(functionNode) ? RENDER : DEFERRED;
}

/**
 * Where a read with these `ancestors` runs: RENDER, MODULE_SCOPE, EFFECT or EVENT. With `skipEffectCheck`, a deferred
 * position returns EVENT without the effect search. Helper call sites only need to know whether they are RENDER or
 * MODULE_SCOPE, and the search would otherwise repeat for every call site.
 */
function classifyPosition(ancestors, sourceCode, seen = new Set(), skipEffectCheck = false) {
    const classifyCall = (call) => classifyPosition(sourceCode.getAncestors(call), sourceCode, seen, true);
    let sawJSXExpression = false;

    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (ancestor.type === 'JSXExpressionContainer') {
            sawJSXExpression = true;
            continue;
        }

        if (!isFunctionNode(ancestor)) {
            continue;
        }

        if (sawJSXExpression) {
            return RENDER;
        }

        const disposition = classifyFunctionBoundary(ancestor, ancestors[index - 1] ?? null, sourceCode, seen, classifyCall);

        if (disposition === DEFERRED) {
            return !skipEffectCheck && isReachedFromEffect(ancestors, index, sourceCode, new Set()) ? EFFECT : EVENT;
        }

        if (disposition === RENDER || disposition === MODULE_SCOPE) {
            return disposition;
        }
    }

    return MODULE_SCOPE;
}

/**
 * True when `value` is assigned, with any operator, to the Onyx property of window or globalThis, as in
 * `window.Onyx = Onyx`, `window['Onyx'] = Onyx` or `(window as WindowWithOnyx).Onyx = Onyx as typeof Onyx & {...}`.
 * That exposes the library to the dev console, and the rule allows it in every file because it does not hide a read.
 */
function isDevConsoleExposure(value) {
    const assignment = value.parent;

    if (assignment?.type !== 'AssignmentExpression' || assignment.right !== value || assignment.left.type !== 'MemberExpression') {
        return false;
    }

    const target = unwrapTypeOnlyExpressions(assignment.left.object);

    return target.type === 'Identifier' && DEV_CONSOLE_GLOBALS.has(target.name) && getStaticName(assignment.left.property, assignment.left.computed) === DEV_CONSOLE_PROPERTY;
}

function isObjectValueUse(reference, getReferencedReadMethod) {
    const identifier = reference.identifier;

    // Type-only references, `typeof Onyx` and `typeof Onyx.get` read nothing at runtime. @typescript-eslint/scope-manager
    // marks the reference in `export {Onyx}` as both type and value (referenceDualValueType in ExportVisitor), so the
    // isValueReference check keeps it reported. eslint-scope, used with espree, sets neither flag.
    if ((reference.isTypeReference && !reference.isValueReference) || identifier.parent?.type === 'TSTypeQuery' || identifier.parent?.type === 'TSQualifiedName') {
        return false;
    }

    const value = getOutermostTypeOnlyWrapper(identifier);
    const parent = value.parent;

    // A member access, a runtime `typeof Onyx` and the dev console exposure do not hand the object to other code
    if ((parent?.type === 'MemberExpression' && parent.object === value) || (parent?.type === 'UnaryExpression' && parent.operator === 'typeof') || isDevConsoleExposure(value)) {
        return false;
    }

    // `const {get} = Onyx` is reported on the destructured property instead, unless a `...rest` element also takes the other methods
    return !(
        parent?.type === 'VariableDeclarator' &&
        parent.init === value &&
        parent.id.type === 'ObjectPattern' &&
        parent.id.properties.some((property) => getReferencedReadMethod(property)) &&
        !parent.id.properties.some((property) => property.type === 'RestElement')
    );
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const filename = context.filename ?? context.getFilename();
    const shouldCheckComponentOrHookScope = requiresComponentOrHookScope(filename);
    const {getCalledReadMethod, getReferencedReadMethod, isOnyxObjectExpression} = createOnyxReadTracker(sourceCode);
    const relativePath = getRepoRelativePath(filename);
    const shouldCheckObjectValueUses = !TEST_INFRASTRUCTURE_DIRECTORIES.some((directory) => relativePath?.startsWith(directory));

    // Reported in every file, since the path check below only sees direct calls
    function reportReference(node) {
        if (!getReferencedReadMethod(node)) {
            return;
        }

        context.report({node, messageId: 'noOnyxReadByReference'});
    }

    return {
        MemberExpression(node) {
            // `Onyx[method]` with a key no rule can resolve may name a read method
            if (node.computed && getStaticName(node.property, true) === null && isOnyxObjectExpression(node.object, false)) {
                context.report({node, messageId: 'noOnyxReadByReference'});
                return;
            }

            const callee = getOutermostTypeOnlyWrapper(node);

            if (callee.parent?.type === 'CallExpression' && callee.parent.callee === callee) {
                return;
            }

            reportReference(node);
        },
        'ObjectPattern > Property': reportReference,
        // Walks the import's references through scope analysis, so a local that shadows the import is not reported
        ImportDeclaration(node) {
            if (!shouldCheckObjectValueUses || node.source.value !== ONYX_MODULE || node.importKind === 'type') {
                return;
            }

            for (const variable of sourceCode.getDeclaredVariables(node)) {
                const specifierType = variable.defs.at(0)?.node.type;

                if (specifierType !== 'ImportDefaultSpecifier' && specifierType !== 'ImportNamespaceSpecifier') {
                    continue;
                }

                for (const reference of variable.references) {
                    if (isObjectValueUse(reference, getReferencedReadMethod)) {
                        context.report({node: reference.identifier, messageId: 'noOnyxObjectAsValue'});
                    }
                }
            }
        },
        // `export {default as Store} from 'react-native-onyx'` hands out the Onyx object under another name
        ExportNamedDeclaration(node) {
            if (!shouldCheckObjectValueUses || node.source?.value !== ONYX_MODULE || node.exportKind === 'type') {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.exportKind !== 'type' && getStaticName(specifier.local, false) === 'default') {
                    context.report({node: specifier, messageId: 'noOnyxObjectAsValue'});
                }
            }
        },
        // So does `export * as Store from 'react-native-onyx'`, while a bare `export *` leaves the default export out
        ExportAllDeclaration(node) {
            if (!shouldCheckObjectValueUses || !node.exported || node.source.value !== ONYX_MODULE || node.exportKind === 'type') {
                return;
            }

            context.report({node, messageId: 'noOnyxObjectAsValue'});
        },
        CallExpression(node) {
            if (!getCalledReadMethod(node.callee)) {
                return;
            }

            if (!isReadAllowedInFile(filename)) {
                context.report({node, messageId: 'noOnyxReadOutsideAllowedPath'});
                return;
            }

            const ancestors = sourceCode.getAncestors(node);
            const position = classifyPosition(ancestors, sourceCode);

            if (position === MODULE_SCOPE) {
                context.report({node, messageId: 'noOnyxReadAtModuleScope'});
                return;
            }

            if (position === RENDER) {
                context.report({node, messageId: 'noOnyxReadInRender'});
                return;
            }

            if (position === EFFECT) {
                context.report({node, messageId: 'noOnyxReadInEffect'});
                return;
            }

            if (shouldCheckComponentOrHookScope && !isInsideComponentOrHook(ancestors)) {
                context.report({node, messageId: 'noOnyxReadOutsideComponentOrHook'});
            }
        },
    };
}

export {name, meta, create};
