import type {NullishDeep, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {CombinedCardFeeds} from '@hooks/useCardFeeds';
import * as API from '@libs/API';
import type {
    AssignCompanyCardParams,
    ImportCSVCompanyCardsParams,
    OpenPolicyAddCardFeedPageParams,
    OpenPolicyCompanyCardsFeedParams,
    OpenPolicyExpensifyCardsPageParams,
    RequestFeedSetupParams,
    SetCompanyCardExportAccountParams,
    SetFeedStatementPeriodEndDayParams,
    UpdateCardTransactionStartDateParams,
    UpdateCompanyCardNameParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CardUtils from '@libs/CardUtils';
import {getCompanyCardFeedWithDomainID} from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, FailedCompanyCardAssignment, Policy} from '@src/types/onyx';
import type {AssignCard, AssignCardData} from '@src/types/onyx/AssignCard';
import type {
    AddNewCardFeedData,
    AddNewCardFeedStep,
    CardFeedData,
    CardFeedDetails,
    CompanyCardFeed,
    CompanyCardFeedWithDomainID,
    CompanyCardFeedWithNumber,
    StatementPeriodEnd,
    StatementPeriodEndDay,
} from '@src/types/onyx/CardFeeds';
import type {OnyxData} from '@src/types/onyx/Request';

type AddNewCompanyCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewCardFeedData>;
};

function setAssignCardStepAndData({cardToAssign, isEditing, currentStep}: Partial<AssignCard>) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {cardToAssign, isEditing, currentStep});
}

function setTransactionStartDate(startDate: string) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {startDate});
}

function clearAssignCardStepAndData() {
    Onyx.set(ONYXKEYS.ASSIGN_CARD, {});
}

function setAddNewCompanyCardStepAndData({data, isEditing, step}: NullishDeep<AddNewCompanyCardFlowData>) {
    Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {data, isEditing, currentStep: step});
}

function clearAddNewCardFlow() {
    Onyx.set(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
        currentStep: null,
        data: {},
    });
}

