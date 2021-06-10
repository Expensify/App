import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Navigation from '../Navigation/Navigation';
import BankAccount from '../models/BankAccount';

/**
 * Gets the Plaid Link token used to initialize the Plaid SDK
 */
function fetchPlaidLinkToken() {
    API.Plaid_GetLinkToken()
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.PLAID_LINK_TOKEN, response.linkToken);
        });
}

/**
 * List of bank accounts. This data should not be stored in Onyx since it contains unmasked PANs.
 *
 * @private
 */
let plaidBankAccounts = [];
let bankName = '';
let plaidAccessToken = '';

/**
 * @param {String} publicToken
 * @param {String} bank
 */
function getPlaidBankAccounts(publicToken, bank) {
    bankName = bank;

    Onyx.merge(ONYXKEYS.PLAID_BANK_ACCOUNTS, {loading: true});
    API.BankAccount_Get({
        publicToken,
        allowDebit: false,
        bank,
    })
        .then((response) => {
            plaidAccessToken = response.plaidAccessToken;
            plaidBankAccounts = response.accounts;
            Onyx.merge(ONYXKEYS.PLAID_BANK_ACCOUNTS, {
                error: {
                    title: response.title,
                    message: response.message,
                },
                loading: false,
                accounts: _.map(plaidBankAccounts, account => ({
                    ...account,
                    accountNumber: Str.maskPAN(account.accountNumber),
                })),
            });
        });
}

/**
 * We clear these out of storage once we are done with them so the user must re-enter Plaid credentials upon returning.
 */
function clearPlaidBankAccounts() {
    plaidBankAccounts = [];
    bankName = '';
    Onyx.set(ONYXKEYS.PLAID_BANK_ACCOUNTS, {});
}

/**
 * Adds a bank account via Plaid
 *
 * @param {Object} account
 * @param {String} password
 * @param {String} plaidLinkToken
 */
function addPersonalBankAccount(account, password, plaidLinkToken) {
    const unmaskedAccount = _.find(plaidBankAccounts, bankAccount => (
        bankAccount.plaidAccountID === account.plaidAccountID
    ));
    API.BankAccount_Create({
        accountNumber: unmaskedAccount.accountNumber,
        addressName: unmaskedAccount.addressName,
        allowDebit: false,
        confirm: false,
        isSavings: unmaskedAccount.isSavings,
        password,
        routingNumber: unmaskedAccount.routingNumber,
        setupType: 'plaid',
        additionalData: JSON.stringify({
            useOnFido: false,
            policyID: '',
            plaidLinkToken,
            isInSetup: true,
            bankAccountInReview: null,
            currentStep: 'AccountOwnerInformationStep',
            bankName,
            plaidAccountID: unmaskedAccount.plaidAccountID,
            ownershipType: '',
            acceptTerms: true,
            country: 'US',
            currency: CONST.CURRENCY.USD,
            fieldsType: 'local',
            plaidAccessToken,
        }),
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                alert('There was a problem adding this bank account.');
                return;
            }

            alert('Bank account added successfully.');
        });
}

/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 */
function fetchOnfidoToken() {
    // Use Onyx.set() since we are resetting the Onfido flow completely.
    Onyx.set(ONYXKEYS.WALLET_ONFIDO, {loading: true});
    API.Wallet_GetOnfidoSDKToken()
        .then((response) => {
            const apiResult = lodashGet(response, ['requestorIdentityOnfido', 'apiResult'], {});
            Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {
                applicantID: apiResult.applicantID,
                sdkToken: apiResult.sdkToken,
                loading: false,
                hasAcceptedPrivacyPolicy: true,
            });
        })
        .catch(() => Onyx.set(ONYXKEYS.WALLET_ONFIDO, {loading: false, error: CONST.WALLET.ERROR.UNEXPECTED}));
}

