// Node ESM needs the extension to load a rule's helper module
// eslint-disable-next-line import/extensions
import {createOnyxReadTracker, getCalleeName, getDeclaredVariable, getRepoRelativePath, getStaticName, matchesCalleeName, TYPE_ONLY_EXPRESSIONS} from './utils/onyxReadUtils.js';

const name = 'no-unsafe-onyx-read';

const READ_ALLOWED_DIRECTORIES = ['src/components/', 'src/pages/', 'src/hooks/', 'tests/'];

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
]);

const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

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
            'Disallow Onyx.get and Onyx.multiGet outside components, pages, hooks and tests, during render, inside effects or at module scope. no-onyx-get-snapshot-key checks which keys they read.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxReadInRender:
            'Do not read Onyx during render. Onyx.get() and Onyx.multiGet() are one-shot reads that never subscribe, so a value they return while rendering does not re-render the component when that key changes and the UI can show stale data indefinitely. A component cannot await it either, so reaching it from render means use() or .then(), both of which read without subscribing.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve Onyx.get() and Onyx.multiGet() for code that runs on an event: event handlers and useCallback bodies.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. A module body runs at import time and cannot await, so the value can only be parked in a module variable through .then(), where it is a one-shot snapshot that never updates when the key changes.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time and reads the current value. If the module genuinely needs to track a key, subscribe with Onyx.connectWithoutView() instead of caching one read.',
        noOnyxReadOutsideAllowedPath:
            'Onyx.get() and Onyx.multiGet() are only allowed in src/components, src/pages, src/hooks and tests.\n\n' +
            'Elsewhere, take the value as a parameter or keep the Onyx.connectWithoutView() subscription. A file joins READ_ALLOWED_FILES only in a PR that removes an Onyx.connectWithoutView() from it.',
        noOnyxReadInEffect:
            'Do not read Onyx inside an effect, or in a function an effect calls. When the value was in the effect dependency array, the useOnyx subscription is what re-runs the effect, and a one-shot read stops that.\n\n' +
            'Keep the useOnyx subscription. Reads inside effects stay banned until a check can confirm the value was not in the dependency array.',
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

