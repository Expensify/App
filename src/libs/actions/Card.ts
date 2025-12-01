import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as API from '@libs/API';
import type {
    ActivatePhysicalExpensifyCardParams,
    CardDeactivateParams,
    OpenCardDetailsPageParams,
    ReportVirtualExpensifyCardFraudParams,
    RequestReplacementExpensifyCardParams,
    ResolveFraudAlertParams,
    RevealExpensifyCardDetailsParams,
    StartIssueNewCardFlowParams,
    UpdateExpensifyCardLimitParams,
    UpdateExpensifyCardLimitTypeParams,
    UpdateExpensifyCardTitleParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CompanyCardFeedWithDomainID} from '@src/types/onyx';
import type {CardLimitType, ExpensifyCardDetails, IssueNewCardData, IssueNewCardStep} from '@src/types/onyx/Card';
import type {ConnectionName} from '@src/types/onyx/Policy';

type ReplacementReason = 'damaged' | 'stolen';

type IssueNewCardFlowData = {
    /** Step to be set in Onyx */
    step?: IssueNewCardStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<IssueNewCardData>;

    /** ID of the policy */
    policyID: string | undefined;

    /** Whether the changing assignee is disabled. E.g., The assignee is auto selected from workspace members page */
    isChangeAssigneeDisabled?: boolean;
};

function reportVirtualExpensifyCardFraud(card: Card, validateCode: string) {
    const cardID = card?.cardID ?? CONST.DEFAULT_NUMBER_ID;
    const optimisticData: OnyxUpdate[] = [
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                cardID,
                isLoading: true,
                errors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: true},
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: false},
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.ACCOUNT,
            value: {isLoading: false},
        },
    ];

    const parameters: ReportVirtualExpensifyCardFraudParams = {
        cardID,
        validateCode,
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
function requestReplacementExpensifyCard(cardID: number, reason: ReplacementReason, validateCode: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.VALIDATE_ACTION_CODE,
            value: {
                validateCodeSent: null,
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
        validateCode,
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

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACTIVATE_PHYSICAL_EXPENSIFY_CARD, parameters, {
        optimisticData,
        successData,
        failureData,
    }).then((response) => {
        if (!response) {
            return;
        }
        if (response.pin) {
            Onyx.set(ONYXKEYS.ACTIVATED_CARD_PIN, response.pin);
        }
    });
}

/**
 * Clears errors for a specific cardID
 */
function clearCardListErrors(cardID: number) {
    Onyx.merge(ONYXKEYS.CARD_LIST, {[cardID]: {errors: null, isLoading: false}});
}

/**
 * Clears the PIN for an activated card
 */
function clearActivatedCardPin() {
    Onyx.set(ONYXKEYS.ACTIVATED_CARD_PIN, '');
}

function clearReportVirtualCardFraudForm() {
    Onyx.merge(ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD, {cardID: null, isLoading: false, errors: null});
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
function revealVirtualCardDetails(cardID: number, validateCode: string): Promise<ExpensifyCardDetails> {
    return new Promise((resolve, reject) => {
        const parameters: RevealExpensifyCardDetailsParams = {cardID, validateCode};

        const optimisticData: OnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: true},
            },
        ];

        const successData: OnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
            },
        ];

        const failureData: OnyxUpdate[] = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ACCOUNT,
                value: {isLoading: false},
            },
        ];

        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_CARD_DETAILS, parameters, {
            optimisticData,
            successData,
            failureData,
        })
            .then((response) => {
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    if (response?.jsonCode === CONST.JSON_CODE.INCORRECT_MAGIC_CODE) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('validateCodeForm.error.incorrectMagicCode');
                        return;
                    }

                    if (response?.jsonCode === 404) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('cardPage.missingPrivateDetails');
                        return;
                    }

                    if (response?.jsonCode === 500) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        reject('cardPage.unexpectedError');
                        return;
                    }

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

