import type {ValueOf} from 'type-fest';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form/ReimbursementAccountForm';
import type {BankAccountList} from '@src/types/onyx';
import type {ACHData, ACHDataReimbursementAccount, BankAccountStep, ReimbursementAccountStep} from '@src/types/onyx/ReimbursementAccount';

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

/**
 * Maps bank account data from SETUP state to ACHData fields
 * @param bankAccountList - List of bank accounts to search for SETUP state accounts
 * @returns Partial ACHData or null if no SETUP accounts found
 */
function mapBankAccountToACHData(bankAccountList?: BankAccountList): Partial<ACHData> | null {
    const setupBankAccount = getSetupStateBankAccount(bankAccountList);
    if (!setupBankAccount?.accountData) {
        return null;
    }

    const accountData = setupBankAccount.accountData;
    const additionalData = accountData.additionalData;

    const achData: Partial<ACHData> = {
        bankAccountID: accountData.bankAccountID,
        routingNumber: accountData.routingNumber,
        accountNumber: accountData.accountNumber,
        bankName: additionalData?.bankName,
        plaidAccountID: accountData.plaidAccountID,
        state: accountData.state,
        addressName: accountData.addressName,
        accountHolderName: accountData.addressName,
        setupType: accountData.plaidAccountID ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID : CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL,
        mask: setupBankAccount.description?.match(/\\d{4}$/)?.[0],
        currency: additionalData?.currency,
        fieldsType: additionalData?.fieldsType,
        isSavings: accountData.isSavings,
        plaidAccessToken: additionalData?.plaidAccessToken ?? '',
        selectedPlaidAccountID: accountData.plaidAccountID,
        firstName: additionalData?.firstName,
        lastName: additionalData?.lastName,
        dob: additionalData?.dob,
        ssnLast4: additionalData?.ssnLast4,
        requestorAddressStreet: additionalData?.requestorAddressStreet,
        requestorAddressCity: additionalData?.requestorAddressCity,
        requestorAddressState: additionalData?.requestorAddressState,
        requestorAddressZipCode: additionalData?.requestorAddressZipCode,
        isOnfidoSetupComplete: additionalData?.isOnfidoSetupComplete,
        companyName: additionalData?.companyName,
        companyTaxID: additionalData?.companyTaxID,
        website: additionalData?.website,
        companyPhone: additionalData?.companyPhone,
        addressStreet: additionalData?.addressStreet,
        addressCity: additionalData?.addressCity,
        addressState: additionalData?.addressState,
        addressZipCode: additionalData?.addressZipCode,
        incorporationType: additionalData?.incorporationType,
        incorporationDate: additionalData?.incorporationDate,
        incorporationState: additionalData?.incorporationState,
        industryCode: additionalData?.industryCode,
        hasNoConnectionToCannabis: additionalData?.hasNoConnectionToCannabis,
        ownsMoreThan25Percent: additionalData?.ownsMoreThan25Percent,
        acceptTermsAndConditions: additionalData?.acceptTerms,
        certifyTrueInformation: additionalData?.certifyTrueInformation,
        isAuthorizedToUseBankAccount: additionalData?.isAuthorizedToUseBankAccount,
        created: additionalData?.dateSigned,
        hasFullSSN: additionalData?.hasFullSSN,
        isControllingOfficer: additionalData?.isControllingOfficer,
        isFromNewDot: true,
        lastUpdate: additionalData?.lastUpdate,
        verifications: additionalData?.verifications,
        country: additionalData?.country as Country,
        beneficialOwners: JSON.stringify(additionalData?.beneficialOwners),
    };

    return achData;
}

/**
 * Maps bank account data from SETUP state to ReimbursementAccountForm draft data
 * @param bankAccountList - List of bank accounts to search for SETUP state accounts
 * @returns Partial ReimbursementAccountForm or null if no SETUP accounts found
 */
