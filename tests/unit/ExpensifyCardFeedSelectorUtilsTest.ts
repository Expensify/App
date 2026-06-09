import type {OnyxCollection} from 'react-native-onyx';
import {getAdminExpensifyCardFeedEntries, getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';
import {createRandomExpensifyCard} from '../utils/collections/card';
import createRandomPolicy from '../utils/collections/policies';

const fundID = 5555;
const policyID = 'policy_other';

function createDomain(email: string, accountID: number): Domain {
    return {
        validated: true,
        accountID,
        email,
    };
}

function createCardList(...cards: Card[]): CardList {
    return cards.reduce<CardList>((list, card, index) => {
        list[`card${index}`] = card;
        return list;
    }, {});
}

function createPolicyWithAccountID(accountID: number, overrides?: Partial<Policy>): Policy {
    return {
        ...createRandomPolicy(1),
        role: CONST.POLICY.ROLE.ADMIN,
        owner: 'admin@workspace.com',
        policyAccountID: accountID,
        ...overrides,
    };
}

describe('getExpensifyCardFeedDescription', () => {
    it('returns domainName from card settings root', () => {
        const settings: ExpensifyCardSettings = {domainName: 'example.com', isEnabled: true};
        expect(getExpensifyCardFeedDescription(settings, {})).toBe('example.com');
    });

    it('returns domainName nested under a program block when root is missing', () => {
        const settings: ExpensifyCardSettings = {
            [CONST.COUNTRY.US]: {isEnabled: true},
            [CONST.COUNTRY.GB]: {domainName: 'example.co.uk', isEnabled: true},
            hasOnceLoaded: true,
        };

        expect(getExpensifyCardFeedDescription(settings, {})).toBe('example.co.uk');
    });

    it('falls back to domain email when settings have no domainName', () => {
        const settings: ExpensifyCardSettings = {isEnabled: true};
        const domains: OnyxCollection<Domain> = {
            [`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`]: createDomain('+@company.com', fundID),
        };

        expect(getExpensifyCardFeedDescription(settings, {}, domains, fundID)).toBe('company.com');
    });

    it('falls back to card list domainName when settings and domain email are missing', () => {
        const settings: ExpensifyCardSettings = {isEnabled: true};
        const cardList = createCardList(
            createRandomExpensifyCard(1, {
                fundID: fundID.toString(),
                domainName: 'cards.example.com',
            }),
        );

        expect(getExpensifyCardFeedDescription(settings, {}, {}, fundID, cardList)).toBe('cards.example.com');
    });

    it('falls back to workspace policy owner domain when fundID matches policyAccountID', () => {
        const settings: ExpensifyCardSettings = {isEnabled: true};
        const policies: OnyxCollection<Policy> = {
            [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: createPolicyWithAccountID(fundID),
        };

        expect(getExpensifyCardFeedDescription(settings, policies, {}, fundID)).toBe('workspace.com');
    });
});

describe('getAdminExpensifyCardFeedEntries', () => {
    const currentUserAccountID = 999;
    const orphanFundID = 1234;
    const orphanFeedSettings: ExpensifyCardSettings = {isEnabled: true, hasOnceLoaded: true};
    const cardSettingsCollection: OnyxCollection<ExpensifyCardSettings> = {
        [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${orphanFundID}`]: orphanFeedSettings,
    };
    const adminPolicyForFund: OnyxCollection<Policy> = {
        [`${ONYXKEYS.COLLECTION.POLICY}WS1`]: createPolicyWithAccountID(orphanFundID, {id: 'WS1'}),
    };

    it('shows an orphan feed when the fund has an issued Expensify Card', () => {
        const cardList = createCardList(createRandomExpensifyCard(1, {fundID: orphanFundID.toString()}));

        const entries = getAdminExpensifyCardFeedEntries(cardSettingsCollection, adminPolicyForFund, {}, currentUserAccountID, cardList);

        expect(entries).toHaveLength(1);
        expect(entries.at(0)?.fundID).toBe(orphanFundID);
    });

    it('hides an orphan feed when the fund has no issued Expensify Card', () => {
        const cardList: CardList = {};

        const entries = getAdminExpensifyCardFeedEntries(cardSettingsCollection, adminPolicyForFund, {}, currentUserAccountID, cardList);

        expect(entries).toHaveLength(0);
    });

    it('still shows a feed with a preferredPolicy even when the fund has no issued Expensify Card', () => {
        const settingsWithPreferredPolicy: OnyxCollection<ExpensifyCardSettings> = {
            [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${orphanFundID}`]: {...orphanFeedSettings, preferredPolicy: 'WS1'},
        };

        const entries = getAdminExpensifyCardFeedEntries(settingsWithPreferredPolicy, adminPolicyForFund, {}, currentUserAccountID, {});

        expect(entries).toHaveLength(1);
    });

    it('still shows a feed with linkedPolicyIDs even when the fund has no issued Expensify Card', () => {
        const settingsWithLinkedPolicies: OnyxCollection<ExpensifyCardSettings> = {
            [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${orphanFundID}`]: {...orphanFeedSettings, linkedPolicyIDs: ['WS1']},
        };

        const entries = getAdminExpensifyCardFeedEntries(settingsWithLinkedPolicies, adminPolicyForFund, {}, currentUserAccountID, {});

        expect(entries).toHaveLength(1);
    });
});
