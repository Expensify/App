import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as DeprecatedAPI from '../deprecatedAPI';
import Growl from '../Growl';
import * as Localize from '../Localize';

/**
 * List of bank accounts. This data should not be stored in Onyx since it contains unmasked PANs.
 *
 * @private
 */
let plaidBankAccounts = [];
let bankName = '';
let plaidAccessToken = '';

/**
 * We clear these out of storage once we are done with them so the user must re-enter Plaid credentials upon returning.
 */
function clearPlaidBankAccountsAndToken() {
    plaidBankAccounts = [];
    bankName = '';
    Onyx.set(ONYXKEYS.PLAID_BANK_ACCOUNTS, {});
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, null);
}

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 */
function fetchPlaidLinkToken() {
    DeprecatedAPI.Plaid_GetLinkToken()
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.PLAID_LINK_TOKEN, response.linkToken);
        });
}

/**
 * @param {String} publicToken
 * @param {String} bank
 */
function fetchPlaidBankAccounts(publicToken, bank) {
    bankName = bank;

    Onyx.merge(ONYXKEYS.PLAID_BANK_ACCOUNTS, {loading: true});
    DeprecatedAPI.BankAccount_Get({
        publicToken,
        allowDebit: false,
        bank,
    })
        .then((response) => {
            if (response.jsonCode === 666 && response.title === CONST.BANK_ACCOUNT.PLAID.ERROR.TOO_MANY_ATTEMPTS) {
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isPlaidDisabled: true});
            }

            plaidAccessToken = response.plaidAccessToken;

            // Filter out any accounts that already exist since they cannot be used again.
            plaidBankAccounts = _.filter(response.accounts, account => !account.alreadyExists);

            if (plaidBankAccounts.length === 0) {
                Growl.error(Localize.translateLocal('bankAccount.error.noBankAccountAvailable'));
            }

            Onyx.merge(ONYXKEYS.PLAID_BANK_ACCOUNTS, {
                error: {
                    title: response.title,
                    message: response.message,
                },
                loading: false,
                accounts: _.map(plaidBankAccounts, account => ({
                    ...account,
                    accountNumber: Str.maskPAN(account.accountNumber),
                })),
                bankName,
            });
        });
}

/**
 * @returns {String}
 */
function getPlaidAccessToken() {
    return plaidAccessToken;
}

/**
 * @returns {Array}
 */
function getPlaidBankAccounts() {
    return plaidBankAccounts;
}

/**
 * @returns {String}
 */
function getBankName() {
    return bankName;
}

export {
    clearPlaidBankAccountsAndToken,
    fetchPlaidBankAccounts,
    fetchPlaidLinkToken,
    getPlaidAccessToken,
    getPlaidBankAccounts,
    getBankName,
};
