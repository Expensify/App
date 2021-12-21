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
            ? `${Localize.translate('paymentMethodList.accountLastFour')} ${bankAccount.accountNumber.slice(-4)
            }`
            : null;
        const {icon, iconSize} = getBankIcon(lodashGet(bankAccount, 'additionalData.bankName', ''));
        combinedPaymentMethods.push({
            type: CONST.PAYMENT_METHODS.BANK_ACCOUNT,
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
            ? `${this.props.translate('paymentMethodList.cardLastFour')} ${card.cardNumber.slice(-4)}`
            : null;
        const {icon, iconSize} = getBankIcon(card.bank, true);
        combinedPaymentMethods.push({
            type: CONST.PAYMENT_METHODS.DEBIT_CARD,
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
            type: CONST.PAYMENT_METHODS.PAYPAL,
            title: 'PayPal.me',
            methodID: CONST.PAYMENT_METHODS.PAYPAL,
            description: this.props.payPalMeUsername,
            icon: Expensicons.PayPal,
            key: 'payPalMePaymentMethod',
        });
    }

    // If we have not added any payment methods, show a default empty state
    if (_.isEmpty(combinedPaymentMethods)) {
        combinedPaymentMethods.push({
            text: this.props.translate('paymentMethodList.addFirstPaymentMethod'),
        });
    }

    return combinedPaymentMethods;
}

export default {
    getPaymentMethods,
};