/**
 * Privately used to update the additionalDetails object in Onyx (which will have various effects on the UI)
 *
 * @param {Boolean} loading whether we are making the API call to validate the user's provided personal details
 * @param {String[]} [errorFields] an array of field names that should display errors in the UI
 * @param {String} [additionalErrorMessage] an additional error message to display in the UI
 * @private
 */
function setAdditionalDetailsStep(loading, errorFields = null, additionalErrorMessage = '') {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {loading, errorFields, additionalErrorMessage});
}

/**
 * This action can be called repeatedly with different steps until an Expensify Wallet has been activated.
 *
 * Possible steps:
 *
 *     - OnfidoStep - Creates an identity check by calling Onfido's API (via Web-Secure) with data returned from the SDK
 *     - AdditionalDetailsStep - Validates a user's provided details against a series of checks
 *     - TermsStep - Ensures that a user has agreed to all of the terms and conditions
 *
 * The API will always return the updated userWallet in the response as a convenience so we can avoid calling
 * Get&returnValueList=userWallet after we call Wallet_Activate.
 *
 * @param {String} currentStep
 * @param {Object} parameters
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {Object} [parameters.personalDetails] - JSON string
 * @param {Boolean} [parameters.hasAcceptedTerms]
 */
function activateWallet(currentStep, parameters) {
    let personalDetails;
    let onfidoData;
    let hasAcceptedTerms;

    if (!_.contains(CONST.WALLET.STEP, currentStep)) {
        throw new Error('Invalid currentStep passed to activateWallet()');
    }

    if (currentStep === CONST.WALLET.STEP.ONFIDO) {
        onfidoData = parameters.onfidoData;
        Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: '', loading: true});
    } else if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
        setAdditionalDetailsStep(true);

        // Personal details are heavily validated on the API side. We will only do a quick check to ensure the values
        // exist in some capacity and then stringify them.
        const errorFields = _.reduce(CONST.WALLET.REQUIRED_ADDITIONAL_DETAILS_FIELDS, (missingFields, fieldName) => (
            !personalDetails[fieldName] ? [...missingFields, fieldName] : missingFields
        ), []);

        if (!_.isEmpty(errorFields)) {
            setAdditionalDetailsStep(false, errorFields);
            return;
        }

        personalDetails = JSON.stringify(parameters.personalDetails);
    } else if (currentStep === CONST.WALLET.STEP.TERMS) {
        hasAcceptedTerms = parameters.hasAcceptedTerms;
        Onyx.merge(ONYXKEYS.WALLET_TERMS, {loading: true});
    }

    API.Wallet_Activate({
        currentStep,
        personalDetails,
        onfidoData,
        hasAcceptedTerms,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                if (currentStep === CONST.WALLET.STEP.ONFIDO) {
                    Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: response.message, loading: false});
                    return;
                }

                if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                    if (response.title === CONST.WALLET.ERROR.MISSING_FIELD) {
                        setAdditionalDetailsStep(false, response.data.fieldNames);
                        return;
                    }

                    const errorTitles = [
                        CONST.WALLET.ERROR.IDENTITY_NOT_FOUND,
                        CONST.WALLET.ERROR.INVALID_SSN,
                        CONST.WALLET.ERROR.UNEXPECTED,
                        CONST.WALLET.ERROR.UNABLE_TO_VERIFY,
                    ];

                    if (errorTitles.includes(response.title)) {
                        setAdditionalDetailsStep(false, null, response.message);
                        return;
                    }

                    setAdditionalDetailsStep(false);
                    return;
                }

                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);

            if (currentStep === CONST.WALLET.STEP.ONFIDO) {
                Onyx.merge(ONYXKEYS.WALLET_ONFIDO, {error: '', loading: true});
            } else if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                setAdditionalDetailsStep(false);
            } else if (currentStep === CONST.WALLET.STEP.TERMS) {
                Onyx.merge(ONYXKEYS.WALLET_TERMS, {loading: false});
            }
        });
}

