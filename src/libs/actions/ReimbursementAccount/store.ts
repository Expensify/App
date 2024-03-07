import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import BankAccount from '@libs/models/BankAccount';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

let bankAccountList: OnyxEntry<OnyxTypes.BankAccountList> = null;
Onyx.connect({
    key: ONYXKEYS.BANK_ACCOUNT_LIST,
    callback: (val) => {
        bankAccountList = val;
    },
});

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

export {getBankAccountList, hasCreditBankAccount};
