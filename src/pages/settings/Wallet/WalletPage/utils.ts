import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {FormattedSelectedPaymentMethod, FormattedSelectedPaymentMethodIcon} from '@hooks/usePaymentMethodState/types';

import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import {getStreetLines} from '@libs/PersonalDetailsUtils';
import {canMemberWrite} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AccountData, Policy} from '@src/types/onyx';
import type {BankAccountAdditionalData} from '@src/types/onyx/BankAccount';
import type PaymentMethod from '@src/types/onyx/PaymentMethod';

import type {OnyxCollection} from 'react-native-onyx';

function shouldOpenBankAccountByPolicy(accountData: AccountData | undefined, policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): boolean {
    const policyID = accountData?.additionalData?.policyID;
    if (!policyID || !currentUserLogin) {
        return false;
    }

    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    return canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);
}

/**
 * Builds the payment method summary shown in the three-dots popover header for a pressed bank account or debit card.
 */
function getFormattedSelectedPaymentMethod(
    accountType: string,
    accountData: AccountData | undefined,
    icon: FormattedSelectedPaymentMethodIcon | undefined,
    description: string | undefined,
    translate: LocalizedTranslate,
): FormattedSelectedPaymentMethod {
    if (accountType !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && accountType !== CONST.PAYMENT_METHODS.DEBIT_CARD) {
        return {title: ''};
    }

    return {
        title: accountData?.addressName ?? '',
        icon,
        description: description ?? getPaymentMethodDescription(accountType, accountData, translate),
        type: accountType,
    };
}

/**
 * Only open business bank accounts that allow debits can be shared with other workspace admins.
 */
function shouldShowShareBankAccountButton(accountData: AccountData | undefined): boolean {
    return accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN && !!accountData?.allowDebit;
}

/**
 * Unshare is offered for open business bank accounts shared with someone other than the current user.
 */
function shouldShowUnshareBankAccountButton(accountData: AccountData | undefined, currentUserEmail: string | undefined): boolean {
    if (accountData?.type !== CONST.BANK_ACCOUNT.TYPE.BUSINESS || !accountData?.sharees?.length) {
        return false;
    }
    const isOnlyCurrentUserInSharees = accountData.sharees.length === 1 && accountData.sharees.at(0) === currentUserEmail;
    return accountData.state === CONST.BANK_ACCOUNT.STATE.OPEN && !isOnlyCurrentUserInSharees;
}

/**
 * "Make default" is hidden when the selected method is the only one or is already the wallet's linked account.
 */
function isSelectedPaymentMethodDefault(
    paymentMethods: PaymentMethod[],
    selectedType: string | undefined,
    selectedPaymentMethod: AccountData,
    walletLinkedAccountID: number | undefined,
): boolean {
    if (paymentMethods.length <= 1) {
        return true;
    }
    if (selectedType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
        return selectedPaymentMethod.bankAccountID === walletLinkedAccountID;
    }
    if (selectedType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
        return selectedPaymentMethod.fundID === walletLinkedAccountID;
    }
    return true;
}

function shouldShowMakeDefaultButton(
    paymentMethods: PaymentMethod[],
    selectedType: string | undefined,
    selectedPaymentMethod: AccountData,
    walletLinkedAccountID: number | undefined,
): boolean {
    const isBusinessBankAccount = selectedType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS;
    return (
        !isSelectedPaymentMethodDefault(paymentMethods, selectedType, selectedPaymentMethod, walletLinkedAccountID) &&
        !isBusinessBankAccount &&
        selectedPaymentMethod?.state === CONST.BANK_ACCOUNT.STATE.OPEN
    );
}

function shouldShowEnableGlobalReimbursementsButton(selectedPaymentMethod: AccountData): boolean {
    return (
        selectedPaymentMethod?.additionalData?.currency === CONST.CURRENCY.USD &&
        selectedPaymentMethod.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS &&
        !selectedPaymentMethod?.additionalData?.verifications?.corpay &&
        selectedPaymentMethod?.state === CONST.BANK_ACCOUNT.STATE.OPEN
    );
}

/**
 * Picks the bank account that becomes the default once `methodIDToDelete` is removed:
 * the most recently created open personal bank account that is not already pending deletion.
 */
function getNextDefaultBankAccountID(paymentMethods: PaymentMethod[], methodIDToDelete: string | number): number | undefined {
    const remainingPaymentMethods = paymentMethods
        .filter(
            (method) =>
                method.methodID !== methodIDToDelete &&
                method.accountType === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT &&
                method.accountData?.type !== CONST.BANK_ACCOUNT.TYPE.BUSINESS &&
                method.accountData?.state === CONST.BANK_ACCOUNT.STATE.OPEN &&
                method.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        )
        .sort((a, b) => {
            const aCreated = a.accountData?.created ?? '';
            const bCreated = b.accountData?.created ?? '';
            if (!aCreated && !bCreated) {
                return 0;
            }
            if (!aCreated) {
                return 1;
            }
            if (!bCreated) {
                return -1;
            }
            return new Date(bCreated).getTime() - new Date(aCreated).getTime();
        });

    const newDefaultMethod = remainingPaymentMethods.at(0);
    if (newDefaultMethod?.accountType !== CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
        return undefined;
    }
    return newDefaultMethod.accountData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
}

/**
 * Pre-fills the personal bank account and home address form drafts from what the bank account already knows,
 * so the user only has to complete the missing personal info.
 */
function getPersonalBankAccountUpdateDrafts(additionalData: BankAccountAdditionalData | undefined) {
    const [street1, street2] = additionalData?.addressStreet ? getStreetLines(additionalData.addressStreet) : [];
    return {
        personalBankAccountDraft: {
            legalFirstName: additionalData?.firstName ?? additionalData?.legalFirstName,
            legalLastName: additionalData?.lastName ?? additionalData?.legalLastName,
            addressStreet: street1,
            addressStreet2: street2 ?? '',
            addressCity: additionalData?.addressCity,
            addressState: additionalData?.addressState,
            addressZipCode: additionalData?.addressZipCode,
            phoneNumber: additionalData?.companyPhone,
        },
        homeAddressDraft: {
            addressLine1: street1,
            addressLine2: street2 ?? '',
            city: additionalData?.addressCity,
            state: additionalData?.addressState,
            zipPostCode: additionalData?.addressZipCode,
            country: CONST.COUNTRY.US,
        },
    };
}

export {
    shouldOpenBankAccountByPolicy,
    getFormattedSelectedPaymentMethod,
    shouldShowShareBankAccountButton,
    shouldShowUnshareBankAccountButton,
    isSelectedPaymentMethodDefault,
    shouldShowMakeDefaultButton,
    shouldShowEnableGlobalReimbursementsButton,
    getNextDefaultBankAccountID,
    getPersonalBankAccountUpdateDrafts,
};
