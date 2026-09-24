import useOnyx from '@hooks/useOnyx';

import BankAccountModel from '@libs/models/BankAccount';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxEntry} from 'react-native-onyx';

import {isCollectingDepositAccountsSelector} from '@selectors/Policy';

const hasDepositAccountSelector = (bankAccountList: OnyxEntry<BankAccountList>): boolean =>
    Object.values(bankAccountList ?? {}).some((bankAccountJSON) => {
        const bankAccount = new BankAccountModel(bankAccountJSON);
        return bankAccount.isOpen() && bankAccount.getType() === CONST.BANK_ACCOUNT.TYPE.PERSONAL;
    });

function useTimeSensitiveAddDepositAccount() {
    const [hasDepositAccount = false, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: hasDepositAccountSelector});
    const [isCollectingDepositAccounts = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: isCollectingDepositAccountsSelector});

    const isBankAccountListRead = !isLoadingOnyxValue(bankAccountListMetadata);

    return {shouldShowAddDepositAccount: isBankAccountListRead && !hasDepositAccount && isCollectingDepositAccounts};
}

export default useTimeSensitiveAddDepositAccount;
