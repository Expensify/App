import _ from 'underscore';
import lodashGet from 'lodash/get';
import BankAccount from './models/BankAccount';
import * as Expensicons from '../components/Icon/Expensicons';
import getBankIcon from '../components/Icon/BankIcons';
import CONST from '../CONST';
import * as Localize from './Localize';

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
    const validDebitCard = _.some(cardList, card => lodashGet(card, 'accountData.additionalData.isP2PDebitCard', false));

    return validBankAccount || validDebitCard;
}

/**
 * @param {String} [accountType] - one of {'bankAccount', 'debitCard', 'payPalMe'}
 * @param {Object} account
 * @returns {String}
 */
function getPaymentMethodDescription(accountType, account) {
    if (accountType === CONST.PAYMENT_METHODS.PAYPAL) {
        return account.username;
    }
    if (accountType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
        return `${Localize.translateLocal('paymentMethodList.accountLastFour')} ${account.accountNumber.slice(-4)}`;
    }
    if (accountType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
        return `${Localize.translateLocal('paymentMethodList.cardLastFour')} ${account.cardNumber.slice(-4)}`;
    }
    return '';
}

/**
 * Get the PaymentMethods list
 * @param {Array} bankAccountList
 * @param {Array} cardList
 * @param {Object} [payPalMeData = null]
 * @returns {Array<PaymentMethod>}
 */
function formatPaymentMethods(bankAccountList, cardList, payPalMeData = null) {
    const combinedPaymentMethods = [];

    _.each(bankAccountList, (bankAccount) => {
        // Add all bank accounts besides the wallet
        if (bankAccount.type === CONST.BANK_ACCOUNT_TYPES.WALLET) {
            return;
        }

        const {icon, iconSize} = getBankIcon(lodashGet(bankAccount, 'accountData.additionalData.bankName', ''));
        combinedPaymentMethods.push({
            ...bankAccount,
            description: getPaymentMethodDescription(bankAccount.accountType, bankAccount.accountData),
            icon,
            iconSize,
            errors: bankAccount.errors,
            pendingAction: bankAccount.pendingAction,
        });
    });

    _.each(cardList, (card) => {
        const {icon, iconSize} = getBankIcon(lodashGet(card, 'accountData.bank', ''), true);
        combinedPaymentMethods.push({
            ...card,
            description: getPaymentMethodDescription(card.accountType, card.accountData),
            icon,
            iconSize,
            errors: card.errors,
            pendingAction: card.pendingAction,
        });
    });

    if (!_.isEmpty(payPalMeData)) {
        combinedPaymentMethods.push({
            ...payPalMeData,
            description: getPaymentMethodDescription(payPalMeData.accountType, payPalMeData.accountData),
            icon: Expensicons.PayPal,
        });
    }

    return combinedPaymentMethods;
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
    getPaymentMethodDescription,
    formatPaymentMethods,
    calculateWalletTransferBalanceFee,
};
