import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsBlockedToAddFeed from '@hooks/useIsBlockedToAddFeed';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../../utils/collections/policies';

const mockPolicyID = '123456';

const delay = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID};

jest.mock('@hooks/useCardFeeds', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));
describe('useIsBlockedToAddFeed', () => {
    beforeEach(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
    });
    it('should return true if collect policy and feed already exists', () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCards: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'plaid.ins_19': {
                            asrEnabled: false,
                            country: 'US',
                            forceReimbursable: 'force_no',
                            liabilityType: 'corporate',
                            preferredPolicy: '135CA2196CD21C88',
                            reportTitleFormat: '',
                            shouldApplyCashbackToBill: true,
                            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
                            uploadLayoutSettings: [],
                        },
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    companyCardNicknames: {'plaid.ins_19': 'Regions Bank cards'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    oAuthAccountDetails: {'plaid.ins_19': {accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333']}},
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result?.current.isBlockedToAddNewFeeds).toBe(true);
    });

    it('should return isBlockedToAddNewFeeds as false if control policy and feed already exists', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCards: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'plaid.ins_19': {
                            asrEnabled: false,
                            country: 'US',
                            forceReimbursable: 'force_no',
                            liabilityType: 'corporate',
                            preferredPolicy: '135CA2196CD21C88',
                            reportTitleFormat: '',
                            shouldApplyCashbackToBill: true,
                            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
                            uploadLayoutSettings: [],
                        },
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    companyCardNicknames: {'plaid.ins_19': 'Regions Bank cards'},
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    oAuthAccountDetails: {'plaid.ins_19': {accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333']}},
                },
            },
            {status: 'loaded'},
        ]);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {...mockPolicy, type: CONST.POLICY.TYPE.CORPORATE});
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result?.current.isBlockedToAddNewFeeds).toBe(false);
    });

    it('should return isBlockedToAddNewFeeds as false if collect policy and new feed added', async () => {
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    oAuthAccountDetails: {},
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(result.current.isBlockedToAddNewFeeds).toBe(false);
        await delay(2000); // Set initial empty state and wait for new connection to be established
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCardNicknames: {ins: 'Regions Bank cards'},
                    oAuthAccountDetails: {ins: {accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333']}},
                },
            },
            {status: 'loaded'},
        ]);
        await delay(2000); // Wait to set state happened

        const {result: secondCall} = renderHook(() => useIsBlockedToAddFeed(mockPolicyID));
        expect(secondCall.current.isBlockedToAddNewFeeds).toBe(false);
    });
});
