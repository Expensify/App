import type {Errors} from './OnyxCommon';

/** Stores information for InitiateBankAccountUnlock API call */
type InitiatingBankAccountUnlock = {
    /** ID of pressed bank account to unlock */
    bankAccountIDToUnlock: number;
    /** Is request successful */
    isSuccess: boolean;
    /** Is request being processed */
    isLoading: boolean;
    /** Errors */
    errors: Errors;
};

export default InitiatingBankAccountUnlock;
