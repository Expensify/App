import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import * as API from '../../API';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import {getNextStepToComplete, goToWithdrawalAccountSetupStep} from './navigation';
import {getReimbursementAccountInSetup, getReimbursementAccountWorkspaceID} from './store';
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

    return API.Get({
        returnValueList: 'nameValuePairs',
        name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
    })
        .then((response) => {
            bankAccountID = lodashGet(response, ['nameValuePairs', CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
            ], '');
            failedValidationAttemptsName = CONST.NVP.FAILED_BANK_ACCOUNT_VALIDATIONS_PREFIX + bankAccountID;

            // Now that we have the bank account. Lets grab the rest of the bank info we need
            return API.Get({
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
 * @param {Object} achData
 * @param {BankAccount} bankAccount
 * @param {Boolean} hasTriedToUpgrade
 * @returns {String}
 */
function getCurrentStep(stepToOpen, achData, bankAccount, hasTriedToUpgrade) {
    let currentStep = getReimbursementAccountInSetup().currentStep;
    if (!stepToOpen && achData.currentStep) {
        // eslint-disable-next-line no-use-before-define
        currentStep = getNextStepToComplete(achData);
    }

    // If we're not in setup, it means we already have a withdrawal account
    // and we're upgrading it to a business bank account. So let the user
    // review all steps with all info prefilled and editable, unless a specific step was passed.
    if (!achData.isInSetup) {
        // @TODO Not sure if we need to do this since for
        // NewDot none of the accounts are pre-existing ones
        currentStep = '';
    }

    // Temporary fix for Onfido flow. Can be removed by nkuoch after Sept 1 2020.
    // @TODO not sure if we still need this or what this is about, but seems like maybe yes...
    if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT && achData.useOnfido) {
        const onfidoResponse = lodashGet(
            achData,
            CONST.BANK_ACCOUNT.VERIFICATIONS.REQUESTOR_IDENTITY_ONFIDO,
        );
        const sdkToken = lodashGet(onfidoResponse, CONST.BANK_ACCOUNT.ONFIDO_RESPONSE.SDK_TOKEN);
        if (sdkToken && !achData.isOnfidoSetupComplete
            && onfidoResponse.status !== CONST.BANK_ACCOUNT.ONFIDO_RESPONSE.PASS
        ) {
            currentStep = CONST.BANK_ACCOUNT.STEP.REQUESTOR;
        }
    }

    // Ensure we route the user to the correct step based on the status of their bank account
    if (bankAccount && !currentStep) {
        currentStep = bankAccount.isPending() || bankAccount.isVerifying()
            ? CONST.BANK_ACCOUNT.STEP.VALIDATION
            : CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;

        // @TODO Again, not sure how much of this logic is needed right now
        // as we shouldn't be handling any open accounts in New Expensify yet that need to pass any more
        // checks or can be upgraded, but leaving in for possible future compatibility.
        if (bankAccount.isOpen()) {
            if (bankAccount.needsToPassLatestChecks()) {
                currentStep = hasTriedToUpgrade ? CONST.BANK_ACCOUNT.STEP.VALIDATION : CONST.BANK_ACCOUNT.STEP.COMPANY;
            } else {
                // We do not show a specific view for the EnableStep since we
                // will enable the Expensify card automatically. However, we will still handle
                // that step and show the Validate view.
                currentStep = CONST.BANK_ACCOUNT.STEP.ENABLE;
            }
        }
    }

    // If at this point we still don't have a current step, default to the BankAccountStep
    if (!currentStep) {
        currentStep = CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
    }

    // If we are providing a stepToOpen via a deep link then we will always navigate to that step. This
    // should be used with caution as it is possible to drop a user into a flow they can't complete e.g.
    // if we drop the user into the CompanyStep, but they have no accountNumber or routing Number in
    // their achData.
    if (stepToOpen) {
        currentStep = stepToOpen;
    }

    return currentStep;
}

function setupACHData(bankAccount, hasTriedToUpgrade) {
    // If we already have a substep stored locally then we will add that to the new achData
    const subStep = lodashGet(getReimbursementAccountInSetup(), 'subStep', '');
    const achData = bankAccount ? bankAccount.toACHData() : {};
    achData.useOnfido = true;
    achData.policyID = getReimbursementAccountWorkspaceID() || '';
    achData.isInSetup = !bankAccount || bankAccount.isInSetup();
    achData.bankAccountInReview = bankAccount && bankAccount.isVerifying();
    achData.domainLimit = 0;

    // If the bank account has already been created in the db and is not yet open
    // let's show the manual form with the previously added values. Otherwise, we will
    // make the subStep the previous value.
    if (bankAccount && bankAccount.isInSetup()) {
        achData.subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    } else {
        achData.subStep = subStep;
    }

    if (bankAccount && bankAccount.isOpen() && bankAccount.needsToPassLatestChecks()) {
        achData.bankAccountInReview = hasTriedToUpgrade;
    }

    return achData;
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
            const achData = setupACHData(bankAccount);
            const hasTriedToUpgrade = getHasTriedToUpgrade(bankAccount, kycVerificationsMigration);
            const currentStep = getCurrentStep(stepToOpen, achData, bankAccount, hasTriedToUpgrade);

            // 'error' displays any string set as an error encountered during the add Verified BBA flow.
            // If we are fetching a bank account, clear the error to reset.
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                throttledDate, maxAttemptsReached, error: '', isPlaidDisabled,
            });
            goToWithdrawalAccountSetupStep(currentStep, achData);
        });
}

export default fetchFreePlanVerifiedBankAccount;
