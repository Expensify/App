import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import * as store from './store';

/**
 * Deletes a bank account from bankAccountList
 *
 * @param {Number} bankAccountID
 */
function deleteFromBankAccountList(bankAccountID) {
    // We should delete the bankAccountID key from the bankAccountList object before setting it in Onyx
    const bankAccountList = store.getBankAccountList();
    delete bankAccountList[bankAccountID];

    Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, bankAccountList);
}

export default deleteFromBankAccountList;
