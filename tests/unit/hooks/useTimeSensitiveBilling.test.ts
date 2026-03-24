/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {hasCardExpiredError, hasInsufficientFundsError} from '@libs/SubscriptionUtils';
import useTimeSensitiveBilling from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveBilling';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/SubscriptionUtils', () => ({
    hasCardExpiredError: jest.fn(() => false),
    hasInsufficientFundsError: jest.fn(() => false),
}));

const mockedHasCardExpiredError = hasCardExpiredError as jest.Mock;
const mockedHasInsufficientFundsError = hasInsufficientFundsError as jest.Mock;

describe('useTimeSensitiveBilling', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockedHasCardExpiredError.mockReturnValue(false);
        mockedHasInsufficientFundsError.mockReturnValue(false);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('when failed billing should NOT be shown', () => {
        it('returns false when amountOwed is 0', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 0);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {
                action: 'action',
                periodMonth: '01',
                periodYear: '2026',
                declineReason: 'insufficient_funds',
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();

            mockedHasInsufficientFundsError.mockReturnValue(true);

            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(false);
        });

        it('returns false when billingStatus has no decline reason', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(false);
        });

        it('returns false when declineReason is present but hasPurchases is false', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {
                action: 'action',
                periodMonth: '01',
                periodYear: '2026',
                declineReason: 'insufficient_funds',
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: false});
            await waitForBatchedUpdates();

            mockedHasInsufficientFundsError.mockReturnValue(true);

            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(false);
        });

        it('returns false when hasPurchases is true but no billing error', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();

            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(false);
        });

        it('returns false when all Onyx values are undefined/empty', () => {
            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(false);
        });
    });

    describe('when failed billing SHOULD be shown', () => {
        it('returns true for insufficient_funds with amountOwed > 0 and hasPurchases', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 500);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {
                action: 'action',
                periodMonth: '01',
                periodYear: '2026',
                declineReason: 'insufficient_funds',
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();

            mockedHasInsufficientFundsError.mockReturnValue(true);

            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(true);
        });

        it('returns true for expired_card with amountOwed > 0 and hasPurchases', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 250);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {
                action: 'action',
                periodMonth: '01',
                periodYear: '2026',
                declineReason: 'expired_card',
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();

            mockedHasCardExpiredError.mockReturnValue(true);

            const {result} = renderHook(() => useTimeSensitiveBilling());

            expect(result.current.shouldShowFixFailedBilling).toBe(true);
        });
    });

    describe('reactivity to Onyx changes', () => {
        it('updates when billing status changes', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();

            const {result, rerender} = renderHook(() => useTimeSensitiveBilling());
            expect(result.current.shouldShowFixFailedBilling).toBe(false);

            mockedHasInsufficientFundsError.mockReturnValue(true);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {
                action: 'action',
                periodMonth: '01',
                periodYear: '2026',
                declineReason: 'insufficient_funds',
            });
            await waitForBatchedUpdates();
            rerender({});

            expect(result.current.shouldShowFixFailedBilling).toBe(true);
        });

        it('updates when account.hasPurchases changes', async () => {
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 100);
            await Onyx.merge(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS, {
                action: 'action',
                periodMonth: '01',
                periodYear: '2026',
                declineReason: 'expired_card',
            });
            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: false});
            await waitForBatchedUpdates();

            mockedHasCardExpiredError.mockReturnValue(true);

            const {result, rerender} = renderHook(() => useTimeSensitiveBilling());
            expect(result.current.shouldShowFixFailedBilling).toBe(false);

            await Onyx.merge(ONYXKEYS.ACCOUNT, {hasPurchases: true});
            await waitForBatchedUpdates();
            rerender({});

            expect(result.current.shouldShowFixFailedBilling).toBe(true);
        });
    });
});
