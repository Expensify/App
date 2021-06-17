import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import BankAccount from '../models/BankAccount';
import promiseAllSettled from '../promiseAllSettled';
import Growl from '../Growl';

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
function clearPlaidBankAccountsAndToken() {
    plaidBankAccounts = [];
    bankName = '';
    Onyx.set(ONYXKEYS.PLAID_BANK_ACCOUNTS, {});
    Onyx.set(ONYXKEYS.PLAID_LINK_TOKEN, null);
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

let previousACHData = {};
Onyx.connect({
    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    callback: (val) => {
        previousACHData = lodashGet(val, 'achData', {});
    },
});

/**
 * Navigate to a specific step in the VBA flow
 *
 * @param {String} stepID
 * @param {Object} achData
 */
function goToWithdrawalAccountSetupStep(stepID, achData) {
    const newACHData = {...previousACHData};

    // If we go back to Requestor Step, reset any validation and previously answered questions from expectID.
    if (!newACHData.useOnfido && stepID === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
        delete newACHData.questions;
        delete newACHData.answers;
        if (lodashHas(achData, CONST.BANK_ACCOUNT.VERIFICATIONS.EXTERNAL_API_RESPONSES)) {
            delete newACHData.verifications.externalApiResponses.requestorIdentityID;
            delete newACHData.verifications.externalApiResponses.requestorIdentityKBA;
        }
    }

    // When going back to the BankAccountStep from the Company Step, show the manual form instead of Plaid
    if (newACHData.currentStep === CONST.BANK_ACCOUNT.STEP.COMPANY && stepID === CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT) {
        newACHData.subStep = 'manual';
    }

    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...newACHData, ...achData, currentStep: stepID}});
}

/**
 * Fetch the bank account currently being set up by the user for the free plan if it exists.
 */
function fetchFreePlanVerifiedBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true});
    promiseAllSettled([
        API.Get({
            returnValueList: 'nameValuePairs',
            name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
        }),
        API.Get({
            returnValueList: 'nameValuePairs',
            name: 'expensify_migration_2020_04_28_RunKycVerifications',
        }),
        API.Get({
            returnValueList: 'nameValuePairs',
            name: CONST.NVP.ACH_DATA_THROTTLED,
        }),
        API.Get({returnValueList: 'bankAccountList'}),
    ])
        .then(([
            freePlanBankAccountIDResponse,
            kycVerificationsMigrationResponse,
            achDataThrottledResponse,
            bankAccountListResponse,
        ]) => {
            const bankAccountID = lodashGet(freePlanBankAccountIDResponse, [
                'value', 'nameValuePairs', CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
            ], '');
            const kycVerificationsMigration = lodashGet(kycVerificationsMigrationResponse, [
                'value', 'nameValuePairs', 'expensify_migration_2020_04_28_RunKycVerifications',
            ], '');
            const throttledDate = lodashGet(achDataThrottledResponse, [
                'value', 'nameValuePairs', CONST.NVP.ACH_DATA_THROTTLED,
            ], '');
            const bankAccountJSON = _.find(
                lodashGet(bankAccountListResponse, ['value', 'bankAccountList'], []), account => (
                    account.bankAccountID === bankAccountID
                ),
            );
            const bankAccount = bankAccountJSON ? new BankAccount(bankAccountJSON) : null;

            // Next we'll build the achData and save it to Onyx
            // If the user is already setting up a bank account we will continue the flow for them
            let currentStep = previousACHData.currentStep;
            const achData = bankAccount ? bankAccount.toACHData() : {};
            achData.useOnfido = true;
            achData.policyID = '';
            achData.isInSetup = !bankAccount || bankAccount.isInSetup();
            achData.bankAccountInReview = bankAccount && bankAccount.isVerifying();
            achData.domainLimit = 0;
            achData.isDomainUsingExpensifyCard = false; // @TODO - Not actually sure if we need this

            // @TODO This subStep is used to either show the Plaid "login" view or the "manual" view - but not sure if
            // we need to implement it yet...
            // eslint-disable-next-line max-len
            // See Web-Secure: https://github.com/Expensify/Web-Expensify/blob/896941794f68d7dce64466d83a3e86a5f8122e45/site/app/settings/reimbursement/bankAccountView.jsx#L356-L357
            achData.subStep = '';

            // If we're not in setup, it means we already have a withdrawal account and we're upgrading it to a business
            // bank account. So let the user review all steps with all info prefilled and editable, unless a specific
            // step was passed.
            if (!achData.isInSetup) {
                // @TODO Not sure if we need to do this since for NewDot none of the accounts are pre-existing ones
                currentStep = '';
            }

            // Temporary fix for Onfido flow. Can be removed by nkuoch after Sept 1 2020.
            // @TODO not sure if we still need this or what this is about, but seems like maybe yes...
            if (currentStep === CONST.BANK_ACCOUNT.STEP.ACH_CONTRACT && achData.useOnfido) {
                const onfidoResponse = lodashGet(achData, CONST.BANK_ACCOUNT.VERIFICATIONS.REQUESTOR_IDENTITY_ONFIDO);
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

                // @TODO Again, not sure how much of this logic is needed right now as we shouldn't be handling any
                // open accounts in E.cash yet that need to pass any more checks or can be upgraded, but leaving in for
                // possible future compatibility.
                if (bankAccount.isOpen()) {
                    if (bankAccount.needsToPassLatestChecks()) {
                        const hasTriedToUpgrade = bankAccount.getDateSigned()
                            > (kycVerificationsMigration || '2020-01-13');
                        currentStep = hasTriedToUpgrade
                            ? CONST.BANK_ACCOUNT.STEP.VALIDATION : CONST.BANK_ACCOUNT.STEP.COMPANY;
                        achData.bankAccountInReview = hasTriedToUpgrade;
                    } else {
                        // In Expensify.cash we do not show a specific view for the EnableStep since we will enable the
                        // Expensify card automatically. However, we will still handle that step and show the Validate
                        // view.
                        currentStep = CONST.BANK_ACCOUNT.STEP.ENABLE;
                    }
                }
            }

            // If at this point we still don't have a current step, default to the BankAccountStep
            if (!currentStep) {
                currentStep = CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT;
            }

            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {throttledDate});
            goToWithdrawalAccountSetupStep(currentStep, achData);
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
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
 * @return {String}
 */
function getNextStepID() {
    const nextStepIndex = Math.min(
        getIndexByStepID(previousACHData.currentStep) + 1,
        WITHDRAWAL_ACCOUNT_STEPS.length - 1,
    );
    return lodashGet(WITHDRAWAL_ACCOUNT_STEPS, [nextStepIndex, 'id'], CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT);
}

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
 */
function setupWithdrawalAccount(data) {
    let nextStep;

    // @TODO will need to figure out how to refactor all of this logic but for now we must await this merge so that it
    // doesn't overwrite what we are trying to do next. Unfortunately, the setup withdrawal account flow isn't really
    // translating to our new Onyx way of doing things and will take some time to unpack and refactor.
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true})
        .then(() => {
            previousACHData = {...previousACHData, ...data};
            if (data && !_.isUndefined(data.isSavings)) {
                previousACHData.isSavings = Boolean(data.isSavings);
            }
            if (!previousACHData.setupType) {
                previousACHData.setupType = previousACHData.plaidAccountID
                    ? CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID
                    : CONST.BANK_ACCOUNT.SETUP_TYPE.MANUAL;
            }

            nextStep = previousACHData.currentStep;

            // If we are setting up a Plaid account replace the accountNumber with the unmasked number
            if (data.plaidAccountID) {
                const unmaskedAccount = _.find(plaidBankAccounts, bankAccount => (
                    bankAccount.plaidAccountID === data.plaidAccountID
                ));
                previousACHData.accountNumber = unmaskedAccount.accountNumber;
            }

            return API.BankAccount_SetupWithdrawal(previousACHData);
        })
        .then((response) => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});

            const currentStep = previousACHData.currentStep;
            let achData = lodashGet(response, 'achData', {});
            let error = lodashGet(achData, CONST.BANK_ACCOUNT.VERIFICATIONS.ERROR_MESSAGE);

            if (response.jsonCode === 200 && !error) {
                // Save an NVP with the bankAccountID for this account. This is temporary since we are not showing lists
                // of accounts yet and must have some kind of record of which account is the one the user is trying to
                // set up for the free plan.
                if (achData.bankAccountID) {
                    setFreePlanVerifiedBankAccountID(achData.bankAccountID);
                }

                // Show warning if another account already set up this bank account and promote share
                if (response.existingOwners) {
                    // @TODO Show better error in UI about existing owners
                    console.error('Cannot set up withdrawal account due to existing owners');
                    return;
                }

                if (currentStep === CONST.BANK_ACCOUNT.STEP.REQUESTOR) {
                    const requestorResponse = lodashGet(
                        achData,
                        CONST.BANK_ACCOUNT.VERIFICATIONS.REQUESTOR_IDENTITY_ID,
                    );
                    if (previousACHData.useOnfido) {
                        const onfidoResponse = lodashGet(
                            achData,
                            CONST.BANK_ACCOUNT.VERIFICATIONS.REQUESTOR_IDENTITY_ONFIDO,
                        );
                        const sdkToken = lodashGet(onfidoResponse, CONST.BANK_ACCOUNT.ONFIDO_RESPONSE.SDK_TOKEN);
                        if (sdkToken && !previousACHData.isOnfidoSetupComplete
                                && onfidoResponse.status !== CONST.BANK_ACCOUNT.ONFIDO_RESPONSE.PASS
                        ) {
                            // Requestor Step still needs to run Onfido
                            achData.sdkToken = sdkToken;
                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.REQUESTOR, achData);
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
                                bankAccountID: previousACHData.bankAccountID,
                            });
                            const bankAccount = new BankAccount(bankAccountJSON);
                            achData = bankAccount.toACHData();
                            const needsToPassLatestChecks = achData.state === BankAccount.STATE.OPEN
                                && achData.needsToPassLatestChecks;
                            achData.bankAccountInReview = needsToPassLatestChecks
                                || achData.state === BankAccount.STATE.VERIFYING;

                            goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.VALIDATION, achData);
                        });
                    return;
                }

                if ((currentStep === CONST.BANK_ACCOUNT.STEP.VALIDATION && previousACHData.bankAccountInReview)
                    || currentStep === CONST.BANK_ACCOUNT.STEP.ENABLE
                ) {
                    // Setup done!
                } else {
                    nextStep = getNextStepID();
                }
            } else {
                if (response.jsonCode === 666) {
                    error = response.message;
                }
                if (lodashGet(achData, CONST.BANK_ACCOUNT.VERIFICATIONS.THROTTLED)) {
                    achData.disableFields = true;
                }
            }

            // Go to next step
            goToWithdrawalAccountSetupStep(nextStep, achData);

            if (error) {
                Growl.show(`Error setting up account: ${error}`, CONST.GROWL.ERROR, 5000);
            }
        });
}

export {
    fetchPlaidLinkToken,
    addPersonalBankAccount,
    getPlaidBankAccounts,
    clearPlaidBankAccountsAndToken,
    fetchOnfidoToken,
    activateWallet,
    fetchUserWallet,
    fetchFreePlanVerifiedBankAccount,
    setupWithdrawalAccount,
    goToWithdrawalAccountSetupStep,
};
