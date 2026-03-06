const name = 'require-live-region-for-status-updates';

const STATUS_ROLES = new Set(['alert', 'status']);

const meta = {
    type: 'problem',
    docs: {
        description: 'Require role/accessibilityRole and accessibilityLiveRegion to be used together for status updates.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        missingLiveRegion: 'Elements with role/accessibilityRole set to "alert" or "status" must include accessibilityLiveRegion so updates are announced.',
        missingStatusRole: 'Elements with accessibilityLiveRegion must include role/accessibilityRole set to "alert" or "status" so assistive technologies treat updates as status messages.',
        invalidLiveRegion: 'Use accessibilityLiveRegion="polite" or "assertive" for status updates; "none" suppresses announcements.',
    },
};

function getJSXAttribute(node, names) {
    return node.attributes.find((attribute) => attribute.type === 'JSXAttribute' && names.includes(attribute.name?.name));
}

function getAttributeStringValue(attribute) {
    if (!attribute?.value) {
        return null;
    }

    if (attribute.value.type === 'Literal' && typeof attribute.value.value === 'string') {
        return attribute.value.value;
    }

    if (attribute.value.type !== 'JSXExpressionContainer') {
        return null;
    }

    if (attribute.value.expression.type === 'Literal' && typeof attribute.value.expression.value === 'string') {
        return attribute.value.expression.value;
    }

    return null;
}

function getConstRoleValue(attribute) {
    if (attribute?.value?.type !== 'JSXExpressionContainer') {
        return null;
    }

    const expression = attribute.value.expression;
    if (expression.type !== 'MemberExpression' || expression.computed || expression.property.type !== 'Identifier') {
        return null;
    }

    if (
        expression.object.type !== 'MemberExpression' ||
        expression.object.computed ||
        expression.object.object.type !== 'Identifier' ||
        expression.object.object.name !== 'CONST' ||
        expression.object.property.type !== 'Identifier' ||
        expression.object.property.name !== 'ROLE'
    ) {
        return null;
    }

    return expression.property.name.toLowerCase();
}

function getResolvedRole(attribute) {
    return getAttributeStringValue(attribute)?.toLowerCase() ?? getConstRoleValue(attribute);
}

function create(context) {
    return {
        JSXOpeningElement(node) {
            const roleAttribute = getJSXAttribute(node, ['role', 'accessibilityRole']);
            const liveRegionAttribute = getJSXAttribute(node, ['accessibilityLiveRegion']);

            const resolvedRole = getResolvedRole(roleAttribute);
            const hasKnownStatusRole = STATUS_ROLES.has(resolvedRole);
            const hasRoleAttribute = !!roleAttribute;
            const hasLiveRegion = !!liveRegionAttribute;
            const liveRegionValue = getAttributeStringValue(liveRegionAttribute)?.toLowerCase();

            if (hasKnownStatusRole && !hasLiveRegion) {
                context.report({
                    node,
                    messageId: 'missingLiveRegion',
                });
                return;
            }

            if (hasLiveRegion && !hasKnownStatusRole && !hasRoleAttribute) {
                context.report({
                    node,
                    messageId: 'missingStatusRole',
                });
                return;
            }

            if (hasKnownStatusRole && liveRegionValue === 'none') {
                context.report({
                    node,
                    messageId: 'invalidLiveRegion',
                });
            }
        },
    };
}

export {name, meta, create};
