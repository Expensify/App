import type * as OnyxCommon from './OnyxCommon';

/** Model of Expensify card settings for a workspace */
type ExpensifyCardSettings = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Sum of all posted Expensify Card transactions */
    currentBalance?: number;

    /** Remaining limit for Expensify Cards on the workspace */
    remainingLimit?: number;

    /** The total amount of cash back earned thus far */
    earnedCashback?: number;

    /** The date of the last settlement */
    monthlySettlementDate: Date;

    /** Whether monthly option should appear in the settlement frequency settings */
    isMonthlySettlementAllowed: boolean;

    /** The bank account chosen for the card settlement */
    paymentBankAccountID: number;

    /** Whether we are loading the data via the API */
    isLoading?: boolean;
}>;

export default ExpensifyCardSettings;
