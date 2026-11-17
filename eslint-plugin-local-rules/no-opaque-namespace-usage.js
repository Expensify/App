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

// The forms checked here are the namespace usages that knip 6.34 treats as "every export of the module is used" (its internal OPAQUE mark), so unused exports of the module are not reported.
// Verified by running knip with `include: ["nsExports", "nsTypes"]`. Every other whole-namespace use (`f(NS)`, `console.log(NS)`, `typeof NS`, `Reflect.ownKeys(NS)`, `Object.assign({}, NS)`, spread into a call, an array or JSX, return, export, `in`, ...)
// does not hide anything: knip either does not see the use or sees only a bare reference, and then it reports the exports it cannot attribute (as `nsExports` when no importer of the module accesses `NS.member`, otherwise as `exports`).
// Re-verify the forms when knip is upgraded.
// Known differences from knip that are not worth the complexity (found by a differential fuzz of the rule against knip 6.34, none occurs in the repo): knip ignores scope, so an alias of a shadowed
// or parenthesized namespace (`function f(NS) {const a = NS}`, `const a = (NS)`) and two `{key: NS}` declarations with the same variable and key are handled differently by it; type-only namespaces used as values are invalid TypeScript.
// Knip only matches a bare identifier, so TypeScript wrappers such as `NS as T` or `NS!` make a usage tracked, and the rule does not look through them.

// Namespace imports of packages are out of scope: knip only reports unused exports of the repo's own modules.
// Knip registers an alias (`const A = X`, `cond ? X : y`, `{...X}`) for every import that resolves to a file of the repo, whatever the kind: named, default, namespace, type-only
// (`import type`, `import {type X}`), `import X = require()`, JSON and asset files, re-exports, path aliases and files its config ignores. An import of a package (including `node:` modules)
// or an unresolvable one is not registered. The rule has no resolver, so INTERNAL_SOURCE_PATTERN stands in for "resolves to a file of the repo".
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
 * unless the alias is member-accessed somewhere in the file (knip stops hiding them only when no importer of the module accesses `NS.member` in any file, a condition a per-file rule cannot see, so the rule is stricter): `const a = NS`, `const a = cond ? NS : other`, `const a = {...NS}` and `const a = {key: NS}`.
 * Passing or exporting the alias does not count as an access. An exported `const a = {...NS}` is tracked.
 * @param {import('estree').Node} reference The identifier that references the namespace.
 * @returns {{aliasName: string, key?: string, declaratorStart: number} | undefined} The variable the namespace is assigned to, the object key for the `{key: NS}` form, and where the declaration starts.
 */
function getAssignedAlias(reference) {
    const {parent} = reference;
    let declarator;
    let key;

    // Knip registers `const {value: Alias = X} = init` (a default of a property of the top-level pattern) as an alias named `Alias`.
    if (parent.type === 'AssignmentPattern' && parent.right === reference && parent.left.type === 'Identifier' && isTopLevelDestructuringDefault(parent)) {
        return {aliasName: parent.left.name, key: undefined, declaratorStart: parent.parent.parent.parent.range[0]};
    }

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
    return {aliasName: declarator.id.name, key, declaratorStart: declarator.range[0]};
}

/**
 * Knip counts `export const a = {...X}` (also nested in an object, `{k: {...X}}`) of any import of the repo as an access to every alias named `a`, in any scope and in any order.
 * @param {import('estree').Node} reference The identifier that references the import.
 * @returns {string | undefined} The name of the exported variable the import is spread into.
 */
function getExportedSpreadName(reference) {
    if (reference.parent.type !== 'SpreadElement') {
        return undefined;
    }
    let node = reference.parent.parent;
    // Knip descends only through properties with an identifier key, so `{'nested': {...X}}` is not followed.
    while (node.type === 'ObjectExpression' && node.parent.type === 'Property' && node.parent.key.type === 'Identifier') {
        node = node.parent.parent;
    }
    if (node.type !== 'ObjectExpression' || node.parent.type !== 'VariableDeclarator' || node.parent.id.type !== 'Identifier' || !isExportedDeclarator(node.parent)) {
        return undefined;
    }
    return node.parent.id.name;
}

