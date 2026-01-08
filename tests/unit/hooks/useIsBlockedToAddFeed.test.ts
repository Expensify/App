import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../../utils/collections/policies';

const mockPolicyID = '123456';

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID, workspaceAccountID: Number(mockPolicyID)};

const mockCardFeeds = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'plaid.ins_19': {
        asrEnabled: false,
        country: 'US',
        feed: 'plaid.ins_19',
        domainID: 123456,
        forceReimbursable: 'force_no',
        liabilityType: 'corporate',
        preferredPolicy: '135CA2196CD21C88',
        reportTitleFormat: '',
        shouldApplyCashbackToBill: true,
        statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
        uploadLayoutSettings: [],
        customFeedName: 'Regions Bank cards',
        accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333'],
    },
};

jest.mock('@hooks/useCardFeeds', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));
describe('useIsBlockedToAddFeed', () => {
    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });
    it('should return true if collect policy and feed already exists', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([mockCardFeeds, {status: 'loaded'}]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result?.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return isBlockedToAddNewFeeds as false if control policy', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([mockCardFeeds, {status: 'loaded'}]);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {...mockPolicy, type: CONST.POLICY.TYPE.CORPORATE});
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result?.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and CSV feed exists (allows adding another feed)', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'csv#123456': {
                    feed: 'csv#123456',
                    customFeedName: 'CSV Upload',
                    accountList: ['Card 0000'],
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));

        // CSV feeds don't count toward the limit, so user can add another feed
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and no feed added', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([{}, {status: 'loaded'}]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and Expensify feed exists', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                [CONST.EXPENSIFY_CARD.BANK]: {
                    feed: CONST.EXPENSIFY_CARD.BANK,
                    domainID: 123456,
                    centralTravelBilling: false,
                    expensifyCardMonthlySettlementDate: 0,
                    expensifyCardSettlementBankAccount: {
                        bankAccountID: 3288123,
                        maskedNumber: '111122XXXXXX1111',
                        ownerEmail: '1234@gmail.com',
                        state: 'OPEN',
                    },
                    expensifyCardSettlementFrequency: 'daily',
                    expensifyCardUseContinuousReconciliation: true,
                    policyWithdrawalIDMap: [],
                    preferredPolicy: mockPolicyID,
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });
    it('should return isBlockedToAddNewFeeds as false when data is still loading', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([mockCardFeeds, {status: 'loading'}, {isLoading: true}]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        // Should not block while loading, even if feeds exist
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
        // But isAllFeedsResultLoading should be true
        expect(result.current.isAllFeedsResultLoading).toBe(true);
    });

    it('should transition from not blocked (loading) to blocked (loaded) when data finishes loading', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([mockCardFeeds, {status: 'loading'}, {isLoading: true}]);
        const {result, rerender} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);

        (useCardFeeds as jest.Mock).mockReturnValue([mockCardFeeds, {status: 'loaded'}, {isLoading: false}]);
        rerender(mockPolicyID);
        expect(result.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return true if collect policy and pending feed exists (pending feeds count toward limit)', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'plaid.ins_19#123456': {
                    feed: 'plaid.ins_19',
                    domainID: 123456,
                    pending: true,
                    liabilityType: 'corporate',
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));

        // Pending feeds count toward the limit, so user should be blocked from adding another feed
        expect(result.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return false if collect policy and pending CSV feed exists (pending CSV feeds do not count toward limit)', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'csv#123456': {
                    feed: 'csv#123456',
                    customFeedName: 'CSV Upload',
                    accountList: ['Card 0000'],
                    pending: true,
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));

        // Pending CSV feeds don't count toward the limit, so user can add another feed
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return true if collect policy has both regular feed and pending feed', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'plaid.ins_19#123456': {
                    feed: 'plaid.ins_19',
                    domainID: 123456,
                    pending: false,
                    liabilityType: 'corporate',
                },
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'oauth.chase.com#123456': {
                    feed: 'oauth.chase.com',
                    domainID: 123456,
                    pending: true,
                    liabilityType: 'corporate',
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));

        // Both regular and pending feeds count, so user should be blocked
        expect(result.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return true if collect policy has only pending feed (no regular feeds)', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'oauth.chase.com#123456': {
                    feed: 'oauth.chase.com',
                    domainID: 123456,
                    pending: true,
                    liabilityType: 'corporate',
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));

        // Pending feeds count toward the limit, so even with only a pending feed, user should be blocked
        expect(result.current.isBlockedToAddNewFeeds).toBe(true);
    });
});
