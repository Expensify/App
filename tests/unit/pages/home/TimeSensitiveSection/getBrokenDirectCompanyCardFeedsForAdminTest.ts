import {getCardFeedWithDomainID} from '@libs/CardUtils';
import getBrokenDirectCompanyCardFeedsForAdmin from '@pages/home/TimeSensitiveSection/getBrokenDirectCompanyCardFeedsForAdmin';
import CONST from '@src/CONST';
import type {Card, Policy} from '@src/types/onyx';

const WORKSPACE_ACCOUNT_ID = 44444444;
const POLICY_ID = 'POLICY_1';
const POLICY_NAME = 'SPS Health';

const OAUTH_CHASE_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;
const OAUTH_AMEX_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT;
const COMMERCIAL_VISA_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

function createAdminPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: POLICY_NAME,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        isPolicyExpenseChatEnabled: true,
        policyAccountID: WORKSPACE_ACCOUNT_ID,
    };
}

function createBrokenCard(cardID: number, bank: string): Card {
    return {
        cardID,
        accountID: 1,
        bank,
        cardName: 'Test Card',
        domainName: 'test.exfy',
        fraud: 'none',
        fundID: String(WORKSPACE_ACCOUNT_ID),
        lastFourPAN: '1234',
        lastScrape: '',
        lastScrapeResult: 403,
        lastUpdated: '',
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
    };
}

describe('getBrokenDirectCompanyCardFeedsForAdmin', () => {
    const adminPolicies = [createAdminPolicy()];

    it('returns one connection when multiple broken cards share the same direct feed', () => {
        const cardsWithBrokenConnection = {
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
            card2: createBrokenCard(2, OAUTH_CHASE_FEED),
            card3: createBrokenCard(3, OAUTH_CHASE_FEED),
        };

        const result = getBrokenDirectCompanyCardFeedsForAdmin(cardsWithBrokenConnection, adminPolicies);

        expect(result).toHaveLength(1);
        expect(result.at(0)).toStrictEqual({
            policyID: POLICY_ID,
            policyName: POLICY_NAME,
            cardID: '1',
            feedKey: getCardFeedWithDomainID(OAUTH_CHASE_FEED, WORKSPACE_ACCOUNT_ID),
        });
    });

    it('returns one connection per distinct direct feed', () => {
        const cardsWithBrokenConnection = {
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
            card2: createBrokenCard(2, OAUTH_AMEX_FEED),
        };

        const result = getBrokenDirectCompanyCardFeedsForAdmin(cardsWithBrokenConnection, adminPolicies);

        expect(result).toHaveLength(2);
        expect(result.map((connection) => connection.feedKey)).toStrictEqual([
            getCardFeedWithDomainID(OAUTH_CHASE_FEED, WORKSPACE_ACCOUNT_ID),
            getCardFeedWithDomainID(OAUTH_AMEX_FEED, WORKSPACE_ACCOUNT_ID),
        ]);
    });

    it('returns no connections for commercial feeds', () => {
        const cardsWithBrokenConnection = {
            card1: createBrokenCard(1, COMMERCIAL_VISA_FEED),
            card2: createBrokenCard(2, COMMERCIAL_VISA_FEED),
            card3: createBrokenCard(3, COMMERCIAL_VISA_FEED),
        };

        const result = getBrokenDirectCompanyCardFeedsForAdmin(cardsWithBrokenConnection, adminPolicies);

        expect(result).toHaveLength(0);
    });

    it('returns only direct feed connections when direct and commercial feeds are both broken', () => {
        const cardsWithBrokenConnection = {
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
            card2: createBrokenCard(2, OAUTH_CHASE_FEED),
            card3: createBrokenCard(3, COMMERCIAL_VISA_FEED),
            card4: createBrokenCard(4, COMMERCIAL_VISA_FEED),
        };

        const result = getBrokenDirectCompanyCardFeedsForAdmin(cardsWithBrokenConnection, adminPolicies);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.feedKey).toBe(getCardFeedWithDomainID(OAUTH_CHASE_FEED, WORKSPACE_ACCOUNT_ID));
    });

    it('returns an empty array when admin policies are undefined', () => {
        const cardsWithBrokenConnection = {
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
        };

        expect(getBrokenDirectCompanyCardFeedsForAdmin(cardsWithBrokenConnection, undefined)).toStrictEqual([]);
    });

    it('skips cards without a matching admin workspace policy', () => {
        const cardsWithBrokenConnection = {
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
        };

        const result = getBrokenDirectCompanyCardFeedsForAdmin(cardsWithBrokenConnection, [
            {
                ...createAdminPolicy(),
                policyAccountID: 99999999,
            },
        ]);

        expect(result).toStrictEqual([]);
    });
});
