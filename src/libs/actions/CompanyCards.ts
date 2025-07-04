import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {
    AssignCompanyCardParams,
    OpenPolicyAddCardFeedPageParams,
    OpenPolicyCompanyCardsFeedParams,
    OpenPolicyExpensifyCardsPageParams,
    RequestFeedSetupParams,
    SetCompanyCardExportAccountParams,
    UpdateCompanyCardNameParams,
} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as NetworkStore from '@libs/Network/NetworkStore';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds} from '@src/types/onyx';
import type {AssignCard, AssignCardData} from '@src/types/onyx/AssignCard';
import type {AddNewCardFeedData, AddNewCardFeedStep, CardFeedDetails, CompanyCardFeed} from '@src/types/onyx/CardFeeds';
import type {OnyxData} from '@src/types/onyx/Request';

type AddNewCompanyCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewCardFeedData>;
};

function setAssignCardStepAndData({data, isEditing, currentStep}: Partial<AssignCard>) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {data, isEditing, currentStep});
}

function setTransactionStartDate(startDate: string) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {startDate});
}

function clearAssignCardStepAndData() {
    Onyx.set(ONYXKEYS.ASSIGN_CARD, {});
}

function setAddNewCompanyCardStepAndData({data, isEditing, step}: AddNewCompanyCardFlowData) {
    Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {data, isEditing, currentStep: step});
}

function clearAddNewCardFlow() {
    Onyx.set(ONYXKEYS.ADD_NEW_COMPANY_CARD, {
        currentStep: null,
        data: {},
    });
}

function addNewCompanyCardsFeed(policyID: string | undefined, cardFeed: CompanyCardFeed, feedDetails: CardFeedDetails, cardFeeds: OnyxEntry<CardFeeds>, lastSelectedFeed?: CompanyCardFeed) {
    const authToken = NetworkStore.getAuthToken();
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    if (!authToken || !policyID) {
        return;
    }

    const feedType = CardUtils.getFeedType(cardFeed, cardFeeds);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: feedType,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                isLoading: true,
                settings: {
                    companyCards: {
                        [feedType]: {
                            errors: null,
                        },
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: feedType,
        },
    ];
    const finallyData: OnyxUpdate[] = [
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
        authToken,
        feedType,
        feedDetails: Object.entries(feedDetails)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', '),
    };

    API.write(WRITE_COMMANDS.REQUEST_FEED_SETUP, parameters, {optimisticData, failureData, successData, finallyData});
}

function setWorkspaceCompanyCardFeedName(policyID: string, domainOrWorkspaceAccountID: number, bankName: string, userDefinedName: string) {
    const authToken = NetworkStore.getAuthToken();
    const onyxData: OnyxData = {
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
        authToken,
        policyID,
        domainAccountID: domainOrWorkspaceAccountID,
        bankName,
        userDefinedName,
    };

    API.write(WRITE_COMMANDS.SET_COMPANY_CARD_FEED_NAME, parameters, onyxData);
}

function setWorkspaceCompanyCardTransactionLiability(domainOrWorkspaceAccountID: number, policyID: string, bankName: CompanyCardFeed, liabilityType: string) {
    const authToken = NetworkStore.getAuthToken();
    const feedUpdates = {
        [bankName]: {liabilityType},
    };

    const onyxData: OnyxData = {
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
        authToken,
        policyID,
        bankName,
        liabilityType,
    };

    API.write(WRITE_COMMANDS.SET_COMPANY_CARD_TRANSACTION_LIABILITY, parameters, onyxData);
}

function deleteWorkspaceCompanyCardFeed(policyID: string, domainOrWorkspaceAccountID: number, bankName: CompanyCardFeed, cardIDs: string[], feedToOpen?: CompanyCardFeed) {
    const authToken = NetworkStore.getAuthToken();
    const isCustomFeed = CardUtils.isCustomFeed(bankName);
    const optimisticFeedUpdates = {[bankName]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}};
    const successFeedUpdates = {[bankName]: null};
    const failureFeedUpdates = {[bankName]: {pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')}};
    const optimisticCardUpdates = Object.fromEntries(cardIDs.map((cardID) => [cardID, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]));
    const successAndFailureCardUpdates = Object.fromEntries(cardIDs.map((cardID) => [cardID, {pendingAction: null}]));

    const optimisticData: OnyxUpdate[] = [
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

    const successData: OnyxUpdate[] = [
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
            value: successAndFailureCardUpdates,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: successAndFailureCardUpdates,
        },
    ];

    const failureData: OnyxUpdate[] = [
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
            value: successAndFailureCardUpdates,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: successAndFailureCardUpdates,
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
        value: feedToOpen ?? null,
    });

    const parameters = {
        authToken,
        domainAccountID: domainOrWorkspaceAccountID,
        policyID,
        bankName,
    };

    API.write(WRITE_COMMANDS.DELETE_COMPANY_CARD_FEED, parameters, {optimisticData, successData, failureData});
}

