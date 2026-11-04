import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {getLastFourDigits, isWiseOnboardingMoreInfoNeeded} from '@libs/BankAccountUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/**
 * Finds the bank accounts Wise asked for more info on, for the Home time-sensitive section.
 */
type WiseMoreInfoNeededBankAccount = {
    bankAccountID: number;

    /** Empty when the account number is not loaded */
    bankAccountLastFour: string;
};

/** The selector keeps only the IDs and last four digits, so Home doesn't rerender when unrelated bank account data changes */
const wiseMoreInfoNeededBankAccountsSelector = (bankAccountList: OnyxEntry<BankAccountList>): WiseMoreInfoNeededBankAccount[] => {
    const bankAccounts: WiseMoreInfoNeededBankAccount[] = [];
    for (const bankAccount of Object.values(bankAccountList ?? {})) {
        const bankAccountID = bankAccount?.accountData?.bankAccountID;
        if (!bankAccountID || !isWiseOnboardingMoreInfoNeeded(bankAccount)) {
            continue;
        }
        bankAccounts.push({
            bankAccountID,
            bankAccountLastFour: getLastFourDigits(bankAccount.accountData?.accountNumber ?? ''),
        });
    }
    return bankAccounts;
};

/** Bank accounts whose global reimbursements onboarding is waiting on more info Wise asked for */
function useTimeSensitiveWiseMoreInfoNeeded() {
    const {isBetaEnabled} = usePermissions();
    const [wiseMoreInfoNeededBankAccounts = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: wiseMoreInfoNeededBankAccountsSelector});

    return {
        wiseMoreInfoNeededBankAccounts: isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS) ? wiseMoreInfoNeededBankAccounts : CONST.EMPTY_ARRAY,
    };
}

export default useTimeSensitiveWiseMoreInfoNeeded;
export {wiseMoreInfoNeededBankAccountsSelector};
