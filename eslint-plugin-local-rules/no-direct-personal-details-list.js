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
 * Search snapshot payloads key their personal details by the same string as the Onyx key, so building one
 * (`data[ONYXKEYS.PERSONAL_DETAILS_LIST] = …`, `Object.assign(data, {[ONYXKEYS.PERSONAL_DETAILS_LIST]: …})`,
 * `{data: {[ONYXKEYS.PERSONAL_DETAILS_LIST]: …}}`) names a payload field rather than touching the Onyx key.
 *
 * @param {import('estree').MemberExpression & import('eslint').Rule.NodeParentExtension} node
 * @returns {boolean}
 */
function isSnapshotPayloadKey(node) {
    const parent = node.parent;
    if (parent.type === 'MemberExpression') {
        return parent.computed && parent.property === node && parent.parent.type === 'AssignmentExpression' && parent.parent.left === parent;
    }
    if (parent.type !== 'Property' || !parent.computed || parent.key !== node) {
        return false;
    }
    const objectLiteral = parent.parent;
    const container = objectLiteral.parent;
    if (container.type === 'Property') {
        return container.value === objectLiteral && !container.computed && container.key.type === 'Identifier' && container.key.name === 'data';
    }
    return (
        container.type === 'CallExpression' &&
        container.arguments.indexOf(objectLiteral) > 0 &&
        container.callee.type === 'MemberExpression' &&
        container.callee.object.type === 'Identifier' &&
        container.callee.object.name === 'Object' &&
        container.callee.property.type === 'Identifier' &&
        container.callee.property.name === 'assign'
    );
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
            if (getStaticPropertyName(node) !== PERSONAL_DETAILS_LIST_PROPERTY || isSnapshotPayloadKey(node)) {
                return;
            }
            context.report({node, messageId: 'directUsage'});
        },
    };
}

export {name, meta, create};
