import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The name of the payment method (bank of Plaid Checking, etc) */
    title: PropTypes.string,

    /** The masked bank account number */
    description: PropTypes.string,

    /** The bankAccountID in the bankAccounts db */
    methodID: PropTypes.number,

    /** The unique key for the payment method */
    key: PropTypes.string,

    /** The type of account ( bankAccount, payPalMe etc */
    accountType: PropTypes.string,

    /** The whole data of the payment method */
    accountData: PropTypes.shape,

    /** Indicates if this is the default payment method */
    isDefault: PropTypes.bool,
});
