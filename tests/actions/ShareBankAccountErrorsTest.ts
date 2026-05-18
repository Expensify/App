import Onyx from 'react-native-onyx';
import {clearShareBankAccountErrors} from '@libs/actions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('clearShareBankAccountErrors', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('should clear SHARE_BANK_ACCOUNT errors when called without bankAccountID', async () => {
        await Onyx.merge(ONYXKEYS.SHARE_BANK_ACCOUNT, {
            errors: {[Date.now()]: 'Some error'},
        });
        await waitForBatchedUpdates();

        clearShareBankAccountErrors();
        await waitForBatchedUpdates();

        const value = await getOnyxValue(ONYXKEYS.SHARE_BANK_ACCOUNT);
        expect(value?.errors).toBeUndefined();
    });

    it('should clear both SHARE_BANK_ACCOUNT and BANK_ACCOUNT_LIST errors when called with bankAccountID', async () => {
        const bankAccountID = 9053260;
        await Onyx.merge(ONYXKEYS.SHARE_BANK_ACCOUNT, {
            errors: {[Date.now()]: 'Some error'},
        });
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [bankAccountID]: {
                errors: {[Date.now()]: 'Auth ShareBankAccount returned an error'},
            },
        });
        await waitForBatchedUpdates();

        clearShareBankAccountErrors(bankAccountID);
        await waitForBatchedUpdates();

        const shareBankAccountValue = await getOnyxValue(ONYXKEYS.SHARE_BANK_ACCOUNT);
        expect(shareBankAccountValue?.errors).toBeUndefined();

        const bankAccountListValue = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
        expect(bankAccountListValue?.[bankAccountID]?.errors).toBeUndefined();
    });

    it('should not modify BANK_ACCOUNT_LIST when called without bankAccountID', async () => {
        const bankAccountID = 9053261;
        const existingErrors = {[Date.now()]: 'Auth ShareBankAccount returned an error'};
        await Onyx.merge(ONYXKEYS.SHARE_BANK_ACCOUNT, {
            errors: {[Date.now()]: 'Some error'},
        });
        await Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {
            [bankAccountID]: {errors: existingErrors},
        });
        await waitForBatchedUpdates();

        clearShareBankAccountErrors();
        await waitForBatchedUpdates();

        const value = await getOnyxValue(ONYXKEYS.BANK_ACCOUNT_LIST);
        expect(value?.[bankAccountID]?.errors).toEqual(existingErrors);
    });
});
