import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** General errors */
    error: PropTypes.string,

    /** Field specific errors */
    errorFields: PropTypes.shape({
        /** Plaid selector and password fields */
        plaidSelector: PropTypes.shape({
            /** Key: timestamp - Value: Error message */
        }),
    }),

    pendingFields: PropTypes.shape({
        /** Data we need for the API command "AddPersonalBankAccount" */
        selectedBankAccount: PropTypes.shape({
            /** Account Number */
            accountNumber: PropTypes.string,

            /** Nickname of bank account */
            addressName: PropTypes.string,

            /** Bank name given by Plaid */
            bank: PropTypes.string,

            /** This payment method has not been added, and is pending with and error */
            isPending: PropTypes.bool,

            /** Is Savings account */
            isSavings: PropTypes.bool,

            /** Password */
            password: PropTypes.string,

            /** Plaid token */
            plaidAccessToken: PropTypes.string,

            /** Plaid bank account ID */
            plaidAccountID: PropTypes.string,

            /** Routing number */
            routingNumber: PropTypes.string,

            /** Tells us if this is set up via Plaid or manually */
            setupType: PropTypes.string,
        }),
    }),

    /** Personal Bank Account successfully added. Show user success modal */
    shouldShowSuccess: PropTypes.bool,

    /** Show loader if still awaiting response */
    isLoading: PropTypes.bool,
});
