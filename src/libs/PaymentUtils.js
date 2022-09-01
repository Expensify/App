import _ from 'underscore';
import lodashGet from 'lodash/get';
import BankAccount from './models/BankAccount';
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
 * Get the PaymentMethods list
 * @param {Array} bankAccountList
 * @param {Array} cardList
 * @param {Object} [payPalDetails = null]
 * @returns {Array<PaymentMethod>}
 */
function formatPaymentMethods(bankAccountList, cardList, payPalDetails = null) {
    const combinedPaymentMethods = [];

    _.each(bankAccountList, (bankAccount) => {
        const {icon, iconSize} = getBankIcon(lodashGet(bankAccount, 'additionalData.bankName', ''));
        combinedPaymentMethods.push({
            ...bankAccount,
            icon,
            iconSize,
            errors: bankAccount.errors,
            pendingAction: bankAccount.pendingAction,
        });
    });

    _.each(cardList, (card) => {
        const {icon, iconSize} = getBankIcon(card.bank, true);
        combinedPaymentMethods.push({
            ...card,
            icon,
            iconSize,
            errors: card.errors,
            pendingAction: card.pendingAction,
        });
    });

    if (payPalDetails) {
        combinedPaymentMethods.push({
            ...payPalDetails,
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
    formatPaymentMethods,
    calculateWalletTransferBalanceFee,
};
