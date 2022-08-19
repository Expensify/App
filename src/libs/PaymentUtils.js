import _ from 'underscore';
import lodashGet from 'lodash/get';
import BankAccount from './models/BankAccount';
import * as Expensicons from '../components/Icon/Expensicons';
import getBankIcon from '../components/Icon/BankIcons';
import CONST from '../CONST';

/**
 * Check to see if user has either a debit card or personal bank account added
 *
 * @param {Array} [cardList]
 * @param {Array} [bankAccountList]
 * @returns {Boolean}
 */
function hasExpensifyPaymentMethod(cardList = [], bankAccountList = []) {
    const validBankAccount = _.some(bankAccountList, (bankAccountJSON) => {
        const bankAccount = new BankAccount(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });

    // Hide any billing cards that are not P2P debit cards for now because you cannot make them your default method, or delete them
    const validDebitCard = _.some(cardList, card => lodashGet(card, 'additionalData.isP2PDebitCard', false));

    return validBankAccount || validDebitCard;
}

/**
 * Get the PaymentMethod list with icons
 * @param {Array} paymentMethodList
 * @returns {Array<PaymentMethod>}
 */
function formatPaymentMethods(paymentMethodList) {
    const paymentMethods = [...paymentMethodList];
    _.each(paymentMethods, (paymentMethod, index) => {
        switch (paymentMethod.accountType) {
            case CONST.PAYMENT_METHODS.BANK_ACCOUNT: {
                const {icon, iconSize} = getBankIcon(lodashGet(paymentMethod, 'additionalData.bankName', ''));
                paymentMethods[index].icon = icon;
                paymentMethods[index].iconSize = iconSize;
                break;
            }
            case CONST.PAYMENT_METHODS.DEBIT_CARD: {
                const {icon, iconSize} = getBankIcon(paymentMethod.accountData.bank, true);
                paymentMethods[index].icon = icon;
                paymentMethods[index].iconSize = iconSize;
                break;
            }
            case CONST.PAYMENT_METHODS.PAYPAL: {
                paymentMethods[index].icon = Expensicons.PayPal;
                break;
            }
            default: {
                paymentMethods[index].icon = '';
                paymentMethods[index].iconSize = '';
                break;
            }
        }
    });
    return paymentMethods;
}

/**
 * @param {Number} currentBalance, in cents
 * @param {String} methodType
 * @returns {Number} the fee, in cents
 */
function calculateWalletTransferBalanceFee(currentBalance, methodType) {
    const transferMethodTypeFeeStructure = methodType === CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT
        ? CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.INSTANT
        : CONST.WALLET.TRANSFER_METHOD_TYPE_FEE.ACH;
    const calculateFee = Math.ceil(currentBalance * (transferMethodTypeFeeStructure.RATE / 100));
    return Math.max(calculateFee, transferMethodTypeFeeStructure.MINIMUM_FEE);
}

export {
    hasExpensifyPaymentMethod,
    formatPaymentMethods,
    calculateWalletTransferBalanceFee,
};
