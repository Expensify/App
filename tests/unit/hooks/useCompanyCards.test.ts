import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useCompanyCards from '@hooks/useCompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockPolicyID = '123456';
const workspaceAccountID = 11111111;
const domainID = 22222222;

// Custom feed (VCF) without accountList
const mockCustomFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#${workspaceAccountID}` as CompanyCardFeedWithDomainID;

// OAuth feed (Chase) with accountList
const mockOAuthFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${domainID}` as CompanyCardFeedWithDomainID;

// Plaid feed
const mockPlaidFeed: CompanyCardFeedWithDomainID = `plaid.ins_123#${workspaceAccountID}` as CompanyCardFeedWithDomainID;

const mockCustomFeedData = {
    [mockCustomFeed]: {
        liabilityType: 'personal',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Custom VCF feed',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA as CompanyCardFeed,
    },
};

const mockOAuthFeedData = {
    [mockOAuthFeed]: {
        liabilityType: 'corporate',
        pending: false,
        domainID,
        customFeedName: 'Chase cards',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE as CompanyCardFeed,

        // OAuth feeds have accountList from oAuthAccountDetails
        accountList: ['CREDIT CARD...6607', 'CREDIT CARD...5501'],
        credentials: 'xxxxx',
        expiration: 1730998958,
    },
};

const mockPlaidFeedData = {
    [mockPlaidFeed]: {
        liabilityType: 'corporate',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Plaid Bank cards',
        feed: 'plaid.ins_123' as CompanyCardFeed,
        accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333'],
        credentials: 'xxxxx',
        expiration: 1730998958,
    },
};

const mockCardsList = {
    cardList: {
        card1: 'card1',
        card2: 'card2',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570652': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        cardName: 'card1',
        domainName: 'expensify-policy://123456',
        lastFourPAN: '1234',
        lastScrape: '',
        lastScrapeResult: 200,
        scrapeMinDate: '2024-09-01',
        state: 3,
    },
};

jest.mock('@hooks/useCardFeeds', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useCardsList', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

describe('useCompanyCards', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    describe('cardFeedType determination', () => {
        it('should return cardFeedType as customFeed for VCF feeds without accountList', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('customFeed');
            expect(result.current.feedName).toBe(mockCustomFeed);
        });

        it('should return cardFeedType as directFeed for OAuth feeds with accountList', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockOAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('directFeed');
            expect(result.current.feedName).toBe(mockOAuthFeed);
            expect(result.current.selectedFeed?.accountList).toEqual(['CREDIT CARD...6607', 'CREDIT CARD...5501']);
        });

        it('should return cardFeedType as directFeed for Plaid feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockPlaidFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('directFeed');
            expect(result.current.feedName).toBe(mockPlaidFeed);
        });
    });

    describe('cardNames derivation', () => {
        it('should derive cardNames from cardList for custom feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('customFeed');
            expect(result.current.cardNames).toEqual(['card1', 'card2']);
        });

        it('should derive cardNames from accountList for OAuth feeds (direct feeds)', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockOAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('directFeed');
            expect(result.current.cardNames).toEqual(['CREDIT CARD...6607', 'CREDIT CARD...5501']);
        });

        it('should derive cardNames from accountList for Plaid feeds (direct feeds)', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockPlaidFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('directFeed');
            expect(result.current.cardNames).toEqual(['Plaid Checking 0000', 'Plaid Credit Card 3333']);
        });

        it('should return empty cardNames when cardList is undefined for custom feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardFeedType).toBe('customFeed');
            expect(result.current.cardNames).toEqual([]);
        });
    });

    describe('policyID handling', () => {
        it('should return only onyxMetadata when policyID is undefined', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: undefined}));

            expect(result.current.feedName).toBeUndefined();
            expect(result.current.cardFeedType).toBeUndefined();
            expect(result.current.onyxMetadata).toBeDefined();
        });
    });

    describe('feed selection', () => {
        it('should use feedNameProp when provided instead of lastSelectedFeed', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);

            const combinedFeeds = {...mockCustomFeedData, ...mockOAuthFeedData};
            (useCardFeeds as jest.Mock).mockReturnValue([combinedFeeds, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID, feedName: mockOAuthFeed}));

            // Should use provided feedName, not lastSelectedFeed
            expect(result.current.feedName).toBe(mockOAuthFeed);
            expect(result.current.cardFeedType).toBe('directFeed');
        });
    });

    describe('onyxMetadata', () => {
        it('should return all metadata from dependent hooks', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);

            const cardListMetadata = {status: 'loaded'};
            const allCardFeedsMetadata = {status: 'loaded'};
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, allCardFeedsMetadata, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsList, cardListMetadata]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.onyxMetadata.cardListMetadata).toBe(cardListMetadata);
            expect(result.current.onyxMetadata.allCardFeedsMetadata).toBe(allCardFeedsMetadata);
            expect(result.current.onyxMetadata.lastSelectedFeedMetadata).toBeDefined();
        });
    });
});
