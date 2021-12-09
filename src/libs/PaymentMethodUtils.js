import _ from 'underscore';
import BankAccount from './models/BankAccount';

/**
 * Check to see if user has either a debit card or personal bank account added
 *
 * @param {Array} [cardList]
 * @param {Array} [bankAccountList]
 * @returns {Boolean}
 */
function hasExpensifyPaymentMethod(cardList = [], bankAccountList = []) {
    return _.some(cardList, card => card) || _.some(bankAccountList, (bankAccountJSON) => {
        const bankAccount = new BankAccount(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    hasExpensifyPaymentMethod,
};
