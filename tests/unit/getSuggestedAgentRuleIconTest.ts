import {getSuggestedAgentRuleIcon} from '@libs/PolicyRulesUtils';

describe('getSuggestedAgentRuleIcon', () => {
    it('maps amount/cap titles to Coins even when the prompt says Reject', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'expense-amount-over',
                title: 'Per-expense amount over a cap',
                prompt: 'Reject any single expense of $75 or more.',
            }),
        ).toBe('Coins');
    });

    it('maps flagged titles to Flag', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'expense-amount-between',
                title: 'Per-expense amount within a flagged band',
                prompt: 'Reject expenses with an amount between $500 and $1000 inclusive.',
            }),
        ).toBe('Flag');
    });

    it('maps banned/block titles to CircleSlash', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'merchant-contains',
                title: 'Merchant name contains a banned word',
                prompt: 'Reject any expense whose merchant name contains the word "casino".',
            }),
        ).toBe('CircleSlash');
    });

    it('defaults allow-list / category rules to ThumbsUp', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'category-is',
                title: 'Category is a specific value',
                prompt: 'Only approve expenses categorized as "Travel". Reject expenses in any other category.',
            }),
        ).toBe('ThumbsUp');
    });

    it('defaults to ThumbsUp when no keyword matches', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'custom',
                title: 'Something custom',
                prompt: 'Do a custom thing',
            }),
        ).toBe('ThumbsUp');
    });
});
