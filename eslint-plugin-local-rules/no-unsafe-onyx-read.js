import fs from 'fs';
import path from 'path';

const name = 'no-unsafe-onyx-read';

const ONYX_MODULE = 'react-native-onyx';

const SNAPSHOT_KEYS_SOURCE = 'src/CONST/runtimeConfigured.ts';

const SNAPSHOT_KEYS_DECLARATION = /SEARCH_SNAPSHOT_ONYX_KEYS:\s*\[([^\]]*)\]/;

const ONYXKEYS_ROOT = 'ONYXKEYS';

function findRepoRoot() {
    let current = path.resolve(process.cwd());

    while (true) {
        if (fs.existsSync(path.join(current, SNAPSHOT_KEYS_SOURCE))) {
            return current;
        }

        const parent = path.dirname(current);

        if (parent === current) {
            return null;
        }

        current = parent;
    }
}

function resolveRestrictedKeyPaths() {
    const repoRoot = findRepoRoot();

    if (!repoRoot) {
        throw new Error(`no-unsafe-onyx-read could not locate ${SNAPSHOT_KEYS_SOURCE}. Without it the rule would silently stop refusing Search snapshot keys.`);
    }

    const source = fs.readFileSync(path.join(repoRoot, SNAPSHOT_KEYS_SOURCE), 'utf8');
    const declaration = SNAPSHOT_KEYS_DECLARATION.exec(source);

    if (!declaration) {
        throw new Error(`no-unsafe-onyx-read could not read SEARCH_SNAPSHOT_ONYX_KEYS from ${SNAPSHOT_KEYS_SOURCE}. Without it the rule would silently stop refusing Search snapshot keys.`);
    }

    return new Set([...declaration[1].matchAll(/ONYXKEYS\.([A-Z0-9_.]+)/g)].map((match) => match[1]));
}

const RESTRICTED_KEY_PATHS = resolveRestrictedKeyPaths();

const READ_METHOD = 'get';

const TYPE_ONLY_EXPRESSIONS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSInstantiationExpression', 'TSTypeAssertion']);

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
            'Disallow unsafe Onyx reads (Onyx.get and friends): during render, where the read does not subscribe; at module scope, where it can only be parked in a stale module variable; and on the Search snapshot keys, which useOnyx redirects in a way a one-shot read cannot see.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noOnyxGetInRender:
            'Do not read Onyx during render. Onyx.get() is a one-shot read that never subscribes, so a value obtained while rendering does not re-render the component when that key changes and the UI can show stale data indefinitely. A component cannot await it either, so reaching it from render means use() or .then(), both of which read without subscribing.\n\n' +
            'Use useOnyx() for anything the component renders. Reserve Onyx.get() for code that runs on an event: event handlers, useCallback and useEffect bodies, and plain module functions.',
        noOnyxReadAtModuleScope:
            'Do not read Onyx at module scope. A module body runs at import time and cannot await, so the value can only be parked in a module variable through .then(), where it is a one-shot snapshot that never updates when the key changes.\n\n' +
            'Move the read inside the function that needs it, so it runs at event time and reads the current value. If the module genuinely needs to track a key, subscribe with Onyx.connectWithoutView() instead of caching one read.',
        noUnresolvableOnyxKey:
            'Do not read Onyx with a key this rule cannot resolve. The read surface is restricted to keys that are provably not Search snapshot keys, and a key built at runtime cannot be checked, so a caller can route a snapshot key here without anything failing.\n\n' +
            'Write the key as an ONYXKEYS access, such as ONYXKEYS.SESSION, or as a template literal that starts with an ONYXKEYS collection prefix. If the key genuinely cannot be static, disable this rule on the line and say in the comment why the key can never be a Search snapshot key.',
        noRestrictedOnyxKey:
            'Do not read {{keyPath}} with a one-shot Onyx read. src/hooks/useOnyx.ts rewrites this key to snapshot_<hash> inside a SearchScopeProvider subtree, so a component subscribed to it may never have been reading the global key at all. A read here returns live data where the component saw the snapshot, and nothing at the call site can tell the two apart.\n\n' +
            'Take the value as a parameter from the component, which knows whether it is inside a Search scope, or keep the useOnyx subscription.',
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

function unwrapKeyExpression(node) {
    if (node && TYPE_ONLY_EXPRESSIONS.has(node.type)) {
        return unwrapKeyExpression(node.expression);
    }

    if (node?.type !== 'TemplateLiteral') {
        return node;
    }

    const leadingExpression = node.expressions.at(0);

    // cspell:disable-next-line -- quasis is the ESTree name for the static chunks of a template literal
    if (!leadingExpression || node.quasis.at(0)?.value.cooked !== '') {
        return node;
    }

    return unwrapKeyExpression(leadingExpression);
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

function getConstInitializer(node, scope) {
    const variable = getVariableByName(scope, node.name);

    if (variable?.defs.length !== 1) {
        return null;
    }

    const definition = variable.defs.at(0);

    if (definition.type !== 'Variable' || definition.parent?.kind !== 'const' || definition.node.id.type !== 'Identifier') {
        return null;
    }

    return definition.node.init ?? null;
}

function getOnyxKeyPath(node, scope, seen = new Set()) {
    const segments = [];
    let current = unwrapKeyExpression(node);

    if (current?.type === 'Identifier' && current.name !== ONYXKEYS_ROOT) {
        if (seen.has(current)) {
            return null;
        }

        seen.add(current);
        const initializer = getConstInitializer(current, scope);

        return initializer ? getOnyxKeyPath(initializer, scope, seen) : null;
    }

    while (current?.type === 'MemberExpression') {
        const propertyName = getStaticPropertyName(current);

        if (!propertyName) {
            return null;
        }

        segments.unshift(propertyName);
        current = current.object;
    }

    if (current?.type !== 'Identifier' || current.name !== ONYXKEYS_ROOT || segments.length === 0) {
        return null;
    }

    return segments.join('.');
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
    return sourceValue === ONYX_MODULE;
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
            return EVENT;
        }

        if (disposition === RENDER) {
            return RENDER;
        }
    }

    return MODULE_SCOPE;
}

function findRestrictedKey(keyArgument, scope) {
    const keyPath = getOnyxKeyPath(keyArgument, scope);

    if (!keyPath) {
        return {keyPath: null};
    }

    return RESTRICTED_KEY_PATHS.has(keyPath) ? {keyPath} : null;
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const onyxImportBindings = new WeakSet();
    const readAliases = new WeakSet();

    function trackBinding(node, bindingName, bindings) {
        const variable = sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);

        if (variable) {
            bindings.add(variable);
        }

        return variable;
    }

    function isOnyxRead(node, scope) {
        if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return false;
        }

        if (getStaticPropertyName(node) !== READ_METHOD) {
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

                    if (keyName === READ_METHOD) {
                        trackBinding(node, property.value.name, readAliases);
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
                }
            }

            if (isOnyxRead(node.init, scope)) {
                trackBinding(node, node.id.name, readAliases);
            }
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const calleeVariable = node.callee.type === 'Identifier' ? getVariableByName(scope, node.callee.name) : null;

            if (!isOnyxRead(node.callee, scope) && !(!!calleeVariable && readAliases.has(calleeVariable))) {
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

            const finding = findRestrictedKey(node.arguments.at(0), scope);

            if (finding) {
                context.report(
                    finding.keyPath ? {node, messageId: 'noRestrictedOnyxKey', data: {keyPath: `${ONYXKEYS_ROOT}.${finding.keyPath}`}} : {node, messageId: 'noUnresolvableOnyxKey'},
                );
            }
        },
    };
}

export {name, meta, create};
