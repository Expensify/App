import type {DynamicFormSchema} from './DynamicFormField';
import type {Errors} from './OnyxCommon';

/**
 * The employee bank-account form for one country and currency, as Wise defines it. The server translates Wise's account
 * requirements into DynamicForm pages, replaces the key whenever the employee changes a field marked refreshOnChange, and never stores it.
 */
type WiseBankAccountFields = {
    /** ISO 3166-1 alpha-2 code of the country the account is held in */
    country?: string;

    /** ISO 4217 code of the account's currency */
    currency?: string;

    /** Wise's recipient account type for the corridor, such as sort_code, aba or swift_code. Wise publishes no closed list */
    payoutType?: string;

    /** The form's pages as the server groups them */
    schema?: DynamicFormSchema;

    /** Whether the form is being fetched */
    isLoading?: boolean;

    /** Errors from the last fetch */
    errors?: Errors;
};

export default WiseBankAccountFields;
