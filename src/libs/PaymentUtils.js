import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as Expensicons from '../components/Icon/Expensicons';
import getBankIcon from '../components/Icon/BankIcons';
import CONST from '../CONST';
import * as Localize from './Localize';

/**
 * Get the PaymentMethods list
 * @param {Array} bankAccountList
 * @param {Array} cardList
 * @param {String} [payPalMeUsername='']
 * @returns {Array<Object>}
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
        const {icon, iconSize} = getBankIcon(lodashGet(bankAccount, 'additionalData.bankName', ''));
        combinedPaymentMethods.push({
            title: bankAccount.addressName,
            description: formattedBankAccountNumber,
            methodID: bankAccount.bankAccountID,
            icon,
            iconSize,
            key: `bankAccount-${bankAccount.bankAccountID}`,
        });
    });

    _.each(cardList, (card) => {
        const formattedCardNumber = card.cardNumber
            ? `${Localize.translateLocal('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`
            : null;
        const {icon, iconSize} = getBankIcon(card.bank, true);
        combinedPaymentMethods.push({
            title: card.addressName,
            description: formattedCardNumber,
            methodID: card.cardNumber,
            icon,
            iconSize,
            key: `card-${card.cardNumber}`,
        });
    });

    if (payPalMeUsername) {
        combinedPaymentMethods.push({
            title: 'PayPal.me',
            methodID: CONST.PAYMENT_METHODS.PAYPAL,
            description: payPalMeUsername,
            icon: Expensicons.PayPal,
            key: 'payPalMePaymentMethod',
        });
    }

    return combinedPaymentMethods;
}

/**
 * Get the amount that is being transferred
 * @param {Number} currentBalance
 * @returns {Number}
 */
function getWalletTransferAmount(currentBalance) {
    return currentBalance - CONST.WALLET.TRANSFER_BALANCE_FEE;
}

export default {
    getPaymentMethods,
    getWalletTransferAmount,
};
