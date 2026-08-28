const name = 'no-unsafe-onyx-read';

const ONYX_MODULE_PREFIX = 'react-native-onyx';

const ONYX_WRAPPER_MODULE = '@libs/OnyxUtils';

const READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

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

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow unsafe Onyx reads (Onyx.get and friends): during render, where the read does not subscribe; at module scope, where it can only be parked in a stale module variable; and straight off the library, around the read surface that the Search snapshot keys need.',
        recommended: 'error',
    },
    schema: [
        {
            type: 'object',
            properties: {
                readSurface: {type: 'string'},
            },
            additionalProperties: false,
        },
    ],
    messages: {
        noOnyxGetInRender:
            'Do not read Onyx during render. Onyx.get() is a one-shot read that never subscribes, so a value obtained while rendering does not re-render the component when that key changes and the UI can show stale data indefinitely. A component cannot await it either, so reaching it from render means use() or .then(), both of which read without subscribing.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve Onyx.get() for code that runs on an event: event handlers, useCallback and useEffect bodies, and plain module functions.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. A module body runs at import time and cannot await, so the value can only be parked in a module variable through .then(), where it is a one-shot snapshot that never updates when the key changes.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time and reads the current value. If the module genuinely needs to track a key, subscribe with Onyx.connectWithoutView() instead of caching one read.',
        noDirectOnyxGet:
            "Do not read Onyx straight from the library. {{readSurface}} is this repo's read surface and refuses the Search snapshot keys, which src/hooks/useOnyx.ts redirects to snapshot_<hash> in a way the library cannot see. Reading around it returns live data where the component would have seen the snapshot.\n\n" +
            'Import the wrapper from {{readSurface}} and call its get() instead.',
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

function getCalleeName(callee) {
    if (callee.type === 'Identifier') {
        return callee.name;
    }

    return callee.type === 'MemberExpression' ? getStaticPropertyName(callee) : null;
}

function matchesCalleeName(callee, names) {
    const calleeName = getCalleeName(callee);

    return !!calleeName && names.has(calleeName);
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

function isOnyxModuleSource(sourceValue) {
    return typeof sourceValue === 'string' && (sourceValue === ONYX_MODULE_PREFIX || sourceValue.startsWith(`${ONYX_MODULE_PREFIX}/`));
}

function isOnyxWrapperSource(sourceValue) {
    return sourceValue === ONYX_WRAPPER_MODULE;
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

function classifyFunctionBoundary(functionNode, parent) {
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

    const functionName = getFunctionName(functionNode, parent);

    if (functionName && (isHookName(functionName) || isComponentName(functionName))) {
        return RENDER;
    }

    return returnsJSX(functionNode) ? RENDER : DEFERRED;
}

function classifyPosition(ancestors) {
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

        const disposition = classifyFunctionBoundary(ancestor, ancestors[index - 1] ?? null);

        if (disposition === DEFERRED) {
            return EVENT;
        }

        if (disposition === RENDER) {
            return RENDER;
        }
    }

    return MODULE_SCOPE;
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const {readSurface} = context.options.at(0) ?? {};
    const onyxImportBindings = new WeakSet();
    const libraryImportBindings = new WeakSet();
    const readAliases = new WeakSet();
    const libraryReadAliases = new WeakSet();

    function trackBinding(node, bindingName, bindings) {
        const variable = sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);

        if (variable) {
            bindings.add(variable);
        }
    }

    function isOnyxMember(node, scope, methods) {
        if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return false;
        }

        const methodName = getStaticPropertyName(node);

        if (!methodName || !methods.has(methodName)) {
            return false;
        }

        const objectVariable = getVariableByName(scope, node.object.name);
        return !!objectVariable && onyxImportBindings.has(objectVariable);
    }

    return {
        ImportDeclaration(node) {
            if (!isOnyxModuleSource(node.source.value) && !isOnyxWrapperSource(node.source.value)) {
                return;
            }

            const isLibrary = isOnyxModuleSource(node.source.value);

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackBinding(node, specifier.local.name, onyxImportBindings);

                    if (isLibrary) {
                        trackBinding(node, specifier.local.name, libraryImportBindings);
                    }
                }
            }
        },
        VariableDeclarator(node) {
            const scope = sourceCode.getScope(node);

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

                    if (keyName && READ_METHODS.has(keyName)) {
                        trackBinding(node, property.value.name, readAliases);

                        if (libraryImportBindings.has(initVariable)) {
                            trackBinding(node, property.value.name, libraryReadAliases);
                        }
                    }
                }
                return;
            }

            if (node.id.type !== 'Identifier') {
                return;
            }

            if (node.init?.type === 'Identifier') {
                const aliasedVariable = getVariableByName(scope, node.init.name);

                if (aliasedVariable && onyxImportBindings.has(aliasedVariable)) {
                    trackBinding(node, node.id.name, onyxImportBindings);

                    if (libraryImportBindings.has(aliasedVariable)) {
                        trackBinding(node, node.id.name, libraryImportBindings);
                    }
                }
            }

            if (isOnyxMember(node.init, scope, READ_METHODS)) {
                trackBinding(node, node.id.name, readAliases);
                const objectVariable = getVariableByName(scope, node.init.object.name);

                if (!!objectVariable && libraryImportBindings.has(objectVariable)) {
                    trackBinding(node, node.id.name, libraryReadAliases);
                }
            }
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;

            if (!isOnyxMember(node.callee, scope, READ_METHODS) && !(!!calleeVariable && readAliases.has(calleeVariable))) {
                return;
            }

            const position = classifyPosition(sourceCode.getAncestors(node));

            if (position === MODULE_SCOPE) {
                context.report({node, messageId: 'noOnyxReadAtModuleScope'});
                return;
            }

            if (position === RENDER) {
                context.report({node, messageId: 'noOnyxGetInRender'});
                return;
            }

            if (!readSurface) {
                return;
            }

            const objectVariable = node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' ? getVariableByName(scope, node.callee.object.name) : null;

            if ((!!objectVariable && libraryImportBindings.has(objectVariable)) || (!!calleeVariable && libraryReadAliases.has(calleeVariable))) {
                context.report({node, messageId: 'noDirectOnyxGet', data: {readSurface}});
            }
        },
    };
}

export {name, meta, create};
