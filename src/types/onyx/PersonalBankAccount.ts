type PersonalBankAccount = {
    /** An error message to display to the user */
    error?: string;

    /** Whether we should show the view that the bank account was successfully added */
    shouldShowSuccess?: boolean;

    /** Whether the form is loading */
    isLoading?: boolean;

    /** The account ID of the selected bank account from Plaid */
    plaidAccountID?: string;
};

export default PersonalBankAccount;
