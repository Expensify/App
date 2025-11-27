import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsAllowedToIssueCompanyCard from '@hooks/useIsAllowedToIssueCompanyCard';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../../utils/collections/policies';

const domainID = 19475968;
const mockPolicyID = '123456';
const workspaceAccountID = 11111111;

const mockPolicy = {...createRandomPolicy(Number(mockPolicyID), CONST.POLICY.TYPE.TEAM, 'TestPolicy'), policyID: mockPolicyID, workspaceAccountID};

const mockedFeeds = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'vcf#19475968': {
        liabilityType: 'personal',
        pending: false,
        domainID,
        customFeedName: 'Custom feed name',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'vcf#11111111': {
        liabilityType: 'personal',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Custom feed name 1',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
    },
};

jest.mock('@hooks/useCardFeeds', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));
describe('useIsAllowedToIssueCompanyCard', () => {
    beforeEach(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, mockPolicy);
    });
    it('should return true if domain feed and access is granted', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicy?.policyID}`, 'vcf#19475968');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainID}`, true);
        (useCardFeeds as jest.Mock).mockReturnValue([mockedFeeds, {status: 'loaded'}]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(true);
    });

    it('should return false if domain feed and access is not granted', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicy?.policyID}`, 'vcf#19475968');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${domainID}`, false);
        (useCardFeeds as jest.Mock).mockReturnValue([mockedFeeds, {status: 'loaded'}]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(false);
    });
    it('should return true if workspace feed and user is admin', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicy?.policyID}`, 'vcf#11111111');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {
            role: CONST.POLICY.ROLE.ADMIN,
        });
        (useCardFeeds as jest.Mock).mockReturnValue([mockedFeeds, {status: 'loaded'}]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(true);
    });
    it('should return false if workspace feed and user is not an admin', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${mockPolicy?.policyID}`, 'vcf#11111111');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${mockPolicy?.policyID}`, {
            role: CONST.POLICY.ROLE.USER,
        });
        (useCardFeeds as jest.Mock).mockReturnValue([mockedFeeds, {status: 'loaded'}]);
        const {result} = renderHook(() => useIsAllowedToIssueCompanyCard({policyID: mockPolicyID}));
        expect(result?.current).toBe(false);
    });
});
