import {renderHook} from '@testing-library/react-native';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

import type * as SubscriptionUtils from '@libs/SubscriptionUtils';
import {PAYMENT_STATUS} from '@libs/SubscriptionUtils';

import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import CardSectionUtils from '@src/pages/settings/Subscription/CardSection/utils';
import type {Purchase} from '@src/types/onyx/PurchaseList';
import type IconAsset from '@src/types/utils/IconAsset';

import {STRIPE_CUSTOMER_ID} from '../utils/TestHelper';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- this param is required for the mock
function translateMock<TPath extends TranslationPaths>(path: TPath, ...phraseParameters: TranslationParameters<TPath>): string {
    return path;
}

const AMOUNT_OWED = 100;
const GRACE_PERIOD_DATE = 1750819200;

// 1 January 2026, distinct from GRACE_PERIOD_DATE so the two grace periods can be told apart
const TRAVEL_GRACE_PERIOD_DATE = 1767225600;

const stripeCustomerId = STRIPE_CUSTOMER_ID;
const ACCOUNT_DATA = {
    cardNumber: '1234',
    cardMonth: 12,
    cardYear: 2024,
};

const mockGetSubscriptionStatus = jest.fn<ReturnType<typeof SubscriptionUtils.getSubscriptionStatus>, Parameters<typeof SubscriptionUtils.getSubscriptionStatus>>();

jest.mock('@libs/SubscriptionUtils', () => ({
    ...jest.requireActual<typeof SubscriptionUtils>('@libs/SubscriptionUtils'),
    getSubscriptionStatus: (...args: Parameters<typeof SubscriptionUtils.getSubscriptionStatus>) => mockGetSubscriptionStatus(...args),
}));

describe('getNextBillingDate', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        // Month is zero indexed, so this is July 5th 2024
        jest.setSystemTime(new Date(2024, 6, 5));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return the next billing date when initial date is valid', () => {
        const expectedNextBillingDate = 'August 1, 2024';

        expect(CardSectionUtils.getNextBillingDate(undefined)).toEqual(expectedNextBillingDate);
    });

    it('should handle end-of-month edge cases correctly', () => {
        const nextBillingDate = CardSectionUtils.getNextBillingDate(undefined);
        const expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should handle date when it at the current month', () => {
        const nextBillingDate = CardSectionUtils.getNextBillingDate(undefined);
        const expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should return the next billing date when initial date is invalid', () => {
        const expectedNextBillingDate = 'August 1, 2024';

        expect(CardSectionUtils.getNextBillingDate(undefined)).toEqual(expectedNextBillingDate);
    });
});

