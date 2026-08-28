import {renderHook} from '@testing-library/react-native';

import useCardFeeds from '@hooks/useCardFeeds';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';

import {getCardFeedWithDomainID} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CombinedCardFeed, CombinedCardFeeds} from '@src/types/onyx/CardFeeds';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import createMock from '../../utils/createMock';

const mockPolicyID = '123456';

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID, policyAccountID: Number(mockPolicyID)};
type UseCardFeedsResult = ReturnType<typeof useCardFeeds>;

const loadedResultMetadata: UseCardFeedsResult[1] = {status: 'loaded'};
const loadingResultMetadata: UseCardFeedsResult[1] = {status: 'loading'};
const emptyCardFeedStatuses: UseCardFeedsResult[3] = {};
const mockWorkspaceAccountID: UseCardFeedsResult[4] = Number(mockPolicyID);

const mockCardFeeds: CombinedCardFeeds = {
    [getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK, mockWorkspaceAccountID)]: createMock<CombinedCardFeed>({
        asrEnabled: false,
        country: 'US',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK,
        domainID: mockWorkspaceAccountID,
        forceReimbursable: 'force_no',
        liabilityType: 'corporate',
        preferredPolicy: '135CA2196CD21C88',
        reportTitleFormat: '',
        statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
        uploadLayoutSettings: {},
        customFeedName: 'Regions Bank cards',
        accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333'],
    }),
};

jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockedUseCardFeeds = jest.mocked(useCardFeeds);

describe('useIsBlockedToAddFeed', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
    });
    it('should return true if collect policy and feed already exists', () => {
        mockedUseCardFeeds.mockReturnValue([mockCardFeeds, loadedResultMetadata, undefined, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result?.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return isBlockedToAddNewFeeds as false if control policy', async () => {
        mockedUseCardFeeds.mockReturnValue([mockCardFeeds, loadedResultMetadata, undefined, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {...mockPolicy, type: CONST.POLICY.TYPE.CORPORATE});
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result?.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and new feed added', async () => {
        mockedUseCardFeeds.mockReturnValue([{}, loadedResultMetadata, undefined, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        const {result, rerender} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
        // Set initial empty state and wait for new connection to be established
        await delay(2000);
        mockedUseCardFeeds.mockReturnValue([
            {
                [getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK, mockWorkspaceAccountID)]: createMock<CombinedCardFeed>({
                    feed: CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK,
                    domainID: mockWorkspaceAccountID,
                    customFeedName: 'Regions Bank cards',
                    accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333'],
                }),
            },
            loadedResultMetadata,
            undefined,
            emptyCardFeedStatuses,
            mockWorkspaceAccountID,
        ]);
        // Wait to set state happened
        await delay(2000);

        rerender(mockPolicyID);
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and no feed added', async () => {
        mockedUseCardFeeds.mockReturnValue([{}, loadedResultMetadata, undefined, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and Expensify feed exists', async () => {
        mockedUseCardFeeds.mockReturnValue([
            {
                [getCardFeedWithDomainID(CONST.EXPENSIFY_CARD.BANK, mockWorkspaceAccountID)]: createMock<CombinedCardFeed>({
                    feed: CONST.EXPENSIFY_CARD.BANK,
                    domainID: mockWorkspaceAccountID,
                    preferredPolicy: mockPolicyID,
                }),
            },
            loadedResultMetadata,
            undefined,
            emptyCardFeedStatuses,
            mockWorkspaceAccountID,
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });
    it('should return isBlockedToAddNewFeeds as false if collect policy and only CSV feed exists', () => {
        mockedUseCardFeeds.mockReturnValue([
            {
                [getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV_CLASSIC, mockWorkspaceAccountID)]: createMock<CombinedCardFeed>({
                    feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV_CLASSIC,
                    domainID: mockWorkspaceAccountID,
                    customFeedName: 'CSV Upload',
                    accountList: [],
                }),
            },
            loadedResultMetadata,
            undefined,
            emptyCardFeedStatuses,
            mockWorkspaceAccountID,
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as true if collect policy has CSV feed and a real feed', () => {
        mockedUseCardFeeds.mockReturnValue([
            {
                [getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV_CLASSIC, mockWorkspaceAccountID)]: createMock<CombinedCardFeed>({
                    feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CSV_CLASSIC,
                    domainID: mockWorkspaceAccountID,
                    customFeedName: 'CSV Upload',
                    accountList: [],
                }),
                [getCardFeedWithDomainID(CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK, mockWorkspaceAccountID)]: createMock<CombinedCardFeed>({
                    feed: CONST.COMPANY_CARD.FEED_BANK_NAME.MOCK_BANK,
                    domainID: mockWorkspaceAccountID,
                    customFeedName: 'Bank Feed',
                    accountList: [],
                }),
            },
            loadedResultMetadata,
            undefined,
            emptyCardFeedStatuses,
            mockWorkspaceAccountID,
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return isBlockedToAddNewFeeds as false when data is still loading', () => {
        mockedUseCardFeeds.mockReturnValue([mockCardFeeds, loadingResultMetadata, {isLoading: true, settings: {}}, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        // Should not block while loading, even if feeds exist
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
        // But isAllFeedsResultLoading should be true
        expect(result.current.isAllFeedsResultLoading).toBe(true);
    });

    it('should transition from not blocked (loading) to blocked (loaded) when data finishes loading', async () => {
        mockedUseCardFeeds.mockReturnValue([mockCardFeeds, loadingResultMetadata, {isLoading: true, settings: {}}, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        const {result, rerender} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);

        mockedUseCardFeeds.mockReturnValue([mockCardFeeds, loadedResultMetadata, {isLoading: false, settings: {}}, emptyCardFeedStatuses, mockWorkspaceAccountID]);
        rerender({policyID: mockPolicyID});
        expect(result.current.isBlockedToAddNewFeeds).toBe(true);
    });
});
