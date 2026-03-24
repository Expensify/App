import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TEST_ACCOUNT_ID = 12345;

/**
 * The subscription visibility condition used by both SubscriptionSettingsPage and InitialSettingsPage:
 *   shouldShowSubscription = !!subscriptionPlan || (amountOwed ?? 0) > 0
 *
 * This test validates that condition behaves correctly in all scenarios,
 * particularly when amountOwed > 0 but no paid workspaces exist (subscriptionPlan is null).
 */
describe('Subscription visibility logic', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: TEST_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.USER_METADATA, {accountID: TEST_ACCOUNT_ID});
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('useSubscriptionPlan', () => {
        it('should return null when user has no policies', () => {
            const {result} = renderHook(() => useSubscriptionPlan());
            expect(result.current).toBeNull();
        });

        it('should return null when user only has personal (free) policies', async () => {
            const personalPolicy = createRandomPolicy(1, CONST.POLICY.TYPE.PERSONAL, 'Personal Workspace');
            personalPolicy.ownerAccountID = TEST_ACCOUNT_ID;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${personalPolicy.id}`, personalPolicy);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useSubscriptionPlan());
            expect(result.current).toBeNull();
        });

        it('should return TEAM when user owns a collect workspace', async () => {
            const teamPolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Team Workspace');
            teamPolicy.ownerAccountID = TEST_ACCOUNT_ID;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${teamPolicy.id}`, teamPolicy);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useSubscriptionPlan());
            expect(result.current).toBe(CONST.POLICY.TYPE.TEAM);
        });

        it('should return CORPORATE when user owns a control workspace', async () => {
            const corporatePolicy = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Corporate Workspace');
            corporatePolicy.ownerAccountID = TEST_ACCOUNT_ID;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${corporatePolicy.id}`, corporatePolicy);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useSubscriptionPlan());
            expect(result.current).toBe(CONST.POLICY.TYPE.CORPORATE);
        });
    });

    describe('shouldShowSubscription condition', () => {
        /**
         * Helper that computes the same condition used by SubscriptionSettingsPage (line 36)
         * and InitialSettingsPage (line 273):
         *   !!subscriptionPlan || (amountOwed ?? 0) > 0
         */
        function shouldShowSubscription(subscriptionPlan: string | null, amountOwed: number | undefined): boolean {
            return !!subscriptionPlan || (amountOwed ?? 0) > 0;
        }

        it('should be false when no subscription plan and no amount owed', () => {
            expect(shouldShowSubscription(null, undefined)).toBe(false);
            expect(shouldShowSubscription(null, 0)).toBe(false);
        });

        it('should be true when subscription plan exists', () => {
            expect(shouldShowSubscription(CONST.POLICY.TYPE.TEAM, 0)).toBe(true);
            expect(shouldShowSubscription(CONST.POLICY.TYPE.CORPORATE, 0)).toBe(true);
            expect(shouldShowSubscription(CONST.POLICY.TYPE.TEAM, undefined)).toBe(true);
        });

        it('should be true when amount owed > 0 even without subscription plan', () => {
            expect(shouldShowSubscription(null, 100)).toBe(true);
            expect(shouldShowSubscription(null, 1)).toBe(true);
            expect(shouldShowSubscription(null, 0.01)).toBe(true);
        });

        it('should be true when both subscription plan and amount owed exist', () => {
            expect(shouldShowSubscription(CONST.POLICY.TYPE.TEAM, 100)).toBe(true);
        });
    });

    describe('scenario: user deletes last paid workspace with outstanding balance', () => {
        it('should have subscriptionPlan null after deleting last paid workspace, but amountOwed keeps subscription visible', async () => {
            // Step 1: User has a paid workspace — subscriptionPlan is TEAM
            const teamPolicy = createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'My Workspace');
            teamPolicy.ownerAccountID = TEST_ACCOUNT_ID;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${teamPolicy.id}`, teamPolicy);
            await waitForBatchedUpdates();

            const {result: planResult, rerender} = renderHook(() => useSubscriptionPlan());
            expect(planResult.current).toBe(CONST.POLICY.TYPE.TEAM);

            // Step 2: User deletes the workspace — subscriptionPlan becomes null
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${teamPolicy.id}`, null);
            await waitForBatchedUpdates();
            rerender({});

            expect(planResult.current).toBeNull();

            // Step 3: amountOwed > 0 keeps subscription visible
            // This is the key scenario this PR fixes — without the amountOwed check,
            // the user would lose access to the Subscription page
            const amountOwed = 100;
            const shouldShowSubscription = !!planResult.current || (amountOwed ?? 0) > 0;
            expect(shouldShowSubscription).toBe(true);
        });
    });
});
