/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
// Import mocks after they're defined
import useHasTeam2025Pricing from '@hooks/useHasTeam2025Pricing';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import {getEarlyDiscountInfo, shouldShowDiscountBanner} from '@libs/SubscriptionUtils';
import useTimeSensitiveOffers from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveOffers';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Mock the hooks and utils that useTimeSensitiveOffers depends on
jest.mock('@hooks/useHasTeam2025Pricing', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useSubscriptionPlan', () => ({
    __esModule: true,
    default: jest.fn(() => 'corporate'),
}));

jest.mock('@libs/SubscriptionUtils', () => ({
    shouldShowDiscountBanner: jest.fn(() => false),
    getEarlyDiscountInfo: jest.fn(() => null),
}));

const mockedUseHasTeam2025Pricing = useHasTeam2025Pricing as jest.Mock;
const mockedUseSubscriptionPlan = useSubscriptionPlan as jest.Mock;
const mockedShouldShowDiscountBanner = shouldShowDiscountBanner as jest.Mock;
const mockedGetEarlyDiscountInfo = getEarlyDiscountInfo as jest.Mock;

describe('useTimeSensitiveOffers', () => {
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

    describe('when discount banner should not be shown', () => {
        it('should return shouldShow50off and shouldShow25off as false when shouldShowDiscountBanner returns false', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 5});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(false);
            expect(result.current.shouldShow25off).toBe(false);
        });

        it('should return shouldShow50off and shouldShow25off as false when discountInfo is null', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(false);
            expect(result.current.shouldShow25off).toBe(false);
        });
    });

    describe('when 50% discount should be shown', () => {
        it('should return shouldShow50off as true when discountType is 50', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 1});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(true);
            expect(result.current.shouldShow25off).toBe(false);
        });

        it('should set discountInfo correctly when showing 50% off', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 1});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.discountInfo).toEqual({discountType: 50, days: 1});
        });
    });

    describe('when 25% discount should be shown', () => {
        it('should return shouldShow25off as true when discountType is 25', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 25, days: 5});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(false);
            expect(result.current.shouldShow25off).toBe(true);
        });

        it('should set discountInfo correctly when showing 25% off', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 25, days: 10});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.discountInfo).toEqual({discountType: 25, days: 10});
        });
    });

    describe('discount type exclusivity', () => {
        it('should only show one discount type at a time (50% takes precedence)', () => {
            // When discount is 50%, only shouldShow50off should be true
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 50, days: 1});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(true);
            expect(result.current.shouldShow25off).toBe(false);
        });

        it('should show 25% when discountType is 25', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 25, days: 5});

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(false);
            expect(result.current.shouldShow25off).toBe(true);
        });
    });

    describe('firstDayFreeTrial data', () => {
        it('should return firstDayFreeTrial from Onyx', async () => {
            const testDate = '2026-01-15';
            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, testDate);
            await waitForBatchedUpdates();

            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.firstDayFreeTrial).toBe(testDate);
        });

        it('should return undefined for firstDayFreeTrial when not set in Onyx', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.firstDayFreeTrial).toBeUndefined();
        });
    });

    describe('hook dependencies', () => {
        it('should call shouldShowDiscountBanner with correct parameters', async () => {
            const firstDayFreeTrial = '2026-01-15';
            const lastDayFreeTrial = '2026-01-22';
            const userBillingFundID = 12345;

            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDayFreeTrial);
            await Onyx.merge(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL, lastDayFreeTrial);
            await Onyx.merge(ONYXKEYS.NVP_BILLING_FUND_ID, userBillingFundID);
            await waitForBatchedUpdates();

            mockedUseHasTeam2025Pricing.mockReturnValue(true);
            mockedUseSubscriptionPlan.mockReturnValue('team');
            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);

            renderHook(() => useTimeSensitiveOffers());

            expect(mockedShouldShowDiscountBanner).toHaveBeenCalledWith(
                true, // hasTeam2025Pricing
                'team', // subscriptionPlan
                firstDayFreeTrial,
                lastDayFreeTrial,
                userBillingFundID,
            );
        });

        it('should call getEarlyDiscountInfo with firstDayFreeTrial', async () => {
            const firstDayFreeTrial = '2026-01-15';

            await Onyx.merge(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL, firstDayFreeTrial);
            await waitForBatchedUpdates();

            mockedShouldShowDiscountBanner.mockReturnValue(false);
            mockedGetEarlyDiscountInfo.mockReturnValue(null);

            renderHook(() => useTimeSensitiveOffers());

            expect(mockedGetEarlyDiscountInfo).toHaveBeenCalledWith(firstDayFreeTrial);
        });
    });

    describe('other discount types', () => {
        it('should not show any discount when discountType is neither 50 nor 25', () => {
            mockedShouldShowDiscountBanner.mockReturnValue(true);
            mockedGetEarlyDiscountInfo.mockReturnValue({discountType: 10, days: 5}); // Some other discount type

            const {result} = renderHook(() => useTimeSensitiveOffers());

            expect(result.current.shouldShow50off).toBe(false);
            expect(result.current.shouldShow25off).toBe(false);
        });
    });
});
