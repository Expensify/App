import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import BankAccount from '../../models/BankAccount';
import {getPlaidBankAccounts} from '../Plaid';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import {getReimbursementAccountInSetup} from './store';
import * as API from '../../API';
import {setBankAccountFormValidationErrors, showBankAccountErrorModal, showBankAccountFormValidationError} from './errors';
import {translateLocal} from '../../translate';
import {getNextStepID, goToWithdrawalAccountSetupStep} from './navigation';

/**
 * @private
 * @param {Number} bankAccountID
 */
function setFreePlanVerifiedBankAccountID(bankAccountID) {
    API.SetNameValuePair({name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, value: bankAccountID});
}

/**
 * Create or update the bank account in db with the updated data.
 *
 * @param {Object} [data]
 *
 * // BankAccountStep
 * @param {Boolean} [data.acceptTerms]
 * @param {String} [data.accountNumber]
 * @param {String} [data.routingNumber]
 * @param {String} [data.setupType]
 * @param {String} [data.country]
 * @param {String} [data.currency]
 * @param {String} [data.fieldsType]
 * @param {String} [data.plaidAccessToken]
 * @param {String} [data.plaidAccountID]
 * @param {String} [data.ownershipType]
 * @param {Boolean} [data.isSavings]
 * @param {String} [data.addressName]
 *
 * // BeneficialOwnersStep
 * @param {Boolean} [data.ownsMoreThan25Percent]
 * @param {Boolean} [data.hasOtherBeneficialOwners]
 * @param {Boolean} [data.acceptTermsAndConditions]
 * @param {Boolean} [data.certifyTrueInformation]
 * @param {Array} [data.beneficialOwners]
 *
 * // CompanyStep
 * @param {String} [data.companyName]
 * @param {String} [data.addressStreet]
 * @param {String} [data.addressCity]
 * @param {String} [data.addressState]
 * @param {String} [data.addressZipCode]
 * @param {String} [data.companyPhone]
 * @param {String} [data.website]
 * @param {String} [data.companyTaxID]
 * @param {String} [data.incorporationType]
 * @param {String} [data.incorporationState]
 * @param {String} [data.incorporationDate]
 * @param {Boolean} [data.hasNoConnectionToCannabis]
 *
 * // RequestorStep
 * @param {String} [data.dob]
 * @param {String} [data.firstName]
 * @param {String} [data.lastName]
 * @param {String} [data.requestorAddressStreet]
 * @param {String} [data.requestorAddressCity]
 * @param {String} [data.requestorAddressState]
 * @param {String} [data.requestorAddressZipCode]
 * @param {String} [data.ssnLast4]
 * @param {String} [data.isControllingOfficer]
 * @param {Object} [data.onfidoData]
 * @param {Boolean} [data.isOnfidoSetupComplete]
 */
