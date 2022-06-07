import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as DeprecatedAPI from '../../deprecatedAPI';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import * as navigation from './navigation';
import * as store from './store';
import BankAccount from '../../models/BankAccount';

/**
 * @param {Object} localBankAccountState
 * @returns {Object}
 */
function getInitialData(localBankAccountState) {
    const initialData = {loading: true, error: ''};

    // Some UI needs to know the bank account state during the loading process, so we are keeping it in Onyx if passed
    if (localBankAccountState) {
        initialData.achData = {state: localBankAccountState};
    }

    return initialData;
}

/**
 * @returns {Promise}
 */
function fetchNameValuePairsAndBankAccount() {
    let bankAccountID;
    let failedValidationAttemptsName;

    return DeprecatedAPI.Get({
        returnValueList: 'nameValuePairs',
        name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
    })
        .then((response) => {
            bankAccountID = lodashGet(response, ['nameValuePairs', CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
            ], '');
            failedValidationAttemptsName = CONST.NVP.FAILED_BANK_ACCOUNT_VALIDATIONS_PREFIX + bankAccountID;

            // Now that we have the bank account. Lets grab the rest of the bank info we need
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            return DeprecatedAPI.Get({
                returnValueList: 'nameValuePairs, bankAccountList',
                nvpNames: [
                    failedValidationAttemptsName,
                    CONST.NVP.KYC_MIGRATION,
                    CONST.NVP.ACH_DATA_THROTTLED,
                    CONST.NVP.BANK_ACCOUNT_GET_THROTTLED,
                ].join(),
            });
        })
        .then(({bankAccountList, nameValuePairs}) => {
            // Users have a limited amount of attempts to get the validations amounts correct.
            // Once exceeded, we need to block them from attempting to validate.
            const failedValidationAttempts = lodashGet(nameValuePairs, failedValidationAttemptsName, 0);
            const maxAttemptsReached = failedValidationAttempts > CONST.BANK_ACCOUNT.VERIFICATION_MAX_ATTEMPTS;

            const kycVerificationsMigration = lodashGet(nameValuePairs, CONST.NVP.KYC_MIGRATION, '');
            const throttledDate = lodashGet(nameValuePairs, CONST.NVP.ACH_DATA_THROTTLED, '');
            const bankAccountJSON = _.find(bankAccountList, account => (
                account.bankAccountID === bankAccountID
            ));
            const bankAccount = bankAccountJSON ? new BankAccount(bankAccountJSON) : null;
            const throttledHistoryCount = lodashGet(nameValuePairs, CONST.NVP.BANK_ACCOUNT_GET_THROTTLED, 0);
            const isPlaidDisabled = throttledHistoryCount > CONST.BANK_ACCOUNT.PLAID.ALLOWED_THROTTLED_COUNT;

            return {
                maxAttemptsReached,
                kycVerificationsMigration,
                throttledDate,
                bankAccount,
                isPlaidDisabled,
                bankAccountID,
            };
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
}

/**
 * @param {BankAccount} bankAccount
 * @param {String} kycVerificationsMigration
 * @returns {Boolean}
 */
function getHasTriedToUpgrade(bankAccount, kycVerificationsMigration) {
    if (!bankAccount) {
        return false;
    }

    return bankAccount.getDateSigned() > (kycVerificationsMigration || '2020-01-13');
}

/**
 * @param {String} stepToOpen
 * @param {String} stepFromStorage
 * @param {Object} achData
 * @param {BankAccount} bankAccount
 * @param {Boolean} hasTriedToUpgrade
 * @returns {String}
 */
function getCurrentStep(stepToOpen, stepFromStorage, achData, bankAccount, hasTriedToUpgrade) {
    // If we are providing a stepToOpen via a deep link then we will always navigate to that step. This
    // should be used with caution as it is possible to drop a user into a flow they can't complete e.g.
    // if we drop the user into the CompanyStep, but they have no accountNumber or routing Number in
    // their achData.
    if (stepToOpen) {
        return stepToOpen;
    }

    // To determine if there's any step we can go to we will look at the data from the server first then whatever is in device storage.
    const currentStep = achData.currentStep
        ? navigation.getNextStepToComplete(achData)
        : store.getReimbursementAccountInSetup().currentStep;

    if (achData.isInSetup) {
        return currentStep || CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    }

    // If we don't have a bank account then take the user to the BankAccountStep so they can create one.
    if (!bankAccount) {
        return CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    }

    if (bankAccount.isPending() || bankAccount.isVerifying()) {
        return CONST.BANK_ACCOUNT.STEP.VALIDATION;
    }

    // No clear place to direct this user so we'll go with the bank account step
    if (!bankAccount.isOpen()) {
        return CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    }

    if (bankAccount.needsToPassLatestChecks()) {
        return hasTriedToUpgrade ? CONST.BANK_ACCOUNT.STEP.VALIDATION : CONST.BANK_ACCOUNT.STEP.COMPANY;
    }

    return CONST.BANK_ACCOUNT.STEP.ENABLE;
}

/**
 * @param {BankAccount} bankAccount
 * @param {Boolean} hasTriedToUpgrade
 * @returns {Boolean}
 */
function getIsBankAccountInReview(bankAccount, hasTriedToUpgrade) {
    if (!bankAccount) {
        return false;
    }

    if (bankAccount.isVerifying()) {
        return true;
    }

    if (bankAccount.isOpen() && bankAccount.needsToPassLatestChecks()) {
        return hasTriedToUpgrade;
    }

    return false;
}

/**
 * @param {BankAccount} bankAccount
 * @param {Boolean} hasTriedToUpgrade
 * @param {String} subStep
 * @returns {Object}
 */
function buildACHData(bankAccount, hasTriedToUpgrade, subStep) {
    return {
        ...(bankAccount ? bankAccount.toACHData() : {}),
        useOnfido: true,
        policyID: store.getReimbursementAccountWorkspaceID() || '',
        isInSetup: !bankAccount || bankAccount.isInSetup(),
        bankAccountInReview: getIsBankAccountInReview(bankAccount, hasTriedToUpgrade),
        domainLimit: 0,
        subStep: bankAccount && bankAccount.isInSetup()
            ? CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL
            : subStep,
    };
}

/**
 * Fetch the bank account currently being set up by the user for the free plan if it exists.
 *
 * @param {String} [stepToOpen]
 * @param {String} [localBankAccountState]
 */
function fetchFreePlanVerifiedBankAccount(stepToOpen, localBankAccountState) {
    const initialData = getInitialData(localBankAccountState);

    // We are using set here since we will rely on data from the server (not local data) to populate the VBA flow
    // and determine which step to navigate to.
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, initialData);

    // Fetch the various NVPs we need to show any initial errors and the bank account itself
    fetchNameValuePairsAndBankAccount()
        .then(({
            bankAccount, kycVerificationsMigration, throttledDate, maxAttemptsReached, isPlaidDisabled,
        }) => {
            // If we already have a substep stored locally then we will add that to the new achData
            const subStep = lodashGet(store.getReimbursementAccountInSetup(), 'subStep', '');
            const hasTriedToUpgrade = getHasTriedToUpgrade(bankAccount, kycVerificationsMigration);
            const achData = buildACHData(bankAccount, hasTriedToUpgrade, subStep);
            const stepFromStorage = store.getReimbursementAccountInSetup().currentStep;
            const currentStep = getCurrentStep(stepToOpen, stepFromStorage, achData, bankAccount, hasTriedToUpgrade);

            navigation.goToWithdrawalAccountSetupStep(currentStep, achData);
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                throttledDate,
                maxAttemptsReached,
                error: '',
                isPlaidDisabled,
            });
        });
}

export default fetchFreePlanVerifiedBankAccount;
export {getCurrentStep, buildACHData};
