import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {TimeSensitiveAdminPolicy} from '@selectors/Policy';

import {primaryLoginSelector} from '@selectors/Account';

type PendingBankAccount = {
    /** Stable key used to render this account widget */
    key: string;

    bankAccountID: number;

    /** The workspace the account reimburses from — undefined means the account is opened from the Wallet */
    policyID?: string;

    /** The policy name — undefined means the account is opened from the Wallet */
    policyName?: string;
};

/**
 * Only the USD flow has a test transaction step. Non-USD accounts sit in PENDING while setup is still incomplete,
 * so they don't need validating. An absent currency is treated as USD, matching getBankAccountConnectionStatus.
 */
function isUSDCurrency(currency: string | undefined) {
    return !currency || currency === CONST.CURRENCY.USD;
}

/**
 * Finds the US bank accounts waiting on the user to confirm their test transactions. This includes
 * accounts shared with the user: sharing a US account gives the recipient their own PENDING copy, and confirming its
 * test transactions is how they accept the share.
 */
function useTimeSensitivePendingBankAccount(adminPolicies: TimeSensitiveAdminPolicy[] | undefined) {
    const [bankAccountList = getEmptyObject<BankAccountList>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const pendingBankAccounts: PendingBankAccount[] = [];
    const workspacePendingBankAccountIDs = new Set<number>();

    for (const policy of adminPolicies ?? []) {
        const achAccount = policy.achAccount;
        if (achAccount?.state !== CONST.BANK_ACCOUNT.STATE.PENDING || !achAccount.bankAccountID || !isUSDCurrency(policy.outputCurrency)) {
            continue;
        }

        // Co-admins also receive the workspace's achAccount, but only the reimburser can validate it
        const isCurrentUserReimburser = !!primaryLogin && achAccount.reimburser === primaryLogin;
        if (!isCurrentUserReimburser) {
            continue;
        }

        workspacePendingBankAccountIDs.add(achAccount.bankAccountID);
        pendingBankAccounts.push({
            key: `workspace-${policy.id}-${achAccount.bankAccountID}`,
            bankAccountID: achAccount.bankAccountID,
            policyID: policy.id,
            policyName: policy.name,
        });
    }

    for (const account of Object.values(bankAccountList ?? {})) {
        const {bankAccountID, state, additionalData} = account?.accountData ?? {};
        if (state !== CONST.BANK_ACCOUNT.STATE.PENDING || !bankAccountID || workspacePendingBankAccountIDs.has(bankAccountID)) {
            continue;
        }

        // `||` not `??`: bankCurrency can be an empty string, which should fall through to additionalData.
        if (!isUSDCurrency(account?.bankCurrency || additionalData?.currency)) {
            continue;
        }

        pendingBankAccounts.push({
            key: `wallet-${bankAccountID}`,
            bankAccountID,
        });
    }

    return {
        pendingBankAccounts,
    };
}

export default useTimeSensitivePendingBankAccount;
