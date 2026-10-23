const name = 'no-onyx-loading-status';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow `isLoadingOnyxValue` and reads of `status` from `useOnyx` results, because Onyx is dropping per-key loading status.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        isLoadingOnyxValueUsage:
            'Do not use `isLoadingOnyxValue`. Onyx is dropping per-key loading status from `useOnyx`. Read the value directly and treat `undefined` as no data (https://github.com/Expensify/App/issues/104583).',
        statusRead:
            'Do not read `status` from a `useOnyx` result. Onyx is dropping per-key loading status. Read the value directly and treat `undefined` as no data (https://github.com/Expensify/App/issues/104583).',
    },
};

const USE_ONYX_IDENTIFIER = 'useOnyx';
const USE_ONYX_HOOK_PATH_SUFFIX = 'hooks/useOnyx';
const STATUS_PROPERTY = 'status';
const IS_LOADING_ONYX_VALUE_PATH_SUFFIX = 'types/utils/isLoadingOnyxValue';

/**
 * @param {import('estree').MemberExpression | import('estree').Property} node
 * @returns {string | undefined}
 */
function getStaticKeyName(node) {
    const key = node.type === 'MemberExpression' ? node.property : node.key;
    if (!node.computed) {
        return key.type === 'Identifier' ? key.name : undefined;
    }
    if (key.type === 'Literal') {
        return typeof key.value === 'string' ? key.value : undefined;
    }
    if (key.type === 'TemplateLiteral' && key.expressions.length === 0 && key.quasis.length === 1) {
        return key.quasis[0].value.cooked;
    }
    return undefined;
}

/**
 * @param {import('estree').Pattern} pattern
 * @returns {import('estree').Property | undefined}
 */
function findStatusProperty(pattern) {
    if (pattern.type !== 'ObjectPattern') {
        return undefined;
    }
    return pattern.properties.find((property) => property.type === 'Property' && getStaticKeyName(property) === STATUS_PROPERTY);
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    // Local names `useOnyx` is called by in this file, so aliased imports like `{useOnyx as useOnyxWithoutSnapshots}` are checked too
    const useOnyxNames = new Set([USE_ONYX_IDENTIFIER]);

    /**
     * Reports `metadata.status`, `metadata?.status` and `const {status} = metadata` for a variable holding `useOnyx` result metadata.
     *
     * @param {import('eslint').Scope.Variable} variable
     */
    function reportStatusReads(variable) {
        for (const reference of variable.references) {
            const identifier = reference.identifier;
            const parent = identifier.parent;
            if (parent.type === 'MemberExpression' && parent.object === identifier && getStaticKeyName(parent) === STATUS_PROPERTY) {
                context.report({node: parent, messageId: 'statusRead'});
                continue;
            }
            if (parent.type === 'VariableDeclarator' && parent.init === identifier) {
                const statusProperty = findStatusProperty(parent.id);
                if (statusProperty) {
                    context.report({node: statusProperty, messageId: 'statusRead'});
                }
            }
        }
    }

    return {
        ImportDeclaration(node) {
            if (typeof node.source.value !== 'string') {
                return;
            }
            const source = node.source.value;
            for (const specifier of node.specifiers) {
                const isNamedUseOnyx = specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier' && specifier.imported.name === USE_ONYX_IDENTIFIER;
                const isDefaultUseOnyxHook = specifier.type === 'ImportDefaultSpecifier' && source.endsWith(USE_ONYX_HOOK_PATH_SUFFIX);
                if (isNamedUseOnyx || isDefaultUseOnyxHook) {
                    useOnyxNames.add(specifier.local.name);
                }
            }
            if (!source.endsWith(IS_LOADING_ONYX_VALUE_PATH_SUFFIX)) {
                return;
            }
            for (const variable of context.sourceCode.getDeclaredVariables(node)) {
                for (const reference of variable.references) {
                    context.report({node: reference.identifier, messageId: 'isLoadingOnyxValueUsage'});
                }
            }
        },

        VariableDeclarator(node) {
            if (node.id.type !== 'ArrayPattern' || node.init?.type !== 'CallExpression') {
                return;
            }
            const callee = node.init.callee;
            if (callee.type !== 'Identifier' || !useOnyxNames.has(callee.name)) {
                return;
            }
            const metadataPattern = node.id.elements.at(1);
            if (!metadataPattern) {
                return;
            }
            if (metadataPattern.type === 'Identifier') {
                const variable = context.sourceCode.getDeclaredVariables(node).find((declaredVariable) => declaredVariable.name === metadataPattern.name);
                if (variable) {
                    reportStatusReads(variable);
                }
                return;
            }
            const statusProperty = findStatusProperty(metadataPattern);
            if (statusProperty) {
                context.report({node: statusProperty, messageId: 'statusRead'});
            }
        },
    };
}

export {name, meta, create};
