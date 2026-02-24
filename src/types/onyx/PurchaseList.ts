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

    /** Policy type */
    type?: typeof CONST.POLICY.TYPE;
};

/** Message type for a purchase */
type Message = {
    /** Account manager account ID */
    accountManagerAccountID?: number;

    /** List of Approved Accountant account IDs */
    approvedAccountantAccountIDs?: number[];

    /** Approved spend amounts by currency */
    approvedSpend?: Record<string, number>;

    /** Billable amount */
    billableAmount?: number;

    /** Billable amount before free trial discount */
    billableAmountBeforeFreeTrialDiscount?: number;

    /** Record of billable policies with their details */
    billablePolicies?: Record<string, BillablePolicy>;

    /** Billing type */
    billingType?: string;

    /** Card spend surcharge percentage */
    cardSpendSurchargePercent?: number;

    /** Cash back amount */
    cashBackAmount?: number;

    /** Cash back percentage */
    cashBackPercentage?: number;

    /** Chat only actor list */
    chatOnlyActorList?: string;

    /** Actor count for Corporate policy type */
    corporateActorCount?: number;

    /** Amount charged for Corporate policy type */
    corporateRevenue?: number;

    /** Expensify Card monthly spend */
    expensifyCardMonthlySpend?: number;

    /** Expensify Card spend by currency */
    expensifyCardSpend?: Record<string, number>;

    /** Free trial days */
    freeTrialDays?: number;

    /** Free trial discount amount */
    freeTrialDiscountAmount?: number;

    /** Free trial discount percentage */
    freeTrialDiscountPercentage?: number;

    /** Freebie credits used */
    freebieCreditsUsed?: number;

    /** Guide account ID */
    guideAccountID?: number;

    /** Whether the user is an Approved Accountant */
    isApprovedAccountant?: boolean;

    /** Whether the user is an Approved Accountant client */
    isApprovedAccountantClient?: boolean;

    /** Paid actor count */
    paidActorCount?: number;

    /** Partner manager account ID */
    partnerManagerAccountID?: number;

    /** Per policy total members count */
    perPolicyTotalMembersCount?: Record<string, number>;

    /** Potential cash back amount */
    potentialCashBackAmount?: number;

    /** Potential cash back percentage */
    potentialCashBackPercentage?: number;

    /** Subscription details */
    subscription?: Subscription;

    /** Actor count for Team policy type */
    teamActorCount?: number;

    /** Amount charged for Team policy type */
    teamRevenue?: number;

    /** Total actor count */
    totalActorCount?: number;

    /** Total freebie credits */
    totalFreebieCredits?: number;

    /** Total platform spend */
    totalPlatformSpend?: number;

    /** Total revenue */
    totalRevenue?: number;

    /** Total unique members count */
    totalUniqueMembersCount?: number;

    /** Whether domain billing was used */
    wasDomainBillingUsed?: boolean;

    /** Yearly overage surcharge */
    yearlyOverageSurcharge?: number;

    /** Yearly subscription overage cost */
    yearlySubscriptionOverageCost?: number;

    /** Yearly subscription surcharge */
    yearlySubscriptionSurcharge?: number;

    /** Yearly subscription user count cost */
    yearlySubscriptionUserCountCost?: number;
};

/** Purchase type */
type Purchase = {
    /** Amount of the purchase */
    amount: number;

    /** Creation date of the purchase */
    created: string;

    /** Currency of the purchase */
    currency: string;

    /** Message containing purchase details */
    message: Message;

    /** ID of the purchase */
    purchaseID: number;
};

/** Array of purchases */
type PurchaseList = Purchase[];

export default PurchaseList;

export type {Purchase};