function updateSettlementFrequency(workspaceAccountID: number, settlementFrequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>, currentFrequency?: Date) {
    const monthlySettlementDate = settlementFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY ? null : new Date();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                monthlySettlementDate,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                monthlySettlementDate,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                monthlySettlementDate: currentFrequency,
            },
        },
    ];

    const parameters = {
        workspaceAccountID,
        settlementFrequency,
    };

    API.write(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_FREQUENCY, parameters, {optimisticData, successData, failureData});
}

function updateSettlementAccount(domainName: string, workspaceAccountID: number, policyID: string, settlementBankAccountID?: number, currentSettlementBankAccountID?: number) {
    if (!settlementBankAccountID) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                paymentBankAccountID: settlementBankAccountID,
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                paymentBankAccountID: settlementBankAccountID,
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                paymentBankAccountID: currentSettlementBankAccountID,
                isLoading: false,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const parameters = {
        domainName,
        settlementBankAccountID,
    };

    API.write(WRITE_COMMANDS.UPDATE_CARD_SETTLEMENT_ACCOUNT, parameters, {optimisticData, successData, failureData});
}

function getCardDefaultName(userName?: string) {
    if (!userName) {
        return '';
    }
    return `${userName}'s Card`;
}

function setIssueNewCardStepAndData({data, isEditing, step, policyID, isChangeAssigneeDisabled}: IssueNewCardFlowData) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {
        data,
        isEditing,
        currentStep: step,
        errors: null,
        isChangeAssigneeDisabled,
    });
}

