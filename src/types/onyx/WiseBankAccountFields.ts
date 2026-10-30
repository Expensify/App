import type {DynamicFormSchema} from './DynamicFormField';
import type {Errors} from './OnyxCommon';

/** One way Wise can pay the account, with the form its details need */
type WisePayoutType = {
    /** Wise's recipient account type, such as sort_code, aba or swift_code. Wise publishes no closed list */
    type: string;

    /** Wise's name for the rail in the account's locale, such as "Local bank account" or "UPI" */
    title: string;

    /** The form's pages as the server groups them */
    schema: DynamicFormSchema;
};

/**
 * The employee bank-account form for one country and currency, as Wise defines it. The server translates Wise's account
 * requirements into DynamicForm pages, replaces the key whenever the employee changes a field marked refreshOnChange, and never stores it.
 */
type WiseBankAccountFields = {
    /** ISO 3166-1 alpha-2 code of the country the account is held in */
    country?: string;

    /** ISO 4217 code of the account's currency */
    currency?: string;

    /** The payout type the form starts on, the first Wise lists */
    defaultPayoutType?: string;

    /** The rails the employee may use, each with its own form. SWIFT appears alone and only when no local rail reaches the account */
    payoutTypes?: WisePayoutType[];

    isLoading?: boolean;

    /** Errors from the last fetch */
    errors?: Errors;
};

export default WiseBankAccountFields;
export type {WisePayoutType};
