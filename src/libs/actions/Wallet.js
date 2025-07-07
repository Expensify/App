"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openOnfidoFlow = openOnfidoFlow;
exports.openInitialSettingsPage = openInitialSettingsPage;
exports.openEnablePaymentsPage = openEnablePaymentsPage;
exports.setAdditionalDetailsQuestions = setAdditionalDetailsQuestions;
exports.updateCurrentStep = updateCurrentStep;
exports.answerQuestionsForWallet = answerQuestionsForWallet;
exports.updatePersonalDetails = updatePersonalDetails;
exports.verifyIdentity = verifyIdentity;
exports.acceptWalletTerms = acceptWalletTerms;
exports.setKYCWallSource = setKYCWallSource;
exports.resetWalletAdditionalDetailsDraft = resetWalletAdditionalDetailsDraft;
exports.issuerEncryptPayloadCallback = issuerEncryptPayloadCallback;
exports.createDigitalGoogleWallet = createDigitalGoogleWallet;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Log_1 = require("@libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var package_json_1 = require("../../../package.json");
/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 */
function openOnfidoFlow() {
    var optimisticData = [
        {
            // Use Onyx.set() since we are resetting the Onfido flow completely.
            onyxMethod: react_native_onyx_1.default.METHOD.SET,
            key: ONYXKEYS_1.default.WALLET_ONFIDO,
            value: {
                isLoading: true,
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_ONFIDO,
            value: {
                isLoading: false,
            },
        },
    ];
    API.read(types_1.READ_COMMANDS.OPEN_ONFIDO_FLOW, null, { optimisticData: optimisticData, finallyData: finallyData });
}
function setAdditionalDetailsQuestions(questions, idNumber) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS, { questions: questions, idNumber: idNumber });
}
/**
 * Save the source that triggered the KYC wall and optionally the chat report ID associated with the IOU
 */
function setKYCWallSource(source, chatReportID) {
    if (chatReportID === void 0) { chatReportID = ''; }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.WALLET_TERMS, { source: source, chatReportID: chatReportID });
}
/**
 * Validates a user's provided details against a series of checks
 */
function updatePersonalDetails(personalDetails) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: true,
                errors: null,
                errorFields: null,
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.UPDATE_PERSONAL_DETAILS_FOR_WALLET, personalDetails, {
        optimisticData: optimisticData,
        finallyData: finallyData,
    });
}
/**
 * Creates an identity check by calling Onfido's API with data returned from the SDK
 *
 * The API will always return the updated userWallet in the response as a convenience so we can avoid an additional
 * API request to fetch the userWallet after we call VerifyIdentity
 */
function verifyIdentity(parameters) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_ONFIDO,
            value: {
                isLoading: true,
                errors: null,
                fixableErrors: null,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.USER_WALLET,
            value: {
                shouldShowFailedKYC: false,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_ONFIDO,
            value: {
                isLoading: false,
                errors: null,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_ONFIDO,
            value: {
                isLoading: false,
                hasAcceptedPrivacyPolicy: false,
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.VERIFY_IDENTITY, parameters, {
        optimisticData: optimisticData,
        successData: successData,
        failureData: failureData,
    });
}
/**
 * Complete the "Accept Terms" step of the wallet activation flow.
 *
 * @param parameters.chatReportID When accepting the terms of wallet to pay an IOU, indicates the parent chat ID of the IOU
 */
function acceptWalletTerms(parameters) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_TERMS,
            value: {
                isLoading: true,
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_TERMS,
            value: {
                errors: null,
                isLoading: false,
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.USER_WALLET,
            value: {
                isPendingOnfidoResult: null,
                shouldShowFailedKYC: true,
            },
        },
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.WALLET_TERMS,
            value: {
                isLoading: false,
            },
        },
    ];
    var requestParams = { hasAcceptedTerms: parameters.hasAcceptedTerms, reportID: parameters.reportID };
    API.write(types_1.WRITE_COMMANDS.ACCEPT_WALLET_TERMS, requestParams, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Fetches data when the user opens the InitialSettingsPage
 */
function openInitialSettingsPage() {
    API.read(types_1.READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE, null);
}
/**
 * Fetches data when the user opens the EnablePaymentsPage
 */
function openEnablePaymentsPage() {
    API.read(types_1.READ_COMMANDS.OPEN_ENABLE_PAYMENTS_PAGE, null);
}
function updateCurrentStep(currentStep) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.USER_WALLET, { currentStep: currentStep });
}
function answerQuestionsForWallet(answers, idNumber) {
    var idologyAnswers = JSON.stringify(answers);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: true,
            },
        },
    ];
    var finallyData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];
    var requestParams = {
        idologyAnswers: idologyAnswers,
        idNumber: idNumber,
    };
    API.write(types_1.WRITE_COMMANDS.ANSWER_QUESTIONS_FOR_WALLET, requestParams, {
        optimisticData: optimisticData,
        finallyData: finallyData,
    });
}
function resetWalletAdditionalDetailsDraft() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, null);
}
function issuerEncryptPayloadCallback(nonce, nonceSignature, certificates) {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method, rulesdir/no-api-in-views
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET, {
        platform: 'ios',
        appVersion: package_json_1.default.version,
        certificates: JSON.stringify({ certificates: certificates }),
        nonce: nonce,
        nonceSignature: nonceSignature,
    })
        .then(function (response) {
        var data = response;
        return {
            encryptedPassData: data.encryptedPassData,
            activationData: data.activationData,
            ephemeralPublicKey: data.ephemeralPublicKey,
        };
    })
        .catch(function (error) {
        Log_1.default.warn("issuerEncryptPayloadCallback error: ".concat(error));
        return {};
    });
}
/**
 * Add card to digital wallet
 *
 * @param walletAccountID ID of the wallet on user's phone
 * @param deviceID ID of user's phone
 */
function createDigitalGoogleWallet(_a) {
    var walletAccountID = _a.walletAccountID, deviceID = _a.deviceID, cardID = _a.cardID, cardHolderName = _a.cardHolderName;
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET, {
        platform: 'android',
        appVersion: package_json_1.default.version,
        walletAccountID: walletAccountID,
        deviceID: deviceID,
        cardID: cardID,
    })
        .then(function (response) {
        var data = response;
        return {
            network: data.network,
            opaquePaymentCard: data.opaquePaymentCard,
            cardHolderName: cardHolderName,
            lastDigits: data.lastDigits,
            userAddress: {
                name: data.userAddress.name,
                addressOne: data.userAddress.address1,
                addressTwo: data.userAddress.address2,
                administrativeArea: data.userAddress.state,
                locality: data.userAddress.city,
                countryCode: data.userAddress.country,
                postalCode: data.userAddress.postal_code,
                phoneNumber: data.userAddress.phone,
            },
        };
    })
        .catch(function (error) {
        Log_1.default.warn("createDigitalGoogleWallet error: ".concat(error));
        return {};
    });
}