function addNewCompanyCardsFeed(
    policyID: string | undefined,
    workspaceAccountID: number,
    cardFeed: CompanyCardFeed,
    feedDetails: CardFeedDetails,
    cardFeeds: OnyxEntry<CombinedCardFeeds>,
    statementPeriodEnd: StatementPeriodEnd | undefined,
    statementPeriodEndDay: StatementPeriodEndDay | undefined,
    lastSelectedFeed?: CompanyCardFeedWithDomainID,
) {
    if (!policyID) {
        return;
    }

    const feedType = CardUtils.getFeedType(cardFeed, cardFeeds);
    const newSelectedFeed = getCompanyCardFeedWithDomainID(feedType as CompanyCardFeed, workspaceAccountID);

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.LAST_SELECTED_FEED | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: newSelectedFeed,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: true,
                settings: {
                    companyCards: {
                        [feedType]: {
                            statementPeriodEndDay: statementPeriodEndDay ?? statementPeriodEnd ?? null,
                            errors: null,
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.LAST_SELECTED_FEED | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: lastSelectedFeed ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: true,
                settings: {
                    companyCards: {
                        [feedType]: null,
                    },
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const parameters: RequestFeedSetupParams = {
        policyID,
        feedType,
        feedDetails: Object.entries(feedDetails)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', '),
        statementPeriodEnd,
        statementPeriodEndDay,
    };

    API.write(WRITE_COMMANDS.REQUEST_FEED_SETUP, parameters, {optimisticData, failureData, finallyData});
}

function setWorkspaceCompanyCardFeedName(policyID: string, domainOrWorkspaceAccountID: number, bankName: CompanyCardFeed, userDefinedName: string) {
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
                value: {
                    settings: {
                        companyCardNicknames: {
                            [bankName]: userDefinedName,
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        domainAccountID: domainOrWorkspaceAccountID,
        bankName,
        userDefinedName,
    };

    API.write(WRITE_COMMANDS.SET_COMPANY_CARD_FEED_NAME, parameters, onyxData);
}

function setWorkspaceCompanyCardTransactionLiability(domainOrWorkspaceAccountID: number, policyID: string, bankName: CompanyCardFeed, liabilityType: string) {
    const feedUpdates = {
        [bankName]: {liabilityType},
    };

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
                value: {
                    settings: {companyCards: feedUpdates},
                },
            },
        ],
    };

    const parameters = {
        policyID,
        bankName,
        liabilityType,
    };

    API.write(WRITE_COMMANDS.SET_COMPANY_CARD_TRANSACTION_LIABILITY, parameters, onyxData);
}

function deleteWorkspaceCompanyCardFeed(policyID: string, domainOrWorkspaceAccountID: number, bankName: CompanyCardFeed, cardIDs: string[], feedToOpen?: CompanyCardFeedWithDomainID) {
    const isCustomFeed = CardUtils.isCustomFeed(bankName);
    const optimisticFeedUpdates = {[bankName]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}};
    const successFeedUpdates = {[bankName]: null};
    const failureFeedUpdates = {[bankName]: {pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')}};
    const optimisticCardUpdates = Object.fromEntries(cardIDs.map((cardID) => [cardID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]));
    const successCardUpdates = Object.fromEntries(cardIDs.map((cardID) => [cardID, null]));
    const failureCardUpdates = Object.fromEntries(cardIDs.map((cardID) => [cardID, {pendingAction: null}]));

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST
            | typeof ONYXKEYS.CARD_LIST
            | typeof ONYXKEYS.COLLECTION.LAST_SELECTED_FEED
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                settings: {
                    companyCards: optimisticFeedUpdates,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: optimisticCardUpdates,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: optimisticCardUpdates,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                settings: {
                    ...(isCustomFeed ? {companyCards: successFeedUpdates} : {oAuthAccountDetails: successFeedUpdates, companyCards: successFeedUpdates}),
                    companyCardNicknames: {
                        [bankName]: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: successCardUpdates,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: successCardUpdates,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER | typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                settings: {
                    companyCards: failureFeedUpdates,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: failureCardUpdates,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: failureCardUpdates,
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
        value: feedToOpen ?? null,
    });

    const parameters = {
        domainAccountID: domainOrWorkspaceAccountID,
        policyID,
        bankName,
    };

    API.write(WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED, parameters, {optimisticData, successData, failureData});
}

function assignWorkspaceCompanyCard(
    policy: OnyxEntry<Policy>,
    domainOrWorkspaceAccountID: number,
    translate: LocaleContextProps['translate'],
    feed: CompanyCardFeedWithDomainID,
    data?: Partial<AssignCardData>,
) {
    if (!data || !policy?.id) {
        return;
    }
    const {bankName = '', email = '', encryptedCardNumber = '', startDate = '', cardName = '', cardholder, customCardName = ''} = data;
    const assigneeDetails = PersonalDetailsUtils.getPersonalDetailByEmail(email);
    const optimisticCardAssignedReportAction = ReportUtils.buildOptimisticCardAssignedReportAction(assigneeDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID);

    const failedCardAssignment: FailedCompanyCardAssignment = {
        domainOrWorkspaceAccountID,
        feed,
        cardholder,
        cardName,
        customCardName,
        encryptedCardNumber,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        errors: {
            failed: translate('workspace.companyCards.assignCardFailedError'),
        },
    };

    const parameters: AssignCompanyCardParams = {
        domainAccountID: domainOrWorkspaceAccountID,
        policyID: policy.id,
        bankName,
        encryptedCardNumber,
        cardName: customCardName,
        email,
        startDate,
        reportActionID: optimisticCardAssignedReportAction.reportActionID,
    };
    const policyExpenseChat = ReportUtils.getPolicyExpenseChat(policy.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID, policy.id);

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.ASSIGN_CARD | typeof ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
                value: {
                    [optimisticCardAssignedReportAction.reportActionID]: optimisticCardAssignedReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ASSIGN_CARD,
                value: {isAssigning: true},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
                value: {[optimisticCardAssignedReportAction.reportActionID]: {pendingAction: null}},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}_${feed}`,
                value: {
                    [encryptedCardNumber]: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
                value: {
                    [optimisticCardAssignedReportAction.reportActionID]: {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}_${feed}`,
                value: {
                    [encryptedCardNumber]: failedCardAssignment,
                },
            },
        ],
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ASSIGN_CARD,
                value: {isAssigning: false, isAssignmentFinished: true},
            },
        ],
    };

    API.write(WRITE_COMMANDS.ASSIGN_COMPANY_CARD, parameters, onyxData);
}

