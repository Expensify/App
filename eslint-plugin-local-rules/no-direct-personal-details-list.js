const name = 'no-direct-personal-details-list';

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow direct use of `ONYXKEYS.PERSONAL_DETAILS_LIST`. Personal details are being reshaped into an Onyx collection, so access has to go through a wrapper that can absorb the change.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        directUsage:
            '`ONYXKEYS.PERSONAL_DETAILS_LIST` is migrating to an Onyx collection, so do not reference it directly. In React use @hooks/usePersonalDetails, outside React use @libs/PersonalDetailsStore, and for writes use `buildPersonalDetailsUpdate` from @libs/PersonalDetailsUtils.',
    },
};

const ONYXKEYS_IDENTIFIER = 'ONYXKEYS';
const PERSONAL_DETAILS_LIST_PROPERTY = 'PERSONAL_DETAILS_LIST';

/**
 * Resolves the property name of a member expression when it is statically known, so `ONYXKEYS.PERSONAL_DETAILS_LIST`,
 * `ONYXKEYS['PERSONAL_DETAILS_LIST']` and ``ONYXKEYS[`PERSONAL_DETAILS_LIST`]`` are all treated as the same access.
 * A computed access through a variable stays unresolved, because its value is only known at runtime.
 *
 * @param {import('estree').MemberExpression} node
 * @returns {string | undefined}
 */
function getStaticPropertyName(node) {
    if (!node.computed) {
        return node.property.type === 'Identifier' ? node.property.name : undefined;
    }
    if (node.property.type === 'Literal') {
        return typeof node.property.value === 'string' ? node.property.value : undefined;
    }
    if (node.property.type === 'TemplateLiteral' && node.property.expressions.length === 0 && node.property.quasis.length === 1) {
        return node.property.quasis[0].value.cooked;
    }
    return undefined;
}

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    return {
        // Type positions parse as TSTypeQuery, not MemberExpression, so `typeof ONYXKEYS.PERSONAL_DETAILS_LIST`
        // is allowed: it neither reads nor writes, and it follows the key definition when that is reshaped.
        MemberExpression(node) {
            if (node.object.type !== 'Identifier' || node.object.name !== ONYXKEYS_IDENTIFIER) {
                return;
            }
            if (getStaticPropertyName(node) !== PERSONAL_DETAILS_LIST_PROPERTY) {
                return;
            }
            context.report({node, messageId: 'directUsage'});
        },
    };
}

export {name, meta, create};
