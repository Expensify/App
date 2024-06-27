import type * as OnyxCommon from './OnyxCommon';

// TODO: specify correct type when API is updated
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
