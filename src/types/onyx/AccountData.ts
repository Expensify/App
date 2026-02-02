import type {BankAccountAdditionalData} from './BankAccount';
import type * as OnyxCommon from './OnyxCommon';

/** Model of bank account data */
type AccountData = {
    /** The masked bank account number */
    accountNumber?: string;

    /** The name of the institution (bank of america, etc */
    addressName?: string;

    /** Can we use this account to pay other people? */
    allowDebit?: boolean;

    /** Can we use this account to receive money from other people? */
    defaultCredit?: boolean;

    /** Is a saving account */
    isSavings?: boolean;

    /** Return whether or not this bank account has been risk checked */
    riskChecked?: boolean;

    /** Account routing number */
    routingNumber?: string;

    /** The status of the bank account */
    state?: string;

    /** All user emails that have access to this bank account */
    sharees?: string[];

    /** Institution that processes the account payments */
    processor?: string;

    /** The bankAccountID in the bankAccounts db */
    bankAccountID?: number;

    /** Unique identifier for this account in Plaid */
    plaidAccountID?: string;

    /** All data related to the bank account */
    additionalData?: BankAccountAdditionalData;

    /** The bank account type */
    type?: string;

    /** Any error message to show */
    errors?: OnyxCommon.Errors;

    /** The debit card ID */
    fundID?: number;

    /** List of policies this account is linked to */
    policyIDs?: string[];
};

export default AccountData;
