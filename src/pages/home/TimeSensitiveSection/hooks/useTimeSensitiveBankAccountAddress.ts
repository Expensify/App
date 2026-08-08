import useOnyx from '@hooks/useOnyx';

import {isBankAccountMissingAddressState} from '@libs/BankAccountUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Policy} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import {primaryLoginSelector} from '@selectors/Account';

type BankAccountMissingAddress = {
    /** Stable key used to render this account widget */
    key: string;

    /** The ID of the bank account missing an address */
    bankAccountID: number;

    /** Whether this is a personal deposit account (vs workspace VBA) */
    isPersonalAccount: boolean;

    /** Policy ID for workspace VBAs — undefined for personal accounts */
    policyID?: string;

    /** The policy name — undefined means personal account */
    policyName?: string;
};

function useTimeSensitiveBankAccountAddress(adminPolicies: Policy[] | undefined) {
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const bankAccountsMissingAddress: BankAccountMissingAddress[] = [];
    const workspaceBankAccountIDs = new Set<number>();

    for (const policy of adminPolicies ?? []) {
        const achAccount = policy.achAccount;
        if (!achAccount?.bankAccountID || achAccount.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
            continue;
        }

        const isCurrentUserReimburser = !!primaryLogin && achAccount.reimburser === primaryLogin;
        if (!isCurrentUserReimburser) {
            continue;
        }

        const bankAccount = bankAccountList?.[String(achAccount.bankAccountID)];
        if (!isBankAccountMissingAddressState(bankAccount?.accountData)) {
            continue;
        }

        workspaceBankAccountIDs.add(achAccount.bankAccountID);
        bankAccountsMissingAddress.push({
            key: `workspace-${policy.id}-${achAccount.bankAccountID}`,
            bankAccountID: achAccount.bankAccountID,
            isPersonalAccount: false,
            policyID: policy.id,
            policyName: policy.name,
        });
    }

    for (const account of Object.values(bankAccountList ?? {})) {
        const accountData = account?.accountData;
        const {bankAccountID, type} = accountData ?? {};
        const isPersonalAccount = type === undefined || type === CONST.BANK_ACCOUNT.TYPE.PERSONAL;

        if (!bankAccountID || !isPersonalAccount || workspaceBankAccountIDs.has(bankAccountID)) {
            continue;
        }

        if (!isBankAccountMissingAddressState(accountData)) {
            continue;
        }

        bankAccountsMissingAddress.push({
            key: `personal-${bankAccountID}`,
            bankAccountID,
            isPersonalAccount: true,
        });
    }

    return {
        bankAccountsMissingAddress,
    };
}

export default useTimeSensitiveBankAccountAddress;
export type {BankAccountMissingAddress};
