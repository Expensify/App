import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {doesPolicyHavePartiallySetupBankAccount} from '@libs/BankAccountUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, ReimbursementAccount} from '@src/types/onyx';
import useOnyx from './useOnyx';

const reimbursementAccountAchStateSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.achData?.state;

const policyAchStateSelector = (policy: OnyxEntry<Policy>) => policy?.achAccount?.state;

function useShouldBlockCurrencyChange(policyID: string | undefined): boolean {
    const [policyAchState] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyAchStateSelector});
    const [reimbursementAccountAchState] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: reimbursementAccountAchStateSelector});
    const bankAccountListSelector = useCallback(
        (bankAccountList: OnyxEntry<BankAccountList>) => !!policyID && doesPolicyHavePartiallySetupBankAccount(bankAccountList, policyID),
        [policyID],
    );
    const [hasPartiallySetupBankAccount = false] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: bankAccountListSelector,
    });

    const achState = policyAchState ?? reimbursementAccountAchState;
    const hasVBA = achState === CONST.BANK_ACCOUNT.STATE.OPEN;

    return hasVBA || hasPartiallySetupBankAccount;
}

export default useShouldBlockCurrencyChange;
