import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';

function fetchBankAccountList() {
    // Note: For the moment, we are just running this to verify that we can successfully return data from the secure API
    API.Get({returnValueList: 'bankAccountList'}, true);
}

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
function addPlaidBankAccount(account, password, plaidLinkToken) {
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
            currency: 'USD',
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

function fetchOnfidoToken() {
    API.Wallet_GetOnfidoSDKToken()
        .then((response) => {
            const apiResult = lodashGet(response, ['requestorIdentityOnfido', 'apiResult'], {});
            Onyx.merge(ONYXKEYS.ONFIDO_APPLICANT_INFO, {
                applicantID: apiResult.applicantID,
                sdkToken: apiResult.sdkToken,
            });
        });
}

/**
 * @param {Boolean} loading
 * @param {String[]} [errorFields]
 * @param {String} [additionalErrorMessage]
 * @private
 */
function setAdditionalDetailsStep(loading, errorFields = null, additionalErrorMessage = '') {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {loading, errorFields, additionalErrorMessage});
}

/**
 * @param {String} currentStep
 * @param {Object} parameters
 * @param {String} [parameters.onfidoData] - JSON string
 * @param {String} [parameters.personalDetails] - JSON string
 */
function activateWallet(currentStep, parameters) {
    if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
        setAdditionalDetailsStep(true);
    }

    API.Wallet_Activate({currentStep, ...parameters})
        .then((response) => {
            if (response.jsonCode !== 200) {
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

            if (currentStep === CONST.WALLET.STEP.ADDITIONAL_DETAILS) {
                setAdditionalDetailsStep(false);
            }
        });
}

function fetchUserWallet() {
    API.Get({returnValueList: 'userWallet'})
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            Onyx.merge(ONYXKEYS.USER_WALLET, response.userWallet);
        });
}

export {
    fetchBankAccountList,
    fetchPlaidLinkToken,
    addPlaidBankAccount,
    getPlaidBankAccounts,
    clearPlaidBankAccounts,
    fetchOnfidoToken,
    activateWallet,
    fetchUserWallet,
};
