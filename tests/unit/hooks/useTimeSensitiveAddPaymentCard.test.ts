/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import {shouldShowTrialEndedUI} from '@libs/SubscriptionUtils';
import useTimeSensitiveAddPaymentCard from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveAddPaymentCard';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useHasTeam2025Pricing', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldShowTrialEndedUI: jest.fn(() => false),
}));

const mockedUseHasTeam2025Pricing = useHasTeam2025Pricing as jest.Mock;
const mockedShouldShowTrialEndedUI = shouldShowTrialEndedUI as jest.Mock;

describe('useTimeSensitiveAddPaymentCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('when add payment card should not be shown', () => {
        it('should return shouldShowAddPaymentCard as false when shouldShowTrialEndedUI returns false', () => {
            mockedUseHasTeam2025Pricing.mockReturnValue(true);
            mockedShouldShowTrialEndedUI.mockReturnValue(false);

            const {result} = renderHook(() => useTimeSensitiveAddPaymentCard());

            expect(result.current.shouldShowAddPaymentCard).toBe(false);
        });

        it('should return shouldShowAddPaymentCard as false when hasTeam2025Pricing is false', () => {
            mockedUseHasTeam2025Pricing.mockReturnValue(false);
            mockedShouldShowTrialEndedUI.mockReturnValue(true);

            const {result} = renderHook(() => useTimeSensitiveAddPaymentCard());

            expect(result.current.shouldShowAddPaymentCard).toBe(false);
        });
    });

    describe('when add payment card should be shown', () => {
        it('should return shouldShowAddPaymentCard as true when hasTeam2025Pricing and shouldShowTrialEndedUI both return true', () => {
            mockedUseHasTeam2025Pricing.mockReturnValue(true);
            mockedShouldShowTrialEndedUI.mockReturnValue(true);

            const {result} = renderHook(() => useTimeSensitiveAddPaymentCard());

            expect(result.current.shouldShowAddPaymentCard).toBe(true);
        });
    });

    describe('hook dependencies', () => {
        it('should call shouldShowTrialEndedUI with Onyx data', async () => {
            const lastDayFreeTrial = '2025-01-15';
            const userBillingFundID = 12345;
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            await Onyx.merge(ONYXKEYS.NVP_BILLING_FUND_ID, userBillingFundID);
            await waitForBatchedUpdates();

            mockedUseHasTeam2025Pricing.mockReturnValue(true);
            mockedShouldShowTrialEndedUI.mockReturnValue(false);

            renderHook(() => useTimeSensitiveAddPaymentCard());

            expect(mockedShouldShowTrialEndedUI).toHaveBeenCalledWith(CONST.DEFAULT_NUMBER_ID, lastDayFreeTrial, userBillingFundID, {}, undefined, undefined, undefined);
        });
    });
});
