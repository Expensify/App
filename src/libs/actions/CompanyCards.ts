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
import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import * as CardUtils from '@libs/CardUtils';
import {getCardFeedWithDomainID} from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CardFeeds, CurrencyList, Policy, WorkspaceCardsList} from '@src/types/onyx';
import type {AssignCard, AssignCardData} from '@src/types/onyx/AssignCard';
import type {ExpensifyCardDetails} from '@src/types/onyx/Card';
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
import type Transaction from '@src/types/onyx/Transaction';

type AddNewCompanyCardFlowData = {
    /** Step to be set in Onyx */
    step?: AddNewCardFeedStep;

    /** Whether the user is editing step */
    isEditing?: boolean;

    /** Data required to be sent to issue a new card */
    data?: Partial<AddNewCardFeedData>;
};

type ImportCSVCompanyCardsData = {
    policyID: string;
    workspaceAccountID: number;
    layoutName: string;
    layoutType: string;
    columnMappings: string[];
    csvData: string[][];
    existingCardsList?: WorkspaceCardsList;
    lastSelectedFeed?: CompanyCardFeedWithDomainID;
    workspaceCardFeeds?: OnyxEntry<CardFeeds>;
};

type OptimisticCompanyCardCSVTransaction = Pick<Transaction, 'transactionID' | 'amount' | 'created' | 'currency' | 'merchant' | 'category' | 'tag' | 'comment' | 'cardName' | 'bank'> & {
    reportID: '0';
    pendingAction: typeof CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;
};

function getColumnIndex(columnMappings: string[], columnName: string): number {
    return columnMappings.findIndex((column) => column === columnName);
}

function parseCSVAmount(value: string): number | undefined {
    const sanitized = String(value).replaceAll(/[^\d.-]/g, '');
    if (!sanitized) {
        return undefined;
    }
    const parsedAmount = Math.round(Number(sanitized) * 100);
    if (Number.isNaN(parsedAmount)) {
        return undefined;
    }
    return parsedAmount;
}

function buildOptimisticCompanyCardCSVTransactions(
    csvData: string[][],
    columnMappings: string[],
    feedName: CompanyCardFeed,
): {
    csvDataWithGeneratedIDs: string[][];
    normalizedColumnMappings: string[];
    transactions: OptimisticCompanyCardCSVTransaction[];
} {
    const normalizedColumnMappings = [...columnMappings];
    const csvDataWithGeneratedIDs = csvData.map((row) => [...row]);

    normalizedColumnMappings.push(CONST.CSV_IMPORT_COLUMNS.EXTERNAL_ID);
    const externalIDColumnIndex = normalizedColumnMappings.length - 1;

    const cardNumberColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER);
    const postedDateColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.POSTED_DATE);
    const merchantColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.MERCHANT);
    const amountColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.AMOUNT);
    const currencyColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.CURRENCY);
    const categoryColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.CATEGORY);
    const tagColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.TAG);
    const commentColumnIndex = getColumnIndex(normalizedColumnMappings, CONST.CSV_IMPORT_COLUMNS.COMMENT);

    const transactions: OptimisticCompanyCardCSVTransaction[] = [];
    for (const row of csvDataWithGeneratedIDs) {
        const transactionID = rand64();
        row[externalIDColumnIndex] = transactionID;

        const cardName = row.at(cardNumberColumnIndex)?.trim();
        const created = row.at(postedDateColumnIndex)?.trim();
        const merchant = row.at(merchantColumnIndex)?.trim() ?? '';
        const currency = row.at(currencyColumnIndex)?.trim();
        const amountValue = row.at(amountColumnIndex) ?? '';
        const amount = parseCSVAmount(amountValue);

        if (!cardName || !created || !currency || amount === undefined) {
            continue;
        }

        const category = categoryColumnIndex >= 0 ? (row.at(categoryColumnIndex)?.trim() ?? '') : '';
        const tag = tagColumnIndex >= 0 ? (row.at(tagColumnIndex)?.trim() ?? '') : '';
        const comment = commentColumnIndex >= 0 ? (row.at(commentColumnIndex)?.trim() ?? '') : '';

        transactions.push({
            transactionID,
            amount,
            created,
            currency,
            merchant,
            category,
            tag,
            comment: {comment},
            cardName,
            bank: feedName,
            reportID: '0',
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        });
    }

    return {csvDataWithGeneratedIDs, normalizedColumnMappings, transactions};
}

function setAssignCardStepAndData({cardToAssign, isEditing, currentStep, isRefreshing}: Partial<AssignCard>) {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {cardToAssign, isEditing, currentStep, isRefreshing});
}

function clearAssignCardStepAndData() {
    Onyx.set(ONYXKEYS.ASSIGN_CARD, {});
}

