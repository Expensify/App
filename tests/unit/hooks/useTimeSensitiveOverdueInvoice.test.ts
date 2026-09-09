import {renderHook} from '@testing-library/react-native';

import useTimeSensitiveOverdueInvoice from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveOverdueInvoice';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ONE_WEEK_SECONDS = 7 * 24 * 60 * 60;
const nowSeconds = () => Math.floor(Date.now() / 1000);

describe('useTimeSensitiveOverdueInvoice', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('when the overdue invoice should NOT be shown', () => {
        it('returns false when there is no grace period end', () => {
            const {result} = renderHook(() => useTimeSensitiveOverdueInvoice());

            expect(result.current.shouldShowOverdueInvoice).toBe(false);
        });

        it('returns false once the grace period is past due (invoicing is overdue, not within grace)', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, nowSeconds() - ONE_WEEK_SECONDS);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTimeSensitiveOverdueInvoice());

            expect(result.current.shouldShowOverdueInvoice).toBe(false);
        });

        it('returns false when an amount is owed (a different billing status applies)', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 500);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, nowSeconds() + ONE_WEEK_SECONDS);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTimeSensitiveOverdueInvoice());

            expect(result.current.shouldShowOverdueInvoice).toBe(false);
        });
    });

    describe('when the overdue invoice SHOULD be shown', () => {
        it('returns true for a billing owner within the grace period with nothing owed', async () => {
            const gracePeriodEnd = nowSeconds() + ONE_WEEK_SECONDS;
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, gracePeriodEnd);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTimeSensitiveOverdueInvoice());

            expect(result.current.shouldShowOverdueInvoice).toBe(true);
            expect(result.current.ownerBillingGracePeriodEnd).toBe(gracePeriodEnd);
        });

        it('returns true even when a travel invoice is also present (travel does not mask the subscription reminder)', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, nowSeconds() + ONE_WEEK_SECONDS);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_TRAVEL_BILLING_GRACE_PERIOD_END, nowSeconds() + ONE_WEEK_SECONDS);
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTimeSensitiveOverdueInvoice());

            expect(result.current.shouldShowOverdueInvoice).toBe(true);
        });
    });

    describe('reactivity to Onyx changes', () => {
        it('updates when the grace period end is set', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await waitForBatchedUpdates();

            const {result, rerender} = renderHook(() => useTimeSensitiveOverdueInvoice());
            expect(result.current.shouldShowOverdueInvoice).toBe(false);

            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, nowSeconds() + ONE_WEEK_SECONDS);
            await waitForBatchedUpdates();
            rerender({});

            expect(result.current.shouldShowOverdueInvoice).toBe(true);
        });
    });
});
