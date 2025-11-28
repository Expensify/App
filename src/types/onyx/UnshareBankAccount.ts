import type * as OnyxCommon from './OnyxCommon';

/** Model of unshare bank account */
type UnshareBankAccount = {
    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Whether we should show the view that the bank account was successfully unshared */
    shouldShowSuccess?: boolean;

    /** Whether the form is loading */
    isLoading?: boolean;
};

export default UnshareBankAccount;
