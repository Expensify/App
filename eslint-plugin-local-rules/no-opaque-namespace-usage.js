const name = 'no-opaque-namespace-usage';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow the namespace import usages of an internal module that knip cannot track, which hide the unused exports of the module.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        opaqueNamespaceUsage:
            'Using the namespace `{{name}}` this way ({{usage}}) makes knip treat every export of the module as used, so unused exports stay hidden. Import the members you need by name, or access them as `{{name}}.member`.',
    },
};

// The forms checked here are the namespace usages that knip 6.34 cannot track (verified by running knip). Every other whole-namespace use
// (spread into a call, an array or JSX, argument, return, export, `in`, ...) is tracked by knip, so it is allowed. Re-verify the forms when knip is upgraded.
// Knip only matches a bare identifier, so TypeScript wrappers such as `NS as T` or `NS!` make a usage tracked, and the rule does not look through them.

// Namespace imports of packages are out of scope: knip only reports unused exports of the repo's own modules.
// Keep the aliases in sync with `paths` in tsconfig.base.json.
const INTERNAL_SOURCE_PATTERN = /^(@(assets|components|hooks|libs|navigation|pages|prompts|styles|src|userActions|github|scripts|selectors|server)(\/|$)|tests\/|\.{1,2}(\/|$))/;
const ENUMERATION_METHODS = new Set(['keys', 'values', 'entries', 'getOwnPropertyNames']);

/**
 * @param {import('estree').Node} property
 * @returns {boolean} Whether a computed key is a string that knip resolves statically: `NS['a']` or a template without substitutions. A numeric key is not.
 */
function isStaticStringKey(property) {
    return (property.type === 'Literal' && typeof property.value === 'string') || (property.type === 'TemplateLiteral' && property.expressions.length === 0);
}

/**
 * @param {import('estree').Node} node
 * @param {string} objectName
 * @returns {boolean} Whether the node is a member access on the identifier with the given name.
 */
function isMemberAccessOn(node, objectName) {
    return node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === objectName;
}

/**
 * @param {import('estree').Node} pattern
 * @returns {boolean} Whether the node is an object pattern with a rest element, such as `{a, ...rest}`.
 */
function hasRestElement(pattern) {
    return pattern.type === 'ObjectPattern' && pattern.properties.some((property) => property.type === 'RestElement');
}

/**
 * @param {import('estree').Node} callee
 * @returns {boolean} Whether the callee is `Object.keys`, `Object.values`, `Object.entries` or `Object.getOwnPropertyNames`.
 */
function isObjectEnumerationCallee(callee) {
    return isMemberAccessOn(callee, 'Object') && !callee.computed && ENUMERATION_METHODS.has(callee.property.name);
}

/**
 * @param {import('estree').Node} node The parent of the reference.
 * @returns {boolean} Whether the node is a default value in `const {a = NS} = obj`, a destructured property of a declarator that has an initializer.
 */
function isTopLevelDestructuringDefault(node) {
    if (node.type !== 'AssignmentPattern' || node.parent.type !== 'Property') {
        return false;
    }
    const pattern = node.parent.parent;
    const declarator = pattern.parent;
    return declarator.type === 'VariableDeclarator' && !!declarator.init;
}

/**
 * @param {import('estree').Node} reference The identifier that references the namespace.
 * @returns {string | undefined} The label of the usage that makes knip treat the whole module as used, or undefined when knip tracks the usage.
 */
function getOpaqueUsage(reference) {
    const {parent} = reference;

    // Knip cannot tell which export is read by `NS[key]`, `NS?.[key]` or `NS[0]`. A string key or a template without substitutions is resolved statically.
    if (parent.type === 'MemberExpression' && parent.object === reference && parent.computed && !isStaticStringKey(parent.property)) {
        return 'computed key';
    }

    // Knip treats `Object.keys(NS)`, `Object.values(NS)`, `Object.entries(NS)` and `Object.getOwnPropertyNames(NS)` as reading every export,
    // in any argument position. Other calls such as `Reflect.ownKeys(NS)`, `Object['keys'](NS)` or `_.keys(NS)` are not recognized, so they are tracked.
    if (parent.type === 'CallExpression' && isObjectEnumerationCallee(parent.callee)) {
        return 'enumeration';
    }

    // Knip treats `for (key in NS)` and `for (value of NS)` as reading every export.
    if (parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') {
        return 'enumeration';
    }

    // Knip cannot tell which exports end up in the rest object of `const {a, ...rest} = NS`. An assignment `({a, ...rest} = NS)` is tracked.
    if (parent.type === 'VariableDeclarator' && hasRestElement(parent.id)) {
        return 'rest destructuring';
    }

    // In a declarator with an initializer, knip treats the default value of a top-level destructured property, `const {a = NS} = obj`, as an opaque use.
    // A nested pattern, a parameter default and a declarator without an initializer, such as the head of `for (const {a = NS} of list)`, are tracked.
    if (isTopLevelDestructuringDefault(parent)) {
        return 'destructuring default';
    }

    return undefined;
}

