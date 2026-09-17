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
                // For the styles layer, which composes tokens out of `variables`. Raw numeric literals stay banned there.
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
 * Matches `variables.fontSize*` / `variables.lineHeight*`, the named escape hatch around the scale.
 * Syntactic match on the `variables.<name>` shape, so a renamed or destructured import is not flagged.
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
 * @param {import('eslint').Scope.Scope | null} scope
 * @param {string} variableName
 * @returns {import('eslint').Scope.Variable | undefined}
 */
function findVariable(scope, variableName) {
    for (let current = scope; current; current = current.upper) {
        const variable = current.set.get(variableName);
        if (variable) {
            return variable;
        }
    }
    return undefined;
}

/**
 * The expression a single-definition `const` alias was assigned, so `const size = variables.fontSizeXXSmall`
 * plus `getFontSizeStyle(size)` is still caught. Only `variables.*` is traced, never bare numbers.
 *
 * @param {import('eslint').Scope.Variable} variable
 * @returns {import('estree').Node | undefined}
 */
function getConstInitializer(variable) {
    if (variable.defs.length !== 1) {
        return undefined;
    }
    const definition = variable.defs.at(0);
    if (definition.type !== 'Variable' || definition.parent.kind !== 'const' || definition.node.id.type !== 'Identifier') {
        return undefined;
    }
    return definition.node.init ?? undefined;
}

/**
 * Flags object properties, JSX attributes, and `getFontSizeStyle()`/`getLineHeightStyle()` arguments that
 * set type outside the typography scale. With `allowVariablesReferences`, only numeric literals are banned.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    const allowVariablesReferences = context.options.at(0)?.allowVariablesReferences ?? false;

    function report(valueNode, propertyName, bannedValue) {
        context.report({
            node: valueNode,
            messageId: bannedValue.messageId,
            data: {
                property: propertyName,
                value: context.sourceCode.getText(bannedValue.node),
            },
        });
    }

    /**
     * Walks past ternaries and `const` aliases so the banned value is found wherever it was written,
     * not only when it sits directly in the banned position.
     *
     * @param {import('estree').Node} valueNode
     * @param {Set<import('eslint').Scope.Variable>} visitedVariables guards against cyclic aliases
     * @param {boolean} isBehindAlias set once the walk has stepped through a `const`, after which bare numbers are not flagged
     * @returns {{messageId: string, node: import('estree').Node} | undefined}
     */
    function findBannedValue(valueNode, visitedVariables, isBehindAlias) {
        const unwrapped = unwrap(valueNode);
        if (!isBehindAlias && isNumericLiteral(unwrapped)) {
            return {messageId: 'rawTypography', node: unwrapped};
        }
        if (!allowVariablesReferences && isVariablesTypographyReference(unwrapped)) {
            return {messageId: 'rawTypographyVariable', node: unwrapped};
        }
        if (unwrapped.type === 'ConditionalExpression') {
            return findBannedValue(unwrapped.consequent, visitedVariables, isBehindAlias) ?? findBannedValue(unwrapped.alternate, visitedVariables, isBehindAlias);
        }
        if (unwrapped.type !== 'Identifier') {
            return undefined;
        }
        const variable = findVariable(context.sourceCode.getScope(unwrapped), unwrapped.name);
        if (!variable || visitedVariables.has(variable)) {
            return undefined;
        }
        visitedVariables.add(variable);
        const initializer = getConstInitializer(variable);
        return initializer ? findBannedValue(initializer, visitedVariables, true) : undefined;
    }

    function getBannedValue(valueNode) {
        return findBannedValue(valueNode, new Set(), false);
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
            if (propertyName === undefined || !BANNED_PROPERTIES.has(propertyName)) {
                return;
            }
            const bannedValue = getBannedValue(node.value);
            if (!bannedValue) {
                return;
            }
            report(node.value, propertyName, bannedValue);
        },
        JSXAttribute(node) {
            if (node.name.type !== 'JSXIdentifier' || !BANNED_PROPERTIES.has(node.name.name)) {
                return;
            }
            if (node.value?.type !== 'JSXExpressionContainer') {
                return;
            }
            const bannedValue = getBannedValue(node.value.expression);
            if (!bannedValue) {
                return;
            }
            report(node.value.expression, node.name.name, bannedValue);
        },
        CallExpression(node) {
            const helperName = getTypographyHelperName(node.callee);
            if (helperName === undefined || !TYPOGRAPHY_STYLE_HELPERS.has(helperName)) {
                return;
            }
            const argument = node.arguments.at(0);
            if (!argument) {
                return;
            }
            const bannedValue = getBannedValue(argument);
            if (!bannedValue) {
                return;
            }
            report(argument, helperName === 'getFontSizeStyle' ? 'fontSize' : 'lineHeight', bannedValue);
        },
    };
}

export {name, meta, create};
