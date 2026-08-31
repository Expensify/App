import fs from 'fs';
import path from 'path';

const name = 'no-unsafe-onyx-read';

const ONYX_MODULE_PREFIX = 'react-native-onyx';

const ONYXKEYS_SOURCE = 'src/ONYXKEYS.ts';

const SNAPSHOT_PREFIX_SOURCE = 'src/CONST/runtimeDefaults.ts';

const SNAPSHOT_PREFIX_DECLARATION = /const SEARCH_SNAPSHOT_ONYX_KEYS = \[([^\]]*)\]/;

const ONYXKEYS_ROOT = 'ONYXKEYS';

/**
 * Walks up from the working directory until it finds the repo root, so the rule resolves the same
 * files whether ESLint runs it from a workspace subdirectory or Jest requires it from the root.
 */
function findRepoRoot() {
    let current = path.resolve(process.cwd());

    while (true) {
        if (fs.existsSync(path.join(current, ONYXKEYS_SOURCE))) {
            return current;
        }

        const parent = path.dirname(current);

        if (parent === current) {
            return null;
        }

        current = parent;
    }
}

/**
 * Maps every string-valued entry of `ONYXKEYS` to its dotted access path, so `report_` is known to be
 * reachable as `ONYXKEYS.COLLECTION.REPORT`. Reading the declaration rather than restating it keeps the
 * rule from drifting when a key is added, renamed or moved between the top level and `COLLECTION`.
 */
function readOnyxKeyPaths(repoRoot) {
    const source = fs.readFileSync(path.join(repoRoot, ONYXKEYS_SOURCE), 'utf8');
    const paths = new Map();
    const stack = [];

    for (const line of source.split('\n')) {
        const opening = /^\s*([A-Z0-9_]+):\s*\{\s*$/.exec(line);

        if (opening) {
            stack.push(opening[1]);
            continue;
        }

        if (/^\s*\},?\s*$/.test(line)) {
            stack.pop();
            continue;
        }

        const entry = /^\s*([A-Z0-9_]+):\s*'([^']*)'/.exec(line);

        if (entry) {
            paths.set([...stack, entry[1]].join('.'), entry[2]);
        }
    }

    return paths;
}

function readSnapshotPrefixes(repoRoot) {
    const source = fs.readFileSync(path.join(repoRoot, SNAPSHOT_PREFIX_SOURCE), 'utf8');
    const declaration = SNAPSHOT_PREFIX_DECLARATION.exec(source);

    return declaration ? [...declaration[1].matchAll(/'([^']*)'/g)].map((match) => match[1]) : [];
}

/**
 * The `ONYXKEYS` access paths that `src/hooks/useOnyx.ts` redirects to `snapshot_<hash>` inside a
 * `SearchScopeProvider` subtree. A one-shot read of these returns live data where the component would
 * have seen the snapshot, which is the difference the reader cannot observe.
 */
function resolveRestrictedKeyPaths() {
    const repoRoot = findRepoRoot();

    if (!repoRoot) {
        return new Set();
    }

    const prefixes = readSnapshotPrefixes(repoRoot);
    const restricted = new Set();

    for (const [keyPath, value] of readOnyxKeyPaths(repoRoot)) {
        if (prefixes.some((prefix) => value.startsWith(prefix))) {
            restricted.add(keyPath);
        }
    }

    return restricted;
}

const RESTRICTED_KEY_PATHS = resolveRestrictedKeyPaths();

const READ_METHODS = new Set(['get', 'multiGet', 'tupleGet', 'getAllKeys']);

const MULTI_KEY_READ_METHODS = new Set(['multiGet', 'tupleGet']);

const KEYLESS_READ_METHODS = new Set(['getAllKeys']);

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

/**
 * Unwraps the shapes a collection member key is written in, so `` `${ONYXKEYS.COLLECTION.REPORT}${reportID}` ``
 * is read as the prefix it starts with. Only a leading interpolation counts: anything before it makes the
 * key something other than that prefix.
 */
