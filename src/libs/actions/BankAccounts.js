import lodashGet from 'lodash/get';
import lodashHas from 'lodash/has';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
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

function goToWithdrawalStepID(stepID, achData) {
    const newACHData = {...previousACHData};

    // If we go back to Requestor Step, reset any validation and previously answered questions from expectID.
    if (!newACHData.useOnfido && stepID === 'RequestorStep') {
        delete newACHData.questions;
        delete newACHData.answers;
        if (lodashHas(achData, 'verifications.externalApiResponses')) {
            delete newACHData.verifications.externalApiResponses.requestorIdentityID;
            delete newACHData.verifications.externalApiResponses.requestorIdentityKBA;
        }
    }

    // When going from CompanyStep to BankAccountStep, show the manual form instead of Plaid
    if (newACHData.currentStep === 'CompanyStep' && stepID === 'BankAccountStep') {
        newACHData.subStep = 'manual';
    }

    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {achData: {...newACHData, ...achData, currentStep: stepID}});
}

/**
 * Fetch the bank account currently being set up by the user for the free plan if it exists.
 */
function fetchFreePlanVerifiedBankAccount() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true});
    let bankAccountID;
    let bankAccount;
    let kycVerificationsMigration;
    API.Get({
        returnValueList: 'nameValuePairs',
        name: CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID,
    })
        .then((response) => {
            bankAccountID = lodashGet(response.nameValuePairs, CONST.NVP.FREE_PLAN_BANK_ACCOUNT_ID, '');

            if (!bankAccountID) {
                return Promise.resolve({});
            }

            return API.Get({
                returnValueList: 'nameValuePairs',
                name: 'expensify_migration_2020_04_28_RunKycVerifications',
            });
        })
        .then((response) => {
            kycVerificationsMigration = lodashGet(
                response.nameValuePairs,
                'expensify_migration_2020_04_28_RunKycVerifications',
                '',
            );
            return API.Get({returnValueList: 'bankAccountList'});
        })
        .then((response) => {
            const bankAccountJSON = _.find(response.bankAccountList, account => (
                account.bankAccountID === bankAccountID
            ));
            bankAccount = bankAccountJSON ? new BankAccount(bankAccountJSON) : null;
            return API.Get({
                returnValueList: 'nameValuePairs',
                name: CONST.NVP.ACH_DATA_THROTTLED,
            });
        })
        .then((response) => {
            const throttledDate = lodashGet(response.nameValuePairs, CONST.NVP.ACH_DATA_THROTTLED, '');

            // Next we'll build the achData and save it to Onyx
            // If the user already is already setting up a bank account we will want to continue the flow for them
            let currentStep;
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
            if (currentStep === 'ACHContractStep' && achData.useOnfido) {
                const onfidoRes = lodashGet(achData, 'verifications.externalApiResponses.requestorIdentityOnfido');
                const sdkToken = lodashGet(onfidoRes, 'apiResult.sdkToken');
                if (sdkToken && !achData.isOnfidoSetupComplete && onfidoRes.status !== 'pass') {
                    currentStep = 'RequestorStep';
                }
            }

            // Ensure we route the user to the correct step based on the status of their bank account
            if (bankAccount && !currentStep) {
                currentStep = bankAccount.isPending()
                    || bankAccount.isVerifying() ? 'ValidationStep' : 'BankAccountStep';

                // @TODO Again, not sure how much of this logic is needed right now as we shouldn't be handling any
                // open accounts in E.cash yet that need to pass any more checks or can be upgraded, but leaving in for
                // possible future compatibility.
                if (bankAccount.isOpen()) {
                    if (bankAccount.needsToPassLatestChecks()) {
                        const hasTriedToUpgrade = bankAccount.getDateSigned()
                            > (kycVerificationsMigration || '2020-01-13');
                        currentStep = hasTriedToUpgrade ? 'ValidationStep' : 'CompanyStep';
                        achData.bankAccountInReview = hasTriedToUpgrade;
                    } else {
                        // We're not going to have a EnableStep, but we can show this account as open if accessed
                        currentStep = 'EnableStep';
                    }
                }
            }

            // If at this point we still don't have a current step, default to the BankAccountStep
            if (!currentStep) {
                currentStep = 'BankAccountStep';
            }

            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {throttledDate});
            goToWithdrawalStepID(currentStep, achData);
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});
        });
}