function resetFailedWorkspaceCompanyCardAssignment(domainOrWorkspaceAccountID: number, feed: CompanyCardFeedWithDomainID | undefined, encryptedCardNumber: string) {
    if (!feed) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.FAILED_COMPANY_CARDS_ASSIGNMENTS}${domainOrWorkspaceAccountID}_${feed}`, {
        [encryptedCardNumber]: null,
    });
}

function unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID: number, bankName: CompanyCardFeed, card: Card) {
    const cardID = card.cardID;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
                value: {
                    [cardID]: {
                        ...card,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        errors: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            },
        ],

        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
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
        ],

        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
                value: {
                    [cardID]: {
                        ...card,
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.companyCards.unassignCardFailedError'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.companyCards.unassignCardFailedError'),
                    },
                },
            },
        ],
    };

    const parameters = {
        cardID: Number(cardID),
    };

    API.write(WRITE_COMMANDS.UNASSIGN_COMPANY_CARD, parameters, onyxData);
}

function resetFailedWorkspaceCompanyCardUnassignment(domainOrWorkspaceAccountID: number, bankName: CompanyCardFeed | undefined, cardID: number | undefined) {
    if (!bankName || !cardID) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`, {
        [cardID]: {
            errors: null,
        },
    });

    Onyx.merge(ONYXKEYS.CARD_LIST, {
        [cardID]: {
            errors: null,
        },
    });
}

function updateWorkspaceCompanyCard(domainOrWorkspaceAccountID: number, cardID: string, bankName: CompanyCardFeed, lastScrapeResult?: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    isLoadingLastUpdated: true,
                    lastScrapeResult: CONST.JSON_CODE.SUCCESS,
                    pendingFields: {
                        lastScrape: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        lastScrape: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    lastScrapeResult: CONST.JSON_CODE.SUCCESS,
                    isLoadingLastUpdated: true,
                    pendingFields: {
                        lastScrape: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        lastScrape: null,
                    },
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    lastScrapeResult: CONST.JSON_CODE.SUCCESS,
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    lastScrapeResult: CONST.JSON_CODE.SUCCESS,
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    lastScrapeResult,
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                    errorFields: {
                        lastScrape: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    lastScrapeResult,
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                    errorFields: {
                        lastScrape: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        },
    ];

    const parameters = {
        cardID: Number(cardID),
    };

    API.write(WRITE_COMMANDS.UPDATE_COMPANY_CARD, parameters, {optimisticData, finallyData, failureData});
}

function updateCompanyCardName(domainOrWorkspaceAccountID: number, cardID: string, newCardTitle: string, bankName: CompanyCardFeed, oldCardTitle?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        cardTitle: newCardTitle,
                        pendingFields: {
                            cardTitle: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        errorFields: {
                            cardTitle: null,
                        },
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
            value: {[cardID]: newCardTitle},
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            cardTitle: null,
                        },
                    },
                },
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            cardTitle: null,
                        },
                        errorFields: {
                            cardTitle: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        },
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES,
            value: {[cardID]: oldCardTitle},
        },
    ];

    const parameters: UpdateCompanyCardNameParams = {
        cardID: Number(cardID),
        cardName: newCardTitle,
    };

    API.write(WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME, parameters, {optimisticData, finallyData, failureData});
}

function updateCardTransactionStartDate(domainOrWorkspaceAccountID: number, cardID: string, newStartDate: string, bankName: CompanyCardFeed, oldStartDate?: string) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    scrapeMinDate: newStartDate,
                    pendingFields: {
                        scrapeMinDate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    errorFields: {
                        scrapeMinDate: null,
                    },
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    pendingFields: {
                        scrapeMinDate: null,
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
                    scrapeMinDate: oldStartDate,
                    pendingFields: {
                        scrapeMinDate: null,
                    },
                    errorFields: {
                        scrapeMinDate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        },
    ];

    const parameters: UpdateCardTransactionStartDateParams = {
        cardID: Number(cardID),
        startDate: newStartDate,
    };

    API.write(WRITE_COMMANDS.UPDATE_CARD_TRANSACTION_START_DATE, parameters, {optimisticData, finallyData, failureData});
}

