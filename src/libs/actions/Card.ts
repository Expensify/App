import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {
    ActivatePhysicalExpensifyCardParams,
    ReportVirtualExpensifyCardFraudParams,
    RequestReplacementExpensifyCardParams,
    RevealExpensifyCardDetailsParams,
    UpdateExpensifyCardLimitParams,
} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardDetails, IssueNewCardData, IssueNewCardStep} from '@src/types/onyx/Card';

type ReplacementReason = 'damaged' | 'stolen';

type IssueNewCardFlowData = {
    /** Step to be set in Onyx */
    step?: IssueNewCardStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<IssueNewCardData>;
};

function reportVirtualExpensifyCardFraud(cardID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: ReportVirtualExpensifyCardFraudParams = {
        cardID,
    };

    API.write(WRITE_COMMANDS.REPORT_VIRTUAL_EXPENSIFY_CARD_FRAUD, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Call the API to deactivate the card and request a new one
 * @param cardID - id of the card that is going to be replaced
 * @param reason - reason for replacement
 */
function requestReplacementExpensifyCard(cardID: number, reason: ReplacementReason) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: RequestReplacementExpensifyCardParams = {
        cardID,
        reason,
    };

    API.write(WRITE_COMMANDS.REQUEST_REPLACEMENT_EXPENSIFY_CARD, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

/**
 * Activates the physical Expensify card based on the last four digits of the card number
 */
function activatePhysicalExpensifyCard(cardLastFourDigits: string, cardID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    errors: null,
                    isLoading: true,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    isLoading: false,
                },
            },
        },
    ];

    const parameters: ActivatePhysicalExpensifyCardParams = {
        cardLastFourDigits,
        cardID,
    };

    API.write(WRITE_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD, parameters, {optimisticData, successData, failureData});
}

/**
 * Clears errors for a specific cardID
 */
function clearCardListErrors(cardID: number) {
    Onyx.merge(ONYXKEYS.CARD_LIST, {[cardID]: {errors: null, isLoading: false}});
}

/**
 * Makes an API call to get virtual card details (pan, cvv, expiration date, address)
 * This function purposefully uses `makeRequestWithSideEffects` method. For security reason
 * card details cannot be persisted in Onyx and have to be asked for each time a user want's to
 * reveal them.
 *
 * @param cardID - virtual card ID
 *
 * @returns promise with card details object
 */
function revealVirtualCardDetails(cardID: number): Promise<ExpensifyCardDetails> {
    return new Promise((resolve, reject) => {
        const parameters: RevealExpensifyCardDetailsParams = {cardID};

        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_CARD_DETAILS, parameters)
            .then((response) => {
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject('cardPage.cardDetailsLoadingFailure');
                    return;
                }
                resolve(response as ExpensifyCardDetails);
            })
            // eslint-disable-next-line prefer-promise-reject-errors
            .catch(() => reject('cardPage.cardDetailsLoadingFailure'));
    });
}

function updateSettlementFrequency(policyID: string, frequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>) {
    // TODO: remove this code when the API is ready
    if (frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`, {
            monthlySettlementDate: null,
        });
    } else {
        Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`, {
            monthlySettlementDate: new Date(),
        });
    }

    // TODO: uncomment this code when the API is ready
    // const optimisticData: OnyxUpdate[] = [
    //     {
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`,
    //         value: {
    //             monthlySettlementDate: '',
    //         },
    //     },
    // ];
    //
    // const successData: OnyxUpdate[] = [
    //     {
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`,
    //         value: {
    //             monthlySettlementDate: '',
    //         },
    //     },
    // ];
    //
    // const failureData: OnyxUpdate[] = [
    //     {
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`,
    //         value: {
    //             monthlySettlementDate: null,
    //         },
    //     },
    // ];
    //
    // const parameters = {
    //     workspaceAccountID: policyID,
    //     settlementFrequency: frequency,
    // };
    //
    // API.write(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_FREQUENCY, parameters, {optimisticData, successData, failureData});
}

function updateSettlementAccount(policyID: string, accountID: number) {
    // TODO: remove this code when the API is ready
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`, {
        paymentBankAccountID: accountID,
    });

    // TODO: uncomment this code when the API is ready
    // const optimisticData: OnyxUpdate[] = [
    //     {
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`,
    //         value: {
    //             paymentBankAccountID: accountID,
    //         },
    //     },
    // ];
    //
    // const successData: OnyxUpdate[] = [
    //     {
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`,
    //         value: {
    //             paymentBankAccountID: accountID,
    //         },
    //     },
    // ];
    //
    // const failureData: OnyxUpdate[] = [
    //     {
    //         onyxMethod: Onyx.METHOD.MERGE,
    //         key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`,
    //         value: {
    //             paymentBankAccountID: null,
    //         },
    //     },
    // ];
    //
    // const parameters = {
    //     workspaceAccountID: policyID,
    //     settlementBankAccountID: accountID,
    // };
    //
    // API.write(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, parameters, {optimisticData, successData, failureData});
}

function setIssueNewCardStepAndData({data, isEditing, step}: IssueNewCardFlowData) {
    Onyx.merge(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD, {data, isEditing, currentStep: step});
}

function clearIssueNewCardFlow() {
    Onyx.set(ONYXKEYS.ISSUE_NEW_EXPENSIFY_CARD, {
        currentStep: null,
        data: {},
    });
}

function updateExpensifyCardLimit(policyID: string, cardID: number, newLimit: number, oldLimit?: number) {
    const authToken = NetworkStore.getAuthToken();

    if (!authToken) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        limit: newLimit,
                    },
                    isLoading: true,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        limit: oldLimit,
                    },
                    isLoading: false,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: UpdateExpensifyCardLimitParams = {
        authToken,
        cardID,
        limit: newLimit,
    };

    API.write(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT, parameters, {optimisticData, successData, failureData});
}

export {
    requestReplacementExpensifyCard,
    activatePhysicalExpensifyCard,
    clearCardListErrors,
    reportVirtualExpensifyCardFraud,
    revealVirtualCardDetails,
    updateSettlementFrequency,
    setIssueNewCardStepAndData,
    clearIssueNewCardFlow,
    updateExpensifyCardLimit,
    updateSettlementAccount,
};
export type {ReplacementReason};
