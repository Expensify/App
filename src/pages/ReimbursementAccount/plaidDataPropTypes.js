import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Whether we are fetching the bank accounts from the API */
    isLoading: PropTypes.bool,

    /** Error message */
    error: PropTypes.string,

    /** Whether we should prevent the user from connecting with Plaid */
    isPlaidDisabled: PropTypes.bool,

    /** List of plaid bank accounts */
    bankAccounts: PropTypes.arrayOf(PropTypes.shape({
        /** Masked account number */
        accountNumber: PropTypes.string,

        /** Name of account */
        addressName: PropTypes.string,

        /** Is the account a savings account? */
        isSavings: PropTypes.bool,

        /** Unique identifier for this account in Plaid */
        plaidAccountID: PropTypes.string,

        /** Routing number for the account */
        routingNumber: PropTypes.string,

        /** last 4 digits of the account number */
        mask: PropTypes.string,

        /** Plaid access token, used to then retrieve Assets and Balances */
        plaidAccessToken: PropTypes.string,
    })),
});
