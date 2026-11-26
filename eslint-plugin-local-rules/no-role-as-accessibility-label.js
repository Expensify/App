/** Reports `CONST.ROLE.*` used as an accessible name: screen readers already announce the role, so it would be read twice and in English. */
const name = 'no-role-as-accessibility-label';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow CONST.ROLE values as accessibility labels.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        roleAsLabel:
            '`{{prop}}` gets `CONST.ROLE.{{role}}`, a role, not a name. The screen reader announces the role on its own. Give the label text that names this control, from `translate(...)`.',
    },
};

const ACCESSIBLE_NAME_PROPS = new Set(['accessibilityLabel', 'aria-label', 'switchAccessibilityLabel']);
const TS_WRAPPER_TYPES = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion']);

function unwrap(node) {
    if (TS_WRAPPER_TYPES.has(node.type)) {
        return unwrap(node.expression);
    }
    return node;
}

function getPropertyName(node) {
    if (!node.computed && node.property.type === 'Identifier') {
        return node.property.name;
    }
    if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
        return node.property.value;
    }
    return undefined;
}

/** Returns the `X` of a `CONST.ROLE.X` expression, or undefined for anything else. */
function getRoleName(node) {
    if (node.type !== 'MemberExpression') {
        return undefined;
    }
    const roleGroup = unwrap(node.object);
    if (roleGroup.type !== 'MemberExpression' || getPropertyName(roleGroup) !== 'ROLE') {
        return undefined;
    }
    const constObject = unwrap(roleGroup.object);
    if (constObject.type !== 'Identifier' || constObject.name !== 'CONST') {
        return undefined;
    }
    return getPropertyName(node);
}

/** Finds every `CONST.ROLE.X` the value can resolve to, through `??`, `||`, `&&` and ternaries. */
function findRoleValues(node, found = []) {
    const unwrapped = unwrap(node);
    if (unwrapped.type === 'LogicalExpression') {
        findRoleValues(unwrapped.left, found);
        findRoleValues(unwrapped.right, found);
        return found;
    }
    if (unwrapped.type === 'ConditionalExpression') {
        findRoleValues(unwrapped.consequent, found);
        findRoleValues(unwrapped.alternate, found);
        return found;
    }
    const role = getRoleName(unwrapped);
    if (role) {
        found.push({node: unwrapped, role});
    }
    return found;
}

function create(context) {
    function check(prop, value) {
        for (const {node, role} of findRoleValues(value)) {
            context.report({node, messageId: 'roleAsLabel', data: {prop, role}});
        }
    }

    return {
        JSXAttribute(node) {
            if (node.name.type !== 'JSXIdentifier' || !ACCESSIBLE_NAME_PROPS.has(node.name.name)) {
                return;
            }
            if (node.value?.type !== 'JSXExpressionContainer' || node.value.expression.type === 'JSXEmptyExpression') {
                return;
            }
            check(node.name.name, node.value.expression);
        },

        // Props are also passed as objects, e.g. spread into a component or listed in a menu item config.
        Property(node) {
            if (node.computed) {
                return;
            }
            let propName;
            if (node.key.type === 'Identifier') {
                propName = node.key.name;
            } else if (node.key.type === 'Literal') {
                propName = node.key.value;
            }
            if (!ACCESSIBLE_NAME_PROPS.has(propName)) {
                return;
            }
            check(propName, node.value);
        },
    };
}

export {name, meta, create};
