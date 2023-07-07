type BankAccount = {
    /** The name of the institution (bank of america, etc */
    addressName?: string;

    /** Alias for addressName */
    title?: string;

    /** The masked bank account number */
    accountNumber?: string;

    /** The bankAccountID in the bankAccounts db */
    bankAccountID?: number;

    /** Alias for bankAccountID */
    methodID?: number;

    /** The bank account type */
    type?: string;

    isDefault?: boolean;

    /** string like 'Account ending in XXXX' */
    description?: string;

    /** string like 'bankAccount-{<bankAccountID>}' where <bankAccountID> is the bankAccountID */
    key?: string;

    /** All data related to the bank account */
    accountData?: Record<string, unknown>;
};

export default BankAccount;
