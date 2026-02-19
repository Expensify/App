/* eslint-disable @typescript-eslint/naming-convention */
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

/** Helper to build expected card entries concisely (uses objectContaining so assignedCard doesn't need exact match) */
const entry = (cardName: string, encryptedCardNumber?: string, isAssigned = false) => expect.objectContaining({cardName, encryptedCardNumber: encryptedCardNumber ?? cardName, isAssigned});

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

    describe('companyCardEntries derivation', () => {
        it('should derive entries from cardList for custom feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('card1', undefined, true), entry('card2')]);
            expect(result.current.feedName).toBe(mockCustomFeed);
        });

        it('should derive entries from accountList for OAuth feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockOAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('CREDIT CARD...6607'), entry('CREDIT CARD...5501')]);
            expect(result.current.feedName).toBe(mockOAuthFeed);
        });

        it('should derive entries from accountList for Plaid feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockPlaidFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('Plaid Checking 0000'), entry('Plaid Credit Card 3333')]);
            expect(result.current.feedName).toBe(mockPlaidFeed);
        });

        it('should return empty entries when no cardList or accountList', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([]);
        });

        it('should merge accountList and cardList entries, with cardList taking precedence', async () => {
            const feedWithBoth: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${domainID}` as CompanyCardFeedWithDomainID;
            const feedDataWithAccountList = {
                [feedWithBoth]: {
                    ...mockOAuthFeedData[mockOAuthFeed],
                    accountList: ['CARD A', 'CARD B'],
                },
            };
            const cardsListWithEncrypted = {
                cardList: {
                    'CARD A': 'encrypted_A',
                    'CARD C': 'encrypted_C',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, feedWithBoth);
            (useCardFeeds as jest.Mock).mockReturnValue([feedDataWithAccountList, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithEncrypted, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([
                entry('CARD A', 'encrypted_A'), // cardList overrides accountList
                entry('CARD C', 'encrypted_C'), // from cardList only
                entry('CARD B'), // from accountList only
            ]);
        });
    });

    describe('policyID handling', () => {
        it('should return only onyxMetadata when policyID is undefined', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: undefined}));

            expect(result.current.feedName).toBeUndefined();
            expect(result.current.companyCardEntries).toBeUndefined();
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

            expect(result.current.feedName).toBe(mockOAuthFeed);
            expect(result.current.companyCardEntries).toEqual([entry('CREDIT CARD...6607'), entry('CREDIT CARD...5501')]);
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
                '490901XXXXXX1234': 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1',
                '490901XXXXXX5678': 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED2',
            },
        };

        it('should return entries with encrypted card numbers for commercial feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsListWithEncryptedNumbers, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardList).toEqual(mockCardsListWithEncryptedNumbers.cardList);
            expect(result.current.companyCardEntries).toEqual([
                entry('490901XXXXXX1234', 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1'),
                entry('490901XXXXXX5678', 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED2'),
            ]);
        });

        it('should have entries where cardName differs from encryptedCardNumber for commercial feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([mockCardsListWithEncryptedNumbers, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            for (const cardEntry of result.current.companyCardEntries ?? []) {
                expect(cardEntry.cardName).not.toBe(cardEntry.encryptedCardNumber);
            }
        });

        it('should have entries where cardName equals encryptedCardNumber for direct feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockPlaidFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.cardList).toBeUndefined();
            for (const cardEntry of result.current.companyCardEntries ?? []) {
                expect(cardEntry.cardName).toBe(cardEntry.encryptedCardNumber);
            }
        });
    });

    describe('assigned cards not in cardList (stale cardList)', () => {
        it('should include assigned cards when cardList is empty/stale for custom feeds', async () => {
            const staleCardsList = {
                cardList: {},
                '21570652': {
                    cardID: 21570652,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 1234',
                    encryptedCardNumber: 'enc_visa_1234',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([staleCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('VISA - 1234', 'enc_visa_1234', true)]);
        });

        it('should include assigned cards missing from OAuth feed accountList', async () => {
            const oAuthFeedWithPartialList = {
                [mockOAuthFeed]: {
                    ...mockOAuthFeedData[mockOAuthFeed],
                    accountList: ['CREDIT CARD...6607'],
                },
            };

            const cardsListWithExtraAssigned = {
                cardList: {},
                '99999': {
                    cardID: 99999,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    cardName: 'CREDIT CARD...5501',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([oAuthFeedWithPartialList, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithExtraAssigned, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([
                entry('CREDIT CARD...5501', undefined, true), // assigned card comes first
                entry('CREDIT CARD...6607'), // remaining unassigned from accountList
            ]);
        });

        it('should not duplicate assigned cards already present in cardList by encryptedCardNumber', async () => {
            const cardsListWithMatchingEncrypted = {
                cardList: {
                    'VISA - 1234': 'enc_visa_1234',
                },
                '21570652': {
                    cardID: 21570652,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 1234',
                    encryptedCardNumber: 'enc_visa_1234',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithMatchingEncrypted, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('VISA - 1234', 'enc_visa_1234', true)]);
        });

        it('should not duplicate assigned cards already present in accountList by cardName match', async () => {
            const oAuthFeedData = {
                [mockOAuthFeed]: {
                    ...mockOAuthFeedData[mockOAuthFeed],
                    accountList: ['CREDIT CARD...6607'],
                },
            };

            const cardsListWithMatchingName = {
                cardList: {},
                '55555': {
                    cardID: 55555,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    cardName: 'CREDIT CARD...6607',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([oAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithMatchingName, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('CREDIT CARD...6607', undefined, true)]);
        });

        it('should handle multiple assigned cards missing from stale cardList', async () => {
            const staleCardsList = {
                cardList: {
                    'VISA - 1111': 'enc_1111',
                },
                '10001': {
                    cardID: 10001,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 1111',
                    encryptedCardNumber: 'enc_1111',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
                '10002': {
                    cardID: 10002,
                    accountID: 18439985,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 2222',
                    encryptedCardNumber: 'enc_2222',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
                '10003': {
                    cardID: 10003,
                    accountID: 18439986,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 3333',
                    encryptedCardNumber: 'enc_3333',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([staleCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual(
                expect.arrayContaining([entry('VISA - 1111', 'enc_1111', true), entry('VISA - 2222', 'enc_2222', true), entry('VISA - 3333', 'enc_3333', true)]),
            );
            expect(result.current.companyCardEntries).toHaveLength(3);
        });

        it('should skip assigned cards without a cardName', async () => {
            const cardsListWithMissingName = {
                cardList: {},
                '77777': {
                    cardID: 77777,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    encryptedCardNumber: 'enc_no_name',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithMissingName, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([]);
        });

        it('should use cardName as fallback encryptedCardNumber when card has none', async () => {
            const cardsListNoEncrypted = {
                cardList: {},
                '88888': {
                    cardID: 88888,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 9999',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListNoEncrypted, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('VISA - 9999', undefined, true)]);
        });

        it('should include both cards when two assigned cards share the same cardName', async () => {
            const cardsListWithDuplicateNames = {
                cardList: {},
                '60001': {
                    cardID: 60001,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 1234',
                    encryptedCardNumber: 'enc_aaa',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
                '60002': {
                    cardID: 60002,
                    accountID: 18439985,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'VISA - 1234',
                    encryptedCardNumber: 'enc_bbb',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithDuplicateNames, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            const entries = result.current.companyCardEntries ?? [];
            const encryptedNumbers = entries.map((e) => e.encryptedCardNumber);

            // Both cards should appear — arrays handle duplicate names naturally
            expect(encryptedNumbers).toContain('enc_aaa');
            expect(encryptedNumbers).toContain('enc_bbb');
            expect(entries).toHaveLength(2);
            expect(entries.every((e) => e.isAssigned)).toBe(true);
        });

        it('should not duplicate assigned card matching by normalized cardName with special characters', async () => {
            const oAuthFeedData = {
                [mockOAuthFeed]: {
                    ...mockOAuthFeedData[mockOAuthFeed],
                    accountList: ['Business Platinum Card - JOHN SMITH - 1234'],
                },
            };

            const cardsListWithSpecialChar = {
                cardList: {},
                '44444': {
                    cardID: 44444,
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    cardName: 'Business Platinum Card\u00AE - JOHN SMITH - 1234',
                    domainName: 'expensify-policy://123456',
                    state: 3,
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([oAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([cardsListWithSpecialChar, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('Business Platinum Card\u00AE - JOHN SMITH - 1234', undefined, true)]);
        });
    });

    describe('card ID consistency', () => {
        it('should have entries where cardName equals encryptedCardNumber for direct feeds', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockOAuthFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockOAuthFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            const entries = result.current.companyCardEntries ?? [];
            expect(entries.map((e) => e.cardName)).toEqual(['CREDIT CARD...6607', 'CREDIT CARD...5501']);

            for (const cardEntry of entries) {
                expect(cardEntry.cardName).toBe(cardEntry.encryptedCardNumber);
            }
        });

        it('should have entries where cardName differs from encryptedCardNumber for commercial feeds', async () => {
            const commercialCardsList = {
                cardList: {
                    'VISA - 1234': 'enc_abc123',
                    'VISA - 5678': 'enc_def456',
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicyID}`, mockCustomFeed);
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useCardsList as jest.Mock).mockReturnValue([commercialCardsList, {status: 'loaded'}]);

            const {result} = renderHook(() => useCompanyCards({policyID: mockPolicyID}));

            expect(result.current.companyCardEntries).toEqual([entry('VISA - 1234', 'enc_abc123'), entry('VISA - 5678', 'enc_def456')]);
        });
    });
});