/**
 * @param {import('estree').Node} node
 * @returns {boolean} Whether the node is a declarator of an exported declaration, such as `export const a = ...`.
 */
function isExportedDeclarator(node) {
    const declaration = node.parent;
    return declaration.parent.type === 'ExportNamedDeclaration';
}

/**
 * Knip follows a namespace assigned to a variable only through the member accesses of that variable, so these forms are opaque
 * unless the alias is member-accessed somewhere in the file (knip tracks them in a file with no `NS.member` at all, where the rule is stricter): `const a = NS`, `const a = cond ? NS : other`, `const a = {...NS}` and `const a = {key: NS}`.
 * Passing or exporting the alias does not count as an access. An exported `const a = {...NS}` is tracked.
 * @param {import('estree').Node} reference The identifier that references the namespace.
 * @returns {{aliasName: string, key?: string} | undefined} The variable the namespace is assigned to, and the object key for the `{key: NS}` form.
 */
function getAssignedAlias(reference) {
    const {parent} = reference;
    let declarator;
    let key;

    if (parent.type === 'VariableDeclarator') {
        declarator = parent;
    } else if (parent.type === 'ConditionalExpression' && parent.test !== reference && parent.parent.type === 'VariableDeclarator') {
        declarator = parent.parent;
    } else if (parent.type === 'SpreadElement' && parent.parent.type === 'ObjectExpression' && parent.parent.parent.type === 'VariableDeclarator') {
        declarator = isExportedDeclarator(parent.parent.parent) ? undefined : parent.parent.parent;
    } else if (
        parent.type === 'Property' &&
        !parent.computed &&
        parent.key.type === 'Identifier' &&
        parent.parent.type === 'ObjectExpression' &&
        parent.parent.parent.type === 'VariableDeclarator'
    ) {
        declarator = parent.parent.parent;
        key = parent.key.name;
    }

    if (!declarator || declarator.id.type !== 'Identifier') {
        return undefined;
    }
    return {aliasName: declarator.id.name, key};
}

/** @type {import('eslint').Rule.RuleModule['create']} */
function create(context) {
    // Knip matches aliases by name and ignores scopes, so the rule collects names the same way.
    const memberAccessedNames = new Set();
    const memberAccessedKeys = new Set();
    const pendingAliases = [];

    /**
     * @param {import('estree').Identifier} identifier
     * @param {string} usage
     */
    function report(identifier, usage) {
        context.report({node: identifier, messageId: 'opaqueNamespaceUsage', data: {name: identifier.name, usage}});
    }

    /** Whether an alias is member-accessed is only known once the whole file is traversed, so the aliases are reported on Program:exit. */
    function reportUnreadAliases() {
        for (const {identifier, aliasName, key} of pendingAliases) {
            const isRead = key ? memberAccessedKeys.has(`${aliasName}.${key}`) : memberAccessedNames.has(aliasName);
            if (!isRead) {
                report(identifier, 'unread alias');
            }
        }
    }

    return {
        MemberExpression(node) {
            if (node.object.type === 'Identifier') {
                memberAccessedNames.add(node.object.name);
            }

            // Collect `holder.key.member` and `holder.key['member']`, which read the `{key: NS}` form.
            const holder = node.object;
            const isStaticMember = !node.computed || isStaticStringKey(node.property);
            if (holder.type === 'MemberExpression' && !holder.computed && holder.object.type === 'Identifier' && isStaticMember) {
                memberAccessedKeys.add(`${holder.object.name}.${holder.property.name}`);
            }
        },

        ImportDeclaration(node) {
            if (node.importKind === 'type' || !INTERNAL_SOURCE_PATTERN.test(node.source.value)) {
                return;
            }
            for (const specifier of node.specifiers) {
                if (specifier.type !== 'ImportNamespaceSpecifier') {
                    continue;
                }
                // Only references bound to this import are checked, so a same-named local or parameter is ignored.
                for (const variable of context.sourceCode.getDeclaredVariables(specifier)) {
                    for (const {identifier} of variable.references) {
                        const usage = getOpaqueUsage(identifier);
                        if (usage) {
                            report(identifier, usage);
                            continue;
                        }
                        const alias = getAssignedAlias(identifier);
                        if (alias) {
                            pendingAliases.push({identifier, ...alias});
                        }
                    }
                }
            }
        },

        'Program:exit': reportUnreadAliases,
    };
}

export {name, meta, create};
