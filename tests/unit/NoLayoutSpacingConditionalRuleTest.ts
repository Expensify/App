import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
import {parser as tsParser} from 'typescript-eslint';

type LocalRuleModule = Rule.RuleModule & {
    name: string;
};

function isLocalRuleModule(ruleModule: unknown): ruleModule is LocalRuleModule {
    if (typeof ruleModule !== 'object' || ruleModule === null) {
        return false;
    }

    const ruleName: unknown = Reflect.get(ruleModule, 'name');
    const create: unknown = Reflect.get(ruleModule, 'create');
    const meta: unknown = Reflect.get(ruleModule, 'meta');

    return typeof ruleName === 'string' && typeof create === 'function' && typeof meta === 'object' && meta !== null;
}

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-layout-spacing-conditional');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-layout-spacing-conditional to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

const tsRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

describe('no-layout-spacing-conditional', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            'const {cardPaddingHorizontal} = useLayoutSpacing(); const style = [styles.flexRow, cardPaddingHorizontal];',
            'const style = shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow;',
            'const style = shouldUseNarrowLayout ? styles.alignItemsCenter : styles.alignItemsStart;',
            'const style = isSelected ? styles.ph5 : styles.ph8;',
            'const style = shouldUseNarrowLayout ? {marginBottom: variables.bottomTabHeight} : undefined;',
            'const jsx = <View style={shouldUseNarrowLayout ? styles.w100 : styles.flex1} />;',
            'const style = styles.ph5;',
            'const style = shouldUseNarrowLayout ? styles.pb2 : styles.pb5;',
            'const style = shouldUseNarrowLayout ? styles.mt3 : styles.mt5;',
            'const style = shouldUseNarrowLayout ? styles.gap3 : styles.gap5;',
            'const style = shouldUseNarrowLayout ? styles.ph3 : styles.ph2;',
            'const style = shouldUseNarrowLayout ? styles.mh5 : styles.mh2;',
            'const style = isLargeScreenWidth ? styles.mr3 : styles.mr2;',
            'const style = shouldUseNarrowLayout ? styles.p3 : styles.p4;',
            'const style = shouldUseNarrowLayout ? styles.ph5 : styles.mh8;',
            'const style = shouldUseNarrowLayout ? styles.ph5 : undefined;',
            'const style = isLargeScreenWidth ? styles.ph5 : styles.ph8;',
            'const style = isMediumScreenWidth ? styles.ph5 : styles.ph8;',
        ],
        invalid: [
            {
                code: 'const style = shouldUseNarrowLayout ? styles.ph5 : styles.ph8;',
                errors: [{messageId: 'layoutSpacingConditionalKnown', data: {test: 'shouldUseNarrowLayout', first: 'ph5', second: 'ph8', replacement: 'cardPaddingHorizontal'}}],
            },
            {
                code: 'const style = isSmallScreenWidth ? styles.p5 : styles.p8;',
                errors: [{messageId: 'layoutSpacingConditionalKnown', data: {test: 'isSmallScreenWidth', first: 'p5', second: 'p8', replacement: 'cardPadding'}}],
            },
            {
                code: 'const style = shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8;',
                errors: [{messageId: 'layoutSpacingConditionalKnown', data: {test: 'shouldUseNarrowLayout', first: 'mhn5', second: 'mhn8', replacement: 'cardEdgeToEdge'}}],
            },
            {
                code: 'const style = shouldUseNarrowLayout ? [styles.ph5, styles.pb5] : [styles.ph8, styles.pb8];',
                errors: [{messageId: 'layoutSpacingConditionalKnown'}],
            },
            {
                code: 'const style = shouldUseNarrowLayout ? styles.ph5 : [styles.ph8, styles.pt3];',
                errors: [{messageId: 'layoutSpacingConditionalKnown'}],
            },
            {
                code: 'const style = !shouldUseNarrowLayout ? styles.ph8 : styles.ph5;',
                errors: [{messageId: 'layoutSpacingConditionalKnown', data: {test: '!shouldUseNarrowLayout', first: 'ph8', second: 'ph5', replacement: 'cardPaddingHorizontal'}}],
            },
            {
                code: 'const style = isLargeScreenWidth ? styles.ph8 : styles.ph5;',
                errors: [{messageId: 'layoutSpacingConditionalKnown', data: {test: 'isLargeScreenWidth', first: 'ph8', second: 'ph5', replacement: 'cardPaddingHorizontal'}}],
            },
            {
                code: 'const style = layout.shouldUseNarrowLayout ? styles.ph5 : styles.ph8;',
                errors: [{messageId: 'layoutSpacingConditionalKnown'}],
            },
            {
                code: 'const jsx = <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]} />;',
                errors: [{messageId: 'layoutSpacingConditionalKnown'}],
            },
            {
                code: 'const style = shouldUseNarrowLayout ? styles.pl5 : styles.pl8;',
                errors: [{messageId: 'layoutSpacingConditional', data: {test: 'shouldUseNarrowLayout', first: 'pl5', second: 'pl8'}}],
            },
            {
                code: 'const style = isLargeScreenWidth ? styles.mr8 : styles.mr5;',
                errors: [{messageId: 'layoutSpacingConditional'}],
            },
        ],
    });

    tsRuleTester.run(`${ruleModule.name} (typescript)`, ruleModule, {
        valid: ['const style = shouldUseNarrowLayout ? (styles.flexColumn as ViewStyle) : styles.flexRow;'],
        invalid: [
            {
                code: 'const style = shouldUseNarrowLayout ? (styles.ph5 as ViewStyle) : styles.ph8;',
                errors: [{messageId: 'layoutSpacingConditionalKnown'}],
            },
        ],
    });
});
