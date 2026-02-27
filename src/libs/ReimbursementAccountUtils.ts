import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {ACHDataReimbursementAccount, ReimbursementAccountStep} from '@src/types/onyx/ReimbursementAccount';

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

function getRouteForCurrentStep(currentStep: ReimbursementAccountStep): ReimbursementAccountStepToOpen {
    switch (currentStep) {
        case CONST.BANK_ACCOUNT.STEP.COMPANY:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.COMPANY;
        case CONST.BANK_ACCOUNT.STEP.REQUESTOR:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.PERSONAL_INFORMATION;
        case CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.BENEFICIAL_OWNERS;
        case CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.CONTRACT;
        case CONST.BANK_ACCOUNT.STEP.VALIDATION:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.VALIDATE;
        case CONST.BANK_ACCOUNT.STEP.ENABLE:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.ENABLE;
        case CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT:
        case CONST.BANK_ACCOUNT.STEP.COUNTRY:
        default:
            return REIMBURSEMENT_ACCOUNT_ROUTE_NAMES.NEW;
    }
}

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

/** Returns true if VBBA flow is in progress */
const hasInProgressVBBA = (achData?: ACHDataReimbursementAccount, isNonUSDWorkspace?: boolean) => {
    if (isNonUSDWorkspace ?? (!!achData?.currency && achData.currency !== CONST.CURRENCY.USD)) {
        return hasInProgressNonUSDVBBA(achData);
    }

    return hasInProgressUSDVBBA(achData);
};

export {getRouteForCurrentStep, hasInProgressUSDVBBA, hasInProgressNonUSDVBBA, hasInProgressVBBA, REIMBURSEMENT_ACCOUNT_ROUTE_NAMES};
export type {ReimbursementAccountStepToOpen};