function getFunctionName(functionNode, parent) {
    if (functionNode.id?.type === 'Identifier') {
        return functionNode.id.name;
    }

    if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
        return parent.id.name;
    }

    if (parent?.type === 'Property' && !parent.computed && parent.key?.type === 'Identifier') {
        return parent.key.name;
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

function isHookArgument(node, call) {
    if (call?.type !== 'CallExpression' || !call.arguments.includes(node)) {
        return false;
    }

    const calleeName = getCalleeName(call.callee);

    return !!calleeName && isHookName(calleeName);
}

// `useOnyx(key, {selector})` inline, or `const options = {selector}; useOnyx(key, options)`
function isHookOption(property, sourceCode) {
    const options = property.parent;

    if (isHookArgument(options, options?.parent)) {
        return true;
    }

    // `const options = {selector} as const` wraps the object before the declarator
    let holder = options;

    while (holder?.parent && TYPE_ONLY_EXPRESSIONS.has(holder.parent.type)) {
        holder = holder.parent;
    }

    const declarator = holder?.parent;

    if (declarator?.type !== 'VariableDeclarator' || declarator.init !== holder || declarator.id.type !== 'Identifier') {
        return false;
    }

    const variable = getDeclaredVariable(declarator, declarator.id.name, sourceCode);

    return !!variable && variable.references.some((reference) => isHookArgument(reference.identifier, reference.identifier.parent));
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

    return null;
}

/**
 * RENDER or MODULE_SCOPE when some reference to the bound function runs it there (a render slot, a call written in a
 * render body or at module scope, or an alias used that way), otherwise null. `classifyCall` is injected from
 * classifyPosition, which this recursion feeds back into for the call sites.
 */
function getEscalatedPosition(declaration, boundName, sourceCode, seen, classifyCall) {
    const variable = getDeclaredVariable(declaration, boundName, sourceCode);

    if (!variable || seen.has(variable)) {
        return null;
    }

    seen.add(variable);

    for (const reference of variable.references) {
        const identifier = reference.identifier;

        if (isRenderTimeUsage(identifier, sourceCode)) {
            return RENDER;
        }

        const parent = identifier.parent;

        // `const value = helper();` written in a render body or at module scope runs the helper right there
        if (parent?.type === 'CallExpression' && parent.callee === identifier) {
            const position = classifyCall(parent);

            if (position === RENDER || position === MODULE_SCOPE) {
                return position;
            }

            continue;
        }

        if (parent?.type === 'VariableDeclarator' && parent.init === identifier && parent.id.type === 'Identifier') {
            const position = getEscalatedPosition(parent, parent.id.name, sourceCode, seen, classifyCall);

            if (position) {
                return position;
            }
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

function getHandlerBinding(functionNode, parent, grandparent) {
    const binding = getFunctionBinding(functionNode, parent);

    if (binding) {
        return binding;
    }

    if (
        parent?.type === 'CallExpression' &&
        parent.arguments.at(0) === functionNode &&
        matchesCalleeName(parent.callee, CALLBACK_HOOK_NAMES) &&
        grandparent?.type === 'VariableDeclarator' &&
        grandparent.init === parent &&
        grandparent.id.type === 'Identifier'
    ) {
        return {declaration: grandparent, name: grandparent.id.name};
    }

    return null;
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
        const variable = getDeclaredVariable(binding.declaration, binding.name, sourceCode);

        if (!variable || seen.has(variable)) {
            return false;
        }

        seen.add(variable);

        return variable.references.some((reference) => {
            if (!reference.isRead()) {
                return false;
            }

            const identifier = reference.identifier;
            const parent = identifier.parent;

            if (parent?.type === 'CallExpression' && parent.arguments.includes(identifier) && isEffectCallback(identifier, parent, parent.parent)) {
                return true;
            }

            if (parent?.type === 'VariableDeclarator' && parent.init === identifier && parent.id.type === 'Identifier') {
                return isHandlerInvokedFromEffect({declaration: parent, name: parent.id.name});
            }

            const isCalled = parent?.type === 'CallExpression' && parent.callee === identifier;

            if (!isCalled && !runsWithEnclosingCode(identifier, parent)) {
                return false;
            }

            const referenceAncestors = sourceCode.getAncestors(identifier);

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

        const binding = getHandlerBinding(ancestor, parent, grandparent);

        if (binding) {
            return isHandlerInvokedFromEffect(binding);
        }

        // A function returned from an effect callback is its cleanup, which React runs from the effect too; a function
        // returned from anything else is a value whose call site decides
        if (isReturnedFunction(ancestor, parent)) {
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

// `classifyCall` comes from classifyPosition, which this function and getEscalatedPosition recurse into for a helper's call sites
function classifyFunctionBoundary(functionNode, parent, grandparent, sourceCode, seen, classifyCall) {
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
            const handler = getHandlerBinding(functionNode, parent, grandparent);

            return (handler && getEscalatedPosition(handler.declaration, handler.name, sourceCode, seen, classifyCall)) ?? DEFERRED;
        }
    }

    const binding = getFunctionBinding(functionNode, parent);
    const escalated = binding ? getEscalatedPosition(binding.declaration, binding.name, sourceCode, seen, classifyCall) : null;

    if (escalated) {
        return escalated;
    }

    const functionName = getFunctionName(functionNode, parent);

    if (functionName && (isHookName(functionName) || isComponentName(functionName))) {
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

        const disposition = classifyFunctionBoundary(ancestor, ancestors[index - 1] ?? null, ancestors[index - 2] ?? null, sourceCode, seen, classifyCall);

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
    const {getCalledReadMethod} = createOnyxReadTracker(sourceCode);

    return {
        CallExpression(node) {
            if (!getCalledReadMethod(node.callee)) {
                return;
            }

            if (!isReadAllowedInFile(filename)) {
                context.report({node, messageId: 'noOnyxReadOutsideAllowedPath'});
                return;
            }

            const position = classifyPosition(sourceCode.getAncestors(node), sourceCode);

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
            }
        },
    };
}

export {name, meta, create};
