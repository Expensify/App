import type {OnyxEntry} from 'react-native-onyx';
import {doesPolicyHavePartiallySetupBankAccount} from '@libs/BankAccountUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import useOnyx from './useOnyx';

const hasVBASelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN;

function useShouldBlockCurrencyChange(policyID: string | undefined): boolean {
    const [hasVBA = false] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: hasVBASelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const hasPartiallySetupBankAccount = !!policyID && doesPolicyHavePartiallySetupBankAccount(bankAccountList, policyID);

    return hasVBA || hasPartiallySetupBankAccount;
}

export default useShouldBlockCurrencyChange;
