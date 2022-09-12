import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The name of the institution (bank of america, etc */
    addressName: PropTypes.string,

    /** The masked bank account number */
    accountNumber: PropTypes.string,

    /** The bankAccountID in the bankAccounts db */
    bankAccountID: PropTypes.number,

    /** The bank account type */
    type: PropTypes.string,
});
