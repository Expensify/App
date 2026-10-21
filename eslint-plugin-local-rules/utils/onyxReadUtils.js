import fs from 'fs';
import path from 'path';

const ONYX_MODULE = 'react-native-onyx';

const SNAPSHOT_KEYS_SOURCE = 'src/CONST/runtimeDefaults.ts';

const ONYXKEYS_ROOT = 'ONYXKEYS';

const ONYXKEYS_MODULE_SOURCE = /(^|\/)ONYXKEYS$/;

const READ_METHOD = 'get';

const MULTI_READ_METHOD = 'multiGet';

const READ_METHODS = new Set([READ_METHOD, MULTI_READ_METHOD]);

const TYPE_ONLY_EXPRESSIONS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSInstantiationExpression', 'TSTypeAssertion']);

// This module lives at eslint-plugin-local-rules/utils/, so the repo root is two levels up. Resolving it from the module
// rather than process.cwd() keeps the rules working when ESLint runs from an editor or a parent workspace. The Jest
// transformer compiles this file to CommonJS and turns `import.meta` into an empty object, hence the __dirname fallback.
const RULES_UTILS_DIR = import.meta.dirname ?? __dirname;

function findRepoRoot() {
    const root = path.resolve(RULES_UTILS_DIR, '../..');

    return fs.existsSync(path.join(root, SNAPSHOT_KEYS_SOURCE)) ? root : null;
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
        const variable = currentScope.set.get(variableName);

        if (variable) {
            return variable;
        }

        currentScope = currentScope.upper;
    }

    return null;
}

function resolveVariable(identifier, sourceCode) {
    return getVariableByName(sourceCode.getScope(identifier), identifier.name);
}

function getDeclaredVariable(declaration, name, sourceCode) {
    return sourceCode.getDeclaredVariables(declaration).find((declaredVariable) => declaredVariable.name === name) ?? null;
}

// The single `const` (or, unless `constOnly`, `let`/`var`) definition of a variable, or null
function getSingleVariableDefinition(variable, constOnly) {
    if (variable?.defs.length !== 1) {
        return null;
    }

    const definition = variable.defs.at(0);

    if (definition.type !== 'Variable' || (constOnly && definition.parent?.kind !== 'const')) {
        return null;
    }

    return definition;
}

function isImportFrom(definition, isSource) {
    return definition.type === 'ImportBinding' && definition.parent?.type === 'ImportDeclaration' && isSource(definition.parent.source.value);
}

