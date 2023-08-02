import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import BankAccount from '../../models/BankAccount';

let bankAccountList = null;
Onyx.connect({
    key: ONYXKEYS.BANK_ACCOUNT_LIST,
    callback: (val) => {
        bankAccountList = val;
    },
});

let credentials;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val || {};
    },
});

function getBankAccountList() {
    return bankAccountList;
}

function hasCreditBankAccount() {
    return _.some(bankAccountList, (bankAccountJSON) => {
        const bankAccount = new BankAccount(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });
}

function getCredentials() {
    return credentials;
}

export {getBankAccountList, getCredentials, hasCreditBankAccount};
