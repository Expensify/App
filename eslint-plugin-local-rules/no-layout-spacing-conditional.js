const name = 'no-layout-spacing-conditional';

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow picking a horizontal inset (padding or margin) by switching on the layout size. Responsive insets must come from useLayoutSpacing() so every screen agrees on the same values.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        layoutSpacingConditional:
            'Do not pick `{{spacing}}` by switching on `{{test}}`. Use the matching style from `useLayoutSpacing()` (src/styles/layoutSpacing.ts) so the value stays in one place.',
        layoutSpacingConditionalKnown: 'Replace `{{test}} ? styles.{{narrow}} : styles.{{wide}}` with `{{replacement}}` from `useLayoutSpacing()` (src/styles/layoutSpacing.ts).',
    },
};

const LAYOUT_FLAGS = new Set(['shouldUseNarrowLayout', 'isSmallScreenWidth', 'isMediumScreenWidth', 'isLargeScreenWidth', 'isExtraSmallScreenWidth']);
const KNOWN_REPLACEMENTS = {
    'ph5:ph8': 'cardPaddingHorizontal',
    'p5:p8': 'cardPadding',
    'mhn5:mhn8': 'cardEdgeToEdge',
};
const SPACING_CLASS_PATTERN = /^[pm](?:h|l|r|hn|ln|rn)?\d+$/;
const TS_WRAPPER_TYPES = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion']);

function unwrap(node) {
    if (TS_WRAPPER_TYPES.has(node.type)) {
        return unwrap(node.expression);
    }
    return node;
}

function getSpacingClassName(node) {
    const unwrapped = unwrap(node);
    if (unwrapped.type !== 'MemberExpression' || unwrapped.computed || unwrapped.property.type !== 'Identifier') {
        return undefined;
    }
    return SPACING_CLASS_PATTERN.test(unwrapped.property.name) ? unwrapped.property.name : undefined;
}

function findSpacingClassName(node) {
    const unwrapped = unwrap(node);
    if (unwrapped.type === 'ArrayExpression') {
        for (const element of unwrapped.elements) {
            const className = element ? findSpacingClassName(element) : undefined;
            if (className) {
                return className;
            }
        }
        return undefined;
    }
    return getSpacingClassName(unwrapped);
}

function getLayoutFlagName(test) {
    const unwrapped = unwrap(test);
    if (unwrapped.type === 'UnaryExpression' && unwrapped.operator === '!') {
        return getLayoutFlagName(unwrapped.argument);
    }
    if (unwrapped.type === 'Identifier' && LAYOUT_FLAGS.has(unwrapped.name)) {
        return unwrapped.name;
    }
    if (unwrapped.type === 'MemberExpression' && !unwrapped.computed && unwrapped.property.type === 'Identifier' && LAYOUT_FLAGS.has(unwrapped.property.name)) {
        return unwrapped.property.name;
    }
    return undefined;
}

function create(context) {
    return {
        ConditionalExpression(node) {
            const flagName = getLayoutFlagName(node.test);
            if (!flagName) {
                return;
            }
            const narrow = findSpacingClassName(node.consequent);
            const wide = findSpacingClassName(node.alternate);
            const spacing = narrow ?? wide;
            if (!spacing) {
                return;
            }
            const isNegated = unwrap(node.test).type === 'UnaryExpression';
            const pair = isNegated ? `${wide}:${narrow}` : `${narrow}:${wide}`;
            const replacement = KNOWN_REPLACEMENTS[pair];
            if (replacement && getSpacingClassName(node.consequent) && getSpacingClassName(node.alternate)) {
                context.report({
                    node,
                    messageId: 'layoutSpacingConditionalKnown',
                    data: {test: isNegated ? `!${flagName}` : flagName, narrow: narrow, wide: wide, replacement},
                });
                return;
            }
            context.report({
                node,
                messageId: 'layoutSpacingConditional',
                data: {spacing, test: flagName},
            });
        },
    };
}

export {name, meta, create};