function assignWorkspaceCompanyCard(policyID: string, data?: Partial<AssignCardData>) {
    if (!data) {
        return;
    }
    const {bankName = '', email = '', encryptedCardNumber = '', startDate = '', cardName = ''} = data;
    const assigneeDetails = PersonalDetailsUtils.getPersonalDetailByEmail(email);
    const optimisticCardAssignedReportAction = ReportUtils.buildOptimisticCardAssignedReportAction(assigneeDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID);

    const parameters: AssignCompanyCardParams = {
        policyID,
        bankName,
        encryptedCardNumber,
        cardName,
        email,
        startDate,
        reportActionID: optimisticCardAssignedReportAction.reportActionID,
    };
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    const policy = PolicyUtils.getPolicy(policyID);
    const policyExpenseChat = ReportUtils.getPolicyExpenseChat(policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID, policyID);

    const onyxData: OnyxData = {
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
                key: ONYXKEYS.ASSIGN_CARD,
                value: {isAssigned: true, isAssigning: false},
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
                key: ONYXKEYS.ASSIGN_CARD,
                value: {isAssigning: false},
            },
        ],
    };

    API.write(WRITE_COMMANDS.ASSIGN_COMPANY_CARD, parameters, onyxData);
}

function unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID: number, bankName: string, card: Card) {
    const authToken = NetworkStore.getAuthToken();
    const cardID = card.cardID;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
                value: {
                    [cardID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
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
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.CARD_LIST,
                value: {
                    [cardID]: {
                        pendingAction: null,
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };

    const parameters = {
        authToken,
        cardID: Number(cardID),
    };

    API.write(WRITE_COMMANDS.UNASSIGN_COMPANY_CARD, parameters, onyxData);
}

function updateWorkspaceCompanyCard(domainOrWorkspaceAccountID: number, cardID: string, bankName: CompanyCardFeed) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
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

    const finallyData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
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
                    isLoadingLastUpdated: false,
                    pendingFields: {
                        lastScrape: null,
                    },
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${domainOrWorkspaceAccountID}_${bankName}`,
            value: {
                [cardID]: {
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
        authToken,
        cardID: Number(cardID),
    };

    API.write(WRITE_COMMANDS.UPDATE_COMPANY_CARD, parameters, {optimisticData, finallyData, failureData});
}

function updateCompanyCardName(domainOrWorkspaceAccountID: number, cardID: string, newCardTitle: string, bankName: string, oldCardTitle?: string) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
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

    const finallyData: OnyxUpdate[] = [
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
    const failureData: OnyxUpdate[] = [
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
        authToken,
        cardID: Number(cardID),
        cardName: newCardTitle,
    };

    API.write(WRITE_COMMANDS.UPDATE_COMPANY_CARD_NAME, parameters, {optimisticData, finallyData, failureData});
}

function setCompanyCardExportAccount(policyID: string, domainOrWorkspaceAccountID: number, cardID: string, accountKey: string, newAccount: string, bank: string) {
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
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

    const finallyData: OnyxUpdate[] = [
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
    const failureData: OnyxUpdate[] = [
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
        authToken,
        cardID: Number(cardID),
        exportAccountDetails: JSON.stringify({[accountKey]: newAccount, [`${accountKey}_policy_id`]: policyID}),
    };

    API.write(WRITE_COMMANDS.SET_CARD_EXPORT_ACCOUNT, parameters, {optimisticData, finallyData, failureData});
}

function clearCompanyCardErrorField(domainOrWorkspaceAccountID: number, cardID: string, bankName: string, fieldName: string, isRootLevel?: boolean) {
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
    const authToken = NetworkStore.getAuthToken();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
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
        authToken,
    };

    API.read(READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE, params, {optimisticData, successData, failureData});
}

function openPolicyCompanyCardsFeed(domainAccountID: number, policyID: string, feed: CompanyCardFeed) {
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

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
            value: {
                isLoading: false,
            },
        },
    ];

    API.read(READ_COMMANDS.OPEN_ASSIGN_FEED_CARD_PAGE, parameters, {optimisticData, successData, failureData});
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

export {
    setWorkspaceCompanyCardFeedName,
    deleteWorkspaceCompanyCardFeed,
    setWorkspaceCompanyCardTransactionLiability,
    openPolicyCompanyCardsPage,
    openPolicyCompanyCardsFeed,
    addNewCompanyCardsFeed,
    assignWorkspaceCompanyCard,
    unassignWorkspaceCompanyCard,
    updateWorkspaceCompanyCard,
    updateCompanyCardName,
    setCompanyCardExportAccount,
    clearCompanyCardErrorField,
    setAddNewCompanyCardStepAndData,
    clearAddNewCardFlow,
    setAssignCardStepAndData,
    clearAssignCardStepAndData,
    openAssignFeedCardPage,
    openPolicyAddCardFeedPage,
    setTransactionStartDate,
};
