// Node ESM needs the extension to load a rule's helper module
// eslint-disable-next-line import/extensions
import {createOnyxReadTracker, getCalleeName, getDeclaredVariable, getRepoRelativePath, getStaticName, matchesCalleeName, TYPE_ONLY_EXPRESSIONS} from './utils/onyxReadUtils.js';

const name = 'no-unsafe-onyx-read';

const TESTS_DIRECTORY = 'tests/';

const READ_ALLOWED_DIRECTORIES = ['src/components/', 'src/pages/', 'src/hooks/', TESTS_DIRECTORY];

const READ_ALLOWED_FILES = new Set([]);

// Hooks whose callback React runs at commit, with the argument index that callback sits at
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
            'Disallow Onyx.get and Onyx.multiGet outside components, pages, hooks and tests, outside a component or hook body in those source directories, during render, inside effects or at module scope. no-onyx-get-snapshot-key checks which keys they read.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxReadInRender:
            'Do not read Onyx during render. Onyx.get() and Onyx.multiGet() are one-shot reads that never subscribe, so a value they return while rendering does not re-render the component when that key changes and the UI can show stale data indefinitely. A component cannot await it either, so reaching it from render means use() or .then(), both of which read without subscribing.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve Onyx.get() and Onyx.multiGet() for event handlers that render never calls.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. A module body runs at import time and cannot await, so the value can only be parked in a module variable through .then(), where it is a one-shot snapshot that never updates when the key changes.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time and reads the current value. If the module genuinely needs to track a key, subscribe with Onyx.connectWithoutView() instead of caching one read.',
        noOnyxReadOutsideAllowedPath:
            'Onyx.get() and Onyx.multiGet() are only allowed in src/components, src/pages, src/hooks and tests.\n\n' +
            'Elsewhere, take the value as a parameter or keep the Onyx.connectWithoutView() subscription. Reviewers accept a new READ_ALLOWED_FILES entry only in a PR that removes an Onyx.connectWithoutView() from that file.',
        noOnyxReadInEffect:
            'Do not read Onyx inside an effect, or in a function an effect calls. When the value was in the effect dependency array, the useOnyx subscription is what re-runs the effect, and a one-shot read stops that.\n\n' +
            'Keep the useOnyx subscription. Reads inside effects stay banned until a check can confirm the value was not in the dependency array.',
        noOnyxReadOutsideComponentOrHook:
            'Call Onyx.get() and Onyx.multiGet() inside the component or hook that needs the value, or in a handler defined inside it. A module-level helper here can be imported from src/libs, which is where these reads are banned.\n\n' +
            'Take the value as a parameter instead.',
        noOnyxReadByReference:
            'Call Onyx.get() and Onyx.multiGet() directly. A reference that is not a direct call (Onyx.get.call, Onyx.get.bind, keys.map(Onyx.get), const read = Onyx.get, const {get} = Onyx) hides the key from no-onyx-get-snapshot-key and the call site from this rule.',
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

// Only an own id or a variable binding names a component or hook; an object key such as `APPROVE` or `Enter` does not
function getFunctionName(functionNode, parent) {
    if (functionNode.id?.type === 'Identifier') {
        return functionNode.id.name;
    }

    if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return parent.id.name;
    }

    return null;
}

// JSX written directly, or behind `cond ? <A /> : null`, `cond && <A />` or a TS wrapper
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

// The outermost of `node` and the TS casts around it, so `{...} as const` or `options as X` is the argument itself
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

// `useOnyx(key, {selector})` inline, or `const options = {selector}; useOnyx(key, options)`, with TS casts on either side
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

// A nested non-arrow function or class rebinds `this`, but a member of this class is called on the instance
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

// The expressions that evaluate to the bound function: a read of its variable, `holder.key`, or `this.key` inside its class
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

// `const run = useCallback(load, [])` or `useEffectEvent(load)` makes `run` another name for `load`
function getCallbackHookAlias(node) {
    const call = node.parent;
    const declarator = call?.parent;

    if (call?.type !== 'CallExpression' || call.arguments.at(0) !== node || !matchesCalleeName(call.callee, CALLBACK_HOOK_NAMES)) {
        return null;
    }

    return declarator?.type === 'VariableDeclarator' && declarator.init === call && declarator.id.type === 'Identifier' ? {declaration: declarator, name: declarator.id.name} : null;
}

// `const run = load` or a callback hook wrapping `load` binds another name to the same function
function getAliasBinding(use) {
    const parent = use.parent;

    if (parent?.type === 'VariableDeclarator' && parent.init === use && parent.id.type === 'Identifier') {
        return {declaration: parent, name: parent.id.name};
    }

    return getCallbackHookAlias(use);
}

/**
 * RENDER or MODULE_SCOPE when some reference to the bound function runs it there (a render slot, a call, synchronous
 * array callback or Promise executor written in a render body or at module scope, or an alias used that way), otherwise null. `classifyCall` is injected from
 * classifyPosition, which this recursion feeds back into for the call sites.
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

// A function the enclosing one returns: `return () => {...}` or an arrow whose body is the function
function isReturnedFunction(functionNode, parent) {
    return parent?.type === 'ReturnStatement' || (isFunctionNode(parent) && parent.body === functionNode);
}

// `const read = useMemo(() => () => Onyx.get(key), [])` binds `read` to the function the factory returns
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

function isReadAllowedInFile(filename) {
    const relativePath = getRepoRelativePath(filename);

    if (!relativePath) {
        return true;
    }

    return READ_ALLOWED_DIRECTORIES.some((directory) => relativePath.startsWith(directory)) || READ_ALLOWED_FILES.has(relativePath);
}

// Suites read at module level in `it` blocks, so only the allowed source directories need the read inside a component or hook
function requiresComponentOrHookScope(filename) {
    const relativePath = getRepoRelativePath(filename);

    return !!relativePath && !relativePath.startsWith(TESTS_DIRECTORY) && READ_ALLOWED_DIRECTORIES.some((directory) => relativePath.startsWith(directory));
}

// A component or hook by name, or the function memo() or forwardRef() wraps, or any function nested in one
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

// `classifyCall` comes from classifyPosition, which this function and getEscalatedPosition recurse into for a helper's call sites
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
 * Where a read at the innermost of `ancestors` runs. With `skipEffectCheck`, a deferred position is reported as EVENT
 * without looking for an effect: the helper call sites only need to know whether they are RENDER or MODULE_SCOPE, and
 * the effect search would otherwise repeat for every call site.
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

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const filename = context.filename ?? context.getFilename();
    const shouldCheckComponentOrHookScope = requiresComponentOrHookScope(filename);
    const {getCalledReadMethod, getReferencedReadMethod} = createOnyxReadTracker(sourceCode);

    // Reported in every file, since the path check below only sees direct calls
    function reportReference(node) {
        if (!getReferencedReadMethod(node)) {
            return;
        }

        context.report({node, messageId: 'noOnyxReadByReference'});
    }

    return {
        MemberExpression(node) {
            const callee = getOutermostTypeOnlyWrapper(node);

            if (callee.parent?.type === 'CallExpression' && callee.parent.callee === callee) {
                return;
            }

            reportReference(node);
        },
        'ObjectPattern > Property': reportReference,
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
