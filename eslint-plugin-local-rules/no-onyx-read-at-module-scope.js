const name = 'no-onyx-read-at-module-scope';

/** Import sources that resolve to the Onyx library, including `react-native-onyx/dist/OnyxUtils`. */
const ONYX_MODULE_PREFIX = 'react-native-onyx';

/** Synchronous read APIs on the Onyx surface. All of them read the cache and nothing else. */
const SYNC_READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

/**
 * Array methods whose callback runs in the caller's own tick. A function boundary here defers nothing,
 * so a read inside one at module scope still runs at import time.
 */
const SYNCHRONOUS_CALLBACK_METHODS = new Set(['map', 'filter', 'reduce', 'reduceRight', 'forEach', 'find', 'findIndex', 'findLast', 'findLastIndex', 'flatMap', 'some', 'every', 'sort']);

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow synchronous Onyx reads at module scope. Module scope runs at import time, before Onyx.init() has hydrated the cache, so the read returns undefined for every key that is only on disk.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. Module bodies run at import time, and Onyx.init() hydrates the cache asynchronously, so this read returns undefined for every key whose value is only on disk. It cannot fail loudly: it looks like an absent value.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time. If it genuinely has to run during startup, sequence it after hydration instead of reading here.',
    },
};

function isFunctionNode(node) {
    return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression';
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
 * Whether a function boundary is transparent to import-time execution. An IIFE and an array callback both
 * run in the caller's tick, so they do not move a read off module scope. Everything else does: naming a
 * function, passing it as a callback, or exporting it all mean the body runs when something calls it.
 */
function isTransparentBoundary(functionNode, parent) {
    if (parent?.type !== 'CallExpression') {
        return false;
    }

    if (parent.callee === functionNode) {
        return true;
    }

    return parent.arguments.includes(functionNode) && parent.callee.type === 'MemberExpression' && matchesCalleeName(parent.callee, SYNCHRONOUS_CALLBACK_METHODS);
}

/**
 * Walk outwards from the read towards module scope. Any boundary that is not transparent means something
 * has to call it before the read happens, which puts the read outside this rule's brief: a render-position
 * read is `no-onyx-get-in-render`'s job, and an event-time read is the sanctioned case.
 */
function runsAtModuleScope(ancestors) {
    for (let index = ancestors.length - 1; index >= 0; index--) {
        const ancestor = ancestors[index];

        if (isFunctionNode(ancestor) && !isTransparentBoundary(ancestor, ancestors[index - 1] ?? null)) {
            return false;
        }
    }

    return true;
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
 * Flags synchronous Onyx reads that run at import time. The object has to resolve to an import from
 * `react-native-onyx`, so a local object that happens to expose `get` is left alone.
 *
 * Companion to `no-onyx-get-in-render`, which deliberately allows module scope because a module body is
 * not a render body. It is not an event-time position either, which is the hole this closes.
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

            if (!runsAtModuleScope(sourceCode.getAncestors(node))) {
                return;
            }

            context.report({
                node,
                messageId: 'noOnyxReadAtModuleScope',
            });
        },
    };
}

export {name, meta, create};
