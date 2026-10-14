// Node ESM needs the extension to load a rule's helper module
// eslint-disable-next-line import/extensions
import {createOnyxReadTracker, getCalleeName, getRepoRelativePath, getStaticName, matchesCalleeName} from './utils/onyxReadUtils.js';

const name = 'no-unsafe-onyx-read';

const READ_ALLOWED_DIRECTORIES = ['src/components/', 'src/pages/', 'src/hooks/', 'tests/'];

const READ_ALLOWED_FILES = new Set([]);

const EFFECT_HOOK_NAMES = new Set(['useEffect', 'useLayoutEffect', 'useInsertionEffect', 'useFocusEffect']);

const CALLBACK_HOOK_NAMES = new Set(['useCallback']);

// Hooks whose dependency list may name the useSnapshotOnyxGet() reader without calling it
const DEPENDENCY_LIST_HOOK_NAMES = new Set([...EFFECT_HOOK_NAMES, ...CALLBACK_HOOK_NAMES, 'useMemo', 'useImperativeHandle']);

const EFFECT_CONTINUATION_NAMES = new Set(['then', 'catch', 'finally', 'setTimeout', 'requestAnimationFrame', 'queueMicrotask', 'runAfterInteractions', 'runAfterTransitions']);

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
            'Disallow unsafe Onyx reads: Onyx.get or Onyx.multiGet outside components, pages, hooks and tests, during render, inside effects or at module scope, and the useSnapshotOnyxGet() reader after it leaves the component. no-onyx-get-snapshot-key checks which keys are read.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxGetInRender:
            'Do not read Onyx during render. Onyx.get() and Onyx.multiGet() are one-shot reads that never subscribes, so a value they return while rendering does not re-render the component when that key changes and the UI can show stale data indefinitely. A component cannot await it either, so reaching it from render means use() or .then(), both of which read without subscribing.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve Onyx.get() and Onyx.multiGet() for code that runs on an event: event handlers and useCallback bodies.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. A module body runs at import time and cannot await, so the value can only be parked in a module variable through .then(), where it is a one-shot snapshot that never updates when the key changes.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time and reads the current value. If the module genuinely needs to track a key, subscribe with Onyx.connectWithoutView() instead of caching one read.',
        noEscapingSnapshotReader:
            'Call the useSnapshotOnyxGet() reader only from this component, inside its event handlers. Do not pass it to another component or function, return it, or store it anywhere but a local variable: this rule cannot follow it there, so it cannot stop a call during render or in an effect.\n\n' +
            'Call useSnapshotOnyxGet() in the component or hook that handles the event, or pass down a handler that calls the reader.',
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

function returnsJSX(functionNode) {
    const body = functionNode.body;

    if (!body) {
        return false;
    }

    if (body.type === 'JSXElement' || body.type === 'JSXFragment') {
        return true;
    }

    if (body.type !== 'BlockStatement') {
        return false;
    }

    return body.body.some((statement) => statement.type === 'ReturnStatement' && (statement.argument?.type === 'JSXElement' || statement.argument?.type === 'JSXFragment'));
}

function getRenderTimeArgumentIndices(callee) {
    const calleeName = getCalleeName(callee);

    return calleeName ? (RENDER_TIME_HOOK_ARGUMENTS.get(calleeName) ?? null) : null;
}

function isHookOption(property) {
    const call = property.parent?.parent;

    if (call?.type !== 'CallExpression' || !call.arguments.includes(property.parent)) {
        return false;
    }

    const calleeName = getCalleeName(call.callee);

    return !!calleeName && isHookName(calleeName);
}

