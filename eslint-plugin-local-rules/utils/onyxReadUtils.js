import fs from 'fs';
import path from 'path';

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
        throw new Error(`no-unsafe-onyx-read and no-onyx-get-snapshot-key could not locate ${SNAPSHOT_KEYS_SOURCE}. Without it the rule would silently stop refusing Search snapshot keys.`);
    }

    const source = fs.readFileSync(path.join(repoRoot, SNAPSHOT_KEYS_SOURCE), 'utf8');
    const declaration = SNAPSHOT_KEYS_DECLARATION.exec(source);

    if (!declaration) {
        throw new Error(
            `no-unsafe-onyx-read and no-onyx-get-snapshot-key could not read SEARCH_SNAPSHOT_ONYX_KEYS from ${SNAPSHOT_KEYS_SOURCE}. Without it the rule would silently stop refusing Search snapshot keys.`,
        );
    }

    return new Set([...declaration[1].matchAll(/ONYXKEYS\.([A-Z0-9_.]+)/g)].map((match) => match[1]));
}

const RESTRICTED_KEY_PATHS = resolveRestrictedKeyPaths();

const READ_METHOD = 'get';

const MULTI_READ_METHOD = 'multiGet';

const READ_METHODS = new Set([READ_METHOD, MULTI_READ_METHOD]);

// Marks variables that hold the reader returned by useSnapshotOnyxGet()
const SNAPSHOT_READ_METHOD = 'snapshotGet';

const SNAPSHOT_READER_HOOK_SOURCE = /(^|\/)useSnapshotOnyxGet$/;

const TYPE_ONLY_EXPRESSIONS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSInstantiationExpression', 'TSTypeAssertion']);

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

function isOnyxModuleSource(sourceValue) {
    return sourceValue === ONYX_MODULE;
}

function getRepoRelativePath(filename) {
    if (!REPO_ROOT || !filename || !path.isAbsolute(filename)) {
        return null;
    }

    const relativePath = path.relative(REPO_ROOT, filename).split(path.sep).join('/');

    return relativePath.startsWith('..') ? null : relativePath;
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

/**
 * Tracks the Onyx default import, Onyx.get / Onyx.multiGet aliases and the reader returned by useSnapshotOnyxGet() in one
 * file, so every rule that inspects Onyx reads recognizes the same calls.
 */
function createOnyxReadTracker(sourceCode) {
    const onyxImportBindings = new WeakSet();
    const snapshotReaderHookBindings = new WeakSet();
    const readAliases = new WeakMap();
    const snapshotReaderVariables = [];

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

    function trackSnapshotReader(node, bindingName) {
        const variable = getDeclaredVariable(node, bindingName);

        if (variable) {
            readAliases.set(variable, SNAPSHOT_READ_METHOD);
            snapshotReaderVariables.push(variable);
        }
    }

    function isSnapshotReaderHookCall(node, scope) {
        if (node?.type !== 'CallExpression' || node.callee.type !== 'Identifier') {
            return false;
        }

        const hookVariable = getVariableByName(scope, node.callee.name);
        return !!hookVariable && snapshotReaderHookBindings.has(hookVariable);
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
        if (isSnapshotReaderHookCall(callee, scope)) {
            return SNAPSHOT_READ_METHOD;
        }

        const readMethod = getOnyxReadMethod(callee, scope);

        if (readMethod) {
            return readMethod;
        }

        const calleeVariable = callee.type === 'Identifier' ? getVariableByName(scope, callee.name) : null;

        return calleeVariable ? (readAliases.get(calleeVariable) ?? null) : null;
    }

    const visitors = {
        ImportDeclaration(node) {
            if (typeof node.source.value === 'string' && SNAPSHOT_READER_HOOK_SOURCE.test(node.source.value)) {
                for (const specifier of node.specifiers) {
                    if (specifier.type !== 'ImportDefaultSpecifier') {
                        continue;
                    }

                    const variable = getDeclaredVariable(node, specifier.local.name);

                    if (variable) {
                        snapshotReaderHookBindings.add(variable);
                    }
                }
                return;
            }

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

            if (isSnapshotReaderHookCall(node.init, scope)) {
                trackSnapshotReader(node, node.id.name);
                return;
            }

            if (node.init?.type === 'Identifier') {
                const aliasedVariable = getVariableByName(scope, node.init.name);

                if (aliasedVariable && onyxImportBindings.has(aliasedVariable)) {
                    trackImportBinding(node, node.id.name);
                }

                if (aliasedVariable && readAliases.get(aliasedVariable) === SNAPSHOT_READ_METHOD) {
                    trackSnapshotReader(node, node.id.name);
                    return;
                }
            }

            const readMethod = getOnyxReadMethod(node.init, scope);

            if (readMethod) {
                trackReadAlias(node, node.id.name, readMethod);
            }
        },
    };

    return {visitors, getCalledReadMethod, isSnapshotReaderHookCall, snapshotReaderVariables};
}

export {
    ONYXKEYS_ROOT,
    REPO_ROOT,
    RESTRICTED_KEY_PATHS,
    READ_METHOD,
    MULTI_READ_METHOD,
    READ_METHODS,
    SNAPSHOT_READ_METHOD,
    TYPE_ONLY_EXPRESSIONS,
    getStaticName,
    getStaticPropertyName,
    unwrapKeyExpression,
    getVariableByName,
    getConstInitializer,
    getOnyxKeyPath,
    getCalleeName,
    matchesCalleeName,
    getRepoRelativePath,
    getKeyListElements,
    createOnyxReadTracker,
};
