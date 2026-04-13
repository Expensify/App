/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {getOwnedPaidPolicies} from '@libs/PolicyUtils';
import {calculateRemainingFreeTrialDays, doesUserHavePaymentCardAdded, getEarlyDiscountInfo, isUserOnFreeTrial, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import useFreeTrial from '@pages/home/FreeTrialSection/useFreeTrial';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useHasTeam2025Pricing', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useSubscriptionPlan', () => ({
    __esModule: true,
    default: jest.fn(() => 'corporate'),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getOwnedPaidPolicies: jest.fn(() => [{id: 'policyID'}]),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldShowDiscountBanner: jest.fn(() => false),
    getEarlyDiscountInfo: jest.fn(() => null),
    isUserOnFreeTrial: jest.fn(() => false),
    doesUserHavePaymentCardAdded: jest.fn(() => true),
    calculateRemainingFreeTrialDays: jest.fn(() => 0),
}));

const mockedUseHasTeam2025Pricing = useHasTeam2025Pricing as jest.Mock;
const mockedUseSubscriptionPlan = useSubscriptionPlan as jest.Mock;
const mockedGetOwnedPaidPolicies = getOwnedPaidPolicies as jest.Mock;
const mockedShouldShowDiscountBanner = shouldShowDiscountBanner as jest.Mock;
const mockedGetEarlyDiscountInfo = getEarlyDiscountInfo as jest.Mock;
const mockedIsUserOnFreeTrial = isUserOnFreeTrial as jest.Mock;
const mockedDoesUserHavePaymentCardAdded = doesUserHavePaymentCardAdded as jest.Mock;
const mockedCalculateRemainingFreeTrialDays = calculateRemainingFreeTrialDays as jest.Mock;

describe('useFreeTrial', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        mockedGetOwnedPaidPolicies.mockReturnValue([{id: 'policyID'}]);
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('section visibility', () => {
        it('should not show section when user is not on free trial', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(false);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(false);
        });

        it('should not show section when user already has a billing card', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(true);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(false);
        });

        it('should show section when user is on free trial and has no billing card', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(15);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(true);
        });

        it("should not show section when user doesn't own any paid workspaces", () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedGetOwnedPaidPolicies.mockReturnValue([]);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(false);
        });
    });

    describe('discount state - 50% off (first 24 hours)', () => {
        it('should return discountType 50 when discount banner is active and within first 24 hours', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 0, hours: 20, minutes: 30, seconds: 15});
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(30);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(true);
            expect(result.current.discountType).toBe(50);
        });
    });

    describe('discount state - 25% off (days 2-7)', () => {
        it('should return discountType 25 when discount banner is active and past first 24 hours', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 25, days: 5, hours: 12, minutes: 0, seconds: 0});
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(25);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(true);
            expect(result.current.discountType).toBe(25);
        });
    });

    describe('no discount (days 8-30)', () => {
        it('should return discountType null when no discount is available but trial is active', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(10);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.shouldShowFreeTrialSection).toBe(true);
            expect(result.current.discountType).toBeNull();
        });
    });

    describe('daysLeft', () => {
        it('should return the remaining trial days from calculateRemainingFreeTrialDays', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(12);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.daysLeft).toBe(12);
        });
    });

    describe('discountInfo', () => {
        it('should return discount info from getEarlyDiscountInfo when on trial', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(5);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 0, hours: 23, minutes: 59, seconds: 30});

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.discountInfo).toEqual({discountType: 50, days: 0, hours: 23, minutes: 59, seconds: 30});
        });

        it('should return null for discountInfo when getEarlyDiscountInfo returns null', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(5);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.discountInfo).toBeNull();
        });
    });

    describe('hook dependencies', () => {
        it('should call isUserOnFreeTrial with correct trial dates from Onyx', async () => {
            const firstDayFreeTrial = '2026-03-01 00:00:00';
            const lastDayFreeTrial = '2026-03-31 00:00:00';

            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDayFreeTrial);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            await waitForBatchedUpdates();

            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(20);

            renderHook(() => useFreeTrial());

            expect(mockedIsUserOnFreeTrial).toHaveBeenCalledWith(firstDayFreeTrial, lastDayFreeTrial);
        });

        it('should call doesUserHavePaymentCardAdded with billing fund ID from Onyx', async () => {
            const userBillingFundID = 12345;

            await Onyx.merge(ONYXKEYS.NVP_BILLING_FUND_ID, userBillingFundID);
            await waitForBatchedUpdates();

            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(true);

            renderHook(() => useFreeTrial());

            expect(mockedDoesUserHavePaymentCardAdded).toHaveBeenCalledWith(userBillingFundID);
        });

        it('should call shouldShowDiscountBanner with correct parameters', async () => {
            const firstDayFreeTrial = '2026-03-01 00:00:00';
            const lastDayFreeTrial = '2026-03-31 00:00:00';
            const userBillingFundID = 12345;

            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDayFreeTrial);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            await Onyx.merge(ONYXKEYS.NVP_BILLING_FUND_ID, userBillingFundID);
            await waitForBatchedUpdates();

            mockedUseHasTeam2025Pricing.mockReturnValue(true);
            mockedUseSubscriptionPlan.mockReturnValue('team');
            mockedIsUserOnFreeTrial.mockReturnValue(false);

            renderHook(() => useFreeTrial());

            expect(mockedShouldShowDiscountBanner).toHaveBeenCalledWith(CONST.DEFAULT_NUMBER_ID, true, 'team', firstDayFreeTrial, lastDayFreeTrial, userBillingFundID, {});
        });

        it('should call calculateRemainingFreeTrialDays with lastDayFreeTrial', async () => {
            const lastDayFreeTrial = '2026-03-31 00:00:00';

            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            await waitForBatchedUpdates();

            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(20);

            renderHook(() => useFreeTrial());

            expect(mockedCalculateRemainingFreeTrialDays).toHaveBeenCalledWith(lastDayFreeTrial);
        });
    });

    describe('discount type exclusivity', () => {
        it('should return discountType 50 and not 25 when discountType is 50', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 0, hours: 20, minutes: 0, seconds: 0});
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(30);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.discountType).toBe(50);
        });

        it('should return discountType 25 and not 50 when discountType is 25', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 25, days: 5, hours: 0, minutes: 0, seconds: 0});
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(25);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.discountType).toBe(25);
        });

        it('should return discountType null when discount banner should not be shown', () => {
            mockedIsUserOnFreeTrial.mockReturnValue(true);
            mockedDoesUserHavePaymentCardAdded.mockReturnValue(false);
            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 0, hours: 20, minutes: 0, seconds: 0});
            mockedCalculateRemainingFreeTrialDays.mockReturnValue(30);

            const {result} = renderHook(() => useFreeTrial());

            expect(result.current.discountType).toBeNull();
        });
    });
});
