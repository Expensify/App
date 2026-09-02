import useOnyx from '@hooks/useOnyx';

import {openDepositAccountSetup} from '@libs/actions/BankAccounts';
import BankAccountModel from '@libs/models/BankAccount';
import {isArchivedOrPendingDeletePolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {useEffect} from 'react';

const hasReimbursementPolicySelector = (policies: OnyxCollection<Policy>): boolean =>
    Object.values(policies ?? {}).some((policy) => !!policy?.reimbursement?.enabled && !isArchivedOrPendingDeletePolicy(policy));

const hasDepositAccountSelector = (bankAccountList: OnyxEntry<BankAccountList>): boolean =>
    Object.values(bankAccountList ?? {}).some((bankAccountJSON) => {
        const bankAccount = new BankAccountModel(bankAccountJSON);
        return bankAccount.isOpen() && bankAccount.getType() !== CONST.BANK_ACCOUNT.TYPE.BUSINESS;
    });

function useTimeSensitiveAddDepositAccount() {
    const [hasDepositAccount = false, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: hasDepositAccountSelector});
    const [hasReimbursementPolicy = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: hasReimbursementPolicySelector});
    const [isLoadingDepositAccountSetup, isLoadingFlagMetadata] = useOnyx(ONYXKEYS.RAM_ONLY_IS_LOADING_DEPOSIT_ACCOUNT_SETUP);

    const isBankAccountListRead = !isLoadingOnyxValue(bankAccountListMetadata);
    const isLoadingFlagRead = !isLoadingOnyxValue(isLoadingFlagMetadata);
    const shouldLoadDepositAccountSetup = isBankAccountListRead && isLoadingFlagRead && !hasDepositAccount && isLoadingDepositAccountSetup === undefined;

    useEffect(() => {
        if (!shouldLoadDepositAccountSetup) {
            return;
        }
        openDepositAccountSetup();
    }, [shouldLoadDepositAccountSetup]);

    return {shouldShowAddDepositAccount: isBankAccountListRead && !hasDepositAccount && hasReimbursementPolicy};
}

export default useTimeSensitiveAddDepositAccount;
