import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';

/** Responses of the additional KYB verification checks, hinting at which documents the user still needs to upload */
type KYBVerificationResponses = NonNullable<ACHData['verifications']>['externalApiResponses'];

type BankAccountConnectionStatus = {
    labelKey: TranslationPaths;
    tone: 'default' | 'success' | 'danger';
    messageKey?: TranslationPaths;
    actionKey?: TranslationPaths;
    requiresUnlockHandler?: boolean;
    tooltipKey?: TranslationPaths;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

function getDefaultCompanyWebsite(session: OnyxEntry<OnyxTypes.Session>, account: OnyxEntry<OnyxTypes.Account>, shouldShowPublicDomain = false): string {
    return account?.isFromPublicDomain && !shouldShowPublicDomain ? '' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
}

function getLastFourDigits(bankAccountNumber: string): string {
    return bankAccountNumber ? bankAccountNumber.slice(-4) : '';
}

/**
 * Renders a bank account as `${friendlyBankName} xx${last4}` for Search filter
 * pickers, chips, and autocomplete suggestions. Falls back to GENERIC_BANK when
 * the bank name is missing or not in CONST.BANK_NAMES_USER_FRIENDLY.
 */
function getBankAccountSearchLabel(bankAccount: OnyxEntry<OnyxTypes.BankAccount>): string {
    // BE returns bankName with the first letter uppercase (e.g. "Chase") but CONST.BANK_NAMES_USER_FRIENDLY keys are lowercase, so lowercase before the lookup.
    const bankName = bankAccount?.accountData?.additionalData?.bankName?.toLowerCase() as keyof typeof CONST.BANK_NAMES_USER_FRIENDLY | undefined;
    const accountNumber = bankAccount?.accountData?.accountNumber ?? '';
    const formattedBankName = (bankName ? CONST.BANK_NAMES_USER_FRIENDLY[bankName] : undefined) ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
    const maskedNumber = accountNumber ? `xx${getLastFourDigits(accountNumber)}` : '';
    return maskedNumber ? `${formattedBankName} ${maskedNumber}` : formattedBankName;
}

function isBankAccountPartiallySetup(state: string | undefined) {
    return state === CONST.BANK_ACCOUNT.STATE.SETUP || state === CONST.BANK_ACCOUNT.STATE.VERIFYING || state === CONST.BANK_ACCOUNT.STATE.PENDING;
}

function getBankAccountState(accountData: AccountData | undefined): string | undefined {
    if (!accountData) {
        return undefined;
    }

    return accountData.state;
}

function hasBankAccountAllowDebit(accountData: AccountData | undefined): boolean {
    if (!accountData) {
        return false;
    }

    return !!accountData.allowDebit;
}

function getIncompleteBankAccountStatus(): BankAccountConnectionStatus {
    return {
        labelKey: 'walletPage.bankAccountStatus.incomplete',
        messageKey: 'walletPage.bankAccountStatus.finishAddingBankAccount',
        actionKey: 'walletPage.bankAccountStatus.finish',
        tone: 'danger',
        brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
    };
}

/**
 * Only the USD flow has a test transaction step, and the backend puts non-USD accounts in PENDING while they are still
 * being set up. So for those, PENDING means the setup is incomplete rather than waiting on the user to confirm test
 * transactions.
 *
 * This keys off currency rather than country because currency is what selects the flow everywhere else. See
 * ReimbursementAccountPage, which routes a PENDING account to the validation (test transaction) step only when the
 * currency is USD. An absent currency is treated as USD, matching BankAccount.getCurrency().
 */
function getBankAccountConnectionStatus(state: string | undefined, currency?: string): BankAccountConnectionStatus | undefined {
    if (state === CONST.BANK_ACCOUNT.STATE.PENDING && !!currency && currency !== CONST.CURRENCY.USD) {
        return getIncompleteBankAccountStatus();
    }

    switch (state) {
        case CONST.BANK_ACCOUNT.STATE.OPEN:
            return {
                labelKey: 'walletPage.bankAccountStatus.active',
                tone: 'success',
            };
        case CONST.BANK_ACCOUNT.STATE.SETUP:
            return getIncompleteBankAccountStatus();
        case CONST.BANK_ACCOUNT.STATE.PENDING:
            return {
                labelKey: 'walletPage.bankAccountStatus.pending',
                messageKey: 'walletPage.bankAccountStatus.confirmTestTransactions',
                actionKey: 'common.confirm',
                tone: 'danger',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
        case CONST.BANK_ACCOUNT.STATE.VERIFYING:
            return {
                labelKey: 'walletPage.bankAccountStatus.verifying',
                tooltipKey: 'walletPage.bankAccountStatus.reviewingDocumentation',
                tone: 'default',
            };
        case CONST.BANK_ACCOUNT.STATE.LOCKED:
            return {
                labelKey: 'common.locked',
                messageKey: 'walletPage.bankAccountStatus.accountRequiresAttention',
                actionKey: 'walletPage.bankAccountStatus.unlock',
                requiresUnlockHandler: true,
                tone: 'danger',
                brickRoadIndicator: CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR,
            };
        default:
            return undefined;
    }
}
/**
 * A BUSINESS account in a state that has actually been usable for paying expenses (anything other than SETUP / VERIFYING / PENDING).
 * Used by the search picker, the autocomplete suggestions, and the advanced-filter visibility gate so all three surfaces accept and count the same set of accounts.
 */
function isFilterableBankAccount(bankAccount: OnyxEntry<OnyxTypes.BankAccount>): boolean {
    return bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && !isBankAccountPartiallySetup(bankAccount?.accountData?.state);
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

/** Compares error keys and searches for overlap. Based on the result we decide whether to gather extra file
 * @param status - status of the check
 * @param qualifiers - errors returned after the check
 * @returns boolean - whether to gather additional address verification file
 */
function isUserAddressVerificationRequired(
    status: string | undefined,
    qualifiers:
        | Array<{
              key: string;
              message: string;
          }>
        | undefined,
): boolean {
    return (
        status !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS &&
        !!CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.ADDRESS.find((error) => qualifiers?.map((qualifier) => qualifier.key).includes(error))
    );
}

/** Compares error keys and searches for overlap. Based on the result we decide whether to gather extra file
 * @param status - status of the check
 * @param qualifiers - errors returned after the check
 * @returns boolean - whether to gather additional DOB verification file
 */
function isUserDOBVerificationRequired(
    status: string | undefined,
    qualifiers:
        | Array<{
              key: string;
              message: string;
          }>
        | undefined,
): boolean {
    return (
        status !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS && !!CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.DOB.find((error) => qualifiers?.map((qualifier) => qualifier.key).includes(error))
    );
}

/** Builds the list of KYB document inputIDs the user must upload, based on which verification checks did not pass.
 * Returns an empty array when no documents are required (e.g. automated verification passed), in which case the
 * KYB documents step should be skipped entirely.
 * @param externalApiResponses - statuses of the external verification checks from the reimbursement account
 * @returns inputIDs of the documents that still need to be uploaded
 */
function getRequiredKYBDocuments(externalApiResponses: KYBVerificationResponses): string[] {
    const requiredDocuments: string[] = [];

    const companyTaxIDStatus = externalApiResponses?.companyTaxID?.status;
    if (companyTaxIDStatus !== undefined && companyTaxIDStatus !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.COMPANY_TAX_ID);
    }

    const lexisNexisStatus = externalApiResponses?.lexisNexisInstantIDResult?.status;
    if (lexisNexisStatus !== undefined && lexisNexisStatus !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.NAME_CHANGE_DOCUMENT, INPUT_IDS.KYB_DOCUMENTS.COMPANY_ADDRESS_VERIFICATION);
    }

    const requestorIdentityStatus = externalApiResponses?.requestorIdentityID?.status;
    const requestorIdentityQualifiers = externalApiResponses?.requestorIdentityID?.apiResult?.qualifiers?.qualifier;
    if (isUserAddressVerificationRequired(requestorIdentityStatus, requestorIdentityQualifiers)) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.USER_ADDRESS_VERIFICATION);
    }
    if (isUserDOBVerificationRequired(requestorIdentityStatus, requestorIdentityQualifiers)) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.USER_DOB_VERIFICATION);
    }

    return requiredDocuments;
}

