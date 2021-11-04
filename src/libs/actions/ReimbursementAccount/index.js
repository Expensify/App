import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashHas from 'lodash/has';
import lodashGet from 'lodash/get';
import * as API from '../../API';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import {translateLocal} from '../../translate';
import BankAccount from '../../models/BankAccount';
import Growl from '../../Growl';
import {getPlaidBankAccounts} from '../Plaid';
import {getReimbursementAccountInSetup, getCredentials, getReimbursementAccountWorkspaceID} from './store';

/**
 * @private
 * @param {Number} bankAccountID
 */
function setFreePlanVerifiedBankAccountID(bankAccountID) {
    API.SetNameValuePair({name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, value: bankAccountID});
}

/**
 * Navigate to a specific step in the VBA flow
 *
 * @param {String} stepID
 * @param {Object} achData
 */
function goToWithdrawalAccountSetupStep(stepID, achData) {
    const newACHData = {...getReimbursementAccountInSetup()};

    // If we go back to Requestor Step, reset any validation and previously answered questions from expectID.
    if (!newACHData.useOnfido && stepID === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
        delete newACHData.questions;
        delete newACHData.answers;
        if (lodashHas(newACHData, CONST.BANK_ACCOUNT.VERIFICATIONS.EXTERNAL_API_RESPONSES)) {
            delete newACHData.verifications.externalApiResponses.requestorIdentityID;
            delete newACHData.verifications.externalApiResponses.requestorIdentityKBA;
        }
    }

    // When going back to the BankAccountStep from the Company Step, show the manual form instead of Plaid
    if (newACHData.currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY && stepID === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT) {
        newACHData.subStep = CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
    }

    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...newACHData, ...achData, currentStep: stepID}});
}

const WITHDRAWAL_ACCOUNT_STEPS = [
    {
        id: CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT,
        title: 'Bank Account',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.COMPANY,
        title: 'Company Information',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.REQUESTOR,
        title: 'Requestor Information',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT,
        title: 'Beneficial Owners',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.VALIDATION,
        title: 'Validate',
    },
    {
        id: CONST.BANK_ACCOUNT.STEP.ENABLE,
        title: 'Enable',
    },
];

/**
 * Get step position in the array
 * @private
 * @param {String} stepID
 * @return {Number}
 */
function getIndexByStepID(stepID) {
    return _.findIndex(WITHDRAWAL_ACCOUNT_STEPS, step => step.id === stepID);
}

/**
 * Get next step ID
 * @param {String} [stepID]
 * @return {String}
 */
function getNextStepID(stepID) {
    const nextStepIndex = Math.min(
        getIndexByStepID(stepID || getReimbursementAccountInSetup().currentStep) + 1,
        WITHDRAWAL_ACCOUNT_STEPS.length - 1,
    );
    return lodashGet(WITHDRAWAL_ACCOUNT_STEPS, [nextStepIndex, 'id'], CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
}

/**
 * Set the current fields with errors.
 *
 * @param {String} errors
 */
function setBankAccountFormValidationErrors(errors) {
    // We set 'errors' to null first because we don't have a way yet to replace a specific property like 'errors' without merging it
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors: null});
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errors});
}

/**
 * Show error modal and optionally a specific error message
 *
 * @param {String} errorModalMessage The error message to be displayed in the modal's body.
 * @param {Boolean} isErrorModalMessageHtml if @errorModalMessage is in html format or not
 */
function showBankAccountErrorModal(errorModalMessage = null, isErrorModalMessageHtml = false) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {errorModalMessage, isErrorModalMessageHtml});
}

/**
 * Set the current error message.
 *
 * @param {String} error
 */
function showBankAccountFormValidationError(error) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {error});
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

/**
 * @param {Object} achData
 * @returns {String}
 */
function getNextStepToComplete(achData) {
    if (achData.currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR && !achData.isOnfidoSetupComplete) {
        return CONST.BANK_ACCOUNT.STEP.REQUESTOR;
    }

    return getNextStepID(achData.currentStep);
}

/**
 * Fetch the bank account currently being set up by the user for the free plan if it exists.
 *
 * @param {String} [stepToOpen]
 * @param {String} [localBankAccountState]
 */
