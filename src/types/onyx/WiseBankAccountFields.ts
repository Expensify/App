import type {WiseField} from './WiseField';

/** The dynamic employee bank-account form for one country and currency; replaced whenever a refreshOnChange field changes */
type WiseBankAccountFields = {
    country: string;

    currency: string;

    /** Wise's payout rail for these fields, e.g. aba or swift_code */
    payoutType: string;

    fields: WiseField[];
};

export default WiseBankAccountFields;