function unwrapKeyExpression(node) {
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

/**
 * Resolves an identifier back to the expression it was declared with, but only through a `const` with a
 * single declaration, where the binding cannot hold anything else by the time the read runs.
 */
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

/**
 * Turns `ONYXKEYS.COLLECTION.REPORT` into `COLLECTION.REPORT`, and returns null for anything that is not
 * a static member access rooted at `ONYXKEYS`.
 */
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
    return typeof sourceValue === 'string' && (sourceValue === ONYX_MODULE_PREFIX || sourceValue.startsWith(`${ONYX_MODULE_PREFIX}/`));
}

function isPublicOnyxModuleSource(sourceValue) {
    return sourceValue === ONYX_MODULE_PREFIX;
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

/**
 * The arguments that carry an Onyx key, which is what the restriction is about. `getAllKeys` reads no key
 * at all, and `multiGet` and `tupleGet` take an array of them, so a literal array is read through to its
 * elements and anything else stays one unresolvable expression.
 */
function getKeyArguments(node, methodName) {
    if (KEYLESS_READ_METHODS.has(methodName)) {
        return [];
    }

    const firstArgument = node.arguments.at(0);

    if (MULTI_KEY_READ_METHODS.has(methodName)) {
        return firstArgument?.type === 'ArrayExpression' ? firstArgument.elements : [firstArgument];
    }

    return [firstArgument];
}

/**
 * Reports the first key argument the read may not have, either because it names a restricted key or
 * because it cannot be resolved and so cannot be shown to name anything else.
 */
function findRestrictedKey(keyArguments, scope) {
    for (const keyArgument of keyArguments) {
        const keyPath = getOnyxKeyPath(keyArgument, scope);

        if (!keyPath) {
            return {keyPath: null};
        }

        if (RESTRICTED_KEY_PATHS.has(keyPath)) {
            return {keyPath};
        }
    }

    return null;
}

function create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const onyxImportBindings = new WeakSet();
    const publicOnyxBindings = new WeakSet();
    const readAliases = new WeakSet();
    const publicReadAliases = new WeakSet();
    const aliasedReadMethods = new WeakMap();

    function trackBinding(node, bindingName, bindings) {
        const variable = sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === bindingName);

        if (variable) {
            bindings.add(variable);
        }

        return variable;
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
            if (!isOnyxModuleSource(node.source.value)) {
                return;
            }

            const isPublic = isPublicOnyxModuleSource(node.source.value);

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackBinding(node, specifier.local.name, onyxImportBindings);

                    if (isPublic) {
                        trackBinding(node, specifier.local.name, publicOnyxBindings);
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
                        const aliasVariable = trackBinding(node, property.value.name, readAliases);

                        if (aliasVariable) {
                            aliasedReadMethods.set(aliasVariable, keyName);
                        }

                        if (publicOnyxBindings.has(initVariable)) {
                            trackBinding(node, property.value.name, publicReadAliases);
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

                    if (publicOnyxBindings.has(aliasedVariable)) {
                        trackBinding(node, node.id.name, publicOnyxBindings);
                    }
                }
            }

            if (isOnyxMember(node.init, scope, READ_METHODS)) {
                const aliasVariable = trackBinding(node, node.id.name, readAliases);

                if (aliasVariable) {
                    aliasedReadMethods.set(aliasVariable, getStaticPropertyName(node.init));
                }

                const objectVariable = getVariableByName(scope, node.init.object.name);

                if (!!objectVariable && publicOnyxBindings.has(objectVariable)) {
                    trackBinding(node, node.id.name, publicReadAliases);
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

            const readObjectVariable = node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' ? getVariableByName(scope, node.callee.object.name) : null;
            const isPublicRead = (!!readObjectVariable && publicOnyxBindings.has(readObjectVariable)) || (!!calleeVariable && publicReadAliases.has(calleeVariable));

            if (!isPublicRead) {
                return;
            }

            const methodName = node.callee.type === 'MemberExpression' ? getStaticPropertyName(node.callee) : aliasedReadMethods.get(calleeVariable);
            const finding = findRestrictedKey(getKeyArguments(node, methodName), scope);

            if (finding) {
                context.report(
                    finding.keyPath
                        ? {node, messageId: 'noRestrictedOnyxKey', data: {keyPath: `${ONYXKEYS_ROOT}.${finding.keyPath}`}}
                        : {node, messageId: 'noUnresolvableOnyxKey'},
                );
            }
        },
    };
}

export {name, meta, create};
