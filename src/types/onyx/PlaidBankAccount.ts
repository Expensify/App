type PlaidBankAccount = {
    /** Masked account number */
    accountNumber: string;

    /** Name of account */
    addressName: string;

    /** Is the account a savings account? */
    isSavings: boolean;

    /** Unique identifier for this account in Plaid */
    plaidAccountID: string;

    /** Routing number for the account */
    routingNumber: string;

    /** Last 4 digits of the account number */
    mask: string;

    /** Plaid access token, used to then retrieve Assets and Balances */
    plaidAccessToken: string;
};

export default PlaidBankAccount;
