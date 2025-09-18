import type {OnyxEntry} from 'react-native-onyx';
import BankAccount from '@libs/models/BankAccount';
import type * as OnyxTypes from '@src/types/onyx';

function hasCreditBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    if (!bankAccountList) {
        return false;
    }

    return Object.values(bankAccountList).some((bankAccountJSON) => {
        const bankAccount = new BankAccount(bankAccountJSON);
        return bankAccount.isDefaultCredit();
    });
}

export default {hasCreditBankAccount};
export {hasCreditBankAccount};