function setCompanyCardExportAccount(policyID: string, domainOrWorkspaceAccountID: number, cardID: string, accountKey: string, newAccount: string, bank: CompanyCardFeed) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bank}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            [accountKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                        errorFields: {
                            [accountKey]: null,
                        },
                        [accountKey]: newAccount,
                    },
                },
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bank}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            [accountKey]: null,
                        },
                    },
                },
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bank}`,
            value: {
                [cardID]: {
                    nameValuePairs: {
                        pendingFields: {
                            [accountKey]: newAccount,
                        },
                        errorFields: {
                            [accountKey]: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                        },
                    },
                },
            },
        },
    ];

    const parameters: SetCompanyCardExportAccountParams = {
        cardID: Number(cardID),
        exportAccountDetails: JSON.stringify({[accountKey]: newAccount, [`${accountKey}_policy_id`]: policyID}),
    };

    API.write(WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT, parameters, {optimisticData, finallyData, failureData});
}

function clearCompanyCardErrorField(domainOrWorkspaceAccountID: number, cardID: string, bankName: CompanyCardFeed, fieldName: string, isRootLevel?: boolean) {
    if (isRootLevel) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`, {
            [cardID]: {
                errorFields: {[fieldName]: null},
            },
        });
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`, {
        [cardID]: {
            nameValuePairs: {
                errorFields: {[fieldName]: null},
            },
        },
    });
    Onyx.merge(ONYXKEYS.CARD_LIST, {
        [cardID]: {
            nameValuePairs: {
                errorFields: {
                    [fieldName]: null,
                },
            },
        },
    });
}

function openPolicyCompanyCardsPage(policyID: string, domainOrWorkspaceAccountID: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: OpenPolicyExpensifyCardsPageParams = {
        policyID,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE, params, {optimisticData, finallyData});
}

function openPolicyCompanyCardsFeed(domainAccountID: number, policyID: string, feed: CompanyCardFeedWithNumber) {
    const parameters: OpenPolicyCompanyCardsFeedParams = {
        domainAccountID,
        policyID,
        feed,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED, parameters);
}

function openAssignFeedCardPage(policyID: string, feed: CompanyCardFeed, domainOrWorkspaceAccountID: number) {
    const parameters: OpenPolicyCompanyCardsFeedParams = {
        policyID,
        feed,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    API.read(READ_COMMANDS.OPEN_ASSIGN_FEED_CARD_PAGE, parameters, {optimisticData, finallyData});
}

function openPolicyAddCardFeedPage(policyID: string | undefined) {
    if (!policyID) {
        return;
    }

    const parameters: OpenPolicyAddCardFeedPageParams = {
        policyID,
    };

    API.write(WRITE_COMMANDS.OPEN_POLICY_ADD_CARD_FEED_PAGE, parameters);
}

function setFeedStatementPeriodEndDay(
    policyID: string,
    bankName: CompanyCardFeed,
    domainAccountID: number,
    newStatementPeriodEnd: StatementPeriodEnd | undefined,
    newStatementPeriodEndDay: StatementPeriodEndDay | undefined,
    oldStatementPeriodEndDay: StatementPeriodEnd | StatementPeriodEndDay | undefined,
) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    companyCards: {
                        [bankName]: {
                            statementPeriodEndDay: newStatementPeriodEndDay ?? newStatementPeriodEnd ?? null,
                            pendingFields: {
                                statementPeriodEndDay: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                statementPeriodEndDay: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    companyCards: {
                        [bankName]: {
                            pendingFields: {
                                statementPeriodEndDay: null,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    companyCards: {
                        [bankName]: {
                            statementPeriodEndDay: oldStatementPeriodEndDay ?? null,
                            pendingFields: {
                                statementPeriodEndDay: null,
                            },
                            errorFields: {
                                statementPeriodEndDay: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    const parameters: SetFeedStatementPeriodEndDayParams = {
        policyID,
        bankName,
        domainAccountID,
        statementPeriodEnd: newStatementPeriodEnd,
        statementPeriodEndDay: newStatementPeriodEndDay,
    };

    API.write(WRITE_COMMANDS.SET_FEED_STATEMENT_PERIOD_END_DAY, parameters, {optimisticData, successData, failureData});
}

function clearErrorField(bankName: CompanyCardFeed, domainAccountID: number, fieldName: keyof CardFeedData) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        settings: {
            companyCards: {
                [bankName]: {
                    errorFields: {
                        [fieldName]: null,
                    },
                },
            },
        },
    });
}

export {
    setWorkspaceCompanyCardFeedName,
    deleteWorkspaceCompanyCardFeed,
    setWorkspaceCompanyCardTransactionLiability,
    openPolicyCompanyCardsPage,
    openPolicyCompanyCardsFeed,
    addNewCompanyCardsFeed,
    assignWorkspaceCompanyCard,
    resetFailedWorkspaceCompanyCardAssignment,
    unassignWorkspaceCompanyCard,
    resetFailedWorkspaceCompanyCardUnassignment,
    updateWorkspaceCompanyCard,
    updateCompanyCardName,
    updateCardTransactionStartDate,
    setCompanyCardExportAccount,
    clearCompanyCardErrorField,
    setAddNewCompanyCardStepAndData,
    clearAddNewCardFlow,
    setAssignCardStepAndData,
    clearAssignCardStepAndData,
    openAssignFeedCardPage,
    openPolicyAddCardFeedPage,
    setTransactionStartDate,
    setFeedStatementPeriodEndDay,
    importCSVCompanyCards,
    clearErrorField,
};
