import fs from 'fs';
import path from 'path';

const ONYX_MODULE = 'react-native-onyx';

const SNAPSHOT_KEYS_SOURCE = 'src/CONST/runtimeConfigured.ts';

const ONYXKEYS_ROOT = 'ONYXKEYS';

const ONYXKEYS_MODULE_SOURCE = /(^|\/)ONYXKEYS$/;

const READ_METHOD = 'get';

const MULTI_READ_METHOD = 'multiGet';

const READ_METHODS = new Set([READ_METHOD, MULTI_READ_METHOD]);

const TYPE_ONLY_EXPRESSIONS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSInstantiationExpression', 'TSTypeAssertion']);

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

function unwrapTypeOnlyExpressions(node) {
    let current = node;

    while (current && TYPE_ONLY_EXPRESSIONS.has(current.type)) {
        current = current.expression;
    }

    return current;
}

function unwrapKeyExpression(node) {
    const current = unwrapTypeOnlyExpressions(node);

    if (current?.type !== 'TemplateLiteral') {
        return current;
    }

    const leadingExpression = current.expressions.at(0);

    // cspell:disable-next-line -- quasis is the ESTree name for the static chunks of a template literal
    if (!leadingExpression || current.quasis.at(0)?.value.cooked !== '') {
        return current;
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

// Resolves `identifier` from its own scope, so a shadowed name in an outer declaration is never confused with the inner one
function getConstInitializer(identifier, sourceCode) {
    const variable = getVariableByName(sourceCode.getScope(identifier), identifier.name);

    if (variable?.defs.length !== 1) {
        return null;
    }

    const definition = variable.defs.at(0);

    if (definition.type !== 'Variable' || definition.parent?.kind !== 'const' || definition.node.id.type !== 'Identifier') {
        return null;
    }

    return definition.node.init ?? null;
}

// The ONYXKEYS root must be the import of src/ONYXKEYS, not a local object or another module's export under the same name
function isOnyxKeysImport(identifier, sourceCode) {
    const variable = getVariableByName(sourceCode.getScope(identifier), identifier.name);

    return !variable || variable.defs.every((definition) => definition.type === 'ImportBinding' && ONYXKEYS_MODULE_SOURCE.test(definition.parent.source.value));
}

function getOnyxKeyPath(node, sourceCode, seen = new Set()) {
    const segments = [];
    let current = unwrapKeyExpression(node);

    if (current?.type === 'Identifier' && current.name !== ONYXKEYS_ROOT) {
        if (seen.has(current)) {
            return null;
        }

        seen.add(current);
        const initializer = getConstInitializer(current, sourceCode);

        return initializer ? getOnyxKeyPath(initializer, sourceCode, seen) : null;
    }

    while (current?.type === 'MemberExpression') {
        const propertyName = getStaticPropertyName(current);

        if (!propertyName) {
            return null;
        }

        segments.unshift(propertyName);
        current = current.object;
    }

    if (current?.type !== 'Identifier' || current.name !== ONYXKEYS_ROOT || segments.length === 0 || !isOnyxKeysImport(current, sourceCode)) {
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

function getRepoRelativePath(filename) {
    if (!REPO_ROOT || !filename || !path.isAbsolute(filename)) {
        return null;
    }

    const relativePath = path.relative(REPO_ROOT, filename).split(path.sep).join('/');

    return relativePath.startsWith('..') ? null : relativePath;
}

// True when every use of the const is an argument of a call `isAllowedCall` accepts, so nothing like `keys.push()`,
// `keys[0] = x` or a helper that mutates its argument could have changed the elements
function isOnlyPassedTo(identifier, sourceCode, isAllowedCall) {
    const variable = getVariableByName(sourceCode.getScope(identifier), identifier.name);

    // An exported const is visible to every importer, which this file cannot see
    if (!variable || variable.defs.some((definition) => definition.parent?.parent?.type === 'ExportNamedDeclaration')) {
        return false;
    }

    return variable.references.every((reference) => {
        // A `typeof keys` type query reads nothing at runtime
        if (reference.init || reference.isTypeReference || reference.identifier.parent?.type === 'TSTypeQuery') {
            return true;
        }

        let argument = reference.identifier;

        while (argument.parent && TYPE_ONLY_EXPRESSIONS.has(argument.parent.type)) {
            argument = argument.parent;
        }

        const call = argument.parent;

        return call?.type === 'CallExpression' && call.arguments.includes(argument) && isAllowedCall(call);
    });
}

/**
 * Elements of an array literal, or of a const bound to one that is only ever passed to a call `isAllowedCall` accepts.
 * Returns null when the list cannot be resolved.
 */
function getKeyListElements(node, sourceCode, isAllowedCall, seen = new Set()) {
    const current = unwrapTypeOnlyExpressions(node);

    if (current?.type === 'Identifier') {
        if (seen.has(current) || !isOnlyPassedTo(current, sourceCode, isAllowedCall)) {
            return null;
        }

        seen.add(current);
        const initializer = getConstInitializer(current, sourceCode);

        return initializer ? getKeyListElements(initializer, sourceCode, isAllowedCall, seen) : null;
    }

    return current?.type === 'ArrayExpression' ? current.elements : null;
}

/**
 * Tracks the Onyx default import and the Onyx.get / Onyx.multiGet aliases in one file, so every rule that inspects Onyx
 * reads recognizes the same calls. Spread `visitors` into the rule's visitor object and call `getCalledReadMethod` with a
 * CallExpression callee to learn which read method it invokes, if any.
 */
function createOnyxReadTracker(sourceCode) {
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

    function resolveVariable(identifier) {
        return getVariableByName(sourceCode.getScope(identifier), identifier.name);
    }

    function getOnyxReadMethod(node) {
        if (node?.type !== 'MemberExpression' || node.object.type !== 'Identifier') {
            return null;
        }

        const propertyName = getStaticPropertyName(node);

        if (!READ_METHODS.has(propertyName)) {
            return null;
        }

        const objectVariable = resolveVariable(node.object);
        return !!objectVariable && onyxImportBindings.has(objectVariable) ? propertyName : null;
    }

    function getCalledReadMethod(callee) {
        const readMethod = getOnyxReadMethod(callee);

        if (readMethod) {
            return readMethod;
        }

        const calleeVariable = callee.type === 'Identifier' ? resolveVariable(callee) : null;

        return calleeVariable ? (readAliases.get(calleeVariable) ?? null) : null;
    }

    const visitors = {
        ImportDeclaration(node) {
            if (node.source.value !== ONYX_MODULE) {
                return;
            }

            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    trackImportBinding(node, specifier.local.name);
                }
            }
        },
        VariableDeclarator(node) {
            // A `let` or `var` alias can be reassigned to something that is not Onyx, so only a const counts
            if (node.parent?.kind !== 'const') {
                return;
            }

            if (node.id.type === 'ObjectPattern' && node.init?.type === 'Identifier') {
                const initVariable = resolveVariable(node.init);

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
                const aliasedVariable = resolveVariable(node.init);

                if (aliasedVariable && onyxImportBindings.has(aliasedVariable)) {
                    trackImportBinding(node, node.id.name);
                }
            }

            const readMethod = getOnyxReadMethod(node.init);

            if (readMethod) {
                trackReadAlias(node, node.id.name, readMethod);
            }
        },
    };

    return {visitors, getCalledReadMethod};
}

export {
    ONYXKEYS_ROOT,
    REPO_ROOT,
    SNAPSHOT_KEYS_SOURCE,
    READ_METHOD,
    MULTI_READ_METHOD,
    getStaticName,
    unwrapTypeOnlyExpressions,
    getVariableByName,
    getConstInitializer,
    getOnyxKeyPath,
    getCalleeName,
    matchesCalleeName,
    getRepoRelativePath,
    getKeyListElements,
    createOnyxReadTracker,
};