function fetchFreePlanVerifiedBankAccount(stepToOpen, localBankAccountState) {
    // Remember which account BankAccountStep subStep the user had before so we can set it later
    const subStep = lodashGet(getReimbursementAccountInSetup(), 'subStep', '');
    const initialData = {loading: true, error: ''};

    // Some UI needs to know the bank account state during the loading process, so we are keeping it in Onyx if passed
    if (localBankAccountState) {
        initialData.achData = {state: localBankAccountState};
    }

    // We are using set here since we will rely on data from the server (not local data) to populate the VBA flow
    // and determine which step to navigate to.
    Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, initialData);
    let bankAccountID;

    API.Get({
        returnValueList: 'nameValuePairs',
        name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
    })
        .then((response) => {
            bankAccountID = lodashGet(response, ['nameValuePairs', CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
            ], '');
            const failedValidationAttemptsName = CONST.NVP.FAILED_BANK_ACCOUNT_VALIDATIONS_PREFIX + bankAccountID;

            // Now that we have the bank account. Lets grab the rest of the bank info we need
            API.Get({
                returnValueList: 'nameValuePairs, bankAccountList',
                nvpNames: [
                    failedValidationAttemptsName,
                    CONST.NVP.KYC_MIGRATION,
                    CONST.NVP.ACH_DATA_THROTTLED,
                    CONST.NVP.BANK_ACCOUNT_GET_THROTTLED,
                ].join(),
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

                    // Next we'll build the achData and save it to Onyx
                    // If the user is already setting up a bank account we will continue the flow for them
                    let currentStep = getReimbursementAccountInSetup().currentStep;
                    const achData = bankAccount ? bankAccount.toACHData() : {};
                    if (!stepToOpen && achData.currentStep) {
                        // eslint-disable-next-line no-use-before-define
                        currentStep = getNextStepToComplete(achData);
                    }

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
                                const hasTriedToUpgrade = bankAccount.getDateSigned()
                                    > (kycVerificationsMigration || '2020-01-13');
                                currentStep = hasTriedToUpgrade
                                    ? CONST.BANK_ACCOUNT.STEP.VALIDATION : CONST.BANK_ACCOUNT.STEP.COMPANY;
                                achData.bankAccountInReview = hasTriedToUpgrade;
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

                    // 'error' displays any string set as an error encountered during the add Verified BBA flow.
                    // If we are fetching a bank account, clear the error to reset.
                    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
                        throttledDate, maxAttemptsReached, error: '', isPlaidDisabled,
                    });
                    goToWithdrawalAccountSetupStep(currentStep, achData);
                })
                .finally(() => {
                    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                });
        });
}

/**
 * Reset user's reimbursement account. This will delete the bank account.
 */
function resetFreePlanBankAccount() {
    const bankAccountID = lodashGet(getReimbursementAccountInSetup(), 'bankAccountID');
    if (!bankAccountID) {
        throw new Error('Missing bankAccountID when attempting to reset free plan bank account');
    }
    if (!getCredentials() || !getCredentials().login) {
        throw new Error('Missing credentials when attempting to reset free plan bank account');
    }

    // Create a copy of the reimbursementAccount data since we are going to optimistically wipe it so the UI changes quickly.
    // If the API request fails we will set this data back into Onyx.
    const previousACHData = {...getReimbursementAccountInSetup()};
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: null, shouldShowResetModal: false});
    API.DeleteBankAccount({bankAccountID, ownerEmail: getCredentials().login})
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Unable to delete bank account so we restore the bank account details
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: previousACHData});
                Growl.error('Sorry we were unable to delete this bank account. Please try again later');
                return;
            }

            // Clear reimbursement account, draft user input, and the bank account list
            Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {});
            Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, null);
            Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, []);

            // Clear the NVP for the bank account so the user can add a new one
            API.SetNameValuePair({name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, value: ''});
        });
}

/**
 * @param {Number} bankAccountID
 * @param {String} validateCode
 */
function validateBankAccount(bankAccountID, validateCode) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true});

    API.BankAccount_Validate({bankAccountID, validateCode})
        .then((response) => {
            if (response.jsonCode === 200) {
                Onyx.set(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, null);
                API.User_IsUsingExpensifyCard()
                    .then(({isUsingExpensifyCard}) => {
                        const reimbursementAccount = {
                            loading: false,
                            error: '',
                            achData: {state: BankAccount.STATE.OPEN},
                        };

                        reimbursementAccount.achData.currentStep = CONST.BANK_ACCOUNT.STEP.ENABLE;
                        Onyx.merge(ONYXKEYS.USER, {isUsingExpensifyCard});
                        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, reimbursementAccount);
                    });
                return;
            }

            // User has input the validate code incorrectly many times so we will return early in this case and not let them enter the amounts again.
            if (response.message === CONST.BANK_ACCOUNT.ERROR.MAX_VALIDATION_ATTEMPTS_REACHED) {
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false, maxAttemptsReached: true});
                return;
            }

            // If the validation amounts entered were incorrect, show specific error
            if (response.message === CONST.BANK_ACCOUNT.ERROR.INCORRECT_VALIDATION_AMOUNTS) {
                showBankAccountErrorModal(translateLocal('bankAccount.error.validationAmounts'));
                Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
                return;
            }

            // We are generically showing any other backend errors that might pop up in the validate step
            showBankAccountErrorModal(response.message);
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
}

/**
 * Set the current sub step in first step of adding withdrawal bank account
 *
 * @param {String} subStep - One of {CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL, CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID, null}
 */
function setBankAccountSubStep(subStep) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {subStep}});
}

function hideBankAccountErrors() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {error: '', errors: null});
}

function setWorkspaceIDForReimbursementAccount(workspaceID) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT_WORKSPACE_ID, workspaceID);
}

/**
 * @param {Object} bankAccountData
 */
function updateReimbursementAccountDraft(bankAccountData) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT, bankAccountData);
}

/**
 * Triggers a modal to open allowing the user to reset their bank account
 */
function requestResetFreePlanBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {shouldShowResetModal: true});
}

/**
 * Hides modal allowing the user to reset their bank account
 */
function cancelResetFreePlanBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {shouldShowResetModal: false});
}

export {
    setupWithdrawalAccount,
    fetchFreePlanVerifiedBankAccount,
    goToWithdrawalAccountSetupStep,
    showBankAccountErrorModal,
    showBankAccountFormValidationError,
    setBankAccountFormValidationErrors,
    resetFreePlanBankAccount,
    validateBankAccount,
    setBankAccountSubStep,
    hideBankAccountErrors,
    setWorkspaceIDForReimbursementAccount,
    updateReimbursementAccountDraft,
    requestResetFreePlanBankAccount,
    cancelResetFreePlanBankAccount,
};
