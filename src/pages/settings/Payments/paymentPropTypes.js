import PropTypes from 'prop-types';

/** Array of bank account objects */
const bankAccountListPropTypes = PropTypes.arrayOf(PropTypes.shape({
    /** The name of the institution (bank of america, etc) */
    addressName: PropTypes.string,

    /** The masked bank account number */
    accountNumber: PropTypes.string,

    /** The bankAccountID in the bankAccounts db */
    bankAccountID: PropTypes.number,

    /** The bank account type */
    type: PropTypes.string,
}));

/** Array of card objects */
const cardListPropTypes = PropTypes.arrayOf(PropTypes.shape({
    /** The name of the institution (bank of america, etc) */
    cardName: PropTypes.string,

    /** The masked credit card number */
    cardNumber: PropTypes.string,

    /** The ID of the card in the cards DB */
    cardID: PropTypes.number,
}));

/** Wallet balance transfer props */
const walletTransferPropTypes = PropTypes.shape({
    /** Amount being transferred  */
    transferAmount: PropTypes.number,

    /** Account selected for transfer */
    selectedAccountID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** Whether the transfer is completed */
    completed: PropTypes.bool,
});

export {
    bankAccountListPropTypes,
    cardListPropTypes,
    walletTransferPropTypes,
};