describe('CardSectionUtils', () => {
    let creditCardEyesIcon: IconAsset;
    let closeIcon: IconAsset;

    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeAll(() => {
        // Get illustrations using renderHook BEFORE fake timers to avoid timing issues
        const {result} = renderHook(() => useMemoizedLazyIllustrations(['CreditCardEyes']));
        creditCardEyesIcon = result.current.CreditCardEyes;

        const {result: iconsResult} = renderHook(() => useMemoizedLazyExpensifyIcons(['Close']));
        closeIcon = iconsResult.current.Close;

        mockGetSubscriptionStatus.mockReturnValue(undefined);

        jest.useFakeTimers();
        // Month is zero indexed, so this is July 5th 2024
        jest.setSystemTime(new Date(2024, 6, 5));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return undefined by default', () => {
        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: undefined,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toBeUndefined();
    });

    it('should return POLICY_OWNER_WITH_AMOUNT_OWED variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
        });
        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwed.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwed.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });

    it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE variant with isRetryAvailable true when accountData is provided', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
        });

        const mockPurchase = {
            message: {
                billingType: 'failed_2018',
                billableAmount: 1000,
            },
            currency: 'USD',
            created: '2023-01-01',
            amount: 1000,
            purchaseID: 12345,
        } as Purchase;

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                purchase: mockPurchase,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });

    it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE variant with isRetryAvailable undefined when accountData is null', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: undefined,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle',
            isError: true,
            isRetryAvailable: undefined,
        });
    });

    it('should return OWNER_OF_POLICY_UNDER_INVOICING variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.policyOwnerUnderInvoicing.title',
            subtitle: 'subscription.billingBanner.policyOwnerUnderInvoicing.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });

    it('should return OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.policyOwnerUnderInvoicingOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerUnderInvoicingOverdue.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });

    it('should return OWNER_OF_POLICY_WITH_OVERDUE_TRAVEL_INVOICE variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.OWNER_OF_POLICY_WITH_OVERDUE_TRAVEL_INVOICE,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                ownerTravelBillingGracePeriodEnd: TRAVEL_GRACE_PERIOD_DATE,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.travelInvoiceOverdue.title',
            subtitle: 'subscription.billingBanner.travelInvoiceOverdue.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });

    it('should return OWNER_OF_POLICY_WITH_OVERDUE_TRAVEL_INVOICE_LOCKED variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.OWNER_OF_POLICY_WITH_OVERDUE_TRAVEL_INVOICE_LOCKED,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: 0,
                ownerBillingGracePeriodEnd: undefined,
                ownerTravelBillingGracePeriodEnd: TRAVEL_GRACE_PERIOD_DATE,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.travelInvoiceOverdueLocked.title',
            subtitle: 'subscription.billingBanner.travelInvoiceOverdueLocked.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });

    it('should date the travel invoice banner from the travel grace period rather than the subscription one', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.OWNER_OF_POLICY_WITH_OVERDUE_TRAVEL_INVOICE,
        });

        const billingStatus = CardSectionUtils.getBillingStatus({
            dateFnsLocale: undefined,
            translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => {
                const interpolatedDate = parameters.at(0);
                return typeof interpolatedDate === 'string' ? `${path}|${interpolatedDate}` : path;
            },
            stripeCustomerId,
            accountData: ACCOUNT_DATA,
            retryBillingSuccessful: false,
            billingDisputePending: undefined,
            retryBillingFailed: undefined,
            creditCardEyesIcon,
            fundList: undefined,
            billingStatus: undefined,
            amountOwed: AMOUNT_OWED,
            ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
            ownerTravelBillingGracePeriodEnd: TRAVEL_GRACE_PERIOD_DATE,
        });

        expect(billingStatus?.subtitle).toBe('subscription.billingBanner.travelInvoiceOverdue.subtitle|January 1, 2026');
    });

    it('should return BILLING_DISPUTE_PENDING variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: 1,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.billingDisputePending.title',
            subtitle: 'subscription.billingBanner.billingDisputePending.subtitle',
            isError: true,
            isRetryAvailable: false,
        });
    });

    it('should return CARD_AUTHENTICATION_REQUIRED variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.cardAuthenticationRequired.title',
            subtitle: 'subscription.billingBanner.cardAuthenticationRequired.subtitle',
            isError: true,
            isAuthenticationRequired: true,
        });
    });

    it('should return INSUFFICIENT_FUNDS variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.INSUFFICIENT_FUNDS,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.insufficientFunds.title',
            subtitle: 'subscription.billingBanner.insufficientFunds.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });

    it('should return CARD_EXPIRED variant with correct isRetryAvailableStatus for expired and unexpired card', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.CARD_EXPIRED,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: {...ACCOUNT_DATA, cardYear: 2023},
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.cardExpired.title',
            subtitle: 'subscription.billingBanner.cardExpired.subtitle',
            isError: true,
            isRetryAvailable: false,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.cardExpired.title',
            subtitle: 'subscription.billingBanner.cardExpired.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });

    it('should return CARD_EXPIRE_SOON variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.CARD_EXPIRE_SOON,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: true,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.cardExpireSoon.title',
            subtitle: 'subscription.billingBanner.cardExpireSoon.subtitle',
            isError: false,
            icon: creditCardEyesIcon,
        });
    });

    it('should return RETRY_BILLING_SUCCESS variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                closeIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.retryBillingSuccess.title',
            subtitle: 'subscription.billingBanner.retryBillingSuccess.subtitle',
            isError: false,
            rightIcon: closeIcon,
        });
    });

    it('should return RETRY_BILLING_ERROR variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.RETRY_BILLING_ERROR,
        });

        expect(
            CardSectionUtils.getBillingStatus({
                dateFnsLocale: undefined,
                translate: translateMock,
                stripeCustomerId,
                accountData: ACCOUNT_DATA,
                retryBillingSuccessful: false,
                billingDisputePending: undefined,
                retryBillingFailed: undefined,
                creditCardEyesIcon,
                fundList: undefined,
                billingStatus: undefined,
                amountOwed: AMOUNT_OWED,
                ownerBillingGracePeriodEnd: GRACE_PERIOD_DATE,
                ownerTravelBillingGracePeriodEnd: undefined,
            }),
        ).toEqual({
            title: 'subscription.billingBanner.retryBillingError.title',
            subtitle: 'subscription.billingBanner.retryBillingError.subtitle',
            isError: true,
            isRetryAvailable: false,
        });
    });
});
