import type {Country} from '@src/CONST';

import type {DynamicFormField} from './DynamicFormField';

/**
 * The employee bank-account form for one country and currency, as Wise defines it. Wise's recipient API returns the fields
 * themselves, so the server translates them into DynamicFormField and the App paginates and renders them. Replaced whenever
 * the employee changes a field marked refreshOnChange, and never stored.
 */
type WiseBankAccountFields = {
    country: Country;

    /** ISO 4217 code of the account's currency */
    currency: string;

    /** Wise's recipient account type for the corridor, such as sort_code, aba or swift_code. Wise publishes no closed list */
    payoutType: string;

    /** The flat field list, in Wise's order; the App groups it into pages */
    fields: DynamicFormField[];
};

export default WiseBankAccountFields;