const WITHDRAWAL_ACCOUNT_STEPS = [
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

/**
 * Get step position in the array
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
    return lodashGet(WITHDRAWAL_ACCOUNT_STEPS, [nextStepIndex, 'id'], 'BankAccountStep');
}

/**
 * @private
 * @param {Number} bankAccountID
 */
function setFreePlanVerifiedBankAccountID(bankAccountID) {
    API.SetNameValuePair({name: 'expensify_freePlanBankAccountID', value: bankAccountID});
}

/**
 * Create or update the bank account in db with the updated data.
 *
 * @param {Object} [data]
 */
function setupWithdrawalAccount(data) {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: true});

    previousACHData = {...previousACHData, ...data};
    if (data && data.isSavings !== undefined) {
        previousACHData.isSavings = Boolean(data.isSavings);
    }
    if (!previousACHData.setupType) {
        previousACHData.setupType = previousACHData.plaidAccountID ? 'plaid' : 'manual';
    }

    let nextStep = previousACHData.currentStep;

    // If we are setting up a Plaid account replace the accountNumber with the unmasked number
    if (data.plaidAccountID) {
        const unmaskedAccount = _.find(plaidBankAccounts, bankAccount => (
            bankAccount.plaidAccountID === data.plaidAccountID
        ));
        previousACHData.accountNumber = unmaskedAccount.accountNumber;
    }

    API.BankAccount_SetupWithdrawal(previousACHData)
        .then((response) => {
            Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {loading: false});

            const currentStep = previousACHData.currentStep;
            let achData = lodashGet(response, 'achData', {});
            let error = lodashGet(achData, 'verifications.errorMessage');

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

                if (currentStep === 'RequestorStep') {
                    const requestorResponse = lodashGet(
                        achData,
                        'verifications.externalApiResponses.requestorIdentityID',
                    );
                    if (previousACHData.useOnfido) {
                        const onfidoRes = lodashGet(
                            achData,
                            'verifications.externalApiResponses.requestorIdentityOnfido',
                        );
                        const sdkToken = lodashGet(onfidoRes, 'apiResult.sdkToken');
                        if (sdkToken && !previousACHData.isOnfidoSetupComplete && onfidoRes.status !== 'pass') {
                            // Requestor Step still needs to run Onfido
                            achData.sdkToken = sdkToken;
                            goToWithdrawalStepID('RequestorStep', achData);
                            return;
                        }
                    } else if (requestorResponse) {
                        // Don't go to next step if Requestor Step needs to ask some questions
                        let questions = lodashGet(requestorResponse, 'apiResult.questions.question') || [];
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
                            achData.questions = questions;
                            goToWithdrawalStepID('RequestorStep', achData);
                            return;
                        }
                    }
                }

                if (currentStep === 'ACHContractStep') {
                    // Get an up-to-date bank account list so that we can allow the user to validate their newly
                    // generated bank account
                    return API.Get({returnValueList: 'bankAccountList'})
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

                            goToWithdrawalStepID('ValidationStep', achData);
                        });
                }

                if ((currentStep === 'ValidationStep' && previousACHData.bankAccountInReview)
                    || currentStep === 'EnableStep'
                ) {
                    // Setup done!
                } else {
                    nextStep = getNextStepID();
                }
            } else {
                if (response.jsonCode === 666) {
                    error = response.message;
                }
                if (lodashGet(achData, 'verifications.throttled')) {
                    achData.disableFields = true;
                }
            }

            // Go to next step
            goToWithdrawalStepID(nextStep, achData);

            if (error) {
                console.error(`Error setting up withdrawal account: ${error}`);
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
    goToWithdrawalStepID,
};
