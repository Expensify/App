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

const REPO_ROOT = findRepoRoot();

function resolveRestrictedKeyPaths() {
    const repoRoot = REPO_ROOT;

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

const MULTI_READ_METHOD = 'multiGet';

const READ_METHODS = new Set([READ_METHOD, MULTI_READ_METHOD]);

const READ_ALLOWED_DIRECTORIES = ['src/components/', 'src/pages/', 'src/hooks/', 'tests/'];

const READ_ALLOWED_FILES = new Set([]);

const EFFECT_HOOK_NAMES = new Set(['useEffect', 'useLayoutEffect', 'useInsertionEffect', 'useFocusEffect']);

const CALLBACK_HOOK_NAMES = new Set(['useCallback']);

const EFFECT_CONTINUATION_NAMES = new Set(['then', 'catch', 'finally', 'setTimeout', 'requestAnimationFrame', 'queueMicrotask', 'runAfterInteractions', 'runAfterTransitions']);

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
const EFFECT = 'effect';

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow unsafe Onyx reads: Onyx.get or Onyx.multiGet outside components, pages, hooks and tests, during render, inside effects, at module scope or on Search snapshot keys.',
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
        noUnresolvableOnyxKey:
            'Do not read Onyx with a key this rule cannot resolve. The read surface is restricted to keys that are provably not Search snapshot keys, and a key built at runtime cannot be checked, so a caller can route a snapshot key here without anything failing.\n\n' +
            'Write the key as an ONYXKEYS access, such as ONYXKEYS.SESSION, or as a template literal that starts with an ONYXKEYS collection prefix. For Onyx.multiGet(), pass an array literal, or a const bound to one, whose every element is written that way. If the key cannot be static, keep the useOnyx subscription or take the value as a parameter. An inline eslint-disable of this rule fails the lint run.',
        noRestrictedOnyxKey:
            'Do not read {{keyPath}} with a one-shot Onyx read. src/hooks/useOnyx.ts rewrites this key to snapshot_<hash> inside a SearchScopeProvider subtree, so a component subscribed to it may never have been reading the global key at all. A read here returns live data where the component saw the snapshot, and nothing at the call site can tell the two apart.\n\n' +
            'Take the value as a parameter from the component, which knows whether it is inside a Search scope, or keep the useOnyx subscription.',
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
    if (!REPO_ROOT || !filename || !path.isAbsolute(filename)) {
        return true;
    }

    const relativePath = path.relative(REPO_ROOT, filename).split(path.sep).join('/');

    if (relativePath.startsWith('..')) {
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

function getKeyListElements(node, scope, seen = new Set()) {
    let current = node;

    while (current && TYPE_ONLY_EXPRESSIONS.has(current.type)) {
        current = current.expression;
    }

    if (current?.type === 'Identifier') {
        if (seen.has(current)) {
            return null;
        }

        seen.add(current);
        const initializer = getConstInitializer(current, scope);

        return initializer ? getKeyListElements(initializer, scope, seen) : null;
    }

    return current?.type === 'ArrayExpression' ? current.elements : null;
}

function findRestrictedKey(keyArgument, scope) {
    const keyPath = getOnyxKeyPath(keyArgument, scope);

    if (!keyPath) {
        return {keyPath: null};
    }

    return RESTRICTED_KEY_PATHS.has(keyPath) ? {keyPath} : null;
}

function findRestrictedKeys(readMethod, call, scope) {
    const keyArgument = call.arguments.at(0);

    if (readMethod !== MULTI_READ_METHOD) {
        const finding = findRestrictedKey(keyArgument, scope);

        return finding ? [{node: call, ...finding}] : [];
    }

    const elements = keyArgument?.type === 'SpreadElement' ? null : getKeyListElements(keyArgument, scope);

    if (!elements) {
        return [{node: call, keyPath: null}];
    }

    return elements.flatMap((element) => {
        if (!element || element.type === 'SpreadElement') {
            return [{node: element ?? call, keyPath: null}];
        }

        const finding = findRestrictedKey(element, scope);

        return finding ? [{node: element, ...finding}] : [];
    });
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const filename = context.filename ?? context.getFilename();
    const onyxImportBindings = new WeakSet();
    const readAliases = new WeakMap();

    function getDeclaredVariable(node, bindingName) {
        return sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);
    }

    function trackImportBinding(node, bindingName) {
        const variable = getDeclaredVariable(node, bindingName);

        if (variable) {
            onyxImportBindings.add(variable);
        }
    }

    function trackReadAlias(node, bindingName, readMethod) {
        const variable = getDeclaredVariable(node, bindingName);

        if (variable) {
            readAliases.set(variable, readMethod);
        }
    }

    function getOnyxReadMethod(node, scope) {
        if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return null;
        }

        const propertyName = getStaticPropertyName(node);

        if (!READ_METHODS.has(propertyName)) {
            return null;
        }

        const objectVariable = getVariableByName(scope, node.object.name);
        return !!objectVariable && onyxImportBindings.has(objectVariable) ? propertyName : null;
    }

    function getCalledReadMethod(callee, scope) {
        const readMethod = getOnyxReadMethod(callee, scope);

        if (readMethod) {
            return readMethod;
        }

        const calleeVariable = callee.type === 'Identifier' ? getVariableByName(scope, callee.name) : null;

        return calleeVariable ? (readAliases.get(calleeVariable) ?? null) : null;
    }

    return {
        ImportDeclaration(node) {
            if (!isOnyxModuleSource(node.source.value)) {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackImportBinding(node, specifier.local.name);
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

                    if (READ_METHODS.has(keyName)) {
                        trackReadAlias(node, property.value.name, keyName);
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
                    trackImportBinding(node, node.id.name);
                }
            }

            const readMethod = getOnyxReadMethod(node.init, scope);

            if (readMethod) {
                trackReadAlias(node, node.id.name, readMethod);
            }
        },
        CallExpression(node) {
            const scope = sourceCode.getScope(node);
            const readMethod = getCalledReadMethod(node.callee, scope);

            if (!readMethod) {
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
                return;
            }

            for (const finding of findRestrictedKeys(readMethod, node, scope)) {
                context.report(
                    finding.keyPath
                        ? {node: finding.node, messageId: 'noRestrictedOnyxKey', data: {keyPath: `${ONYXKEYS_ROOT}.${finding.keyPath}`}}
                        : {node: finding.node, messageId: 'noUnresolvableOnyxKey'},
                );
            }
        },
    };
}

export {name, meta, create};