// Resolves `identifier` from its own scope, so a shadowed name in an outer declaration is never confused with the inner one
function getConstInitializer(identifier, sourceCode) {
    const variable = resolveVariable(identifier, sourceCode);

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
    const variable = resolveVariable(identifier, sourceCode);

    return !variable || variable.defs.every((definition) => isImportFrom(definition, (source) => ONYXKEYS_MODULE_SOURCE.test(source)));
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
    const variable = resolveVariable(identifier, sourceCode);

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
 * Resolves, on demand, whether a callee is `Onyx.get` or `Onyx.multiGet` from `react-native-onyx`, through any chain of
 * aliases in the file: `import O from 'react-native-onyx'`, `const api = Onyx`, `const {get: read} = Onyx`,
 * `const read = Onyx.get`, with TS casts unwrapped at every step. Resolution walks variable definitions instead of visitor
 * order, so an alias declared after its first use is still recognized. With `constOnly`, an alias bound by `let` or `var`
 * does not count, which the Concierge proof needs since such a binding could be reassigned.
 */
function createOnyxReadTracker(sourceCode) {
    const memo = new Map();

    function isOnyxModuleSource(source) {
        return source === ONYX_MODULE;
    }

    // One slot per question (object or read method) and per strictness, so the two never return each other's answer
    function memoized(variable, question, constOnly, compute) {
        const key = `${question}:${constOnly ? 'const' : 'any'}`;
        let entry = memo.get(variable);

        if (!entry) {
            entry = {};
            memo.set(variable, entry);
        }

        if (!(key in entry)) {
            // A self-referential chain resolves to "not Onyx" while it is being computed
            entry[key] = null;
            entry[key] = compute();
        }

        return entry[key];
    }

    // True when `identifier` is bound to the Onyx default or namespace import, directly or through aliases
    function isOnyxObject(identifier, constOnly) {
        const variable = resolveVariable(identifier, sourceCode);

        if (!variable) {
            return false;
        }

        return !!memoized(variable, 'object', constOnly, () => {
            if (variable.defs.length === 1 && isImportFrom(variable.defs.at(0), isOnyxModuleSource)) {
                const specifier = variable.defs.at(0).node;
                return specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier';
            }

            const definition = getSingleVariableDefinition(variable, constOnly);
            const init = definition ? unwrapTypeOnlyExpressions(definition.node.init) : null;

            return definition?.node.id.type === 'Identifier' && init?.type === 'Identifier' && isOnyxObject(init, constOnly);
        });
    }

    // The read method a member access `Onyx.get` / `api['multiGet']` names, or null
    function getMemberReadMethod(node, constOnly) {
        const member = unwrapTypeOnlyExpressions(node);

        if (member?.type !== 'MemberExpression') {
            return null;
        }

        const propertyName = getStaticPropertyName(member);
        const object = unwrapTypeOnlyExpressions(member.object);

        return READ_METHODS.has(propertyName) && object?.type === 'Identifier' && isOnyxObject(object, constOnly) ? propertyName : null;
    }

    // The read method an identifier is bound to through `const read = Onyx.get`, `const read2 = read` or `const {get: read} = Onyx`, or null
    function getIdentifierReadMethod(identifier, constOnly) {
        const variable = resolveVariable(identifier, sourceCode);
        const definition = getSingleVariableDefinition(variable, constOnly);

        if (!definition) {
            return null;
        }

        return memoized(variable, 'method', constOnly, () => {
            const {id, init} = definition.node;

            if (id.type === 'Identifier') {
                const value = unwrapTypeOnlyExpressions(init);

                // `const read2 = read` follows the alias; anything else must be the member access itself
                return value?.type === 'Identifier' ? getIdentifierReadMethod(value, constOnly) : getMemberReadMethod(value, constOnly);
            }

            const source = unwrapTypeOnlyExpressions(init);

            if (id.type !== 'ObjectPattern' || source?.type !== 'Identifier' || !isOnyxObject(source, constOnly)) {
                return null;
            }

            const property = id.properties.find((candidate) => candidate.type === 'Property' && candidate.value.type === 'Identifier' && candidate.value.name === identifier.name);
            const keyName = property ? getStaticName(property.key, property.computed) : null;

            return READ_METHODS.has(keyName) ? keyName : null;
        });
    }

    /**
     * The Onyx read method `callee` invokes (`get` or `multiGet`), or null. Pass `{constOnly: true}` to reject aliases
     * bound by `let` or `var`.
     */
    function getCalledReadMethod(callee, {constOnly = false} = {}) {
        const current = unwrapTypeOnlyExpressions(callee);

        if (current?.type === 'Identifier') {
            return getIdentifierReadMethod(current, constOnly);
        }

        return getMemberReadMethod(current, constOnly);
    }

    /** The import specifier node `identifier` is bound to when it comes from a module `isSource` accepts, or null. */
    function getImportSpecifier(identifier, isSource) {
        const variable = resolveVariable(identifier, sourceCode);

        return !!variable && variable.defs.length === 1 && isImportFrom(variable.defs.at(0), isSource) ? variable.defs.at(0).node : null;
    }

    return {getCalledReadMethod, getImportSpecifier};
}

export {
    ONYX_MODULE,
    ONYXKEYS_ROOT,
    REPO_ROOT,
    SNAPSHOT_KEYS_SOURCE,
    READ_METHOD,
    MULTI_READ_METHOD,
    TYPE_ONLY_EXPRESSIONS,
    getStaticName,
    unwrapTypeOnlyExpressions,
    resolveVariable,
    getDeclaredVariable,
    getSingleVariableDefinition,
    getConstInitializer,
    getOnyxKeyPath,
    getCalleeName,
    matchesCalleeName,
    getRepoRelativePath,
    getKeyListElements,
    createOnyxReadTracker,
};
