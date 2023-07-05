type BankAccount = {
    /** The name of the institution (bank of america, etc */
    addressName?: string;

    /** The masked bank account number */
    accountNumber?: string;

    /** The bankAccountID in the bankAccounts db */
    bankAccountID?: number;

    /** The bank account type */
    type?: string;
};

export default BankAccount;