/** @type {import('eslint').Rule.RuleModule['create']} */
function create(context) {
    // Knip matches aliases by name and ignores scopes, so the rule collects names the same way. Knip also registers an alias when it reaches the declaration
    // and counts only the member accesses it reaches afterwards, in source order, whatever the scope. So an access is stored as the position of its latest occurrence.
    const lastMemberAccessStart = new Map();
    const pendingAliases = [];
    const otherAliasDeclarations = [];
    const exportedSpreadNames = new Set();

    /**
     * @param {string} readKey `alias` or `alias.key`
     * @param {import('estree').Node} node
     */
    function recordMemberAccess(readKey, node) {
        lastMemberAccessStart.set(readKey, Math.max(lastMemberAccessStart.get(readKey) ?? -1, node.range[0]));
    }

    /**
     * @param {import('estree').Identifier} identifier
     * @param {string} usage
     */
    function report(identifier, usage) {
        context.report({node: identifier, messageId: 'opaqueNamespaceUsage', data: {name: identifier.name, usage}});
    }

    /** Whether an alias is member-accessed is only known once the whole file is traversed, so the aliases are reported on Program:exit. */
    function reportUnreadAliases() {
        // Aliases with the same name are one alias for knip: an access counts once it follows the first declaration of the name.
        const firstDeclarationStart = new Map();
        for (const {aliasName, key, declaratorStart} of [...pendingAliases, ...otherAliasDeclarations]) {
            const readKey = key ? `${aliasName}.${key}` : aliasName;
            firstDeclarationStart.set(readKey, Math.min(firstDeclarationStart.get(readKey) ?? Infinity, declaratorStart));
        }
        for (const {identifier, aliasName, key} of pendingAliases) {
            const readKey = key ? `${aliasName}.${key}` : aliasName;
            const isRead = (lastMemberAccessStart.get(readKey) ?? -1) > firstDeclarationStart.get(readKey) || (!key && exportedSpreadNames.has(aliasName));
            if (!isRead) {
                report(identifier, 'unread alias');
            }
        }
    }

    /**
     * @param {import('estree').Node} bindingNode The import specifier or the `import Name = require()` declaration that declares the local name.
     * @param {boolean} isInternal Whether the import resolves to a module of the repo.
     * @param {boolean} isCheckedNamespace Whether the binding is a value namespace import of an internal module.
     */
    function processImportBinding(bindingNode, isInternal, isCheckedNamespace) {
        // Only references bound to this import are checked, so a same-named local or parameter is ignored.
        for (const variable of context.sourceCode.getDeclaredVariables(bindingNode)) {
            for (const {identifier} of variable.references) {
                const spreadName = isInternal ? getExportedSpreadName(identifier) : undefined;
                if (spreadName) {
                    exportedSpreadNames.add(spreadName);
                }
                if (isCheckedNamespace) {
                    const usage = getOpaqueUsage(identifier);
                    if (usage) {
                        report(identifier, usage);
                        continue;
                    }
                }
                const alias = getAssignedAlias(identifier);
                if (!alias) {
                    continue;
                }
                if (isCheckedNamespace) {
                    pendingAliases.push({identifier, ...alias});
                } else if (isInternal && !alias.key) {
                    // Knip registers an alias of every import that resolves to a module of the repo (named, default, type-only, `import = require`, JSON, assets, re-exports), under the same name,
                    // which is only a declaration for the source order. It does not register an alias of a package or an unresolved import, nor the `{key: value}` form of a non-namespace import.
                    otherAliasDeclarations.push(alias);
                }
            }
        }
    }

    return {
        MemberExpression(node) {
            if (node.object.type === 'Identifier') {
                recordMemberAccess(node.object.name, node);
            }

            // Collect `holder.key.member` and `holder.key['member']`, which read the `{key: NS}` form.
            const holder = node.object;
            const isStaticMember = !node.computed || isStaticStringKey(node.property);
            if (holder.type === 'MemberExpression' && !holder.computed && holder.object.type === 'Identifier' && isStaticMember) {
                recordMemberAccess(`${holder.object.name}.${holder.property.name}`, node);
            }
        },

        ImportDeclaration(node) {
            const isInternal = INTERNAL_SOURCE_PATTERN.test(node.source.value);
            for (const specifier of node.specifiers) {
                // A type-only namespace import has no runtime exports to hide, so it is never checked, but knip still registers its aliases like any other import.
                const isCheckedNamespace = isInternal && specifier.type === 'ImportNamespaceSpecifier' && node.importKind !== 'type';
                processImportBinding(specifier, isInternal, isCheckedNamespace);
            }
        },

        // `import Name = require('./module')` is an import for knip, a default one.
        TSImportEqualsDeclaration(node) {
            const reference = node.moduleReference;
            if (reference.type === 'TSExternalModuleReference' && reference.expression.type === 'Literal' && typeof reference.expression.value === 'string') {
                processImportBinding(node, INTERNAL_SOURCE_PATTERN.test(reference.expression.value), false);
            }
        },

        'Program:exit': reportUnreadAliases,
    };
}

export {name, meta, create};
