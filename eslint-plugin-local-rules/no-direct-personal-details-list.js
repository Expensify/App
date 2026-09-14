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
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    return {
        // Type positions parse as TSTypeQuery, not MemberExpression, so `typeof ONYXKEYS.PERSONAL_DETAILS_LIST`
        // is allowed: it neither reads nor writes, and it follows the key definition when that is reshaped.
        MemberExpression(node) {
            if (node.computed || node.object.type !== 'Identifier' || node.object.name !== ONYXKEYS_IDENTIFIER) {
                return;
            }
            if (node.property.type !== 'Identifier' || node.property.name !== PERSONAL_DETAILS_LIST_PROPERTY) {
                return;
            }
            context.report({node, messageId: 'directUsage'});
        },
    };
}

export {name, meta, create};
