import type {Errors} from './OnyxCommon';

/** Stores information for InitiateBankAccountUnlock API call */
type InitiatingBankAccountUnlock = {
    bankAccountIDToUnlock: number;

    /** Is request successful */
    isSuccess: boolean;

    /** Is request being processed */
    isLoading: boolean;

    errors: Errors;

    /** ID of the optimistic Concierge report action to clean up after API success */
    optimisticReportActionID?: string | null;
};

export default InitiatingBankAccountUnlock;
