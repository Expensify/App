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

    it('prefers Coins over Flag when amount and within both match', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'expense-amount-between',
                title: 'Per-expense amount within a flagged band',
                prompt: 'Reject expenses with an amount between $500 and $1000 inclusive.',
            }),
        ).toBe('Coins');
    });

    it('prefers CircleSlash over Coins when block and amount both match', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'blocked-amount',
                title: 'Block expenses over an amount cap',
                prompt: 'Reject blocked high-amount spend.',
            }),
        ).toBe('CircleSlash');
    });

    it('maps flagged titles without money keywords to Flag', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'receipt-mismatch',
                title: 'Receipt mismatch on weekend',
                prompt: 'Flag expenses with a receipt mismatch.',
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

    it('does not match age inside agent or manage', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'agent-rules',
                title: 'Agent rules for workspace',
                prompt: 'Describe agent rules.',
            }),
        ).toBe('ThumbsUp');

        expect(
            getSuggestedAgentRuleIcon({
                id: 'manage-approvals',
                title: 'Manage approval workflow',
                prompt: 'Manage approvals carefully.',
            }),
        ).toBe('ThumbsUp');
    });

    it('does not match cap inside capital', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'capital-expense',
                title: 'Capital expense approval',
                prompt: 'Approve capital expenses.',
            }),
        ).toBe('ThumbsUp');
    });

    it('does not match age inside page', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'page-count',
                title: 'Page count limits',
                prompt: 'Limit page count.',
            }),
        ).toBe('ThumbsUp');
    });

    it('overrides number-of-expenses to Flag even though its title has no keyword match', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'number-of-expenses',
                title: 'Too many expenses',
                prompt: 'Reject reports that contain more than 5 expenses; they must be split into smaller reports. Approve reports with 5 or fewer expenses.',
            }),
        ).toBe('Flag');
    });

    it('overrides receipt-transaction-mismatch to Flag even though its title also matches a Coins keyword', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'receipt-transaction-mismatch',
                title: 'Receipt total mismatch',
                prompt: 'Reject an expense when the total shown on its receipt does not match the expense amount, noting the discrepancy. Approve when the receipt total matches the expense amount.',
            }),
        ).toBe('Flag');
    });

    it('overrides itemized-split-recommended to Flag even though its title also matches a CircleSlash keyword', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: 'itemized-split-recommended',
                title: 'Mixed business / personal items',
                prompt: 'When a single receipt mixes clearly business items with clearly personal items, reject it and ask the submitter to split out the personal items. Approve all-business receipts.',
            }),
        ).toBe('Flag');
    });
});
