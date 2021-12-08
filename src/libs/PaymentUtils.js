import _ from 'underscore';
import CONST from '../CONST';
import ROUTES from '../ROUTES';
import * as Localize from './Localize';
import Navigation from './Navigation/Navigation';

/**
 * PaymentMethod Type
 * @typedef {Object} PaymentMethod
 * @property {String} title
 * @property {String} description
 * @property {String} key
 * @property {String} id
 * @property {String} type
 * @property {Number} [number] Bank or Card number
 * @property {String} [bankName] Bank Name
*/

/**
 * Get the PaymentMethods list
 * @param {Array} bankAccountList
 * @param {Array} cardList
 * @param {String} [payPalMeUsername]
 * @returns {Array<PaymentMethod>}
 */
function getPaymentMethodsList(bankAccountList, cardList, payPalMeUsername) {
    const combinedPaymentMethods = [];

    _.each(bankAccountList, (bankAccount) => {
        // Add all bank accounts besides the wallet
        if (bankAccount.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
            return;
        }

        const formattedBankAccountNumber = bankAccount.accountNumber
            ? `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${bankAccount.accountNumber.slice(-4)
            }`
            : null;
        combinedPaymentMethods.push({
            title: bankAccount.addressName,
            bankName: bankAccount.additionalData.bankName,
            number: bankAccount.accountNumber,
            id: bankAccount.bankAccountID,
            description: formattedBankAccountNumber,
            key: `bankAccount-${bankAccount.bankAccountID}`,
            type: CONST.WALLET.PAYMENT_METHOD_TYPE.BANK,
        });
    });

    _.each(cardList, (card) => {
        // Add all cards besides the "cash" card
        const formattedCardNumber = card.cardNumber
            ? `${Localize.translateLocal('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`
            : null;
        combinedPaymentMethods.push({
            title: card.addressName,
            bankName: card.bank,
            number: card.cardNumber,
            id: card.fundID,
            description: formattedCardNumber,
            key: `card-${card.fundID}`,
            type: CONST.WALLET.PAYMENT_METHOD_TYPE.CARD,
        });
    });

    if (payPalMeUsername) {
        combinedPaymentMethods.push({
            title: 'PayPal.me',
            description: payPalMeUsername,
            key: 'payPalMePaymentMethod',
            id: 'payPalMe',
            type: CONST.WALLET.PAYMENT_METHOD_TYPE.PAYPAL,
        });
    }

    return combinedPaymentMethods;
}

/**
 * Navigate to the appropriate payment type addition screen
 *
 * @param {String} paymentType
 */
function addPaymentMethodType(paymentType) {
    if (paymentType === CONST.PAYMENT_METHOD_TYPE.PAYPAL) {
        Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
    }

    if (paymentType === CONST.PAYMENT_METHOD_TYPE.CARD) {
        Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
    }
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getPaymentMethodsList,
    addPaymentMethodType,
};
