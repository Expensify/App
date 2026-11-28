/**
 * Sentry labels for Settings > Subscription.
 * They live here so SENTRY_LABEL.ts stays under the line limit.
 */
const SUBSCRIPTION_SENTRY_LABEL = {
    EXPLORE_PLANS: 'SettingsSubscription-ExplorePlans',
    PAYMENT_CARD_MENU_ITEM: {
        CHANGE_CARD: 'SettingsSubscription-PaymentCardMenuItem-ChangeCard',
        CHANGE_CURRENCY: 'SettingsSubscription-PaymentCardMenuItem-ChangeCurrency',
    },
    SAVE_WITH_EXPENSIFY: 'SettingsSubscription-SaveWithExpensify',
    ANNUAL_SAVINGS: 'SettingsSubscription-AnnualSavings',
    RETRY_PAYMENT: 'SettingsSubscription-RetryPayment',
    AUTHENTICATE_PAYMENT: 'SettingsSubscription-AuthenticatePayment',
    VIEW_PAYMENT_HISTORY: 'SettingsSubscription-ViewPaymentHistory',
    PAYMENT_HISTORY_ROW: 'SettingsSubscription-PaymentHistoryRow',
    PAYMENT_ACTIVITY_ROW: 'SettingsSubscription-PaymentActivityRow',
    VIEW_BILLING_RECEIPT: 'SettingsSubscription-ViewBillingReceipt',
    REQUEST_REFUND: 'SettingsSubscription-RequestRefund',
    CANCEL_SUBSCRIPTION: 'SettingsSubscription-CancelSubscription',
    AUTO_RENEW_SWITCH: 'SettingsSubscription-AutoRenewSwitch',
    AUTO_INCREASE_SWITCH: 'SettingsSubscription-AutoIncreaseSwitch',
    ADD_PAYMENT_CARD: 'SettingsSubscription-AddPaymentCard',
    BILLING_CURRENCY: 'SettingsSubscription-BillingCurrency',
    CANCEL_SUBSCRIPTION_DONE: 'SettingsSubscription-CancelSubscriptionDone',
    EARLY_RENEWAL_BANNER_CLAIM: 'SettingsSubscription-EarlyRenewalBannerClaim',
    EARLY_RENEWAL_BANNER_RENEW: 'SettingsSubscription-EarlyRenewalBannerRenew',
    EDIT_SUBSCRIPTION: 'SettingsSubscription-EditSubscription',
    EXPENSIFY_CODE: 'SettingsSubscription-ExpensifyCode',
    EXPIRING_SOON_BANNER_MANAGE: 'SettingsSubscription-ExpiringSoonBannerManage',
    PAYMENT_CARD_MENU: 'SettingsSubscription-PaymentCardMenu',
    PLAN_DOWNGRADE: 'SettingsSubscription-PlanDowngrade',
    PLAN_MENU: 'SettingsSubscription-PlanMenu',
    PLAN_UPGRADE: 'SettingsSubscription-PlanUpgrade',
    SUBSCRIPTION_SIZE: 'SettingsSubscription-SubscriptionSize',
    SIZE_NOT_SET_LEARN_MORE: 'SettingsSubscription-SizeNotSetLearnMore',
    SUBSCRIPTION_SIZE_SAVE: 'SettingsSubscription-SubscriptionSizeSave',
    TAX_EXEMPT: 'SettingsSubscription-TaxExempt',
    PAYMENT_CARD_SECURITY_LINK: 'SettingsSubscription-PaymentCardSecurityLink',
} as const;

export default SUBSCRIPTION_SENTRY_LABEL;
