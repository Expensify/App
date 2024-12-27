import type {Route} from '@src/ROUTES';
import type * as OnyxCommon from './OnyxCommon';

/** Model of personal bank account */
type PersonalBankAccount = {
    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Whether we should show the view that the bank account was successfully added */
    shouldShowSuccess?: boolean;

    /** Whether the form is loading */
    isLoading?: boolean;

    /** The account ID of the selected bank account from Plaid */
    plaidAccountID?: string;

    /** Whether the bank account being added is linked to the workspace invoices */
    isInvoiceBankAccount?: boolean;

    /** Any reportID we should redirect to at the end of the flow */
    exitReportID?: string;

    /** If set, continue with the KYC flow after adding a PBA. This specifies the fallback route to use. */
    onSuccessFallbackRoute?: Route;
};

export default PersonalBankAccount;