/**
 * Fetches information about a user's Expensify Wallet
 *
 * @typedef {Object} UserWallet
 * @property {Number} availableBalance
 * @property {Number} currentBalance
 * @property {String} currentStep - used to track which step of the "activate wallet" flow a user is in
 * @property {('SILVER'|'GOLD')} status - will be GOLD when fully activated. SILVER is able to recieve funds only.
 */
function fetchUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);
        });
}

/**
 * @private
 * @param {String} stepID
 * @returns {String}
 */
function getNextWithdrawalAccountSetupStep(stepID) {
    const withdrawalAccountSteps = [
        {
            id: 'BankAccountStep',
            title: 'Bank Account',
        },
        {
            id: 'CompanyStep',
            title: 'Company Information',
        },
        {
            id: 'RequestorStep',
            title: 'Requestor Information',
        },
        {
            id: 'ACHContractStep',
            title: 'Beneficial Owners',
        },
        {
            id: 'ValidationStep',
            title: 'Validate',
        },
        {
            id: 'EnableStep',
            title: 'Enable',
        },
    ];

    const index = _.findIndex(withdrawalAccountSteps, step => step.id === stepID);
    const nextStepIndex = Math.min(index + 1, withdrawalAccountSteps.length - 1);
    return lodashGet(withdrawalAccountSteps, [nextStepIndex, 'id']);
}

/**
 * @param {String} stepID
 * @param {Object} previousACHData
 * @param {Object} newACHData
 * @returns {Object}
 */
function goToWithdrawlAccountStep(stepID, previousACHData, newACHData = {}) {
    // @TODO I'm lost on how to migrate this one... seems like kind of tacked on mutations of the this.achData...
    // I would like to maybe get rid of this.achData as a concept here... maybe the achData belongs in Onyx instead
    // there's some weird stuff happening like setting the domain limit locally and the logic is not easy to follow yet.


    const modifiedPreviousACHData = {...previousACHData};

    // If we go back to Requestor Step, reset any validation and previously answered questions from expectID.
    if (!modifiedPreviousACHData.useOnfido && stepID === 'RequestorStep') {
        delete modifiedPreviousACHData.questions;
        delete modifiedPreviousACHData.answers;
        if (_.has(modifiedPreviousACHData, 'verifications.externalApiResponses')) {
            delete modifiedPreviousACHData.verifications.externalApiResponses.requestorIdentityID;
            delete modifiedPreviousACHData.verifications.externalApiResponses.requestorIdentityKBA;
        }
    }

    // When going from companyStep to bankAccountStep, show the manual form instead of Plaid
    if (modifiedPreviousACHData.currentStep === 'CompanyStep' && stepID === 'BankAccountStep') {
        modifiedPreviousACHData.subStep = 'manual';
    }

    _.extend(modifiedPreviousACHData, newACHData, {currentStep: stepID});

    if (stepID === 'EnableStep') {
        // Calculate the Expensify Card limit associated with the bankAccountID
        API.BankAccount_CalculateDomainLimit({
            bankAccountID: modifiedPreviousACHData.bankAccountID,
            useExistingDomainLimitIfAvailable: true,
        })
            .done((response) => {
                // @TODO this doesn't really work because we'd have already returned this object - not entirely sure if
                // we need to set a domain limit here anyway as the user can't modify it in E.cash
                modifiedPreviousACHData.domainLimit = response.domainLimit || 3000000;
            });
    } else {
        // previously we called refreshView() - but we probably will not do that in the E.cash version and will instead
        // call Navigation.navigate() and just go to the view... I think probably we can kill this method also and just
        // do this in setupWithdrawalAccount
        Navigation.navigate(stepID, modifiedPreviousACHData);
    }

    return modifiedPreviousACHData;
}

/**
 * @param {Object} previousACHData
 * @param {Object} data
 * @returns {Object}
 */
