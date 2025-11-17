import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsAllowedToIssueCompanyCard from '@hooks/useIsAllowedToIssueCompanyCard';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../../utils/collections/policies';

const mockPolicyID = '123456';

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID};

jest.mock('@hooks/useCardFeeds', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));
describe('useIsAllowedToIssueCompanyCard', () => {
    beforeEach(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicy?.policyID}`, 'vcf');
    });
    it('should return true if domain feed and access is granted', async () => {
        const domainID = 19475968;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainID}`, true);
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCards: {
                        vcf: {
                            asrEnabled: false,
                            country: 'US',
                            domainID,
                            forceReimbursable: 'force_no',
                            liabilityType: 'corporate',
                            preferredPolicy: '135CA2196CD21C88',
                            reportTitleFormat: '',
                            shouldApplyCashbackToBill: true,
                            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
                            uploadLayoutSettings: [],
                        },
                    },
                    companyCardNicknames: {},
                    oAuthAccountDetails: {},
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(true);
    });

    it('should return false if domain feed and access is not granted', async () => {
        const domainID = 19475968;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainID}`, false);
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCards: {
                        vcf: {
                            asrEnabled: false,
                            country: 'US',
                            domainID,
                            forceReimbursable: 'force_no',
                            liabilityType: 'corporate',
                            preferredPolicy: '135CA2196CD21C88',
                            reportTitleFormat: '',
                            shouldApplyCashbackToBill: true,
                            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
                            uploadLayoutSettings: [],
                        },
                    },
                    companyCardNicknames: {},
                    oAuthAccountDetails: {},
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(false);
    });
    it('should return true if workspace feed and user is admin', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {
            role: CONST.POLICY.ROLE.ADMIN,
        });
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCards: {
                        vcf: {
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
                    companyCardNicknames: {},
                    oAuthAccountDetails: {},
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(true);
    });
    it('should return false if workspace feed and user is not an admin', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {
            role: CONST.POLICY.ROLE.USER,
        });
        (useCardFeeds as jest.Mock).mockReturnValue([
            {
                settings: {
                    companyCards: {
                        vcf: {
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
                    companyCardNicknames: {},
                    oAuthAccountDetails: {},
                },
            },
            {status: 'loaded'},
        ]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(false);
    });
});
