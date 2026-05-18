import type {MemberForList} from '@libs/OptionsListUtils';
import type * as OnyxCommon from './OnyxCommon';

/** Model of share bank account */
type ShareBankAccount = {
    /** An error message to display to the user */
    errors?: OnyxCommon.Errors;

    /** Error objects keyed by field name containing errors keyed by microtime */
    errorFields?: OnyxCommon.ErrorFields;

    /** Whether we should show the view that the bank account was successfully shared */
    shouldShowSuccess?: boolean;

    /** Whether the form is loading */
    isLoading?: boolean;

    /** The list of admins */
    admins?: MemberForList[] | null;
};

export default ShareBankAccount;
