import PropTypes from 'prop-types';

const propTypes = {
    /** Fired when the user exits the Plaid flow */
    onExitPlaid: PropTypes.func,

    /** Fired when the user selects an account and submits the form */
    onSubmit: PropTypes.func,

    /** Additional text to display */
    text: PropTypes.string,

    /** The OAuth URI + stateID needed to re-initialize the PlaidLink after the user logs into their bank */
    receivedRedirectURI: PropTypes.string,

    /** If the bank account being added is a business bank account */
    isBusinessBankAccount: PropTypes.bool,
};

const defaultProps = {
    plaidLinkToken: '',
    plaidBankAccounts: {
        loading: false,
    },
    onExitPlaid: () => {},
    onSubmit: () => {},
    text: '',
    receivedRedirectURI: null,
};

export {
    propTypes,
    defaultProps,
};
