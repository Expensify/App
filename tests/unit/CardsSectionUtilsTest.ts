import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {Phrase, PhraseParameters} from '@libs/Localize';
import type * as SubscriptionUtils from '@libs/SubscriptionUtils';
import {PAYMENT_STATUS} from '@libs/SubscriptionUtils';
import type {TranslationPaths} from '@src/languages/types';
import type {BillingStatusResult} from '@src/pages/settings/Subscription/CardSection/utils';
import CardSectionUtils from '@src/pages/settings/Subscription/CardSection/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- this param is required for the mock
function translateMock<TKey extends TranslationPaths>(key: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>): string {
    return key;
}

const AMOUNT_OWED = 100;
const GRACE_PERIOD_DATE = 1750819200;

const ACCOUNT_DATA = {
    cardNumber: '1234',
    cardMonth: 12,
    cardYear: 2024,
};

const mockGetSubscriptionStatus = jest.fn();

jest.mock('@libs/SubscriptionUtils', () => ({
    ...jest.requireActual<typeof SubscriptionUtils>('@libs/SubscriptionUtils'),
    getAmountOwed: () => AMOUNT_OWED,
    getOverdueGracePeriodDate: () => GRACE_PERIOD_DATE,
    getSubscriptionStatus: () => mockGetSubscriptionStatus() as BillingStatusResult,
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

        expect(CardSectionUtils.getNextBillingDate()).toEqual(expectedNextBillingDate);
    });

    it('should handle end-of-month edge cases correctly', () => {
        const nextBillingDate = CardSectionUtils.getNextBillingDate();
        const expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should handle date when it at the current month', () => {
        const nextBillingDate = CardSectionUtils.getNextBillingDate();
        const expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });

    it('should return the next billing date when initial date is invalid', () => {
        const expectedNextBillingDate = 'August 1, 2024';

        expect(CardSectionUtils.getNextBillingDate()).toEqual(expectedNextBillingDate);
    });
});

describe('CardSectionUtils', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeAll(() => {
        mockGetSubscriptionStatus.mockReturnValue('');

        jest.useFakeTimers();
        // Month is zero indexed, so this is July 5th 2024
        jest.setSystemTime(new Date(2024, 6, 5));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return undefined by default', () => {
        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toBeUndefined();
    });

    it('should return POLICY_OWNER_WITH_AMOUNT_OWED variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwed.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwed.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });

    it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle',
            isError: true,
        });
    });

    it('should return OWNER_OF_POLICY_UNDER_INVOICING variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
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

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
            title: 'subscription.billingBanner.policyOwnerUnderInvoicingOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerUnderInvoicingOverdue.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });

    it('should return BILLING_DISPUTE_PENDING variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
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

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
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

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
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

        expect(CardSectionUtils.getBillingStatus(translateMock, {...ACCOUNT_DATA, cardYear: 2023})).toEqual({
            title: 'subscription.billingBanner.cardExpired.title',
            subtitle: 'subscription.billingBanner.cardExpired.subtitle',
            isError: true,
            isRetryAvailable: false,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
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

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
            title: 'subscription.billingBanner.cardExpireSoon.title',
            subtitle: 'subscription.billingBanner.cardExpireSoon.subtitle',
            isError: false,
            icon: Illustrations.CreditCardEyes,
        });
    });

    it('should return RETRY_BILLING_SUCCESS variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
            title: 'subscription.billingBanner.retryBillingSuccess.title',
            subtitle: 'subscription.billingBanner.retryBillingSuccess.subtitle',
            isError: false,
            rightIcon: Expensicons.Close,
        });
    });

    it('should return RETRY_BILLING_ERROR variant', () => {
        mockGetSubscriptionStatus.mockReturnValue({
            status: PAYMENT_STATUS.RETRY_BILLING_ERROR,
        });

        expect(CardSectionUtils.getBillingStatus(translateMock, ACCOUNT_DATA)).toEqual({
            title: 'subscription.billingBanner.retryBillingError.title',
            subtitle: 'subscription.billingBanner.retryBillingError.subtitle',
            isError: true,
            isRetryAvailable: false,
        });
    });
});
