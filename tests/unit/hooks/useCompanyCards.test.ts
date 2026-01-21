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

    describe('cardList data structure', () => {
        const mockCardsListWithEncryptedNumbers = {
            cardList: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '490901XXXXXX1234': 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '490901XXXXXX5678': 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED2',
            },
        };

        it('should return cardList with encrypted card numbers for commercial feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsListWithEncryptedNumbers, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            // For commercial feeds, cardList contains {cardName: encryptedNumber}
            expect(result.current.cardList).toEqual(mockCardsListWithEncryptedNumbers.cardList);

            // cardNames should be the keys (display names)
            expect(result.current.cardNames).toEqual(['490901XXXXXX1234', '490901XXXXXX5678']);
        });

        it('should have cardList where keys differ from values for commercial feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsListWithEncryptedNumbers, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            const cardList = result.current.cardList ?? {};
            const cardNames = Object.keys(cardList);
            const encryptedNumbers = Object.values(cardList);

            // In commercial feeds, the display name (key) should differ from encrypted value (value)
            for (const [index, name] of cardNames.entries()) {
                expect(name).not.toBe(encryptedNumbers.at(index));
            }
        });

        it('should not have cardList for direct feeds (accountList is used instead)', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockPlaidFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            // Direct feeds use accountList, not cardList
            expect(result.current.cardList).toBeUndefined();
            expect(result.current.selectedFeed?.accountList).toBeDefined();
            expect(result.current.cardNames).toEqual(['Plaid Checking 0000', 'Plaid Credit Card 3333']);
        });
    });

    describe('card ID consistency', () => {
        it('should ensure direct feed cardNames can be used as identifiers', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockOAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            // For direct feeds, cardNames ARE the identifiers (no encryption)
            const cardNames = result.current.cardNames ?? [];
            expect(cardNames).toEqual(['CREDIT CARD...6607', 'CREDIT CARD...5501']);

            // Each card name is both the display value AND the identifier
            for (const name of cardNames) {
                expect(typeof name).toBe('string');
                expect(name.length).toBeGreaterThan(0);
            }
        });

        it('should ensure commercial feed cardList maps display names to encrypted identifiers', async () => {
            const commercialCardsList = {
                cardList: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'VISA - 1234': 'enc_abc123',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'VISA - 5678': 'enc_def456',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([commercialCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            const cardList = result.current.cardList ?? {};

            // Display names are keys
            expect(Object.keys(cardList)).toEqual(['VISA - 1234', 'VISA - 5678']);

            // Encrypted identifiers are values
            expect(Object.values(cardList)).toEqual(['enc_abc123', 'enc_def456']);

            // Lookup: given a display name, get the encrypted identifier
            expect(cardList['VISA - 1234']).toBe('enc_abc123');
        });
    });
});
