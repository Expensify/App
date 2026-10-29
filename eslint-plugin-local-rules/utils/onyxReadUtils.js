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

// This module lives at eslint-plugin-local-rules/utils/, so the repo root is two levels up. The root comes from this
// module's path rather than process.cwd(), so the rules still work when ESLint runs from an editor or a parent workspace.
// Under Jest, config/babel/oxcJestTransformer.js compiles this file to CommonJS with esbuild, which replaces `import.meta`
// with an empty object, so `import.meta.dirname` is undefined there and __dirname is used instead.
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

    // cspell:disable-next-line -- quasis is the ESTree name for the static chunks of a template literal
    return keyNode.type === 'TemplateLiteral' && keyNode.expressions.length === 0 ? (keyNode.quasis.at(0)?.value.cooked ?? null) : null;
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

/** The key expression with casts removed. A template literal that starts with an expression, such as `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, resolves to that leading expression, the collection prefix. */
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

/** The initializer of the `const` an identifier resolves to, or null. The lookup starts in the identifier's own scope, so an outer declaration that the inner one shadows is never used. */
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

/** True when `identifier` is the ONYXKEYS default import. Also true for an undeclared global named ONYXKEYS. */
function isOnyxKeysImport(identifier, sourceCode) {
    const variable = resolveVariable(identifier, sourceCode);

    return !variable || variable.defs.every((definition) => isImportFrom(definition, (source) => ONYXKEYS_MODULE_SOURCE.test(source)));
}

/** The dotted path `node` reads below ONYXKEYS, such as `COLLECTION.REPORT`, or null. A const alias is followed, and a template literal that starts with an ONYXKEYS access resolves to that access. */
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

/** True when every use of `identifier` is an argument of a call `isAllowedCall` accepts, so no `keys.push()`, `keys[0] = x` or helper that mutates its argument can have changed the elements. */
function isOnlyPassedTo(identifier, sourceCode, isAllowedCall) {
    const variable = resolveVariable(identifier, sourceCode);

    // Other files can import an exported const, and this rule cannot see their uses
    if (!variable || variable.defs.some((definition) => definition.parent?.parent?.type === 'ExportNamedDeclaration')) {
        return false;
    }

    return variable.references.every((reference) => {
        // The initializing write, a type reference and a `typeof keys` type query do not use the value at runtime
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

/** The elements of an array literal, written inline or behind a const, or null. A const counts only when it is only ever passed to a call `isAllowedCall` accepts. */
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
 * Returns functions that tell whether a callee or reference is `Onyx.get` or `Onyx.multiGet` from `react-native-onyx`.
 * They follow any chain of aliases in the file, such as `import O from 'react-native-onyx'`, `const api = Onyx`,
 * `const {get: read} = Onyx`, `const read = Onyx.get` or `Onyx.default` on a namespace import, and strip TS casts at
 * every step. They walk variable definitions rather than visitor order, so an alias declared after its first use is
 * still found. With `constOnly`, an alias bound by `let` or `var` does not count. The Concierge exemption in
 * no-onyx-get-snapshot-key needs that, because such a binding could be reassigned.
 */
function createOnyxReadTracker(sourceCode) {
    const memo = new Map();

    function isOnyxModuleSource(source) {
        return source === ONYX_MODULE;
    }

    /** Caches the answer to `question` about `variable`. One slot per question and per `constOnly`, so an answer computed with one strictness is never returned for the other. */
    function memoized(variable, question, constOnly, compute) {
        const key = `${question}:${constOnly ? 'const' : 'any'}`;
        let entry = memo.get(variable);

        if (!entry) {
            entry = {};
            memo.set(variable, entry);
        }

        if (!(key in entry)) {
            // The null seed makes a self-referential chain read as "not Onyx" instead of recursing without end
            entry[key] = null;
            entry[key] = compute();
        }

        return entry[key];
    }

    function getImportSpecifier(identifier, isSource) {
        const variable = resolveVariable(identifier, sourceCode);

        return !!variable && variable.defs.length === 1 && isImportFrom(variable.defs.at(0), isSource) ? variable.defs.at(0).node : null;
    }

    /** True when `node` is the Onyx import or a const alias of it. Also true for `Onyx.default` on a namespace import. */
    function isOnyxObjectExpression(node, constOnly) {
        const current = unwrapTypeOnlyExpressions(node);

        if (current?.type === 'MemberExpression') {
            const namespace = unwrapTypeOnlyExpressions(current.object);

            return getStaticPropertyName(current) === 'default' && namespace?.type === 'Identifier' && getImportSpecifier(namespace, isOnyxModuleSource)?.type === 'ImportNamespaceSpecifier';
        }

        const variable = current?.type === 'Identifier' ? resolveVariable(current, sourceCode) : null;

        if (!variable) {
            return false;
        }

        return !!memoized(variable, 'object', constOnly, () => {
            if (variable.defs.length === 1 && isImportFrom(variable.defs.at(0), isOnyxModuleSource)) {
                const specifier = variable.defs.at(0).node;
                return specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier';
            }

            const definition = getSingleVariableDefinition(variable, constOnly);

            return definition?.node.id.type === 'Identifier' && isOnyxObjectExpression(definition.node.init, constOnly);
        });
    }

    function getMemberReadMethod(node, constOnly) {
        const member = unwrapTypeOnlyExpressions(node);

        if (member?.type !== 'MemberExpression') {
            return null;
        }

        const propertyName = getStaticPropertyName(member);

        return READ_METHODS.has(propertyName) && isOnyxObjectExpression(member.object, constOnly) ? propertyName : null;
    }

    /** The read method an identifier is bound to through `const read = Onyx.get`, `const read2 = read` or `const {get: read} = Onyx`, or null. */
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

            if (id.type !== 'ObjectPattern' || !isOnyxObjectExpression(init, constOnly)) {
                return null;
            }

            const property = id.properties.find((candidate) => candidate.type === 'Property' && candidate.value.type === 'Identifier' && candidate.value.name === identifier.name);
            const keyName = property ? getStaticName(property.key, property.computed) : null;

            return READ_METHODS.has(keyName) ? keyName : null;
        });
    }

    /** Returns `get`, `multiGet` or null. */
    function getCalledReadMethod(callee, {constOnly = false} = {}) {
        const current = unwrapTypeOnlyExpressions(callee);

        if (current?.type === 'Identifier') {
            return getIdentifierReadMethod(current, constOnly);
        }

        return getMemberReadMethod(current, constOnly);
    }

    /** The read method a member access (`Onyx.get`) or a destructured property (`const {get} = Onyx`) names, or null. */
    function getReferencedReadMethod(node) {
        if (node.type !== 'Property' || node.parent?.type !== 'ObjectPattern') {
            return getMemberReadMethod(node, false);
        }

        const declarator = node.parent.parent;
        const isFromOnyx = declarator?.type === 'VariableDeclarator' && declarator.id === node.parent && isOnyxObjectExpression(declarator.init, false);
        const keyName = getStaticName(node.key, node.computed);

        return READ_METHODS.has(keyName) && isFromOnyx ? keyName : null;
    }

    return {getCalledReadMethod, getReferencedReadMethod, getImportSpecifier, isOnyxObjectExpression};
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
