import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useRestrictedActionPolicyID from '@hooks/useRestrictedActionPolicyID';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import type * as SubscriptionUtilsModule from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/SubscriptionUtils', () => ({
    ...jest.requireActual<typeof SubscriptionUtilsModule>('@libs/SubscriptionUtils'),
    shouldRestrictUserBillableActions: jest.fn(),
}));

const mockedShouldRestrict = jest.mocked(shouldRestrictUserBillableActions);

describe('useRestrictedActionPolicyID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
        mockedShouldRestrict.mockReset();
    });

    it('returns undefined when no policy is provided (and never checks the restriction)', async () => {
        const {result} = renderHook(() => useRestrictedActionPolicyID(undefined), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBeUndefined();
        expect(mockedShouldRestrict).not.toHaveBeenCalled();
    });

    it('returns the policy id when billable actions are restricted', async () => {
        mockedShouldRestrict.mockReturnValue(true);
        const policy = createRandomPolicy(7);

        const {result} = renderHook(() => useRestrictedActionPolicyID(policy), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBe('7');
    });

    it('returns undefined when billable actions are not restricted', async () => {
        mockedShouldRestrict.mockReturnValue(false);
        const policy = createRandomPolicy(7);

        const {result} = renderHook(() => useRestrictedActionPolicyID(policy), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBeUndefined();
    });

    it('passes the billing grace periods and amount owed from Onyx to the restriction check', async () => {
        mockedShouldRestrict.mockReturnValue(false);
        await Onyx.multiSet({
            [ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END]: 123,
            [ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED]: 456,
        });
        await waitForBatchedUpdatesWithAct();
        const policy = createRandomPolicy(7);

        renderHook(() => useRestrictedActionPolicyID(policy), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        const callArgs = mockedShouldRestrict.mock.calls.at(0);
        expect(callArgs?.[0]).toBe(policy); // policy
        expect(callArgs?.[1]).toBe(123); // ownerBillingGracePeriodEnd
        expect(callArgs?.[3]).toBe(456); // amountOwed
    });
});