function clearAssignCardErrors() {
    Onyx.merge(ONYXKEYS.ASSIGN_CARD, {errors: null});
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
    const newSelectedFeed = getCardFeedWithDomainID(feedType, workspaceAccountID) as CompanyCardFeedWithDomainID;

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
        feedDetails: feedDetails
            ? Object.entries(feedDetails)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')
            : '',
        statementPeriodEnd,
        statementPeriodEndDay,
    };

    API.write(WRITE_COMMANDS.REQUEST_FEED_SETUP, parameters, {optimisticData, failureData, finallyData});
}

function setWorkspaceCompanyCardFeedName(policyID: string, domainOrWorkspaceAccountID: number, bankName: CompanyCardFeedWithNumber, userDefinedName: string) {
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

function setWorkspaceCompanyCardTransactionLiability(domainOrWorkspaceAccountID: number, policyID: string, bankName: CompanyCardFeedWithNumber, liabilityType: string) {
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

function deleteWorkspaceCompanyCardFeed(
    policyID: string,
    domainOrWorkspaceAccountID: number,
    bankName: CompanyCardFeedWithNumber,
    cardIDs: string[],
    feedToOpen?: CompanyCardFeedWithDomainID,
) {
    const optimisticFeedUpdates = {[bankName]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}};
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

    // Card collections only: API onyxData provides SHARED_NVP on success (avoid merge-after-set on that key).
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST | typeof ONYXKEYS.CARD_LIST>> = [
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
    data: Partial<AssignCardData>,
    currentUserAccountID: number,
) {
    if (!policy?.id) {
        return;
    }
    const {bankName, email = '', encryptedCardNumber = '', startDate = '', customCardName = ''} = data;
    const assigneeDetails = PersonalDetailsUtils.getPersonalDetailByEmail(email);
    const optimisticCardAssignedReportAction = ReportUtils.buildOptimisticCardAssignedReportAction(assigneeDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserAccountID);

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

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.ASSIGN_CARD> = {
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
                value: {isAssignmentFinished: true},
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
        ],
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.ASSIGN_CARD,
                value: {isAssigning: false},
            },
        ],
    };

    API.write(WRITE_COMMANDS.ASSIGN_COMPANY_CARD, parameters, onyxData);
}

function unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID: number, bankName: CompanyCardFeedWithNumber, card: Card) {
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

    API.write(WRITE_COMMANDS.UNASSIGN_CARD, parameters, onyxData);
}

