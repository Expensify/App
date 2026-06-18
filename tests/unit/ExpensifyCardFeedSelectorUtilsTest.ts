import type {OnyxCollection} from 'react-native-onyx';
import {getAdminExpensifyCardFeedEntries, getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, Domain, ExpensifyCardSettings, Policy} from '@src/types/onyx';
import {createRandomExpensifyCard} from '../utils/collections/card';

const fundID = 5555;
const policyID = 'policy_other';
const workspacePolicyID = 'WS1';

function createDomain(email: string, accountID: number): Domain {
    return {
        validated: true,
        accountID,
        email,
        // Backend-provided key name; not camelCase in Onyx data.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        domain_defaultSecurityGroupID: '0',
    };
}

function createCardList(...cards: Card[]): CardList {
    return Object.fromEntries(cards.map((card, index) => [`card${index}`, card]));
}

function createAdminPolicy(overrides: Partial<Policy> & Pick<Policy, 'id'>): Policy {
    return {
        name: 'Test Workspace',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: 'admin@workspace.com',
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: false,
        ...overrides,
    };
}

function createPolicyCollection(policies: Policy[]): OnyxCollection<Policy> {
    return Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id.toUpperCase()}`, policy]));
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
        const policies = createPolicyCollection([
            createAdminPolicy({
                id: policyID,
                policyAccountID: fundID,
            }),
        ]);

        expect(getExpensifyCardFeedDescription(settings, policies, {}, fundID)).toBe('workspace.com');
    });
});

describe('getAdminExpensifyCardFeedEntries', () => {
    const currentUserAccountID = 999;
    const feedFundID = 1234;
    const feedSettings: ExpensifyCardSettings = {isEnabled: true, hasOnceLoaded: true};
    const cardSettingsCollection: OnyxCollection<ExpensifyCardSettings> = {
        [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${feedFundID}`]: feedSettings,
    };
    const adminPolicyForFund = createPolicyCollection([
        createAdminPolicy({
            id: workspacePolicyID,
            policyAccountID: feedFundID,
        }),
    ]);

    function createAdminDomain(accountID: number, adminAccountID: number): Domain {
        return {
            ...createDomain('+@company.com', accountID),
            // Computed Onyx admin-permission key (e.g. expensify_adminPermissions_0).
            [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: adminAccountID,
        };
    }

    it('shows a feed when the user is an admin of a policy whose policyAccountID matches the fundID (no issued card required)', () => {
        const entries = getAdminExpensifyCardFeedEntries(cardSettingsCollection, adminPolicyForFund, {}, currentUserAccountID);

        expect(entries).toHaveLength(1);
        expect(entries.at(0)?.fundID).toBe(feedFundID);
    });

    it('shows a feed when the user is a domain admin for the fund (no issued card required)', () => {
        const domains: OnyxCollection<Domain> = {
            [`${ONYXKEYS.COLLECTION.DOMAIN}${feedFundID}`]: createAdminDomain(feedFundID, currentUserAccountID),
        };

        const entries = getAdminExpensifyCardFeedEntries(cardSettingsCollection, {}, domains, currentUserAccountID);

        expect(entries).toHaveLength(1);
        expect(entries.at(0)?.fundID).toBe(feedFundID);
    });

    it('hides a feed when the user is neither a domain admin nor a workspace admin for the fund', () => {
        const nonAdminPolicy = createPolicyCollection([createAdminPolicy({id: workspacePolicyID, policyAccountID: 9999})]);

        const entries = getAdminExpensifyCardFeedEntries(cardSettingsCollection, nonAdminPolicy, {}, currentUserAccountID);

        expect(entries).toHaveLength(0);
    });

    it('does not use preferredPolicy for visibility', () => {
        const settingsWithPreferredPolicyOnly: OnyxCollection<ExpensifyCardSettings> = {
            [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${feedFundID}`]: {...feedSettings, preferredPolicy: workspacePolicyID},
        };
        // The admin policy here does not back this fund (policyAccountID mismatch), so preferredPolicy alone must not surface the feed.
        const unrelatedAdminPolicy = createPolicyCollection([createAdminPolicy({id: workspacePolicyID, policyAccountID: 9999})]);

        const entries = getAdminExpensifyCardFeedEntries(settingsWithPreferredPolicyOnly, unrelatedAdminPolicy, {}, currentUserAccountID);

        expect(entries).toHaveLength(0);
    });
});
