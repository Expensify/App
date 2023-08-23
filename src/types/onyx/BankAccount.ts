type AdditionalData = {
    isP2PDebitCard?: boolean;
    beneficialOwners?: string[];
    currency?: string;
    bankName?: string;
    fieldsType?: string;
    country?: string;
};

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

    processor?: string;

    /** The bankAccountID in the bankAccounts db */
    bankAccountID?: number;

    /** All data related to the bank account */
    additionalData?: AdditionalData;

    /** The bank account type */
    type?: string;
};

type BankAccount = {
    /** The bank account type */
    accountType?: string;

    /** string like 'Account ending in XXXX' */
    description?: string;

    isDefault?: boolean;

    /** string like 'bankAccount-{<bankAccountID>}' where <bankAccountID> is the bankAccountID */
    key?: string;

    /** Alias for bankAccountID */
    methodID?: number;

    /** Alias for addressName */
    title?: string;

    /** All data related to the bank account */
    accountData?: AccountData;
};

export default BankAccount;
