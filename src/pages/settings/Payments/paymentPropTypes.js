import PropTypes from 'prop-types';
import CONST from '../../../CONST';

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
    /** Selected accountID for transfer */
    selectedAccountID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /** Type to filter the payment Method list */
    filterPaymentMethodType: PropTypes.oneOf([CONST.PAYMENT_METHODS.DEBIT_CARD, CONST.PAYMENT_METHODS.BANK_ACCOUNT, '']),

    /** Whether the user has intiatied the tranfer and transfer request is submitted to backend. */
    completed: PropTypes.bool,
});

export {
    bankAccountListPropTypes,
    cardListPropTypes,
    walletTransferPropTypes,
};
