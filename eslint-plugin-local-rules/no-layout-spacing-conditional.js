const name = 'no-layout-spacing-conditional';

const meta = {
    type: 'problem',
    docs: {
        description:
            'Disallow spelling the card inset by hand as a narrow/wide ternary over spacing helpers. Card padding must come from useLayoutSpacing() so every screen agrees on the same values.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        layoutSpacingConditional:
            '`{{test}} ? styles.{{first}} : styles.{{second}}` spells the card inset by hand. Use the matching style from `useLayoutSpacing()` (src/styles/layoutSpacing.ts) so the value stays in one place.',
        layoutSpacingConditionalKnown: 'Replace `{{test}} ? styles.{{first}} : styles.{{second}}` with `{{replacement}}` from `useLayoutSpacing()` (src/styles/layoutSpacing.ts).',
    },
};

const NARROW_FLAGS = new Set(['shouldUseNarrowLayout', 'isSmallScreenWidth', 'isExtraSmallScreenWidth']);
const WIDE_FLAGS = new Set(['isLargeScreenWidth', 'isExtraLargeScreenWidth']);
const KNOWN_REPLACEMENTS = {
    'ph5:ph8': 'cardPaddingHorizontal',
    'p5:p8': 'cardPadding',
    'mhn5:mhn8': 'cardEdgeToEdge',
};
const SPACING_CLASS_PATTERN = /^([pm](?:h|l|r|hn|ln|rn)?)(\d+)$/;
const CARD_PADDING_STEPS = {narrow: '5', wide: '8'};
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

function getLayoutFlag(test) {
    const unwrapped = unwrap(test);
    if (unwrapped.type === 'UnaryExpression' && unwrapped.operator === '!') {
        const inner = getLayoutFlag(unwrapped.argument);
        return inner ? {name: `!${inner.name}`, isNarrowWhenTrue: !inner.isNarrowWhenTrue} : undefined;
    }
    let flagName;
    if (unwrapped.type === 'Identifier') {
        flagName = unwrapped.name;
    } else if (unwrapped.type === 'MemberExpression' && !unwrapped.computed && unwrapped.property.type === 'Identifier') {
        flagName = unwrapped.property.name;
    }
    if (NARROW_FLAGS.has(flagName)) {
        return {name: flagName, isNarrowWhenTrue: true};
    }
    if (WIDE_FLAGS.has(flagName)) {
        return {name: flagName, isNarrowWhenTrue: false};
    }
    return undefined;
}

function create(context) {
    return {
        ConditionalExpression(node) {
            const flag = getLayoutFlag(node.test);
            if (!flag) {
                return;
            }
            const first = findSpacingClassName(node.consequent);
            const second = findSpacingClassName(node.alternate);
            if (!first || !second) {
                return;
            }
            const narrow = flag.isNarrowWhenTrue ? first : second;
            const wide = flag.isNarrowWhenTrue ? second : first;
            const [, narrowPrefix, narrowStep] = SPACING_CLASS_PATTERN.exec(narrow);
            const [, widePrefix, wideStep] = SPACING_CLASS_PATTERN.exec(wide);
            if (narrowPrefix !== widePrefix || narrowStep !== CARD_PADDING_STEPS.narrow || wideStep !== CARD_PADDING_STEPS.wide) {
                return;
            }
            const replacement = KNOWN_REPLACEMENTS[`${narrow}:${wide}`];
            const data = {test: flag.name, first, second};
            if (replacement) {
                context.report({node, messageId: 'layoutSpacingConditionalKnown', data: {...data, replacement}});
                return;
            }
            context.report({node, messageId: 'layoutSpacingConditional', data});
        },
    };
}

export {name, meta, create};