function isRenderTimeUsage(identifier) {
    const parent = identifier.parent;

    if (parent?.type === 'Property' && parent.value === identifier && RENDER_TIME_OPTION_NAMES.has(getStaticName(parent.key, parent.computed)) && isHookOption(parent)) {
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

function isReferencedAtRenderTime(declaration, boundName, sourceCode, seen = new Set()) {
    const variable = sourceCode.getDeclaredVariables(declaration).find((declaredVariable) => declaredVariable.name === boundName);

    if (!variable || seen.has(variable)) {
        return false;
    }

    seen.add(variable);

    return variable.references.some((reference) => {
        const identifier = reference.identifier;

        if (isRenderTimeUsage(identifier)) {
            return true;
        }

        const parent = identifier.parent;

        if (parent?.type !== 'VariableDeclarator' || parent.init !== identifier || parent.id.type !== 'Identifier') {
            return false;
        }

        return isReferencedAtRenderTime(parent, parent.id.name, sourceCode, seen);
    });
}

function isEffectCallback(functionNode, parent, grandparent) {
    if (parent?.type !== 'CallExpression' || parent.arguments.at(0) !== functionNode) {
        return false;
    }

    if (matchesCalleeName(parent.callee, EFFECT_HOOK_NAMES)) {
        return true;
    }

    return (
        matchesCalleeName(parent.callee, CALLBACK_HOOK_NAMES) &&
        grandparent?.type === 'CallExpression' &&
        grandparent.arguments.at(0) === parent &&
        matchesCalleeName(grandparent.callee, EFFECT_HOOK_NAMES)
    );
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
        const variable = sourceCode.getDeclaredVariables(binding.declaration).find((declaredVariable) => declaredVariable.name === binding.name);

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

            if (parent?.type === 'CallExpression' && parent.arguments.at(0) === identifier && isEffectCallback(identifier, parent, parent.parent)) {
                return true;
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

        if (!runsWithEnclosingCode(ancestor, parent)) {
            return false;
        }
    }

    return false;
}

function isReadAllowedInFile(filename) {
    const relativePath = getRepoRelativePath(filename);

    if (relativePath === null) {
        return true;
    }

    return READ_ALLOWED_DIRECTORIES.some((directory) => relativePath.startsWith(directory)) || READ_ALLOWED_FILES.has(relativePath);
}

function classifyFunctionBoundary(functionNode, parent, sourceCode) {
    if (parent?.type === 'Property' && parent.value === functionNode && RENDER_TIME_OPTION_NAMES.has(getStaticName(parent.key, parent.computed)) && isHookOption(parent)) {
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

            return DEFERRED;
        }
    }

    const binding = getFunctionBinding(functionNode, parent);

    if (binding && isReferencedAtRenderTime(binding.declaration, binding.name, sourceCode)) {
        return RENDER;
    }

    const functionName = getFunctionName(functionNode, parent);

    if (functionName && (isHookName(functionName) || isComponentName(functionName))) {
        return RENDER;
    }

    return returnsJSX(functionNode) ? RENDER : DEFERRED;
}

function classifyPosition(ancestors, sourceCode) {
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

        const disposition = classifyFunctionBoundary(ancestor, ancestors[index - 1] ?? null, sourceCode);

        if (disposition === DEFERRED) {
            return isReachedFromEffect(ancestors, index, sourceCode, new Set()) ? EFFECT : EVENT;
        }

        if (disposition === RENDER) {
            return RENDER;
        }
    }

    return MODULE_SCOPE;
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const filename = context.filename ?? context.getFilename();
    const {visitors, getCalledReadMethod, isSnapshotReaderHookCall, snapshotReaderVariables} = createOnyxReadTracker(sourceCode);

    // The reader may only be called, copied to another local variable, or listed as a hook dependency
    function isAllowedSnapshotReaderReference(identifier) {
        const parent = identifier.parent;

        if (parent.type === 'CallExpression') {
            return parent.callee === identifier;
        }

        if (parent.type === 'VariableDeclarator') {
            return parent.init === identifier && parent.id.type === 'Identifier';
        }

        if (parent.type === 'ArrayExpression') {
            const hookCall = parent.parent;
            return hookCall.type === 'CallExpression' && hookCall.arguments.includes(parent) && matchesCalleeName(hookCall.callee, DEPENDENCY_LIST_HOOK_NAMES);
        }

        return false;
    }

    return {
        ...visitors,
        CallExpression(node) {
            const scope = sourceCode.getScope(node);

            // useSnapshotOnyxGet() itself: its result must be bound to a variable or called on the spot
            if (isSnapshotReaderHookCall(node, scope)) {
                const parent = node.parent;
                const isBound = parent.type === 'VariableDeclarator' && parent.init === node && parent.id.type === 'Identifier';
                const isCalled = parent.type === 'CallExpression' && parent.callee === node;

                if (!isBound && !isCalled) {
                    context.report({node, messageId: 'noEscapingSnapshotReader'});
                }
                return;
            }

            if (!getCalledReadMethod(node.callee, scope)) {
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
                context.report({node, messageId: 'noOnyxGetInRender'});
                return;
            }

            if (position === EFFECT) {
                context.report({node, messageId: 'noOnyxReadInEffect'});
            }
        },
        'Program:exit': function () {
            for (const variable of snapshotReaderVariables) {
                for (const reference of variable.references) {
                    if (!reference.init && !isAllowedSnapshotReaderReference(reference.identifier)) {
                        context.report({node: reference.identifier, messageId: 'noEscapingSnapshotReader'});
                    }
                }
            }
        },
    };
}

export {name, meta, create};
