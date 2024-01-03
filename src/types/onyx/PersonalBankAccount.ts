import * as OnyxCommon from './OnyxCommon';

type PersonalBankAccount = {
    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Whether we should show the view that the bank account was successfully added */
    shouldShowSuccess?: boolean;

    /** Whether the form is loading */
    isLoading?: boolean;

    /** The account ID of the selected bank account from Plaid */
    plaidAccountID?: string;

    /** Any reportID we should redirect to at the end of the flow */
    exitReportID?: string;

    /** If set, continue with the KYC flow after adding a PBA. This specifies the fallback route to use. */
    onSuccessFallbackRoute?: string;
};

export default PersonalBankAccount;
