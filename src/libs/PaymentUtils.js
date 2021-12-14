import _ from 'underscore';
import * as Expensicons from '../components/Icon/Expensicons';
import getBankIcon from '../components/Icon/BankIcons';
import CONST from '../CONST';
import * as Localize from './Localize';

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
 * @param {String} [payPalMeUsername='']
 * @returns {Array<PaymentMethod>}
 */
function getPaymentMethods(bankAccountList, cardList, payPalMeUsername = '') {
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
            type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
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
            type: CONST.PAYMENT_METHODS.DEBIT_CARD,
        });
    });

    if (!_.isEmpty(payPalMeUsername)) {
        combinedPaymentMethods.push({
            title: 'PayPal.me',
            description: payPalMeUsername,
            key: 'payPalMePaymentMethod',
            id: 'payPalMe',
            type: CONST.PAYMENT_METHODS.PAYPAL,
        });
    }

    return combinedPaymentMethods;
}

/**
 * Get the Icon for PaymentMethod and its properties
 * @param {PaymentMethod} paymentMethod
 * @typedef {Object} IconProperties
 * @property {?} IconProperties.icon
 * @property {Number} [IconProperties.iconSize]
 * @returns {IconProperties}
 */
function getPaymentMethodIconProperties(paymentMethod) {
    switch (paymentMethod.type) {
        case CONST.PAYMENT_METHODS.BANK_ACCOUNT:
            return getBankIcon(paymentMethod.bankName);
        case CONST.PAYMENT_METHODS.DEBIT_CARD:
            return getBankIcon(paymentMethod.bankName, true);
        case CONST.PAYMENT_METHODS.PAYPAL:
            return {icon: Expensicons.PayPal};
        default: break;
    }
}

export default {
    getPaymentMethods,
    getPaymentMethodIconProperties,
};
