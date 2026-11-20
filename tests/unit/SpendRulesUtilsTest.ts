import {buildSpendRuleAST} from '@libs/SpendRulesUtils';

import CONST from '@src/CONST';

describe('buildSpendRuleAST', () => {
    it('returns no rule when no criteria or cards are supplied', () => {
        // Given a spend rule form with no criteria and no cards
        const spendRuleValues = {};

        // When the rule is built
        const rule = buildSpendRuleAST(spendRuleValues);

        // Then there is no rule, because there is nothing to filter on
        expect(rule).toBeUndefined();
    });

    it('keeps a card-only rule and its original creation time', () => {
        // Given a rule with only a card, edited after it was first created
        const created = '2025-01-01';

        // When the rule is rebuilt
        const rule = buildSpendRuleAST({cardIDs: ['card-1']}, created);

        // Then it filters on the card alone and keeps its original creation time
        expect(rule?.filters).toEqual({
            left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
            operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            right: ['card-1'],
        });
        expect(rule?.created).toBe(created);
    });

    it.each([CONST.SPEND_RULES.ACTION.ALLOW, CONST.SPEND_RULES.ACTION.BLOCK])('preserves mixed criteria grouping for %s', (action) => {
        // Given a rule with a card, merchants, a category, a currency and a maximum amount
        // When the rule is built
        const rule = buildSpendRuleAST(
            {
                cardIDs: ['card-1'],
                merchantNames: ['Exact', 'Contains'],
                merchantMatchTypes: [CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS],
                categories: ['Food'],
                currencies: ['USD'],
                maxAmount: '100',
                restrictionAction: action,
            },
            '2025-01-01',
        );

        // Then every criterion is kept and grouped as before, because the missing nodes are now filtered with a typed check
        expect(rule?.created).toBe('2025-01-01');
        expect(rule?.action).toBe(action);
        expect(rule?.filters).toMatchObject({
            operator: CONST.SEARCH.SYNTAX_OPERATORS.AND,
            left: {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID, right: ['card-1']},
            right: {
                operator: action === CONST.SPEND_RULES.ACTION.BLOCK ? CONST.SEARCH.SYNTAX_OPERATORS.OR : CONST.SEARCH.SYNTAX_OPERATORS.AND,
                right: {
                    operator: CONST.SEARCH.SYNTAX_OPERATORS.OR,
                    right: {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, right: ['Food']},
                    left: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.OR,
                        left: {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, right: ['Exact']},
                        right: {left: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, operator: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS, right: ['Contains']},
                    },
                },
            },
        });
    });
});
