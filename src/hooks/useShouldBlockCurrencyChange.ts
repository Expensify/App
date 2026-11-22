import {canUseMismatchedCurrencyPolicyBankAccount, doesPolicyHavePartiallySetupBankAccount} from '@libs/BankAccountUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy, ReimbursementAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

const reimbursementAccountAchStateSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.achData?.state;

const policyAchStateSelector = (policy: OnyxEntry<Policy>) => policy?.achAccount?.state;

function useShouldBlockCurrencyChange(policyID: string | undefined): boolean {
    const {isBetaEnabled} = usePermissions();
    const isMismatchedReimbursementCurrencyBetaEnabled = isBetaEnabled(CONST.BETAS.MISMATCHED_REIMBURSEMENT_CURRENCY);
    const [policyAchState] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: policyAchStateSelector});
    const [canUseMismatchedCurrency = false] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        selector: (policy: OnyxEntry<Policy>) => canUseMismatchedCurrencyPolicyBankAccount(policy?.achAccount, isMismatchedReimbursementCurrencyBetaEnabled),
    });
    const [reimbursementAccountAchState] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {selector: reimbursementAccountAchStateSelector});
    const bankAccountListSelector = (bankAccountList: OnyxEntry<BankAccountList>) => !!policyID && doesPolicyHavePartiallySetupBankAccount(bankAccountList, policyID);
    const [hasPartiallySetupBankAccount = false] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {
        selector: bankAccountListSelector,
    });

    const achState = policyAchState ?? reimbursementAccountAchState;
    const hasVBA = achState === CONST.BANK_ACCOUNT.STATE.OPEN;

    return (hasVBA && !canUseMismatchedCurrency) || hasPartiallySetupBankAccount;
}

export default useShouldBlockCurrencyChange;