function setDraftInviteAccountID(assigneeEmail: string | undefined, assigneeAccountID: number | undefined, policyID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`, {
        [assigneeEmail ?? '']: assigneeAccountID,
    });
}

function clearIssueNewCardFlow(policyID: string | undefined) {
    Onyx.set(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {
        currentStep: null,
        data: {},
    });
}

function clearIssueNewCardFormData() {
    Onyx.set(ONYXKEYS.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM, {});
}

function clearIssueNewCardError(policyID: string | undefined) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {errors: null});
}

function updateExpensifyCardLimit(
    workspaceAccountID: number,
    cardID: number,
    newLimit: number,
    newAvailableSpend: number,
    oldLimit?: number,
    oldAvailableSpend?: number,
    isVirtualCard?: boolean,
) {
    const authToken = NetworkStore.getAuthToken();

    if (!authToken) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    availableSpend: newAvailableSpend,
                    nameValuePairs: {
                        unapprovedExpenseLimit: newLimit,
                        pendingFields: {unapprovedExpenseLimit: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    pendingFields: {availableSpend: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    isLoading: true,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {unapprovedExpenseLimit: null},
                    },
                    pendingAction: null,
                    pendingFields: {availableSpend: null},
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    availableSpend: oldAvailableSpend,
                    nameValuePairs: {
                        unapprovedExpenseLimit: oldLimit,
                        pendingFields: {unapprovedExpenseLimit: null},
                    },
                    pendingAction: null,
                    pendingFields: {availableSpend: null},
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
        isVirtualCard: isVirtualCard ?? false,
    };

    API.write(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT, parameters, {optimisticData, successData, failureData});
}

function updateExpensifyCardTitle(workspaceAccountID: number, cardID: number, newCardTitle: string, oldCardTitle?: string) {
    const authToken = NetworkStore.getAuthToken();

    if (!authToken) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        cardTitle: newCardTitle,
                        pendingFields: {cardTitle: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    isLoading: true,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {cardTitle: null},
                    },
                    pendingAction: null,
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        cardTitle: oldCardTitle,
                        pendingFields: {cardTitle: null},
                    },
                    pendingAction: null,
                    isLoading: false,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: UpdateExpensifyCardTitleParams = {
        authToken,
        cardID,
        cardTitle: newCardTitle,
    };

    API.write(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_TITLE, parameters, {optimisticData, successData, failureData});
}

function updateExpensifyCardLimitType(workspaceAccountID: number, cardID: number, newLimitType: CardLimitType, oldLimitType?: CardLimitType) {
    const authToken = NetworkStore.getAuthToken();

    if (!authToken) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        limitType: newLimitType,
                        pendingFields: {limitType: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    pendingFields: {availableSpend: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    isLoading: true,
                    errors: null,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    isLoading: false,
                    nameValuePairs: {
                        pendingFields: {limitType: null},
                    },
                    pendingAction: null,
                    pendingFields: {availableSpend: null},
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        limitType: oldLimitType,
                        pendingFields: {limitType: null},
                    },
                    pendingFields: {availableSpend: null},
                    pendingAction: null,
                    isLoading: false,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: UpdateExpensifyCardLimitTypeParams = {
        authToken,
        cardID,
        limitType: newLimitType,
    };

    API.write(WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT_TYPE, parameters, {optimisticData, successData, failureData});
}

function deactivateCard(workspaceAccountID: number, card?: Card) {
    const authToken = NetworkStore.getAuthToken();
    const cardID = card?.cardID ?? CONST.DEFAULT_NUMBER_ID;

    if (!authToken) {
        return;
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`,
            value: {
                [cardID]: {
                    ...card,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    ...card,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: CardDeactivateParams = {
        authToken,
        cardID,
    };

    API.write(WRITE_COMMANDS.CARD_DEACTIVATE, parameters, {optimisticData, failureData});
}

function startIssueNewCardFlow(policyID: string | undefined) {
    const parameters: StartIssueNewCardFlowParams = {
        policyID,
    };

    API.read(READ_COMMANDS.START_ISSUE_NEW_CARD_FLOW, parameters);
}

function configureExpensifyCardsForPolicy(policyID: string, bankAccountID?: number) {
    if (!bankAccountID) {
        return;
    }

    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA}${workspaceAccountID}`,
            value: {
                isLoading: true,
                isSuccess: false,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA}${workspaceAccountID}`,
            value: {
                isLoading: false,
                isSuccess: true,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`,
            value: {
                isLoading: false,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_BANK_ACCOUNT_METADATA}${workspaceAccountID}`,
            value: {
                isLoading: false,
                isSuccess: false,
            },
        },
    ];

    const parameters = {
        policyID,
        bankAccountID,
    };

    API.write(WRITE_COMMANDS.CONFIGURE_EXPENSIFY_CARDS_FOR_POLICY, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function issueExpensifyCard(domainAccountID: number, policyID: string | undefined, feedCountry: string, validateCode: string, data?: IssueNewCardData) {
    if (!data) {
        return;
    }

    const {assigneeEmail, limit, limitType, cardTitle, cardType} = data;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`,
            value: {
                isLoading: true,
                errors: null,
                isSuccessful: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`,
            value: {
                isLoading: false,
                isSuccessful: true,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD}${policyID}`,
            value: {
                isLoading: false,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    const parameters = {
        assigneeEmail,
        limit,
        limitType,
        cardTitle,
        validateCode,
        domainAccountID,
    };

    if (cardType === CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL) {
        API.write(
            WRITE_COMMANDS.CREATE_EXPENSIFY_CARD,
            {...parameters, feedCountry},
            {
                optimisticData,
                successData,
                failureData,
            },
        );
        return;
    }

    // eslint-disable-next-line rulesdir/no-multiple-api-calls
    API.write(
        WRITE_COMMANDS.CREATE_ADMIN_ISSUED_VIRTUAL_CARD,
        {...parameters, policyID},
        {
            optimisticData,
            successData,
            failureData,
        },
    );
}

function openCardDetailsPage(cardID: number) {
    const authToken = NetworkStore.getAuthToken();

    if (!authToken) {
        return;
    }

    const parameters: OpenCardDetailsPageParams = {
        authToken,
        cardID,
    };

    API.read(READ_COMMANDS.OPEN_CARD_DETAILS_PAGE, parameters);
}

function toggleContinuousReconciliation(workspaceAccountID: number, shouldUseContinuousReconciliation: boolean, connectionName: ConnectionName, oldConnectionName?: ConnectionName) {
    const parameters = shouldUseContinuousReconciliation
        ? {
              workspaceAccountID,
              shouldUseContinuousReconciliation,
              expensifyCardContinuousReconciliationConnection: connectionName,
          }
        : {
              workspaceAccountID,
              shouldUseContinuousReconciliation,
          };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
            value: shouldUseContinuousReconciliation,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
            value: connectionName,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
            value: shouldUseContinuousReconciliation,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
            value: connectionName,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_USE_CONTINUOUS_RECONCILIATION}${workspaceAccountID}`,
            value: !shouldUseContinuousReconciliation,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.EXPENSIFY_CARD_CONTINUOUS_RECONCILIATION_CONNECTION}${workspaceAccountID}`,
            value: oldConnectionName ?? null,
        },
    ];

    API.write(WRITE_COMMANDS.TOGGLE_CARD_CONTINUOUS_RECONCILIATION, parameters, {
        optimisticData,
        successData,
        failureData,
    });
}

function updateSelectedFeed(feed: CompanyCardFeedWithDomainID, policyID: string | undefined) {
    if (!policyID) {
        return;
    }

    Onyx.update([
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: feed,
        },
    ]);
}

function updateSelectedExpensifyCardFeed(feed: number, policyID: string | undefined) {
    if (!policyID) {
        return;
    }

    Onyx.update([
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`,
            value: feed,
        },
    ]);
}

