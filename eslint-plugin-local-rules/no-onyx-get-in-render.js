const name = 'no-onyx-get-in-render';

/** Import sources that resolve to the Onyx library, including `react-native-onyx/dist/OnyxUtils`. */
const ONYX_MODULE_PREFIX = 'react-native-onyx';

/** Synchronous read APIs on the Onyx surface. None of them subscribe, so none of them belong in render. */
const SYNC_READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

/**
 * Array methods whose callback runs in the caller's own tick. A function boundary here defers
 * nothing, so a read inside one is as much a render read as a read written inline.
 */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

/** Hooks whose callback runs during render, unlike useCallback (on an event) and useEffect (after commit). */
const RENDER_TIME_HOOK_NAMES = new Set(['useMemo']);

/** Calls that wrap a component without deferring it, so their callback argument is still a render body. */
const COMPONENT_WRAPPER_NAMES = new Set(['memo', 'forwardRef']);

/** How a function boundary between the read and the module scope affects when the read runs. */
const RENDER = 'render';
const DEFERRED = 'deferred';
const SYNCHRONOUS = 'synchronous';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow synchronous Onyx reads (Onyx.get and friends) in code that runs during render. Reads during render do not subscribe, so the rendered value never updates.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxGetInRender:
            'Do not read Onyx during render. Onyx.get() is a synchronous, non-reactive read: a value read while rendering does not re-render the component when that key changes, so the UI can show stale data indefinitely.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve the synchronous read for code that runs on an event: event handlers, useCallback and useEffect bodies, and plain module functions.',
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

/** The name a function is known by: its own identifier, or the binding it is assigned to. */
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

/** A function that returns JSX is a render body whatever it is called, which covers anonymous default exports. */
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

/** The static name a key node stands for, covering both `a.b` and `a['b']`. */
function getStaticName(keyNode, computed) {
    if (!computed && keyNode.type === 'Identifier') {
        return keyNode.name;
    }

    if (keyNode.type === 'Literal' && typeof keyNode.value === 'string') {
        return keyNode.value;
    }

    return null;
}

function getStaticPropertyName(memberExpression) {
    return getStaticName(memberExpression.property, memberExpression.computed);
}

function matchesCalleeName(callee, names) {
    if (callee.type === 'Identifier') {
        return names.has(callee.name);
    }

    if (callee.type === 'MemberExpression') {
        const propertyName = getStaticPropertyName(callee);
        return !!propertyName && names.has(propertyName);
    }

    return false;
}

/**
 * Classify what a function boundary does to the timing of the code inside it. `SYNCHRONOUS` means the
 * boundary is transparent (an IIFE, or an array callback), so the walk continues outward through it.
 */
function classifyFunctionBoundary(functionNode, parent) {
    if (parent?.type === 'CallExpression') {
        if (parent.callee === functionNode) {
            return SYNCHRONOUS;
        }

        if (parent.arguments.includes(functionNode)) {
            if (matchesCalleeName(parent.callee, COMPONENT_WRAPPER_NAMES) || matchesCalleeName(parent.callee, RENDER_TIME_HOOK_NAMES)) {
                return RENDER;
            }

            if (parent.callee.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS)) {
                return SYNCHRONOUS;
            }

            return DEFERRED;
        }
    }

    const functionName = getFunctionName(functionNode, parent);

    if (functionName && (isHookName(functionName) || isComponentName(functionName))) {
        return RENDER;
    }

    return returnsJSX(functionNode) ? RENDER : DEFERRED;
}

/**
 * Walk outwards from the read towards module scope. The first boundary that decides the timing wins:
 * a deferring function boundary (an event handler, useCallback, useEffect, a nested helper) means the
 * read does not run during render, while a component or hook body, a useMemo callback, or a JSX
 * expression means it does.
 */
function isRenderReachable(ancestors) {
    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (isFunctionNode(ancestor)) {
            const disposition = classifyFunctionBoundary(ancestor, ancestors[index - 1] ?? null);

            if (disposition === DEFERRED) {
                return false;
            }

            if (disposition === RENDER) {
                return true;
            }
        } else if (ancestor.type === 'JSXExpressionContainer') {
            return true;
        }
    }

    return false;
}

function isOnyxModuleSource(sourceValue) {
    return typeof sourceValue === 'string' && (sourceValue === ONYX_MODULE_PREFIX || sourceValue.startsWith(`${ONYX_MODULE_PREFIX}/`));
}

function getVariableByName(scope, variableName) {
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
 * Flags synchronous Onyx reads that run during render. The object has to resolve to an import from
 * `react-native-onyx`, so a local object that happens to expose `get` is left alone.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const onyxImportBindings = new WeakSet();
    const syncReadAliases = new WeakSet();

    function trackBinding(node, bindingName, bindings) {
        const variable = sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);

        if (variable) {
            bindings.add(variable);
        }
    }

    function isOnyxSyncReadMember(node, scope) {
        if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return false;
        }

        const methodName = getStaticPropertyName(node);

        if (!methodName || !SYNC_READ_METHODS.has(methodName)) {
            return false;
        }

        const objectVariable = getVariableByName(scope, node.object.name);
        return !!objectVariable && onyxImportBindings.has(objectVariable);
    }

    return {
        ImportDeclaration(node) {
            if (!isOnyxModuleSource(node.source.value)) {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackBinding(node, specifier.local.name, onyxImportBindings);
                }
            }
        },
        VariableDeclarator(node) {
            const scope = sourceCode.getScope(node);

            // const {get} = OnyxUtils;  /  const {get: readOnyx} = OnyxUtils;
            if (node.id.type === 'ObjectPattern' && node.init?.type === 'Identifier') {
                const initVariable = getVariableByName(scope, node.init.name);

                if (!initVariable || !onyxImportBindings.has(initVariable)) {
                    return;
                }

                for (const property of node.id.properties) {
                    if (property.type !== 'Property' || property.value.type !== 'Identifier') {
                        continue;
                    }

                    const keyName = getStaticName(property.key, property.computed);

                    if (keyName && SYNC_READ_METHODS.has(keyName)) {
                        trackBinding(node, property.value.name, syncReadAliases);
                    }
                }
                return;
            }

            // const readOnyx = OnyxUtils.get;
            if (node.id.type === 'Identifier' && isOnyxSyncReadMember(node.init, scope)) {
                trackBinding(node, node.id.name, syncReadAliases);
            }
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;
            const isAliasedRead = !!calleeVariable && syncReadAliases.has(calleeVariable);

            if (!isOnyxSyncReadMember(node.callee, scope) && !isAliasedRead) {
                return;
            }

            if (!isRenderReachable(sourceCode.getAncestors(node))) {
                return;
            }

            context.report({
                node,
                messageId: 'noOnyxGetInRender',
            });
        },
    };
}

export {name, meta, create};