function mapBankAccountToReimbursementAccountDraft(bankAccountList?: BankAccountList): Partial<ReimbursementAccountForm> | null {
    const setupBankAccount = getSetupStateBankAccount(bankAccountList);
    if (!setupBankAccount?.accountData) {
        return null;
    }

    const accountData = setupBankAccount.accountData;
    const additionalData = accountData.additionalData;

    return {
        accountNumber: accountData.accountNumber,
        routingNumber: accountData.routingNumber,
        bankName: additionalData?.bankName,
        mask: setupBankAccount.description?.match(/\\d{4}$/)?.[0],
        isSavings: accountData.isSavings,
        plaidAccountID: accountData.plaidAccountID,
        plaidAccessToken: additionalData?.plaidAccessToken,
        firstName: additionalData?.firstName,
        lastName: additionalData?.lastName,
        dob: additionalData?.dob,
        ssnLast4: additionalData?.ssnLast4,
        requestorAddressStreet: additionalData?.requestorAddressStreet,
        requestorAddressCity: additionalData?.requestorAddressCity,
        requestorAddressState: additionalData?.requestorAddressState,
        requestorAddressZipCode: additionalData?.requestorAddressZipCode,
        companyName: additionalData?.companyName,
        companyTaxID: additionalData?.companyTaxID,
        website: additionalData?.website,
        companyPhone: additionalData?.companyPhone,
        addressStreet: additionalData?.addressStreet,
        addressCity: additionalData?.addressCity,
        addressState: additionalData?.addressState,
        addressZipCode: additionalData?.addressZipCode,
        incorporationType: additionalData?.incorporationType,
        incorporationDate: additionalData?.incorporationDate,
        incorporationState: additionalData?.incorporationState,
        industryCode: additionalData?.industryCode,
        hasNoConnectionToCannabis: additionalData?.hasNoConnectionToCannabis,
        ownsMoreThan25Percent: additionalData?.ownsMoreThan25Percent,
        beneficialOwners: additionalData?.beneficialOwners ? JSON.stringify(additionalData.beneficialOwners) : undefined,
        acceptTermsAndConditions: additionalData?.acceptTerms,
        certifyTrueInformation: additionalData?.certifyTrueInformation,
        isAuthorizedToUseBankAccount: additionalData?.isAuthorizedToUseBankAccount,
        country: additionalData?.country as Country,
        currency: additionalData?.currency,
    };
}

/**
 * Determines the current step based on available data in bank account
 * @param bankAccountList - List of bank accounts to search for SETUP state accounts
 * @returns Current step string or null if no SETUP accounts found
 */
function getCurrentStepFromBankAccount(bankAccountList?: BankAccountList): BankAccountStep | undefined {
    const setupBankAccount = getSetupStateBankAccount(bankAccountList);
    if (!setupBankAccount?.accountData) {
        return undefined;
    }

    const additionalData = setupBankAccount.accountData.additionalData;

    if (additionalData?.currentStep) {
        return additionalData.currentStep as BankAccountStep;
    }

    const hasPersonalInfo = !!(additionalData?.firstName && additionalData?.lastName && additionalData?.dob && additionalData?.ssnLast4);
    const hasBusinessInfo = !!(additionalData?.companyName && additionalData?.companyTaxID && additionalData?.incorporationType);
    const hasBeneficialOwnerInfo = additionalData?.ownsMoreThan25Percent !== undefined;
    const hasContractInfo = !!(additionalData?.acceptTerms && additionalData?.certifyTrueInformation && additionalData?.isAuthorizedToUseBankAccount);

    if (!hasPersonalInfo) {
        return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
    }
    if (!hasBusinessInfo) {
        return CONST.BANK_ACCOUNT.STEP.COMPANY;
    }
    if (!hasBeneficialOwnerInfo) {
        return CONST.BANK_ACCOUNT.STEP.BENEFICIAL_OWNERS;
    }
    if (!hasContractInfo) {
        return CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT;
    }

    // If all steps are complete, move to validation
    return CONST.BANK_ACCOUNT.STEP.VALIDATION;
}

/**
 * Helper function to get the first SETUP state bank account without policyID
 * @param bankAccountList - List of bank accounts to search
 * @returns First matching bank account or null
 */
function getSetupStateBankAccount(bankAccountList?: BankAccountList) {
    if (!bankAccountList) {
        return null;
    }

    const setupStateBankAccounts = Object.values(bankAccountList).filter(
        (bankAccount) => bankAccount?.accountData?.state === CONST.BANK_ACCOUNT.STATE.SETUP && !bankAccount?.accountData?.additionalData?.policyID,
    );

    return setupStateBankAccounts.at(0) ?? null;
}

export {
    getRouteForCurrentStep,
    hasInProgressUSDVBBA,
    hasInProgressNonUSDVBBA,
    hasInProgressVBBA,
    REIMBURSEMENT_ACCOUNT_ROUTE_NAMES,
    mapBankAccountToACHData,
    mapBankAccountToReimbursementAccountDraft,
    getCurrentStepFromBankAccount,
    getSetupStateBankAccount,
};
export type {ReimbursementAccountStepToOpen};
