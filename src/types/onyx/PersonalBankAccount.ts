import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import type {HomeAddressForm, InternationalBankAccountForm, PersonalBankAccountForm} from '@src/types/form';

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

    /** Any reportID we should redirect to at the end of the flow */
    exitReportID?: string;

    /** The policyID of the workspace for which the bank account is being added */
    policyID?: string;

    /** Where the bank account addition was started, e.g., from the Invoices page or Wallet page */
    source?: string;

    /** Last non-terminal page visited in a resumable personal bank-account setup */
    currentPage?: string;

    /** Whether the saved page was opened from the confirmation page for editing */
    currentPageAction?: 'edit';

    /** Values from before the current confirmation-page edit, used to cancel an unconfirmed edit after reopening the flow */
    editDraftSnapshot?: {
        pageName: string;
        personalBankAccountDraft?: Partial<PersonalBankAccountForm> | null;
        homeAddressDraft?: Partial<HomeAddressForm> | null;
        internationalBankAccountDraft?: Partial<InternationalBankAccountForm> | null;
    };

    /** If set, continue with the KYC flow after adding a PBA. This specifies the fallback route to use. */
    onSuccessFallbackRoute?: Route;

    /** The bank account ID being updated in the personal info update flow */
    bankAccountID?: number;

    /** API error stored separately from `errors` to avoid blocking FormProvider resubmission */
    updateError?: TranslationPaths | null;

    /** Error encountered while loading Corpay fields needed to resume an international Wallet setup */
    corpayFieldsError?: TranslationPaths | null;
};

export default PersonalBankAccount;
