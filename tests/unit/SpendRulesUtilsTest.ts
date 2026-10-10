import {buildSpendRuleAST} from '@libs/SpendRulesUtils';

import CONST from '@src/CONST';

describe('buildSpendRuleAST', () => {
    it('returns no rule when no criteria or cards are supplied', () => {
        // Given an empty form, when the real builder runs, then there is no filter to save.
        expect(buildSpendRuleAST({})).toBeUndefined();
    });

    it('keeps a card-only rule and its original creation time', () => {
        // Given a card and an existing timestamp, when rebuilding, then both survive unchanged.
        expect(buildSpendRuleAST({cardIDs: ['card-1']}, '2025-01-01')?.filters).toEqual({
            left: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
            operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            right: ['card-1'],
        });
        expect(buildSpendRuleAST({cardIDs: ['card-1']}, '2025-01-01')?.created).toBe('2025-01-01');
    });

    it.each([CONST.SPEND_RULES.ACTION.ALLOW, CONST.SPEND_RULES.ACTION.BLOCK])('preserves mixed criteria grouping for %s', (action) => {
        // Given all conditional nodes, when building a rule, then every node is present in the intended grouping.
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
