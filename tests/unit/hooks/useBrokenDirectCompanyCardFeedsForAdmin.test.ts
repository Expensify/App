import {renderHook} from '@testing-library/react-native';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import useBrokenDirectCompanyCardFeedsForAdmin from '@pages/home/TimeSensitiveSection/hooks/useBrokenDirectCompanyCardFeedsForAdmin';
import CONST from '@src/CONST';
import type {Card, CardList} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {CardFeedErrors} from '@src/types/onyx/DerivedValues';
import type Policy from '@src/types/onyx/Policy';

const WORKSPACE_ACCOUNT_ID = 44444444;
const POLICY_ID = 'POLICY_1';
const POLICY_NAME = 'SPS Health';

const OAUTH_CHASE_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;
const OAUTH_AMEX_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT;
const COMMERCIAL_VISA_FEED = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;

const DEFAULT_CARD_FEED_ERROR_STATE = {
    shouldShowRBR: false,
    hasFeedErrors: false,
    hasWorkspaceErrors: false,
    isFeedConnectionBroken: false,
};

function createDefaultCardFeedErrors(): CardFeedErrors {
    return {
        cardFeedErrors: {},
        cardsWithBrokenFeedConnection: {},
        personalCardsWithBrokenConnection: {},
        shouldShowRbrForWorkspaceAccountID: {},
        shouldShowRbrForFeedNameWithDomainID: {},
        all: DEFAULT_CARD_FEED_ERROR_STATE,
        companyCards: DEFAULT_CARD_FEED_ERROR_STATE,
        expensifyCard: DEFAULT_CARD_FEED_ERROR_STATE,
        personalCard: DEFAULT_CARD_FEED_ERROR_STATE,
    };
}

const mockUseCardFeedErrors = jest.fn<CardFeedErrors, []>();

jest.mock('@hooks/useCardFeedErrors', () => ({
    __esModule: true,
    default: () => mockUseCardFeedErrors(),
}));

function createAdminPolicy(overrides: Partial<Policy> & {id: string} = {id: POLICY_ID}): Policy {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        name: POLICY_NAME,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        isPolicyExpenseChatEnabled: true,
        policyAccountID: WORKSPACE_ACCOUNT_ID,
        ...overrides,
    } as Policy;
}

function createBrokenCard(cardID: number, bank: CardFeedWithNumber): Card {
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

function setMockBrokenCards(cardsWithBrokenFeedConnection: CardList) {
    mockUseCardFeedErrors.mockReturnValue({
        ...createDefaultCardFeedErrors(),
        cardsWithBrokenFeedConnection,
    });
}

describe('useBrokenDirectCompanyCardFeedsForAdmin', () => {
    const adminPolicies = [createAdminPolicy()];

    beforeEach(() => {
        mockUseCardFeedErrors.mockReturnValue(createDefaultCardFeedErrors());
    });

    it('returns one connection when multiple broken cards share the same direct feed', () => {
        setMockBrokenCards({
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
            card2: createBrokenCard(2, OAUTH_CHASE_FEED),
            card3: createBrokenCard(3, OAUTH_CHASE_FEED),
        });

        const {result} = renderHook(() => useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies));

        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)).toStrictEqual({
            policyID: POLICY_ID,
            policyName: POLICY_NAME,
            cardID: '1',
            feedKey: getCardFeedWithDomainID(OAUTH_CHASE_FEED, WORKSPACE_ACCOUNT_ID),
        });
    });

    it('returns one connection per distinct direct feed', () => {
        setMockBrokenCards({
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
            card2: createBrokenCard(2, OAUTH_AMEX_FEED),
        });

        const {result} = renderHook(() => useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies));

        expect(result.current).toHaveLength(2);
        expect(result.current.map((connection) => connection.feedKey)).toStrictEqual([
            getCardFeedWithDomainID(OAUTH_CHASE_FEED, WORKSPACE_ACCOUNT_ID),
            getCardFeedWithDomainID(OAUTH_AMEX_FEED, WORKSPACE_ACCOUNT_ID),
        ]);
    });

    it('returns no connections for commercial feeds', () => {
        setMockBrokenCards({
            card1: createBrokenCard(1, COMMERCIAL_VISA_FEED),
            card2: createBrokenCard(2, COMMERCIAL_VISA_FEED),
            card3: createBrokenCard(3, COMMERCIAL_VISA_FEED),
        });

        const {result} = renderHook(() => useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies));

        expect(result.current).toHaveLength(0);
    });

    it('returns only direct feed connections when direct and commercial feeds are both broken', () => {
        setMockBrokenCards({
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
            card2: createBrokenCard(2, OAUTH_CHASE_FEED),
            card3: createBrokenCard(3, COMMERCIAL_VISA_FEED),
            card4: createBrokenCard(4, COMMERCIAL_VISA_FEED),
        });

        const {result} = renderHook(() => useBrokenDirectCompanyCardFeedsForAdmin(adminPolicies));

        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)?.feedKey).toBe(getCardFeedWithDomainID(OAUTH_CHASE_FEED, WORKSPACE_ACCOUNT_ID));
    });

    it('returns an empty array when admin policies are undefined', () => {
        setMockBrokenCards({
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
        });

        const {result} = renderHook(() => useBrokenDirectCompanyCardFeedsForAdmin(undefined));

        expect(result.current).toStrictEqual([]);
    });

    it('skips cards without a matching admin workspace policy', () => {
        setMockBrokenCards({
            card1: createBrokenCard(1, OAUTH_CHASE_FEED),
        });

        const {result} = renderHook(() =>
            useBrokenDirectCompanyCardFeedsForAdmin([
                createAdminPolicy({
                    id: POLICY_ID,
                    policyAccountID: 99999999,
                }),
            ]),
        );

        expect(result.current).toStrictEqual([]);
    });
});
