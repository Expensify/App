import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {PrivatePersonalDetails} from '@libs/GetPhysicalCardUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {WalletAdditionalQuestionDetails} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type WalletTerms = {
    hasAcceptedTerms: boolean;
    reportID: string;
};

type WalletQuestionAnswer = {
    question: string;
    answer: string;
};

type IdentityVerification = {
    onfidoData: string;
};

type PersonalDetails = {
    phoneNumber: string;
    legalFirstName: string;
    legalLastName: string;
    addressStreet: string;
    addressCity: string;
    addressState: string;
    addressZip: string;
    dob: string;
    ssn: string;
};

/**
 * Fetch and save locally the Onfido SDK token and applicantID
 * - The sdkToken is used to initialize the Onfido SDK client
 * - The applicantID is combined with the data returned from the Onfido SDK as we need both to create an
 *   identity check. Note: This happens in Web-Secure when we call Activate_Wallet during the OnfidoStep.
 */
function openOnfidoFlow() {
    const optimisticData: OnyxUpdate[] = [
        {
            // Use Onyx.set() since we are resetting the Onfido flow completely.
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: true,
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: false,
            },
        },
    ];

    API.read(
        'OpenOnfidoFlow',
        {},
        {
            optimisticData,
            finallyData,
        },
    );
}

function setAdditionalDetailsQuestions(questions: WalletAdditionalQuestionDetails[], idNumber: string) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {questions, idNumber});
}

function setAdditionalDetailsErrors(errorFields: OnyxCommon.ErrorFields) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorFields: null});
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorFields});
}

function setAdditionalDetailsErrorMessage(additionalErrorMessage: string) {
    Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {additionalErrorMessage});
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
function updatePersonalDetails(personalDetails: PersonalDetails) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: true,
                errors: null,
                errorFields: null,
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    API.write('UpdatePersonalDetailsForWallet', personalDetails, {
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
function verifyIdentity(parameters: IdentityVerification) {
    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: false,
                errors: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ONFIDO,
            value: {
                isLoading: false,
                hasAcceptedPrivacyPolicy: false,
            },
        },
    ];
    API.write('VerifyIdentity', parameters, {
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
function acceptWalletTerms(parameters: WalletTerms) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_TERMS,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_TERMS,
            value: {
                errors: null,
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
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

    const requestParams: WalletTerms = {hasAcceptedTerms: parameters.hasAcceptedTerms, reportID: parameters.reportID};

    API.write('AcceptWalletTerms', requestParams, {optimisticData, successData, failureData});
}

/**
 * Fetches data when the user opens the InitialSettingsPage
 */
function openInitialSettingsPage() {
    API.read('OpenInitialSettingsPage', {});
}

/**
 * Fetches data when the user opens the EnablePaymentsPage
 */
function openEnablePaymentsPage() {
    API.read('OpenEnablePaymentsPage', {});
}

function updateCurrentStep(currentStep: ValueOf<typeof CONST.WALLET.STEP>) {
    Onyx.merge(ONYXKEYS.USER_WALLET, {currentStep});
}

function answerQuestionsForWallet(answers: WalletQuestionAnswer[], idNumber: string) {
    const idologyAnswers = JSON.stringify(answers);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: true,
            },
        },
    ];

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.WALLET_ADDITIONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    type AnswerQuestionsForWallet = {
        idologyAnswers: string;
        idNumber: string;
    };

    const requestParams: AnswerQuestionsForWallet = {
        idologyAnswers,
        idNumber,
    };

    API.write('AnswerQuestionsForWallet', requestParams, {
        optimisticData,
        finallyData,
    });
}

function requestPhysicalExpensifyCard(cardID: number, authToken: string, privatePersonalDetails: PrivatePersonalDetails) {
    const {
        legalFirstName,
        legalLastName,
        phoneNumber,
        address: {city, country, state, street, zip},
    } = privatePersonalDetails;

    type RequestPhysicalExpensifyCardParams = {
        authToken: string;
        legalFirstName: string;
        legalLastName: string;
        phoneNumber: string;
        addressCity: string;
        addressCountry: string;
        addressState: string;
        addressStreet: string;
        addressZip: string;
    };

    const requestParams: RequestPhysicalExpensifyCardParams = {
        authToken,
        legalFirstName,
        legalLastName,
        phoneNumber,
        addressCity: city,
        addressCountry: country,
        addressState: state,
        addressStreet: street,
        addressZip: zip,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    state: 4, // NOT_ACTIVATED
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: privatePersonalDetails,
        },
    ];

    API.write('RequestPhysicalExpensifyCard', requestParams, {optimisticData});
}

export {
    openOnfidoFlow,
    openInitialSettingsPage,
    openEnablePaymentsPage,
    setAdditionalDetailsErrors,
    setAdditionalDetailsErrorMessage,
    setAdditionalDetailsQuestions,
    updateCurrentStep,
    answerQuestionsForWallet,
    updatePersonalDetails,
    verifyIdentity,
    acceptWalletTerms,
    setKYCWallSource,
    requestPhysicalExpensifyCard,
};
