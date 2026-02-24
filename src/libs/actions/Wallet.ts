import type {AndroidCardData, IOSEncryptPayload} from '@expensify/react-native-wallet';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {AcceptWalletTermsParams, AnswerQuestionsForWalletParams, UpdatePersonalDetailsForWalletParams, VerifyIdentityParams} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ProvisioningCardData, WalletAdditionalQuestionDetails} from '@src/types/onyx';
import pkg from '../../../package.json';

type WalletQuestionAnswer = {
    question: string;
    answer: string;
};

/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 */
function openOnfidoFlow() {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_ONFIDO>> = [
        {
            // Use Onyx.set() since we are resetting the Onfido flow completely.
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: true,
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_ONFIDO>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: false,
            },
        },
    ];

    API.read(READ_COMMANDS.OPEN_ONFIDO_FLOW, null, {optimisticData, finallyData});
}

function setAdditionalDetailsQuestions(questions: WalletAdditionalQuestionDetails[] | null, idNumber?: string) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {questions, idNumber});
}

/**
 * Save the source that triggered the KYC wall and optionally the chat report ID associated with the IOU
 */
function setKYCWallSource(source?: ValueOf<typeof CONST.KYC_WALL_SOURCE>, chatReportID = '') {
    Onyx.merge(ONYXKEYS.WALLET_TERMS, {source, chatReportID});
}

/**
 * Validates a user's provided details against a series of checks
 */
function updatePersonalDetails(personalDetails: UpdatePersonalDetailsForWalletParams) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: true,
                errors: null,
                errorFields: null,
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    API.write(WRITE_COMMANDS.UPDATE_PERSONAL_DETAILS_FOR_WALLET, personalDetails, {
        optimisticData,
        finallyData,
    });
}

/**
 * Creates an identity check by calling Onfido's API with data returned from the SDK
 *
 * The API will always return the updated userWallet in the response as a convenience so we can avoid an additional
 * API request to fetch the userWallet after we call VerifyIdentity
 */
function verifyIdentity(parameters: VerifyIdentityParams) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_ONFIDO | typeof ONYXKEYS.USER_WALLET>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: true,
                errors: null,
                fixableErrors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.USER_WALLET,
            value: {
                shouldShowFailedKYC: false,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_ONFIDO>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: false,
                errors: null,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_ONFIDO>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: false,
                hasAcceptedPrivacyPolicy: false,
            },
        },
    ];
    API.write(WRITE_COMMANDS.VERIFY_IDENTITY, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Complete the "Accept Terms" step of the wallet activation flow.
 *
 * @param parameters.chatReportID When accepting the terms of wallet to pay an IOU, indicates the parent chat ID of the IOU
 */
function acceptWalletTerms(parameters: AcceptWalletTermsParams) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_TERMS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_TERMS,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.WALLET_TERMS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_TERMS,
            value: {
                errors: null,
                isLoading: false,
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.USER_WALLET | typeof ONYXKEYS.WALLET_TERMS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.USER_WALLET,
            value: {
                isPendingOnfidoResult: null,
                shouldShowFailedKYC: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_TERMS,
            value: {
                isLoading: false,
            },
        },
    ];

    const requestParams: AcceptWalletTermsParams = {hasAcceptedTerms: parameters.hasAcceptedTerms, reportID: parameters.reportID};

    API.write(WRITE_COMMANDS.ACCEPT_WALLET_TERMS, requestParams, {optimisticData, successData, failureData});
}

/**
 * Fetches data when the user opens the InitialSettingsPage
 */
function openInitialSettingsPage() {
    API.read(READ_COMMANDS.OPEN_INITIAL_SETTINGS_PAGE, null);
}

/**
 * Fetches data when the user opens the EnablePaymentsPage
 */
function openEnablePaymentsPage() {
    API.read(READ_COMMANDS.OPEN_ENABLE_PAYMENTS_PAGE, null);
}

function updateCurrentStep(currentStep: ValueOf<typeof CONST.WALLET.STEP> | null) {
    Onyx.merge(ONYXKEYS.USER_WALLET, {currentStep});
}

function answerQuestionsForWallet(answers: WalletQuestionAnswer[], idNumber: string) {
    const idologyAnswers = JSON.stringify(answers);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: true,
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    const requestParams: AnswerQuestionsForWalletParams = {
        idologyAnswers,
        idNumber,
    };

    API.write(WRITE_COMMANDS.ANSWER_QUESTIONS_FOR_WALLET, requestParams, {
        optimisticData,
        finallyData,
    });
}

function resetWalletAdditionalDetailsDraft() {
    Onyx.set(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, null);
}

function issuerEncryptPayloadCallback(nonce: string, nonceSignature: string, certificates: string[]): Promise<IOSEncryptPayload> {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method, rulesdir/no-api-in-views
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET, {
        platform: 'ios',
        appVersion: pkg.version,
        certificates: JSON.stringify({certificates}),
        nonce,
        nonceSignature,
    })
        .then((response) => {
            const data = response as unknown as IOSEncryptPayload;
            return {
                encryptedPassData: data.encryptedPassData,
                activationData: data.activationData,
                ephemeralPublicKey: data.ephemeralPublicKey,
            } as IOSEncryptPayload;
        })
        .catch((error) => {
            Log.warn(`issuerEncryptPayloadCallback error: ${error}`);
            return {} as IOSEncryptPayload;
        });
}

/**
 * Add card to digital wallet
 *
 * @param walletAccountID ID of the wallet on user's phone
 * @param deviceID ID of user's phone
 */
function createDigitalGoogleWallet({
    walletAccountID,
    deviceID,
    cardID,
    cardHolderName,
}: {
    deviceID: string;
    walletAccountID: string;
    cardID: number;
    cardHolderName: string;
}): Promise<AndroidCardData> {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_DIGITAL_WALLET, {
        platform: 'android',
        appVersion: pkg.version,
        walletAccountID,
        deviceID,
        cardID,
    })
        .then((response) => {
            const data = response as unknown as ProvisioningCardData;
            return {
                network: data.network,
                opaquePaymentCard: data.opaquePaymentCard,
                cardHolderName,
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
            } as AndroidCardData;
        })
        .catch((error) => {
            Log.warn(`createDigitalGoogleWallet error: ${error}`);
            return {} as AndroidCardData;
        });
}

export {
    openOnfidoFlow,
    openInitialSettingsPage,
    openEnablePaymentsPage,
    setAdditionalDetailsQuestions,
    updateCurrentStep,
    answerQuestionsForWallet,
    updatePersonalDetails,
    verifyIdentity,
    acceptWalletTerms,
    setKYCWallSource,
    resetWalletAdditionalDetailsDraft,
    issuerEncryptPayloadCallback,
    createDigitalGoogleWallet,
};
