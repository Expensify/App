import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import BankAccount from '@libs/models/BankAccount';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

let bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>;
Onyx.connect({
    key: ONYXKEYS.BANK_ACCOUNT_LIST,
    callback: (val) => {
        bankAccountList = val;
    },
});

function getBankAccountList(): OnyxEntry<OnyxTypes.BankAccountList> {
    return bankAccountList;
}

function hasCreditBankAccount(): boolean {
    if (!bankAccountList) {
        return false;
    }

    return Object.values(bankAccountList).some((bankAccountJSON) => {
        const bankAccount = new BankAccount(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });
}

export {getBankAccountList, hasCreditBankAccount};
