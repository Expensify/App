import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Log from '../../Log';
import BankAccount from '../../models/BankAccount';
import * as Plaid from '../Plaid';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import * as store from './store';
import * as API from '../../API';
import * as errors from './errors';
import * as Localize from '../../Localize';
import * as navigation from './navigation';

/**
 * @private
 * @param {Number} bankAccountID
 */
function setFreePlanVerifiedBankAccountID(bankAccountID) {
    API.SetNameValuePair({name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, value: bankAccountID});
}

/**
 * @param {Object} updatedACHData
 */
function getBankAccountListAndGoToValidateStep(updatedACHData) {
    // Get an up-to-date bank account list so that we can allow the user to validate their newly
    // generated bank account
    API.Get({returnValueList: 'bankAccountList'})
        .then((bankAccountListResponse) => {
            const bankAccountJSON = _.findWhere(bankAccountListResponse.bankAccountList, {
                bankAccountID: updatedACHData.bankAccountID,
            });
            const bankAccount = new BankAccount(bankAccountJSON);
            const achData = bankAccount.toACHData();
            const needsToPassLatestChecks = achData.state === BankAccount.STATE.OPEN
                && achData.needsToPassLatestChecks;
            achData.bankAccountInReview = needsToPassLatestChecks
                || achData.state === BankAccount.STATE.VERIFYING;

            navigation.goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.VALIDATION, achData);
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
}

/**
 * @param {Object} response
 * @returns {Boolean}
 */
function hasAccountOrRoutingError(response) {
    return response.message === CONST.BANK_ACCOUNT.ERROR.MISSING_ROUTING_NUMBER
        || response.message === CONST.BANK_ACCOUNT.ERROR.MAX_ROUTING_NUMBER;
}

/**
 * @param {Object} updatedACHData
 * @returns {String}
 */
function getNextStep(updatedACHData) {
    const currentStep = updatedACHData.currentStep;
    if (currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE) {
        return currentStep;
    }

    if (currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION && updatedACHData.bankAccountInReview) {
        return currentStep;
    }

    return navigation.getNextStepID();
}

/**
 *
 * @param {Object} response
 * @param {String} verificationsError
 * @param {Object} updatedACHData
 */
function showSetupWithdrawalAccountErrors(response, verificationsError, updatedACHData) {
    let error = verificationsError;
    let isErrorHTML = false;
    const responseACHData = lodashGet(response, 'achData', {});

    if (response.jsonCode === 666 || response.jsonCode === 404) {
        // Since these specific responses can have an error message in html format with richer content, give priority to the html error.
        error = response.htmlMessage || response.message;
        isErrorHTML = Boolean(response.htmlMessage);
    }

    if (response.jsonCode === 402) {
        if (hasAccountOrRoutingError(response)) {
            errors.setBankAccountFormValidationErrors({routingNumber: true});
            errors.showBankAccountErrorModal();
        } else if (response.message === CONST.BANK_ACCOUNT.ERROR.MISSING_INCORPORATION_STATE) {
            error = Localize.translateLocal('bankAccount.error.incorporationState');
        } else if (response.message === CONST.BANK_ACCOUNT.ERROR.MISSING_INCORPORATION_TYPE) {
            error = Localize.translateLocal('bankAccount.error.companyType');
        } else {
            console.error(response.message);
        }
    }

    if (error) {
        errors.showBankAccountFormValidationError(error);
        errors.showBankAccountErrorModal(error, isErrorHTML);
    }

    const nextStep = response.jsonCode === 200 && !error ? getNextStep(updatedACHData) : updatedACHData.currentStep;
    navigation.goToWithdrawalAccountSetupStep(nextStep, {
        ...responseACHData,
        subStep: hasAccountOrRoutingError(response) ? CONST.BANK_ACCOUNT.SUBSTEP.MANUAL : responseACHData.subStep,
    });
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
}

/**
 * @param {Object} data
 * @returns {Object}
 */
function mergeParamsWithLocalACHData(data) {
    const updatedACHData = {
        ...store.getReimbursementAccountInSetup(),
        ...data,

        // This param tells Web-Secure that this bank account is from NewDot so we can modify links back to the correct
        // app in any communications. It also will be used to provision a customer for the Expensify card automatically
        // once their bank account is successfully validated.
        enableCardAfterVerified: true,
    };

    if (data && !_.isUndefined(data.isSavings)) {
        updatedACHData.isSavings = Boolean(data.isSavings);
    }
    if (!updatedACHData.setupType) {
        updatedACHData.setupType = updatedACHData.plaidAccountID
            ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID
            : CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    }

    // If we are setting up a Plaid account replace the accountNumber with the unmasked number
    if (data.plaidAccountID) {
        const unmaskedAccount = _.find(Plaid.getPlaidBankAccounts(), bankAccount => (
            bankAccount.plaidAccountID === data.plaidAccountID
        ));
        updatedACHData.accountNumber = unmaskedAccount.accountNumber;
    }
    return updatedACHData;
}

/**
 * Create or update the bank account in db with the updated data.
 *
 * This action is called by several steps in the Verified Bank Account flow and is coupled tightly with SetupWithdrawalAccount in Auth
 * Each time the command is called the state of the bank account progresses a bit further and when handling the response we redirect
 * to the appropriate next step in the flow.
 *
 * @param {Object} params
 *
 * // BankAccountStep
 * @param {Boolean} [params.acceptTerms]
 * @param {String} [params.accountNumber]
 * @param {String} [params.routingNumber]
 * @param {String} [params.setupType]
 * @param {String} [params.country]
 * @param {String} [params.currency]
 * @param {String} [params.fieldsType]
 * @param {String} [params.plaidAccessToken]
 * @param {String} [params.plaidAccountID]
 * @param {String} [params.ownershipType]
 * @param {Boolean} [params.isSavings]
 * @param {String} [params.addressName]
 *
 * // CompanyStep
 * @param {String} [params.companyName]
 * @param {String} [params.addressStreet]
 * @param {String} [params.addressCity]
 * @param {String} [params.addressState]
 * @param {String} [params.addressZipCode]
 * @param {String} [params.companyPhone]
 * @param {String} [params.website]
 * @param {String} [params.companyTaxID]
 * @param {String} [params.incorporationType]
 * @param {String} [params.incorporationState]
 * @param {String} [params.incorporationDate]
 * @param {Boolean} [params.hasNoConnectionToCannabis]
 *
 * // RequestorStep
 * @param {String} [params.dob]
 * @param {String} [params.firstName]
 * @param {String} [params.lastName]
 * @param {String} [params.requestorAddressStreet]
 * @param {String} [params.requestorAddressCity]
 * @param {String} [params.requestorAddressState]
 * @param {String} [params.requestorAddressZipCode]
 * @param {String} [params.ssnLast4]
 * @param {String} [params.isControllingOfficer]
 * @param {Object} [params.onfidoData]
 * @param {Boolean} [params.isOnfidoSetupComplete]
 *
 * // ACHContractStep
 * @param {Boolean} [params.ownsMoreThan25Percent]
 * @param {Boolean} [params.hasOtherBeneficialOwners]
 * @param {Boolean} [params.acceptTermsAndConditions]
 * @param {Boolean} [params.certifyTrueInformation]
 * @param {Array} [params.beneficialOwners]
 */
function setupWithdrawalAccount(params) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true, errorModalMessage: '', errors: null});
    const updatedACHData = mergeParamsWithLocalACHData(params);
    API.BankAccount_SetupWithdrawal(updatedACHData)
        .then((response) => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...updatedACHData}});
            const currentStep = updatedACHData.currentStep;
            const responseACHData = lodashGet(response, 'achData', {});
            const verificationsError = lodashGet(responseACHData, CONST.BANK_ACCOUNT.VERIFICATIONS.ERROR_MESSAGE);
            if (response.jsonCode !== 200 || verificationsError) {
                showSetupWithdrawalAccountErrors(response, verificationsError, updatedACHData);
                return;
            }

            // Save an NVP with the bankAccountID for this account. This is temporary since we are not showing lists
            // of accounts yet and must have some kind of record of which account is the one the user is trying to
            // set up for the free plan.
            if (responseACHData.bankAccountID) {
                setFreePlanVerifiedBankAccountID(responseACHData.bankAccountID);
            }

            const nextStep = getNextStep(updatedACHData);

            // Some steps require several substeps based on some data.
            // This logic is done php side: when we need to display a specific step with specific data, php adds them in the response in nextStepValues
            // Example 1: When forcing manual step after adding Chase bank account via Plaid, so we can ask for the real numbers instead of the plaid substitutes
            // Example 2: When on the requestor step, showing Onfido view after submitting the identity and retrieving the sdkToken
            if (_.has(responseACHData, 'nextStepValues')) {
                navigation.goToWithdrawalAccountSetupStep(lodashGet(responseACHData, 'nextStepValues.currentStep') || nextStep, {
                    ...updatedACHData,
                    ...(_.omit(responseACHData, 'nextStepValues')),
                    ...responseACHData.nextStepValues,
                });
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                return;
            }

            if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT) {
                getBankAccountListAndGoToValidateStep(responseACHData);
                return;
            }

            // Go to next step
            if (_.isEmpty(responseACHData)) {
                Log.info('[SetupWithdrawalAccount] No achData in response. Navigating to next step based on currently stored values.', 0, {nextStep});
                navigation.goToWithdrawalAccountSetupStep(nextStep, updatedACHData);
            } else {
                navigation.goToWithdrawalAccountSetupStep(nextStep, responseACHData);
            }
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        })
        .catch((response) => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false, achData: {...updatedACHData}});
            console.error(response.stack);
            errors.showBankAccountErrorModal(Localize.translateLocal('common.genericErrorMessage'));
        });
}

export default setupWithdrawalAccount;
