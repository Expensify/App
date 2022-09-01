import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The name of the institution (bank of america, etc */
    title: PropTypes.string,

    /** The masked bank account number */
    description: PropTypes.string,

    /** The bankAccountID in the bankAccounts db */
    methodID: PropTypes.number,

    /** The bank account type */
    accountType: PropTypes.string,
});
