import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as API from '../API';

/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} dob
 */
function openOnfidoFlow(firstName, lastName, dob) {
    API.read('OpenOnfidoFlow', {firstName, lastName, dob}, {
        optimisticData: [
            {
                // Use Onyx.set() since we are resetting the Onfido flow completely.
                onyxMethod: CONST.ONYX.METHOD.SET,
                key: ONYXKEYS.WALLET_ONFIDO,
                value: {
                    isLoading: true,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ONFIDO,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ONFIDO,
                value: {
                    isLoading: false,
                },
            },
        ],
    });
}

/**
 * @param {Array} questions
 * @param {String} [idNumber]
 */
function setAdditionalDetailsQuestions(questions, idNumber) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {questions, idNumber});
}

/**
 * @param {Object} errorFields
 */
function setAdditionalDetailsErrors(errorFields) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorFields: null});
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorFields});
}

/**
 * @param {String} additionalErrorMessage
 */
function setAdditionalDetailsErrorMessage(additionalErrorMessage) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {additionalErrorMessage});
}

/**
 * Save the ID of the chat whose IOU triggered showing the KYC wall.
 *
 * @param {String} chatReportID
 */
function setKYCWallSourceChatReportID(chatReportID) {
    Onyx.merge(ONYXKEYS.WALLET_TERMS, {chatReportID});
}

/**
 * Validates a user's provided details against a series of checks
 *
 * @param {Object} personalDetails
 */
function updatePersonalDetails(personalDetails) {
    if (!personalDetails) {
        return;
    }
    const firstName = personalDetails.legalFirstName || '';
    const lastName = personalDetails.legalLastName || '';
    const dob = personalDetails.dob || '';
    const addressStreet = personalDetails.addressStreet || '';
    const addressCity = personalDetails.addressCity || '';
    const addressState = personalDetails.addressState || '';
    const addressZip = personalDetails.addressZip || '';
    const ssn = personalDetails.ssn || '';
    const phoneNumber = personalDetails.phoneNumber || '';
    API.write('UpdatePersonalDetailsForWallet', {
        legalFirstName: firstName,
        legalLastName: lastName,
        dob,
        addressStreet,
        addressCity,
        addressState,
        addressZip,
        ssn,
        phoneNumber,
    }, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
                value: {
                    isLoading: true,
                    errors: null,
                    errorFields: null,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
                value: {
                    isLoading: false,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
                value: {
                    isLoading: false,
                },
            },
        ],
    });
}

/**
 * Creates an identity check by calling Onfido's API with data returned from the SDK
 *
 * The API will always return the updated userWallet in the response as a convenience so we can avoid an additional
 * API request to fetch the userWallet after we call VerifyIdentity
 *
 * @param {Object} parameters
 * @param {String} [parameters.onfidoData] - JSON string
 */
function verifyIdentity(parameters) {
    const onfidoData = parameters.onfidoData;

    API.write('VerifyIdentity', {
        onfidoData,
    }, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ONFIDO,
                value: {
                    isLoading: true,
                    errors: null,
                    fixableErrors: null,
                },
            },
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.USER_WALLET,
                value: {
                    shouldShowFailedKYC: false,
                },
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ONFIDO,
                value: {
                    isLoading: false,
                    errors: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ONFIDO,
                value: {
                    isLoading: false,
                    hasAcceptedPrivacyPolicy: false,
                },
            },
        ],
    });
}

/**
 * Complete the "Accept Terms" step of the wallet activation flow.
 *
 * @param {Object} parameters
 * @param {Boolean} parameters.hasAcceptedTerms
 * @param {Number} parameters.chatReportID When accepting the terms of wallet to pay an IOU, indicates the parent chat ID of the IOU
 */
function acceptWalletTerms(parameters) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.USER_WALLET,
            value: {
                shouldShowWalletActivationSuccess: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.WALLET_TERMS,
            value: {
                errors: null,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.USER_WALLET,
            value: {
                shouldShowWalletActivationSuccess: null,
                shouldShowFailedKYC: true,
            },
        },
    ];

    API.write('AcceptWalletTerms', {hasAcceptedTerms: parameters.hasAcceptedTerms, reportID: parameters.chatReportID}, {optimisticData, successData, failureData});
}

/**
 * Fetches data when the user opens the InitialSettingsPage
 *
 * @typedef {Object} UserWallet
 * @property {Number} availableBalance
 * @property {Number} currentBalance
 * @property {String} currentStep - used to track which step of the "activate wallet" flow a user is in
 * @property {('SILVER'|'GOLD')} tierName - will be GOLD when fully activated. SILVER is able to receive funds only.
 */
function openInitialSettingsPage() {
    API.read('OpenInitialSettingsPage');
}

/**
 * Fetches data when the user opens the EnablePaymentsPage
 *
 * @typedef {Object} UserWallet
 * @property {Number} availableBalance
 * @property {Number} currentBalance
 * @property {String} currentStep - used to track which step of the "activate wallet" flow a user is in
 * @property {('SILVER'|'GOLD')} tierName - will be GOLD when fully activated. SILVER is able to receive funds only.
 */
function openEnablePaymentsPage() {
    API.read('OpenEnablePaymentsPage');
}

/**
 * @param {Object} keyValuePair
 */
function updateAdditionalDetailsDraft(keyValuePair) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS_DRAFT, keyValuePair);
}

/**
 * @param {String} currentStep
 */
function updateCurrentStep(currentStep) {
    Onyx.merge(ONYXKEYS.USER_WALLET, {currentStep});
}

/**
 * @param {Array} answers
 * @param {String} idNumber
 */
function answerQuestionsForWallet(answers, idNumber) {
    const idologyAnswers = JSON.stringify(answers);
    API.write('AnswerQuestionsForWallet',
        {
            idologyAnswers,
            idNumber,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
                value: {
                    isLoading: true,
                },
            }],
            successData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
                value: {
                    isLoading: false,
                },
            }],
            failureData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
                value: {
                    isLoading: false,
                },
            }],
        });
}

export {
    openOnfidoFlow,
    openInitialSettingsPage,
    openEnablePaymentsPage,
    setAdditionalDetailsErrors,
    updateAdditionalDetailsDraft,
    setAdditionalDetailsErrorMessage,
    setAdditionalDetailsQuestions,
    updateCurrentStep,
    answerQuestionsForWallet,
    updatePersonalDetails,
    verifyIdentity,
    acceptWalletTerms,
    setKYCWallSourceChatReportID,
};
