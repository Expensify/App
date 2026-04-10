import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';

type ReimbursementAccountStepToOpen = ValueOf<typeof REIMBURSEMENT_ACCOUNT_ROUTE_NAMES> | '';

const REIMBURSEMENT_ACCOUNT_ROUTE_NAMES = {
    COMPANY: 'company',
    PERSONAL_INFORMATION: 'personal-information',
    BENEFICIAL_OWNERS: 'beneficial-owners',
    CONTRACT: 'contract',
    VALIDATE: 'validate',
    ENABLE: 'enable',
    NEW: 'new',
} as const;

/**
 * Returns true if a VBBA exists in any state other than OPEN or LOCKED
 */
const hasInProgressUSDVBBA = (achData?: ACHDataReimbursementAccount): boolean => {
    return !!achData?.bankAccountID && !!achData?.state && achData?.state !== CONST.BANK_ACCOUNT.STATE.OPEN && achData?.state !== CONST.BANK_ACCOUNT.STATE.LOCKED;
};

/** Returns true if user passed first step of flow for non USD VBBA */
const hasInProgressNonUSDVBBA = (achData?: ACHDataReimbursementAccount): boolean => {
    return !!achData?.bankAccountID && !!achData?.created;
};

/**
 * Returns achData.bankAccountID coerced to a number, defaulting to 0 when missing so VBBA API calls avoid NaN from undefined.
 */
function getBankAccountIDAsNumber(achData?: ACHDataReimbursementAccount): number {
    return Number(achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID);
}

/** Returns true if VBBA flow is in progress */
const hasInProgressVBBA = (achData?: ACHDataReimbursementAccount, isNonUSDWorkspace?: boolean, policyID?: string) => {
    if (achData?.policyID !== policyID) {
        return false;
    }

    if (isNonUSDWorkspace) {
        return hasInProgressNonUSDVBBA(achData);
    }

    return hasInProgressUSDVBBA(achData);
};

export {getBankAccountIDAsNumber, hasInProgressUSDVBBA, hasInProgressNonUSDVBBA, hasInProgressVBBA, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES};
export type {ReimbursementAccountStepToOpen};
