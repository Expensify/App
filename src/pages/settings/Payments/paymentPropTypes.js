import PropTypes from 'prop-types';

/** User's wallet information */
const userWalletPropTypes = PropTypes.shape({
    /** What step in the activation flow are we on? */
    currentStep: PropTypes.string,

    /** Status of wallet - e.g. SILVER or GOLD */
    tierName: PropTypes.string,

    /** Linked Bank account to the user wallet */
    // eslint-disable-next-line react/forbid-prop-types
    linkedBankAccount: PropTypes.object,

    /** The user's current wallet balance */
    availableBalance: PropTypes.number,
});

/** Array of bank account objects */
const bankAccountListPropTypes = PropTypes.arrayOf(PropTypes.shape({
    /** The name of the institution (bank of america, etc */
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
    /** The name of the institution (bank of america, etc */
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

    /** Account selected for Transfer */
    selectedAccountID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** Whether the trasnfer is completed */
    completed: PropTypes.bool,
});

export {
    userWalletPropTypes,
    bankAccountListPropTypes,
    cardListPropTypes,
    walletTransferPropTypes,
};
