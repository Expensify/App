import type * as OnyxCommon from './OnyxCommon';

/** Model of an Expensify card settings */
type ExpensifyCardSettings = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Cards current balance */
    currentBalance: number;

    /** Cards remaining limit */
    remainingLimit: number;

    /** Cards cash back */
    cashBack: number;
}>;

export default ExpensifyCardSettings;
