import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import ONYXKEYS from '../../../ONYXKEYS';
import BankAccount from '../../models/BankAccount';

/** Reimbursement account actively being set up */
let reimbursementAccountInSetup = {};
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => {
        reimbursementAccountInSetup = lodashGet(val, 'achData', {});
    },
});

let reimbursementAccountWorkspaceID = null;
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID,
    callback: (val) => {
        reimbursementAccountWorkspaceID = val;
    },
});

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

function getReimbursementAccountInSetup() {
    return reimbursementAccountInSetup;
}

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

function getReimbursementAccountWorkspaceID() {
    return reimbursementAccountWorkspaceID;
}

export {getReimbursementAccountInSetup, getBankAccountList, getCredentials, getReimbursementAccountWorkspaceID, hasCreditBankAccount};