function setupWithdrawalAccount(data) {
    let nextStep;
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true, errorModalMessage: '', errors: null});

    const newACHData = {
        ...getReimbursementAccountInSetup(),
        ...data,

        // This param tells Web-Secure that this bank account is from NewDot so we can modify links back to the correct
        // app in any communications. It also will be used to provision a customer for the Expensify card automatically
        // once their bank account is successfully validated.
        enableCardAfterVerified: true,
    };

    if (data && !_.isUndefined(data.isSavings)) {
        newACHData.isSavings = Boolean(data.isSavings);
    }
    if (!newACHData.setupType) {
        newACHData.setupType = newACHData.plaidAccountID
            ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID
            : CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    }

    nextStep = newACHData.currentStep;

    // If we are setting up a Plaid account replace the accountNumber with the unmasked number
    if (data.plaidAccountID) {
        const unmaskedAccount = _.find(getPlaidBankAccounts(), bankAccount => (
            bankAccount.plaidAccountID === data.plaidAccountID
        ));
        newACHData.accountNumber = unmaskedAccount.accountNumber;
    }

    API.BankAccount_SetupWithdrawal(newACHData)
        .then((response) => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...newACHData}});
            const currentStep = newACHData.currentStep;
            let achData = lodashGet(response, 'achData', {});
            let error = lodashGet(achData, CONST.BANK_ACCOUNT.VERIFICATIONS.ERROR_MESSAGE);
            let isErrorHTML = false;
            const errors = {};

            if (response.jsonCode === 200 && !error) {
                // Save an NVP with the bankAccountID for this account. This is temporary since we are not showing lists
                // of accounts yet and must have some kind of record of which account is the one the user is trying to
                // set up for the free plan.
                if (achData.bankAccountID) {
                    setFreePlanVerifiedBankAccountID(achData.bankAccountID);
                }

                if (currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
                    const requestorResponse = lodashGet(
                        achData,
                        CONST.BANK_ACCOUNT.VERIFICATIONS.REQUESTOR_IDENTITY_ID,
                    );
                    if (newACHData.useOnfido) {
                        const onfidoResponse = lodashGet(
                            achData,
                            CONST.BANK_ACCOUNT.VERIFICATIONS.REQUESTOR_IDENTITY_ONFIDO,
                        );
                        const sdkToken = lodashGet(onfidoResponse, CONST.BANK_ACCOUNT.ONFIDO_RESPONSE.SDK_TOKEN);
                        if (sdkToken && !newACHData.isOnfidoSetupComplete
                                && onfidoResponse.status !== CONST.BANK_ACCOUNT.ONFIDO_RESPONSE.PASS
                        ) {
                            // Requestor Step still needs to run Onfido
                            achData.sdkToken = sdkToken;
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR, achData);
                            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                            return;
                        }
                    } else if (requestorResponse) {
                        // Don't go to next step if Requestor Step needs to ask some questions
                        let questions = lodashGet(requestorResponse, CONST.BANK_ACCOUNT.QUESTIONS.QUESTION) || [];
                        if (_.isEmpty(questions)) {
                            const differentiatorQuestion = lodashGet(
                                requestorResponse,
                                CONST.BANK_ACCOUNT.QUESTIONS.DIFFERENTIATOR_QUESTION,
                            );
                            if (differentiatorQuestion) {
                                questions = [differentiatorQuestion];
                            }
                        }
                        if (!_.isEmpty(questions)) {
                            achData.questions = questions;
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR, achData);
                            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                            return;
                        }
                    }
                }

                if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT) {
                    // Get an up-to-date bank account list so that we can allow the user to validate their newly
                    // generated bank account
                    API.Get({returnValueList: 'bankAccountList'})
                        .then((bankAccountListResponse) => {
                            const bankAccountJSON = _.findWhere(bankAccountListResponse.bankAccountList, {
                                bankAccountID: newACHData.bankAccountID,
                            });
                            const bankAccount = new BankAccount(bankAccountJSON);
                            achData = bankAccount.toACHData();
                            const needsToPassLatestChecks = achData.state === BankAccount.STATE.OPEN
                                && achData.needsToPassLatestChecks;
                            achData.bankAccountInReview = needsToPassLatestChecks
                                || achData.state === BankAccount.STATE.VERIFYING;

                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.VALIDATION, achData);
                            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                        });
                    return;
                }

                if ((currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION && newACHData.bankAccountInReview)
                    || currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE
                ) {
                    // Setup done!
                } else {
                    nextStep = getNextStepID();
                }
            } else {
                if (response.jsonCode === 666 || response.jsonCode === 404) {
                    // Since these specific responses can have an error message in html format with richer content, give priority to the html error.
                    error = response.htmlMessage || response.message;
                    isErrorHTML = Boolean(response.htmlMessage);
                }

                if (response.jsonCode === 402) {
                    if (response.message === CONST.BANK_ACCOUNT.ERROR.MISSING_ROUTING_NUMBER
                        || response.message === CONST.BANK_ACCOUNT.ERROR.MAX_ROUTING_NUMBER
                    ) {
                        errors.routingNumber = true;
                        achData.subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
                    } else if (response.message === CONST.BANK_ACCOUNT.ERROR.MISSING_INCORPORATION_STATE) {
                        error = translateLocal('bankAccount.error.incorporationState');
                    } else if (response.message === CONST.BANK_ACCOUNT.ERROR.MISSING_INCORPORATION_TYPE) {
                        error = translateLocal('bankAccount.error.companyType');
                    } else {
                        console.error(response.message);
                    }
                }
            }

            // Go to next step
            goToWithdrawalAccountSetupStep(nextStep, achData);

            if (_.size(errors)) {
                setBankAccountFormValidationErrors(errors);
                showBankAccountErrorModal();
            }
            if (error) {
                showBankAccountFormValidationError(error);
                showBankAccountErrorModal(error, isErrorHTML);
            }
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        })
        .catch((response) => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false, achData: {...newACHData}});
            console.error(response.stack);
            showBankAccountErrorModal(translateLocal('common.genericErrorMessage'));
        });
}

export default setupWithdrawalAccount;