function resetFailedWorkspaceCompanyCardUnassignment(domainOrWorkspaceAccountID: number, bankName: CompanyCardFeedWithNumber | undefined, cardID: number | undefined) {
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

function updateWorkspaceCompanyCard(domainOrWorkspaceAccountID: number, cardID: string, bankName: CompanyCardFeedWithNumber, lastScrapeResult?: number, breakConnection?: boolean) {
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

    const parameters: {cardID: number; breakConnection?: number} = {
        cardID: Number(cardID),
    };

    if (breakConnection) {
        // Simulate "Account refresh required" error code for testing
        parameters.breakConnection = 438;
    }

    API.write(WRITE_COMMANDS.SYNC_CARD, parameters, {optimisticData, finallyData, failureData});
}

function updateCompanyCardName(domainOrWorkspaceAccountID: number, cardID: string, newCardTitle: string, bankName: CompanyCardFeedWithNumber, oldCardTitle?: string) {
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

function updateCardTransactionStartDate(domainOrWorkspaceAccountID: number, cardID: string, newStartDate: string, bankName: CompanyCardFeedWithNumber, oldStartDate?: string) {
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

function setCompanyCardExportAccount(policyID: string, domainOrWorkspaceAccountID: number, cardID: string, accountKey: string, newAccount: string, bank: CompanyCardFeedWithNumber) {
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

function clearCompanyCardErrorField(domainOrWorkspaceAccountID: number, cardID: string, bankName: CompanyCardFeedWithNumber, fieldName: string, isRootLevel?: boolean) {
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

function openPolicyCompanyCardsPage(policyID: string, domainOrWorkspaceAccountID: number, emailList: string[], translate: LocaleContextProps['translate']) {
    // Skip loading state writes when domainOrWorkspaceAccountID is 0 since Onyx discards writes to collection keys with member ID '0'.
    const onyxLoadingStateUpdates = domainOrWorkspaceAccountID !== CONST.DEFAULT_NUMBER_ID;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = onyxLoadingStateUpdates
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
                  value: {
                      isLoading: true,
                      errors: null,
                  },
              },
          ]
        : [];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = onyxLoadingStateUpdates
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
                  value: {
                      isLoading: false,
                  },
              },
          ]
        : [];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = onyxLoadingStateUpdates
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`,
                  value: {
                      isLoading: false,
                      errors: {
                          [CONST.COMPANY_CARDS.WORKSPACE_FEEDS_LOAD_ERROR]: translate('workspace.companyCards.error.workspaceFeedsCouldNotBeLoadedMessage'),
                      },
                  },
              },
          ]
        : [];

    const params: OpenPolicyExpensifyCardsPageParams = {
        policyID,
        emailList: JSON.stringify(emailList),
    };

    API.read(READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_PAGE, params, {optimisticData, successData, failureData});
}

function openPolicyCompanyCardsFeed(domainAccountID: number, policyID: string, feed: CompanyCardFeedWithNumber, translate: LocaleContextProps['translate']) {
    const parameters: OpenPolicyCompanyCardsFeedParams = {
        domainAccountID,
        policyID,
        feed,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`,
            value: {
                settings: {
                    cardFeedsStatus: {
                        [feed]: {
                            isLoading: true,
                            errors: null,
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
                    cardFeedsStatus: {
                        [feed]: {
                            isLoading: false,
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
                    cardFeedsStatus: {
                        [feed]: {
                            isLoading: false,
                            errors: {
                                [CONST.COMPANY_CARDS.FEED_LOAD_ERROR]: translate('workspace.companyCards.error.feedCouldNotBeLoadedMessage'),
                            },
                        },
                    },
                },
            },
        },
    ];

    API.read(READ_COMMANDS.OPEN_POLICY_COMPANY_CARDS_FEED, parameters, {optimisticData, successData, failureData});
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
    bankName: CompanyCardFeedWithNumber,
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

function importCSVCompanyCards({
    policyID,
    workspaceAccountID,
    layoutName,
    layoutType,
    columnMappings,
    csvData,
    existingCardsList,
    lastSelectedFeed,
    workspaceCardFeeds,
}: ImportCSVCompanyCardsData) {
    const feedName = layoutType as CompanyCardFeed;
    const {csvDataWithGeneratedIDs, normalizedColumnMappings, transactions: optimisticTransactions} = buildOptimisticCompanyCardCSVTransactions(csvData, columnMappings, feedName);
    const instanceID = Date.now().toString();

    const parameters: ImportCSVCompanyCardsParams = {
        policyID,
        settings: JSON.stringify({
            columnMappings: normalizedColumnMappings,
            instanceID,
            layoutName,
            layoutType,
        }),
        csvData: JSON.stringify(csvDataWithGeneratedIDs),
    };

    const feedNameWithDomainID = getCardFeedWithDomainID(feedName, workspaceAccountID);
    const existingCompanyCards = workspaceCardFeeds?.settings?.companyCards ?? {};
    const existingNicknames = workspaceCardFeeds?.settings?.companyCardNicknames ?? {};
    const shouldCreateFeed = !existingCompanyCards?.[feedName];
    const shouldSetNickname = !existingNicknames?.[feedName] && !!layoutName;

    const cardNumberColumnIndex = normalizedColumnMappings.indexOf(CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER);
    const cardNumbersFromCSV = new Set<string>();
    if (cardNumberColumnIndex !== -1 && optimisticTransactions.length > 0) {
        for (const row of csvDataWithGeneratedIDs) {
            const cardNumber = row?.at(cardNumberColumnIndex)?.trim();
            if (cardNumber) {
                cardNumbersFromCSV.add(cardNumber);
            }
        }
    }

    const existingCardNames = new Set<string>();
    const existingCardList = existingCardsList?.cardList ?? {};
    for (const cardName of Object.keys(existingCardList)) {
        existingCardNames.add(cardName);
    }
    const {cardList, ...assignedCards} = existingCardsList ?? {};
    for (const card of Object.values(assignedCards)) {
        if (card?.cardName) {
            existingCardNames.add(card.cardName);
        }
    }

    const newCardEntries = Object.fromEntries([...cardNumbersFromCSV].filter((cardName) => !existingCardNames.has(cardName)).map((cardName) => [cardName, cardName]));
    const mergedCardList = {...existingCardList, ...newCardEntries};
    const newCardEntriesCount = Object.keys(newCardEntries).length;
    const transactionsCount = optimisticTransactions.length;

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST
            | typeof ONYXKEYS.COLLECTION.LAST_SELECTED_FEED
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: feedNameWithDomainID as CompanyCardFeedWithDomainID,
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.IMPORTED_SPREADSHEET>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IMPORTED_SPREADSHEET,
            value: {
                shouldFinalModalBeOpened: true,
                importFinalModal: {
                    titleKey: 'spreadsheet.importSuccessfulTitle',
                    promptKey: 'spreadsheet.importCompanyCardTransactionsSuccessfulDescription',
                    promptKeyParams: {
                        transactions: transactionsCount,
                    },
                },
            },
        },
    ];

    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER
            | typeof ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST
            | typeof ONYXKEYS.COLLECTION.LAST_SELECTED_FEED
            | typeof ONYXKEYS.IMPORTED_SPREADSHEET
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`,
            value: lastSelectedFeed ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IMPORTED_SPREADSHEET,
            value: {
                shouldFinalModalBeOpened: true,
                importFinalModal: {
                    titleKey: 'spreadsheet.importFailedTitle',
                    promptKey: 'spreadsheet.importFailedDescription',
                },
            },
        },
    ];

    for (const transaction of optimisticTransactions) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: null,
        });
    }

    if (shouldCreateFeed || shouldSetNickname) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                settings: {
                    ...(shouldCreateFeed
                        ? {
                              companyCards: {
                                  [feedName]: {
                                      statementPeriodEndDay: null,
                                      errors: null,
                                  },
                              },
                          }
                        : {}),
                    ...(shouldSetNickname
                        ? {
                              companyCardNicknames: {
                                  [feedName]: layoutName,
                              },
                          }
                        : {}),
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`,
            value: {
                settings: {
                    ...(shouldCreateFeed ? {companyCards: {[feedName]: null}} : {}),
                    ...(shouldSetNickname ? {companyCardNicknames: {[feedName]: existingNicknames?.[feedName] ?? null}} : {}),
                },
            },
        });
    }

    if (newCardEntriesCount > 0) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feedName}`,
            value: {
                cardList: mergedCardList,
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${feedName}`,
            value: existingCardsList ?? null,
        });
    }

    API.write(WRITE_COMMANDS.IMPORT_CSV_COMPANY_CARDS, parameters, {optimisticData, successData, failureData});
}