function setupWithdrawalAccount(previousACHData, data) {
    // In Web-Secure this is referring to this.achData - still need to look at how that works...
    const achData = _.extend(previousACHData, {
        ...data,
        isSavings: data
            && !_.isUndefined(data.isSavings)
            && Boolean(data.isSavings),
    });

    if (!achData.setupType) {
        // @TODO use CONST
        achData.setupType = achData.plaidAccountID ? 'plaid' : 'manual';
    }

    let nextStep = achData.currentStep;

    API.BankAccount_SetupWithdrawal(achData)
        .finally((response) => {
            const currentStep = achData.currentStep;
            let responseACHData = response.achData;
            let error = lodashGet(responseACHData, 'verifications.errorMessage');

            if (response.jsonCode === 200 && !error) {
                // Show warning if another account already set up this bank account and promote share
                if (response.existingOwners) {
                    // @TODO show this error
                    return;
                }

                // @TODO use CONST for step name
                if (currentStep === 'RequestorStep') {
                    // @TODO use CONST
                    const requestorResponse = lodashGet(
                        responseACHData,
                        'verifications.externalApiResponses.requestorIdentityID',
                    );

                    if (responseACHData.useOnFido) {
                        const onfidoResponse = lodashGet(
                            responseACHData, 'verifications.externalApiResponses.requstorIdentityOnfido',
                        );
                        const sdkToken = lodashGet(onfidoResponse, 'apiResult.sdkToken');
                        if (sdkToken && !achData.isOnfidoSetupComplete && onfidoResponse.status !== 'pass') {
                            // Requestor Step still needs to run Onfido
                            responseACHData.sdkToken = sdkToken;

                            // Navigate to "RequestorStep" with responseACHData
                            Navigation.navigate('/bank-account/requestor', responseACHData);
                            return;
                        }
                    } else if (requestorResponse) {
                        // Don't go to next step if Requestor Step needs to ask some questions
                        let questions = _.get(requestorResponse, 'apiResult.questions.question') || [];
                        if (_.isEmpty(questions)) {
                            const differentiatorQuestion = lodashGet(
                                requestorResponse,
                                'apiResult.differentiator-question',
                            );
                            if (differentiatorQuestion) {
                                questions = [differentiatorQuestion];
                            }
                        }
                        if (!_.isEmpty(questions)) {
                            responseACHData.questions = questions;
                            Navigation.navigate('/bank-account/requestor', responseACHData);
                            return;
                        }
                    }
                }

                // @TODO figure out why this is returning a promise...
                if (currentStep === 'ACHContractStep') {
                    // Get an up-to-date bank account list so that we can allow the user to validate their newly
                    // generated bank account
                    return API.Get({returnValueList: 'bankAccountList'}, true)
                        .then((json) => {
                            const bankAccount = new BankAccount(
                                _.findWhere(json.bankAccountList, {bankAccountID: achData.bankAccountID}),
                            );
                            responseACHData = bankAccount.toACHData();
                            const needsToPassLatestChecks = responseACHData.state === BankAccount.STATE.OPEN
                                && responseACHData.needsToPassLatestChecks;
                            responseACHData.bankAccountInReview = needsToPassLatestChecks
                                || responseACHData.state === BankAccount.STATE.VERIFYING;
                            Navigation.navigate('/bank-account/validation', responseACHData);
                        });
                }

                if ((currentStep === 'ValidationStep' && achData.bankAccountInReview)
                    || currentStep === 'EnableStep'
                ) {
                    // We're done. Close the view.
                    // @TODO actually close it
                } else {
                    nextStep = getNextWithdrawalAccountSetupStep(achData);
                }
            } else {
                if (response.jsonCode === 666) {
                    error = response.message;
                }
                if (lodashGet(responseACHData, 'verifications.throttled')) {
                    responseACHData.disableFields = true;
                }
            }

            goToWithdrawlAccountStep(nextStep, achData, responseACHData);

            if (error) {
                // @TODO Show the error somehow
            }
        });

    return achData;
}

export {
    fetchPlaidLinkToken,
    addPersonalBankAccount,
    getPlaidBankAccounts,
    clearPlaidBankAccounts,
    fetchOnfidoToken,
    activateWallet,
    fetchUserWallet,
    setupWithdrawalAccount,
};
