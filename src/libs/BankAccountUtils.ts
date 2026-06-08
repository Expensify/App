import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';

function getDefaultCompanyWebsite(session: OnyxEntry<OnyxTypes.Session>, account: OnyxEntry<OnyxTypes.Account>, shouldShowPublicDomain = false): string {
    return account?.isFromPublicDomain && !shouldShowPublicDomain ? '' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
}

function getLastFourDigits(bankAccountNumber: string): string {
    return bankAccountNumber ? bankAccountNumber.slice(-4) : '';
}

function isBankAccountPartiallySetup(state: string | undefined) {
    return state === CONST.BANK_ACCOUNT.STATE.SETUP || state === CONST.BANK_ACCOUNT.STATE.VERIFYING || state === CONST.BANK_ACCOUNT.STATE.PENDING;
}

/**
 * States that should drive an account-level red/info dot.
 *
 * Why this is narrower than `isBankAccountPartiallySetup`: the partial-setup predicate is
 * also used by KYC gating, currency-change blocking, payment-option building, and workflow
 * filtering — so dropping VERIFYING from it would silently change those flows. The spec
 * wants VERIFYING to *not* light the indicator, but the rest of the system should keep
 * treating it as "partially set up". Use this predicate at indicator/display sites only.
 *
 * Currently unused; introduced as a building block for the row/indicator refactor.
 */
function bankAccountRequiresUserAttention(state: string | undefined): boolean {
    return state === CONST.BANK_ACCOUNT.STATE.SETUP || state === CONST.BANK_ACCOUNT.STATE.PENDING || state === CONST.BANK_ACCOUNT.STATE.LOCKED;
}

function hasBankAccountRequiringUserAttention(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => bankAccountRequiresUserAttention(bankAccount?.accountData?.state));
}

function doesPolicyHavePartiallySetupBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>, policyID: string) {
    if (!bankAccountList) {
        return false;
    }

    const bankAccounts = Object.values(bankAccountList);
    const matchingBankAccount = bankAccounts.find((bankAccount) => bankAccount.accountData?.policyIDs?.includes(policyID));

    return isBankAccountPartiallySetup(matchingBankAccount?.accountData?.state);
}

function hasPartiallySetupBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isBankAccountPartiallySetup(bankAccount?.accountData?.state));
}

const PERSONAL_INFO_STEP = {
    NAME: 1,
    ADDRESS: 2,
    PHONE: 3,
} as const;

type AdditionalData = AccountData['additionalData'];

function hasOwnerName(additionalData: AdditionalData): boolean {
    // OldDot stores firstName/lastName, NewDot stores legalFirstName/legalLastName — both are valid.
    return (!!additionalData?.firstName && !!additionalData?.lastName) || (!!additionalData?.legalFirstName && !!additionalData?.legalLastName);
}

function hasOwnerAddress(additionalData: AdditionalData): boolean {
    return !!additionalData?.addressStreet && !!additionalData?.addressCity && !!additionalData?.addressState && !!additionalData?.addressZipCode;
}

function hasOwnerPhone(additionalData: AdditionalData): boolean {
    return !!additionalData?.companyPhone;
}

function isPersonalBankAccountMissingInfo(accountData: AccountData | undefined): boolean {
    if (accountData?.type !== CONST.BANK_ACCOUNT.TYPE.PERSONAL) {
        return false;
    }

    if (accountData.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
        return false;
    }

    // Defaults to US when absent — legacy US accounts may omit country, matching BankAccount.getCountry().
    const country = accountData.additionalData?.country ?? CONST.COUNTRY.US;
    if (country !== CONST.COUNTRY.US) {
        return false;
    }

    const {additionalData} = accountData;

    return !hasOwnerName(additionalData) || !hasOwnerAddress(additionalData) || !hasOwnerPhone(additionalData);
}

function getCompletedStepsForBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>, bankAccountID: number): number[] {
    const bankAccount = bankAccountList?.[String(bankAccountID)];
    if (!bankAccount) {
        return [];
    }

    const {additionalData} = bankAccount.accountData ?? {};
    const completedSteps: number[] = [];

    if (hasOwnerName(additionalData)) {
        completedSteps.push(PERSONAL_INFO_STEP.NAME);
    }
    if (hasOwnerAddress(additionalData)) {
        completedSteps.push(PERSONAL_INFO_STEP.ADDRESS);
    }
    if (hasOwnerPhone(additionalData)) {
        completedSteps.push(PERSONAL_INFO_STEP.PHONE);
    }

    return completedSteps;
}

function hasPersonalBankAccountMissingInfo(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isPersonalBankAccountMissingInfo(bankAccount?.accountData));
}

type BankAccountConnectionStatus = {
    /** Translation key for the user-facing status label (Active / Incomplete / Pending / Verifying / Locked). */
    labelKey: TranslationPaths;
    /** Translation key for the helper copy rendered beneath the row. */
    descriptionKey?: TranslationPaths;
    /** Translation key for the tooltip displayed on the status label (used for VERIFYING). */
    tooltipKey?: TranslationPaths;
    /** Translation key for the inline CTA button label (Finish / Confirm / Unlock). */
    actionLabelKey?: TranslationPaths;
    /** Brick-road indicator severity; undefined when no dot should render. */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

/**
 * Maps a bank-account state to the user-facing status + RBR + optional CTA the Wallet
 * and Workflows rows should render. Returns undefined for unknown states.
 *
 * Currently unused; introduced as a building block for the row refactor. The follow-up
 * PR wires this into PaymentMethodList, WorkspaceWorkflowsPage, and OldDot.
 */
function getBankAccountConnectionStatus(state: string | undefined): BankAccountConnectionStatus | undefined {
    switch (state) {
        case CONST.BANK_ACCOUNT.STATE.OPEN:
            return {labelKey: 'walletPage.bankAccountStatus.active'};
        case CONST.BANK_ACCOUNT.STATE.SETUP:
            return {
                labelKey: 'walletPage.bankAccountStatus.incomplete',
                descriptionKey: 'walletPage.bankAccountStatus.finishAdding',
                actionLabelKey: 'walletPage.bankAccountStatus.finish',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.INFO,
            };
        case CONST.BANK_ACCOUNT.STATE.PENDING:
            return {
                labelKey: 'walletPage.bankAccountStatus.pending',
                descriptionKey: 'walletPage.bankAccountStatus.confirmTestTransactions',
                actionLabelKey: 'walletPage.bankAccountStatus.confirm',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.INFO,
            };
        case CONST.BANK_ACCOUNT.STATE.VERIFYING:
            return {
                labelKey: 'walletPage.bankAccountStatus.verifying',
                tooltipKey: 'walletPage.bankAccountStatus.reviewingDocumentation',
            };
        case CONST.BANK_ACCOUNT.STATE.LOCKED:
            return {
                labelKey: 'common.locked',
                descriptionKey: 'walletPage.bankAccountStatus.requiresAttention',
                actionLabelKey: 'walletPage.bankAccountStatus.unlock',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
        default:
            return undefined;
    }
}

export {
    bankAccountRequiresUserAttention,
    getBankAccountConnectionStatus,
    getDefaultCompanyWebsite,
    getLastFourDigits,
    hasBankAccountRequiringUserAttention,
    hasPartiallySetupBankAccount,
    hasPersonalBankAccountMissingInfo,
    isBankAccountPartiallySetup,
    doesPolicyHavePartiallySetupBankAccount,
    isPersonalBankAccountMissingInfo,
    getCompletedStepsForBankAccount,
    PERSONAL_INFO_STEP,
};
export type {BankAccountConnectionStatus};
