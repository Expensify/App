import type * as OnyxCommon from './OnyxCommon';

/** Model of Expensify card settings for a workspace */
type ExpensifyCardSettings = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Sum of all posted Expensify Card transactions */
    currentBalance: number;

    /** Remaining limit for Expensify Cards on the workspace */
    remainingLimit: number;

    /** The total amount of cash back earned thus far */
    cashBack: number;
}>;

export default ExpensifyCardSettings;
