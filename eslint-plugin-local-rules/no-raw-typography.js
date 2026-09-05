const name = 'no-raw-typography';

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow raw numeric fontSize/lineHeight values. Type must come from the typography scale so it cannot drift from the design system.',
        recommended: 'error',
    },
    schema: [
        {
            type: 'object',
            properties: {
                // The styles layer composes tokens out of `variables`, so it is allowed to read
                // `variables.fontSize*`/`variables.lineHeight*` directly. Everywhere else must go
                // through `src/styles/typography.ts`.
                allowVariablesReferences: {type: 'boolean'},
            },
            additionalProperties: false,
        },
    ],
    messages: {
        rawTypography: 'Raw `{{property}}: {{value}}` is not allowed. Use a `<Text variant="...">` or a token from src/styles/typography.ts (https://github.com/Expensify/App/issues/37503).',
        rawTypographyVariable:
            '`{{property}}: {{value}}` bypasses the typography scale. Use a `<Text variant="...">` or a token from src/styles/typography.ts (https://github.com/Expensify/App/issues/37503).',
    },
};

const BANNED_PROPERTIES = new Set(['fontSize', 'lineHeight']);
const BANNED_VARIABLE_PREFIXES = ['fontSize', 'lineHeight'];
const TYPOGRAPHY_STYLE_HELPERS = new Set(['getFontSizeStyle', 'getLineHeightStyle']);
const VARIABLES_MODULE_NAME = 'variables';

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
const TS_WRAPPER_TYPES = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion']);

function unwrap(node) {
    if (TS_WRAPPER_TYPES.has(node.type)) {
        return unwrap(node.expression);
    }
    return node;
}

function isNumericLiteral(node) {
    const unwrapped = unwrap(node);
    if (unwrapped.type === 'Literal' && typeof unwrapped.value === 'number') {
        return true;
    }
    return unwrapped.type === 'UnaryExpression' && (unwrapped.operator === '-' || unwrapped.operator === '+') && isNumericLiteral(unwrapped.argument);
}

/**
 * Matches `variables.fontSizeNormal`, `variables.lineHeightXLarge`, and friends — the named escape
 * hatch around the typography scale. Only the `variables` module is matched; unrelated objects that
 * happen to have a `fontSize*` key are left alone.
 *
 * @param {import('estree').Node} node
 * @returns {boolean}
 */
function isVariablesTypographyReference(node) {
    const unwrapped = unwrap(node);
    if (unwrapped.type !== 'MemberExpression' || unwrapped.computed) {
        return false;
    }
    if (unwrapped.object.type !== 'Identifier' || unwrapped.object.name !== VARIABLES_MODULE_NAME) {
        return false;
    }
    if (unwrapped.property.type !== 'Identifier') {
        return false;
    }
    return BANNED_VARIABLE_PREFIXES.some((prefix) => unwrapped.property.name.startsWith(prefix));
}

/**
 * Flags object properties (`{fontSize: 17}`), JSX attributes (`<Text fontSize={17}>`), and
 * `getFontSizeStyle()`/`getLineHeightStyle()` arguments that set type outside the typography scale —
 * both numeric literals and, unless `allowVariablesReferences` is set, `variables.fontSize*` /
 * `variables.lineHeight*` references.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    const allowVariablesReferences = context.options.at(0)?.allowVariablesReferences ?? false;

    function report(valueNode, propertyName) {
        const isVariableReference = isVariablesTypographyReference(valueNode);
        context.report({
            node: valueNode,
            messageId: isVariableReference ? 'rawTypographyVariable' : 'rawTypography',
            data: {
                property: propertyName,
                value: context.sourceCode.getText(valueNode),
            },
        });
    }

    function isBannedValue(valueNode) {
        if (isNumericLiteral(valueNode)) {
            return true;
        }
        return !allowVariablesReferences && isVariablesTypographyReference(valueNode);
    }

    /**
     * `getFontSizeStyle(x)` and `StyleUtils.getLineHeightStyle(x)` both build a `{fontSize}` /
     * `{lineHeight}` style, so their argument is the same escape hatch as the property itself.
     */
    function getTypographyHelperName(callee) {
        if (callee.type === 'Identifier') {
            return callee.name;
        }
        if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
            return callee.property.name;
        }
        return undefined;
    }

    return {
        Property(node) {
            if (node.computed) {
                return;
            }
            const propertyName = getPropertyName(node.key);
            if (propertyName === undefined || !BANNED_PROPERTIES.has(propertyName) || !isBannedValue(node.value)) {
                return;
            }
            report(node.value, propertyName);
        },
        JSXAttribute(node) {
            if (node.name.type !== 'JSXIdentifier' || !BANNED_PROPERTIES.has(node.name.name)) {
                return;
            }
            if (node.value?.type !== 'JSXExpressionContainer' || !isBannedValue(node.value.expression)) {
                return;
            }
            report(node.value.expression, node.name.name);
        },
        CallExpression(node) {
            const helperName = getTypographyHelperName(node.callee);
            if (helperName === undefined || !TYPOGRAPHY_STYLE_HELPERS.has(helperName)) {
                return;
            }
            const argument = node.arguments.at(0);
            if (!argument || !isBannedValue(argument)) {
                return;
            }
            report(argument, helperName === 'getFontSizeStyle' ? 'fontSize' : 'lineHeight');
        },
    };
}

export {name, meta, create};
