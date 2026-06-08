import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useDomainGroupMoveValidation from '@pages/domain/Members/useDomainGroupMoveValidation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DomainSecurityGroup} from '@src/types/onyx';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const DOMAIN_ACCOUNT_ID = 100;
const GROUP_ID = 'group1';
const POLICY_ID = 'policy123';
const SECURITY_GROUP_KEY = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${GROUP_ID}`;

const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

function buildSecurityGroup(overrides: Partial<DomainSecurityGroup> = {}): DomainSecurityGroup {
    return {
        name: 'Test Group',
        enableRestrictedPrimaryLogin: false,
        enableRestrictedPolicyCreation: false,
        shared: {},
        ...overrides,
    };
}

describe('useDomainGroupMoveValidation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockShowConfirmModal.mockClear();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('isBlocked is false when targetGroupId is undefined', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
            [SECURITY_GROUP_KEY]: buildSecurityGroup({enableRestrictedPrimaryPolicy: true, restrictedPrimaryPolicyID: POLICY_ID}),
        } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup>);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, undefined));

        await waitFor(() => {
            expect(result.current.isBlocked).toBe(false);
        });
    });

    it('isBlocked is false when target group has no enableRestrictedPrimaryPolicy flag', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {[SECURITY_GROUP_KEY]: buildSecurityGroup()} as PrefixedRecord<
            typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX,
            DomainSecurityGroup
        >);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, GROUP_ID));

        await waitFor(() => {
            expect(result.current.isBlocked).toBe(false);
        });
    });

    it('isBlocked is false when enableRestrictedPrimaryPolicy is true but restrictedPrimaryPolicyID is missing', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {[SECURITY_GROUP_KEY]: buildSecurityGroup({enableRestrictedPrimaryPolicy: true})} as PrefixedRecord<
            typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX,
            DomainSecurityGroup
        >);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, GROUP_ID));

        await waitFor(() => {
            expect(result.current.isBlocked).toBe(false);
        });
    });

    it('isBlocked is false when user is admin of the required policy', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
            [SECURITY_GROUP_KEY]: buildSecurityGroup({enableRestrictedPrimaryPolicy: true, restrictedPrimaryPolicyID: POLICY_ID}),
        } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup>);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Restricted Policy',
            role: CONST.POLICY.ROLE.ADMIN,
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, GROUP_ID));

        await waitFor(() => {
            expect(result.current.isBlocked).toBe(false);
        });
    });

    it('isBlocked is true when user is not admin of the required policy', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
            [SECURITY_GROUP_KEY]: buildSecurityGroup({enableRestrictedPrimaryPolicy: true, restrictedPrimaryPolicyID: POLICY_ID}),
        } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup>);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Restricted Policy',
            role: CONST.POLICY.ROLE.USER,
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, GROUP_ID));

        await waitFor(() => {
            expect(result.current.isBlocked).toBe(true);
        });
    });

    it('isBlocked is true when required policy does not exist in Onyx', async () => {
        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN}${DOMAIN_ACCOUNT_ID}`, {
            [SECURITY_GROUP_KEY]: buildSecurityGroup({enableRestrictedPrimaryPolicy: true, restrictedPrimaryPolicyID: POLICY_ID}),
        } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, DomainSecurityGroup>);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, GROUP_ID));

        await waitFor(() => {
            expect(result.current.isBlocked).toBe(true);
        });
    });

    it('showBlockedModal calls showConfirmModal with correct arguments', async () => {
        const {result} = renderHook(() => useDomainGroupMoveValidation(DOMAIN_ACCOUNT_ID, undefined));

        result.current.showBlockedModal();

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith({
            title: 'workspace.distanceRates.oopsNotSoFast',
            prompt: 'domain.members.error.moveMemberNotPolicyAdmin',
            confirmText: 'common.buttonConfirm',
            shouldShowCancelButton: false,
        });
    });
});
