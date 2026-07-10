import {getSuggestedAgentRuleIcon} from '@libs/PolicyRulesUtils';

describe('getSuggestedAgentRuleIcon', () => {
    it('maps approve rules to ThumbsUp', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: '1',
                title: 'Approve any report that consists of expenses under $75',
                prompt: 'Approve any report that consists of expenses under $75',
            }),
        ).toBe('ThumbsUp');
    });

    it('maps block rules to CircleSlash', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: '2',
                title: 'Block all spend from gambling or shady websites',
                prompt: 'Block all spend from gambling or shady websites',
            }),
        ).toBe('CircleSlash');
    });

    it('maps flag rules to Flag', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: '3',
                title: 'Flag spend when someone spends above the category average',
                prompt: 'Flag spend when someone spends above the category average',
            }),
        ).toBe('Flag');
    });

    it('maps hotel spend limits to Coins', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: '4',
                title: 'Set spend limit of $200/night for all hotels booked in New York City',
                prompt: 'Set spend limit of $200/night for all hotels booked in New York City',
            }),
        ).toBe('Coins');
    });

    it('defaults to ThumbsUp when no keyword matches', () => {
        expect(
            getSuggestedAgentRuleIcon({
                id: '5',
                title: 'Something custom',
                prompt: 'Do a custom thing',
            }),
        ).toBe('ThumbsUp');
    });
});
