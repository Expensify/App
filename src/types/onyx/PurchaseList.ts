import type CONST from '@src/CONST';

import type PrivateSubscription from './PrivateSubscription';

/** Subscription type for a purchase */
type Subscription = Omit<PrivateSubscription, 'errors' | 'errorFields'>;

/** Type for a billable policy */
type BillablePolicy = {
    /** Comma separated list of emails for members in the policy */
    actorList?: string;

    /** Amount spent, by currency */
    approvedSpend?: Record<string, number>;

    /** Whether the policy is corporate */
    corporate?: boolean;

    /** Expensify card spend by currency */
    expensifyCardSpend?: Record<string, number>;

    type?: typeof CONST.POLICY.TYPE;
};

/** Message type for a purchase */
type Message = {
    accountManagerAccountID?: number;
    approvedAccountantAccountIDs?: number[];

    /** Approved spend amounts by currency */
    approvedSpend?: Record<string, number>;

    billableAmount?: number;
    billableAmountBeforeFreeTrialDiscount?: number;
    billablePolicies?: Record<string, BillablePolicy>;
    billingType?: string;

    /** Whether sales tax was charged on this purchase */
    salesTaxCharged?: boolean;

    /** Whether the account is exempt from sales tax */
    salesTaxExempt?: boolean;

    /** Whether the account is on the 2025 team pricing (members vs active users) */
    isTeam2025Pricing?: boolean;

    /** ID of the receipt attached to this purchase, used to view the billing receipt */
    receiptID?: number;

    /** For a refund row: the ID of the purchase being refunded */
    refundPurchaseID?: number;

    /** Whether a refund row is a partial refund */
    isPartialRefund?: boolean;

    /** For a dispute row: the ID of the purchase being disputed */
    disputePurchaseID?: number;

    /** The dispute state for a dispute row */
    disputeStatus?: string;

    /** For a clear row: the ID of the failed purchase being cleared */
    failedPurchaseID?: number;

    /** Email the balance was transferred from, for a balance-transfer row */
    takenOverFrom?: string;

    /** Email the balance was transferred to, for a balance-transfer row */
    transferTo?: string;
    cardSpendSurchargePercent?: number;
    cashBackAmount?: number;
    cashBackPercentage?: number;
    chatOnlyActorList?: string;

    /** Actor count for Corporate policy type */
    corporateActorCount?: number;

    /** Amount charged for Corporate policy type */
    corporateRevenue?: number;

    expensifyCardMonthlySpend?: number;

    /** Expensify Card spend by currency */
    expensifyCardSpend?: Record<string, number>;

    freeTrialDays?: number;
    freeTrialDiscountAmount?: number;
    freeTrialDiscountPercentage?: number;
    freebieCreditsUsed?: number;
    guideAccountID?: number;
    isApprovedAccountant?: boolean;
    isApprovedAccountantClient?: boolean;
    paidActorCount?: number;
    partnerManagerAccountID?: number;
    perPolicyTotalMembersCount?: Record<string, number>;
    potentialCashBackAmount?: number;
    potentialCashBackPercentage?: number;
    subscription?: Subscription;

    /** Actor count for Team policy type */
    teamActorCount?: number;

    /** Amount charged for Team policy type */
    teamRevenue?: number;

    totalActorCount?: number;
    totalFreebieCredits?: number;
    totalPlatformSpend?: number;
    totalRevenue?: number;
    totalUniqueMembersCount?: number;
    wasDomainBillingUsed?: boolean;
    yearlyOverageSurcharge?: number;
    yearlySubscriptionOverageCost?: number;
    yearlySubscriptionSurcharge?: number;
    yearlySubscriptionUserCountCost?: number;
};

/** Purchase type */
type Purchase = {
    amount: number;

    /** Creation date of the purchase */
    created: string;

    currency: string;

    /** Message containing purchase details */
    message: Message;

    purchaseID: number;
};

/** Array of purchases */
type PurchaseList = Purchase[];

export default PurchaseList;

export type {Purchase};
