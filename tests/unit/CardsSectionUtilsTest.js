"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var utils_1 = require("@src/pages/settings/Subscription/CardSection/utils");
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- this param is required for the mock
function translateMock(path) {
    var phraseParameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        phraseParameters[_i - 1] = arguments[_i];
    }
    return path;
}
var AMOUNT_OWED = 100;
var GRACE_PERIOD_DATE = 1750819200;
var ACCOUNT_DATA = {
    cardNumber: '1234',
    cardMonth: 12,
    cardYear: 2024,
};
var mockGetSubscriptionStatus = jest.fn();
jest.mock('@libs/SubscriptionUtils', function () { return (__assign(__assign({}, jest.requireActual('@libs/SubscriptionUtils')), { getAmountOwed: function () { return AMOUNT_OWED; }, getOverdueGracePeriodDate: function () { return GRACE_PERIOD_DATE; }, getSubscriptionStatus: function () { return mockGetSubscriptionStatus(); } })); });
describe('getNextBillingDate', function () {
    beforeAll(function () {
        jest.useFakeTimers();
        // Month is zero indexed, so this is July 5th 2024
        jest.setSystemTime(new Date(2024, 6, 5));
    });
    afterAll(function () {
        jest.useRealTimers();
    });
    it('should return the next billing date when initial date is valid', function () {
        var expectedNextBillingDate = 'August 1, 2024';
        expect(utils_1.default.getNextBillingDate()).toEqual(expectedNextBillingDate);
    });
    it('should handle end-of-month edge cases correctly', function () {
        var nextBillingDate = utils_1.default.getNextBillingDate();
        var expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });
    it('should handle date when it at the current month', function () {
        var nextBillingDate = utils_1.default.getNextBillingDate();
        var expectedNextBillingDate = 'August 1, 2024';
        expect(nextBillingDate).toBe(expectedNextBillingDate);
    });
    it('should return the next billing date when initial date is invalid', function () {
        var expectedNextBillingDate = 'August 1, 2024';
        expect(utils_1.default.getNextBillingDate()).toEqual(expectedNextBillingDate);
    });
});
describe('CardSectionUtils', function () {
    afterEach(function () {
        jest.restoreAllMocks();
    });
    beforeAll(function () {
        mockGetSubscriptionStatus.mockReturnValue('');
        jest.useFakeTimers();
        // Month is zero indexed, so this is July 5th 2024
        jest.setSystemTime(new Date(2024, 6, 5));
    });
    afterAll(function () {
        jest.useRealTimers();
    });
    it('should return undefined by default', function () {
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toBeUndefined();
    });
    it('should return POLICY_OWNER_WITH_AMOUNT_OWED variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwed.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwed.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });
    it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE variant with isRetryAvailable true when accountData is provided', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
        });
        var mockPurchase = {
            message: {
                billingType: 'failed_2018',
                billableAmount: 1000,
            },
            currency: 'USD',
            created: '2023-01-01',
            amount: 1000,
            purchaseID: 12345,
        };
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA, purchase: mockPurchase })).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });
    it('should return POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE variant with isRetryAvailable undefined when accountData is null', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: undefined })).toEqual({
            title: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerAmountOwedOverdue.subtitle',
            isError: true,
            isRetryAvailable: undefined,
        });
    });
    it('should return OWNER_OF_POLICY_UNDER_INVOICING variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.policyOwnerUnderInvoicing.title',
            subtitle: 'subscription.billingBanner.policyOwnerUnderInvoicing.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });
    it('should return OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.policyOwnerUnderInvoicingOverdue.title',
            subtitle: 'subscription.billingBanner.policyOwnerUnderInvoicingOverdue.subtitle',
            isError: true,
            isAddButtonDark: true,
        });
    });
    it('should return BILLING_DISPUTE_PENDING variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.billingDisputePending.title',
            subtitle: 'subscription.billingBanner.billingDisputePending.subtitle',
            isError: true,
            isRetryAvailable: false,
        });
    });
    it('should return CARD_AUTHENTICATION_REQUIRED variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.cardAuthenticationRequired.title',
            subtitle: 'subscription.billingBanner.cardAuthenticationRequired.subtitle',
            isError: true,
            isAuthenticationRequired: true,
        });
    });
    it('should return INSUFFICIENT_FUNDS variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.INSUFFICIENT_FUNDS,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.insufficientFunds.title',
            subtitle: 'subscription.billingBanner.insufficientFunds.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });
    it('should return CARD_EXPIRED variant with correct isRetryAvailableStatus for expired and unexpired card', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.CARD_EXPIRED,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: __assign(__assign({}, ACCOUNT_DATA), { cardYear: 2023 }) })).toEqual({
            title: 'subscription.billingBanner.cardExpired.title',
            subtitle: 'subscription.billingBanner.cardExpired.subtitle',
            isError: true,
            isRetryAvailable: false,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.cardExpired.title',
            subtitle: 'subscription.billingBanner.cardExpired.subtitle',
            isError: true,
            isRetryAvailable: true,
        });
    });
    it('should return CARD_EXPIRE_SOON variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.CARD_EXPIRE_SOON,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.cardExpireSoon.title',
            subtitle: 'subscription.billingBanner.cardExpireSoon.subtitle',
            isError: false,
            icon: Illustrations.CreditCardEyes,
        });
    });
    it('should return RETRY_BILLING_SUCCESS variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.retryBillingSuccess.title',
            subtitle: 'subscription.billingBanner.retryBillingSuccess.subtitle',
            isError: false,
            rightIcon: Expensicons.Close,
        });
    });
    it('should return RETRY_BILLING_ERROR variant', function () {
        mockGetSubscriptionStatus.mockReturnValue({
            status: SubscriptionUtils_1.PAYMENT_STATUS.RETRY_BILLING_ERROR,
        });
        expect(utils_1.default.getBillingStatus({ translate: translateMock, accountData: ACCOUNT_DATA })).toEqual({
            title: 'subscription.billingBanner.retryBillingError.title',
            subtitle: 'subscription.billingBanner.retryBillingError.subtitle',
            isError: true,
            isRetryAvailable: false,
        });
    });
});
