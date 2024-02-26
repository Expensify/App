import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import BankAccount from '@libs/models/BankAccount';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';
import type {EmptyObject} from '@src/types/utils/EmptyObject';

/** Reimbursement account actively being set up */
let reimbursementAccountInSetup: ACHData | EmptyObject = {};
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => {
        reimbursementAccountInSetup = val?.achData ?? {};
    },
});

let reimbursementAccountWorkspaceID: OnyxEntry<string> = null;
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID,
    callback: (val) => {
        reimbursementAccountWorkspaceID = val;
    },
});

let bankAccountList: OnyxEntry<OnyxTypes.BankAccountList> = null;
Onyx.connect({
    key: ONYXKEYS.BANK_ACCOUNT_LIST,
    callback: (val) => {
        bankAccountList = val;
    },
});

let credentials: OnyxEntry<OnyxTypes.Credentials> = null;
Onyx.connect({
    key: ONYXKEYS.CREDENTIALS,
    callback: (val) => {
        credentials = val;
    },
});

function getReimbursementAccountInSetup() {
    return reimbursementAccountInSetup;
}

function getBankAccountList() {
    return bankAccountList;
}

function hasCreditBankAccount() {
    if (!bankAccountList) {
        return false;
    }

    Object.values(bankAccountList).some((bankAccountJSON) => {
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