function isValidIBAN(value?: string): boolean {
    return CONST.BANK_ACCOUNT.REGEX.IBAN.test((value ?? '').trim());
}

function isValidSwiftBic(value?: string): boolean {
    return CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test((value ?? '').trim());
}

/**
 * IBAN/SWIFT can come from the dedicated `iban`/`swiftCode` fields or from `accountNumber`/`swiftBicCode` on the
 * Corpay bank-details step. IBAN must match the IBAN format in either place. Dedicated `swiftCode` must be a BIC;
 * first-page `swiftBicCode` is already Corpay-validated, so non-empty is enough (it may not be a BIC).
 */
function hasValidInternationalBankAccountDetails(iban: string | undefined, swiftCode: string | undefined, accountNumber?: string, swiftBicCode?: string) {
    return (isValidIBAN(iban) || isValidIBAN(accountNumber)) && (isValidSwiftBic(swiftCode) || !!swiftBicCode);
}

/**
 * Whether the Corpay account details step already collected a real IBAN and a SWIFT value. That is the only case
 * where the dedicated international details step can be omitted. `accountNumber` must be an IBAN (it is often a local
 * number). `swiftBicCode` is always the SWIFT field and is validated on that step, so non-empty is enough. Filled
 * `iban`/`swiftCode` must not omit the step, or it disappears from the wizard after the user completes it.
 */
