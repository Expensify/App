import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList, Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';

const fundID = 5555;
const policyID = 'policy_other';

describe('getExpensifyCardFeedDescription', () => {
    it('returns domainName from card settings root', () => {
        const settings = {domainName: 'example.com', isEnabled: true} as ExpensifyCardSettings;
        expect(getExpensifyCardFeedDescription(settings, {})).toBe('example.com');
    });

    it('returns domainName nested under a program block when root is missing', () => {
        const settings = {
            [CONST.COUNTRY.US]: {isEnabled: true},
            [CONST.COUNTRY.GB]: {domainName: 'example.co.uk', isEnabled: true},
            hasOnceLoaded: true,
        } as ExpensifyCardSettings;

        expect(getExpensifyCardFeedDescription(settings, {})).toBe('example.co.uk');
    });

    it('falls back to domain email when settings have no domainName', () => {
        const settings = {isEnabled: true} as ExpensifyCardSettings;
        const domains = {
            [`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`]: {
                email: '+@company.com',
            },
        } as Record<string, Domain>;

        expect(getExpensifyCardFeedDescription(settings, {}, domains, fundID)).toBe('company.com');
    });

    it('falls back to card list domainName when settings and domain email are missing', () => {
        const settings = {isEnabled: true} as ExpensifyCardSettings;
        const cardList = {
            card1: {
                bank: CONST.EXPENSIFY_CARD.BANK,
                fundID: fundID.toString(),
                domainName: 'cards.example.com',
            },
        } as unknown as CardList;

        expect(getExpensifyCardFeedDescription(settings, {}, {}, fundID, cardList)).toBe('cards.example.com');
    });

    it('falls back to workspace policy owner domain when fundID matches policyAccountID', () => {
        const settings = {isEnabled: true} as ExpensifyCardSettings;
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {
                policyAccountID: fundID,
                owner: 'admin@workspace.com',
            },
        } as Record<string, Policy>;

        expect(getExpensifyCardFeedDescription(settings, policies, {}, fundID)).toBe('workspace.com');
    });
});
