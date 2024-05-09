import type {BankName} from './Bank';
import type * as OnyxCommon from './OnyxCommon';

/** Model of additional bank account data */
type AdditionalData = {
    /** Is a Peer-To-Peer debit card */
    isP2PDebitCard?: boolean;

    /** Owners that can benefit from this bank account */
    beneficialOwners?: string[];

    /** In which currency is the bank account */
    currency?: string;

    /** In which bank is the bank account */
    bankName?: BankName;

    // TODO: Confirm this
    /** Whether the bank account is local or international */
    fieldsType?: string;

    /** In which country is the bank account */
    country?: string;
};

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

    /** All data related to the bank account */
    additionalData?: AdditionalData;

    /** The bank account type */
    type?: string;

    /** Any error message to show */
    errors?: OnyxCommon.Errors;

    /** The debit card ID */
    fundID?: number;
};

export default AccountData;