function hasValidAccountDetailsInternationalFields(accountNumber?: string, swiftBicCode?: string): boolean {
    return isValidIBAN(accountNumber) && !!swiftBicCode;
}

/**
 * Resolves the IBAN/SWIFT values to display or submit, falling back to `accountNumber`/`swiftBicCode` when the
 * dedicated `iban`/`swiftCode` fields weren't collected (e.g. the international bank account details step was
 * skipped because the Corpay bank-details step already gathered equivalent values).
 */
function getInternationalBankAccountDetailsValues(iban: string | undefined, swiftCode: string | undefined, accountNumber?: string, swiftBicCode?: string): {iban: string; swiftCode: string} {
    let resolvedIBAN = iban ?? '';
    if (!resolvedIBAN && isValidIBAN(accountNumber)) {
        resolvedIBAN = accountNumber ?? '';
    }

    let resolvedSwiftCode = swiftCode ?? '';
    if (!resolvedSwiftCode && swiftBicCode) {
        resolvedSwiftCode = swiftBicCode;
    }

    // `swiftBicCode` is always the SWIFT field and is already validated on the account details step, so a non-empty
    // value can be copied as-is. `accountNumber` is not always an IBAN, so that fallback still uses isValidIBAN.
    return {
        iban: resolvedIBAN,
        swiftCode: resolvedSwiftCode,
    };
}

/**
 * Locks the international-details IBAN or SWIFT/BIC input when the initial bank details page already collected
 * that value, so the user cannot submit a second conflicting copy.
 */
function getDisabledInternationalBankAccountFields(accountNumber?: string, swiftBicCode?: string): {isIBANDisabled: boolean; isSwiftCodeDisabled: boolean} {
    return {
        isIBANDisabled: isValidIBAN(accountNumber),
        isSwiftCodeDisabled: !!swiftBicCode,
    };
}

/**
 * Confirmation should list IBAN/SWIFT from the international details step only when the user entered them there.
 * Prefill comes from `accountNumber` (IBAN countries) or `swiftBicCode`, which are already shown on the initial
 * bank details fields, so a matching value is hidden.
 */
function shouldShowInternationalDetailOnConfirmation(value: string | undefined, sourceValue?: string): boolean {
    const trimmed = value?.trim();
    if (!trimmed) {
        return false;
    }
    return trimmed !== sourceValue?.trim();
}

/**
 * Shared IBAN/SWIFT format validation for the international bank account details step, used by both the USD and
 * international personal bank account flows.
 */
function getInternationalBankAccountDetailsErrors(
    iban: string | undefined,
    swiftCode: string | undefined,
    translate: LocaleContextProps['translate'],
    isSwiftCodeDisabled = false,
): Partial<Record<'iban' | 'swiftCode', string>> {
    const errors: Partial<Record<'iban' | 'swiftCode', string>> = {};
    if (iban && !isValidIBAN(iban)) {
        errors.iban = translate('bankAccount.error.iban');
    }
    if (swiftCode && !isSwiftCodeDisabled && !isValidSwiftBic(swiftCode)) {
        errors.swiftCode = translate('bankAccount.error.swiftCode');
    }
    return errors;
}

export {
    hasValidInternationalBankAccountDetails,
    hasValidAccountDetailsInternationalFields,
    getInternationalBankAccountDetailsValues,
    getDisabledInternationalBankAccountFields,
    shouldShowInternationalDetailOnConfirmation,
    getInternationalBankAccountDetailsErrors,
    getBankAccountSearchLabel,
    isFilterableBankAccount,
    getDefaultCompanyWebsite,
    getBankAccountState,
    hasBankAccountAllowDebit,
    getBankAccountConnectionStatus,
    getRequiredKYBDocuments,
    getLastFourDigits,
    hasPartiallySetupBankAccount,
    hasPersonalBankAccountMissingInfo,
    isBankAccountPartiallySetup,
    isUserAddressVerificationRequired,
    isUserDOBVerificationRequired,
    doesPolicyHavePartiallySetupBankAccount,
    isPersonalBankAccountMissingInfo,
    getCompletedStepsForBankAccount,
    PERSONAL_INFO_STEP,
};
export type {BankAccountConnectionStatus, KYBVerificationResponses};