/**
 * Seeds ASSIGN_CARD Onyx state for a card feed refresh flow. The correct connection step (Plaid vs OAuth) is
 * derived from the feed type. For Plaid feeds, ADD_NEW_COMPANY_CARD.data.selectedCountry is also populated
 * so that PlaidConnectionStep can open the correct institution login.
 *
 * Called directly after identity verification succeeds (from VerifyAccountPageBase.onValidationSuccess).
 * Navigation to the refresh page is handled by the caller (VerifyAccountPageBase.navigateForwardTo).
 */
function seedCardFeedRefresh(feed: CompanyCardFeedWithDomainID, outputCurrency?: string, currencyList?: CurrencyList, countryByIp?: string) {
    const isPlaidFeed = !!CardUtils.getPlaidInstitutionId(feed);
    const currentStep = isPlaidFeed ? CONST.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST.COMPANY_CARD.STEP.BANK_CONNECTION;

    if (isPlaidFeed) {
        const selectedCountry = CardUtils.getPlaidCountry(outputCurrency, currencyList, countryByIp);
        Onyx.merge(ONYXKEYS.ADD_NEW_COMPANY_CARD, {data: {selectedCountry}});
    }

    setAssignCardStepAndData({currentStep, isRefreshing: true, isEditing: false});
}

/**
 * Starts the card feed refresh flow for an already-validated user: seeds Onyx state and navigates
 * directly to the refresh connection page.
 *
 * When identity validation is required first, use the VERIFY_ACCOUNT screen with seedCardFeedRefresh
 * as the onValidationSuccess callback instead.
 */
function startCardFeedRefresh(policyID: string, feed: CompanyCardFeedWithDomainID, outputCurrency?: string, currencyList?: CurrencyList, countryByIp?: string) {
    seedCardFeedRefresh(feed, outputCurrency, currencyList, countryByIp);
    Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION.getRoute(policyID, feed));
}

function clearErrorField(bankName: CompanyCardFeedWithNumber, domainAccountID: number, fieldName: keyof CardFeedData) {
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

function linkCardFeedToPolicy(domainAccountID: number, policyID: string, feedType: string, feedCountry?: string, feedName?: CompanyCardFeedWithNumber) {
    return new Promise((resolve, reject) => {
        const parameters = {
            policyID,
            domainAccountID,
            feedType,
            feedName,
            feedCountry: feedCountry && feedCountry.length > 0 ? feedCountry : CONST.COUNTRY.US,
        };
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.LINK_CARD_FEED_TO_POLICY, parameters)
            .then((response) => {
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    reject('common.genericErrorMessage');
                    return;
                }
                resolve(response as ExpensifyCardDetails);
            })
            // eslint-disable-next-line prefer-promise-reject-errors
            .catch(() => reject('common.genericErrorMessage'));
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
    openPolicyAddCardFeedPage,
    setFeedStatementPeriodEndDay,
    importCSVCompanyCards,
    clearErrorField,
    clearAssignCardErrors,
    linkCardFeedToPolicy,
    seedCardFeedRefresh,
    startCardFeedRefresh,
};