function queueExpensifyCardForBilling(feedCountry: string, domainAccountID: number) {
    const parameters = {
        feedCountry,
        domainAccountID,
    };

    API.write(WRITE_COMMANDS.QUEUE_EXPENSIFY_CARD_FOR_BILLING, parameters);
}

/**
 * Resolves a fraud alert for a given card.
 * When the user clicks on the whisper it sets the optimistic data to the resolution and calls the API
 */
function resolveFraudAlert(cardID: number | undefined, isFraud: boolean, reportID: string | undefined, reportActionID: string | undefined) {
    if (!reportID || !reportActionID || !cardID) {
        Log.hmmm('[resolveFraudAlert] Missing required parameters');
        return;
    }

    const resolution = isFraud ? CONST.CARD_FRAUD_ALERT_RESOLUTION.FRAUD : CONST.CARD_FRAUD_ALERT_RESOLUTION.RECOGNIZED;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    originalMessage: {
                        resolution,
                    },
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    originalMessage: {
                        resolution: null,
                    },
                    pendingAction: null,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        },
    ];

    const parameters: ResolveFraudAlertParams = {
        cardID,
        isFraud,
    };

    API.write(WRITE_COMMANDS.RESOLVE_FRAUD_ALERT, parameters, {optimisticData, successData, failureData});
}

export {
    requestReplacementExpensifyCard,
    activatePhysicalExpensifyCard,
    clearCardListErrors,
    clearReportVirtualCardFraudForm,
    clearIssueNewCardError,
    reportVirtualExpensifyCardFraud,
    revealVirtualCardDetails,
    updateSettlementFrequency,
    setIssueNewCardStepAndData,
    clearIssueNewCardFlow,
    updateExpensifyCardLimit,
    updateExpensifyCardTitle,
    updateSettlementAccount,
    startIssueNewCardFlow,
    configureExpensifyCardsForPolicy,
    issueExpensifyCard,
    openCardDetailsPage,
    clearActivatedCardPin,
    toggleContinuousReconciliation,
    updateExpensifyCardLimitType,
    updateSelectedFeed,
    updateSelectedExpensifyCardFeed,
    deactivateCard,
    getCardDefaultName,
    queueExpensifyCardForBilling,
    clearIssueNewCardFormData,
    setDraftInviteAccountID,
    resolveFraudAlert,
};
export type {ReplacementReason};
