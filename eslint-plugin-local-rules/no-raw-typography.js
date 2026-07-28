const name = 'no-raw-typography';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow raw numeric fontSize/lineHeight values. Type must come from the typography scale so it cannot drift from the design system.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        rawTypography: 'Raw `{{property}}: {{value}}` is not allowed. Use a `<Text variant="...">` or a token from src/styles/typography.ts (https://github.com/Expensify/App/issues/37503).',
    },
};

const BANNED_PROPERTIES = new Set(['fontSize', 'lineHeight']);

/**
 * @param {import('estree').Node} key
 * @returns {string | undefined}
 */
function getPropertyName(key) {
    if (key.type === 'Identifier') {
        return key.name;
    }
    if (key.type === 'Literal' && typeof key.value === 'string') {
        return key.value;
    }
    return undefined;
}

/**
 * @param {import('estree').Node} node
 * @returns {boolean}
 */
function isNumericLiteral(node) {
    if (node.type === 'Literal' && typeof node.value === 'number') {
        return true;
    }
    return node.type === 'UnaryExpression' && node.operator === '-' && isNumericLiteral(node.argument);
}

/**
 * Flags object properties (`{fontSize: 17}`) and JSX attributes (`<Text fontSize={17}>`) that set
 * `fontSize`/`lineHeight` to a numeric literal. References to tokens or computed values are allowed.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    function report(valueNode, propertyName) {
        context.report({
            node: valueNode,
            messageId: 'rawTypography',
            data: {
                property: propertyName,
                value: context.sourceCode.getText(valueNode),
            },
        });
    }

    return {
        Property(node) {
            if (node.computed) {
                return;
            }
            const propertyName = getPropertyName(node.key);
            if (propertyName === undefined || !BANNED_PROPERTIES.has(propertyName) || !isNumericLiteral(node.value)) {
                return;
            }
            report(node.value, propertyName);
        },
        JSXAttribute(node) {
            if (node.name.type !== 'JSXIdentifier' || !BANNED_PROPERTIES.has(node.name.name)) {
                return;
            }
            if (node.value?.type !== 'JSXExpressionContainer' || !isNumericLiteral(node.value.expression)) {
                return;
            }
            report(node.value.expression, node.name.name);
        },
    };
}

export {name, meta, create};
