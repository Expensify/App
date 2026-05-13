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

    return getConstRoleValueFromExpression(attribute.value.expression);
}

function getConstRoleValueFromExpression(expression) {
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

function getResolvedRolesFromExpression(expression) {
    if (expression.type === 'Literal' && typeof expression.value === 'string') {
        return new Set([expression.value.toLowerCase()]);
    }

    if (expression.type === 'Identifier' && expression.name === 'undefined') {
        return new Set();
    }

    if (expression.type === 'MemberExpression') {
        const constRoleValue = getConstRoleValueFromExpression(expression);
        return constRoleValue ? new Set([constRoleValue]) : null;
    }

    if (expression.type === 'ConditionalExpression') {
        const consequentRoles = getResolvedRolesFromExpression(expression.consequent);
        const alternateRoles = getResolvedRolesFromExpression(expression.alternate);

        if (!consequentRoles || !alternateRoles) {
            return null;
        }

        return new Set([...consequentRoles, ...alternateRoles]);
    }

    if (expression.type === 'LogicalExpression' && expression.operator === '&&') {
        const rightRoles = getResolvedRolesFromExpression(expression.right);

        if (!rightRoles) {
            return null;
        }

        return rightRoles;
    }

    return null;
}

function getResolvedRoles(attribute) {
    if (!attribute?.value) {
        return new Set();
    }

    if (attribute.value.type === 'Literal' && typeof attribute.value.value === 'string') {
        return new Set([attribute.value.value.toLowerCase()]);
    }

    if (attribute.value.type !== 'JSXExpressionContainer') {
        return null;
    }

    return getResolvedRolesFromExpression(attribute.value.expression);
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
            const resolvedRoles = getResolvedRoles(roleAttribute);
            const hasKnownStatusRole = STATUS_ROLES.has(resolvedRole);
            const hasRoleAttribute = !!roleAttribute;
            const hasLiveRegion = !!liveRegionAttribute;
            const liveRegionValue = getAttributeStringValue(liveRegionAttribute)?.toLowerCase();
            const hasAnyResolvedStatusRole = !!resolvedRoles && [...resolvedRoles].some((role) => STATUS_ROLES.has(role));
            const hasOnlyResolvedNonStatusRoles = !!resolvedRoles && resolvedRoles.size > 0 && !hasAnyResolvedStatusRole;

            if ((hasKnownStatusRole || hasAnyResolvedStatusRole) && !hasLiveRegion) {
                context.report({
                    node,
                    messageId: 'missingLiveRegion',
                });
                return;
            }

            if (hasLiveRegion && (!hasRoleAttribute || hasOnlyResolvedNonStatusRoles)) {
                context.report({
                    node,
                    messageId: 'missingStatusRole',
                });
                return;
            }

            if ((hasKnownStatusRole || hasAnyResolvedStatusRole) && liveRegionValue === 'none') {
                context.report({
                    node,
                    messageId: 'invalidLiveRegion',
                });
            }
        },
    };
}

export {name, meta, create};
