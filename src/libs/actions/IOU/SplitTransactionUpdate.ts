// eslint-disable-next-line no-restricted-imports
import {InteractionManager} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SearchActionsContextValue, SearchStateContextValue} from '@components/Search/types';
import {write as apiWrite} from '@libs/API';
import type {RevertSplitTransactionParams, SplitTransactionParams, SplitTransactionSplitsParam} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {calculateAmount as calculateIOUAmount} from '@libs/IOUUtils';
import Log from '@libs/Log';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {getDistanceRateCustomUnitRate} from '@libs/PolicyUtils';
import {
    getAllReportActions,
    getIOUActionForReportID,
    getIOUActionForTransactionID,
    getLastVisibleAction,
    getOriginalMessage,
    getReportAction,
    isActionOfType,
    isAddCommentAction,
    isDeletedAction,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {
    buildOptimisticAddCommentReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getParsedComment,
    getReportOrDraftReport,
    getTransactionDetails,
    isArchivedReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    navigateBackOnDeleteTransaction,
    updateOptimisticParentReportAction,
} from '@libs/ReportUtils';
import {isTracking, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {getChildTransactions, isDistanceRequest as isDistanceRequestTransactionUtils, isOnHold, isPerDiemRequest as isPerDiemRequestTransactionUtils} from '@libs/TransactionUtils';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import {removeDraftSplitTransaction} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant, SplitExpense} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import type {TransactionChanges} from '@src/types/onyx/Transaction';
import {getCleanUpTransactionThreadReportOnyxData} from './DeleteMoneyRequest';
import {getAllReports, getMoneyRequestParticipantsFromReport, getMoneyRequestPolicyTags, getPolicyTagsData} from './index';
import {getMoneyRequestInformation, getReportPreviewAction} from './MoneyRequestBuilder';
import type {BuildOnyxDataForMoneyRequestKeys, MoneyRequestInformationParams} from './MoneyRequestBuilder';
import {getDeleteTrackExpenseInformation} from './TrackExpense';
import {getUpdateMoneyRequestParams} from './UpdateMoneyRequest';
import type {UpdateMoneyRequestDataKeys} from './UpdateMoneyRequest';

type UpdateSplitTransactionsParams = {
    allTransactionsList: OnyxCollection<OnyxTypes.Transaction>;
    allReportsList: OnyxCollection<OnyxTypes.Report>;
    allReportNameValuePairsList: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
    allSnapshots?: OnyxCollection<OnyxTypes.SearchResults>;
    transactionData: {
        reportID: string;
        originalTransactionID: string;
        splitExpenses: SplitExpense[];
        splitExpensesTotal: number | undefined;
    };
    searchContext?: (Partial<SearchStateContextValue & SearchActionsContextValue> & {activeGroupSearchHashes?: number[]}) | undefined;
    policyCategories: OnyxTypes.PolicyCategories | undefined;
    policy: OnyxTypes.Policy | undefined;
    policyRecentlyUsedCategories: OnyxTypes.RecentlyUsedCategories | undefined;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    firstIOU: OnyxEntry<OnyxTypes.ReportAction> | undefined;
    isASAPSubmitBetaEnabled: boolean;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    iouReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isFromSplitExpensesFlow?: boolean;
    policyTags: OnyxTypes.PolicyTagLists;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    transactionReport: OnyxEntry<OnyxTypes.Report>;
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    isOffline: boolean;
};

function updateSplitTransactions({
    allTransactionsList,
    allReportsList,
    allReportNameValuePairsList,
    allSnapshots,
    transactionData,
    searchContext,
    policyCategories,
    policy,
    policyRecentlyUsedCategories,
    iouReport,
    firstIOU,
    isASAPSubmitBetaEnabled,
    currentUserPersonalDetails,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    iouReportNextStep,
    isFromSplitExpensesFlow,
    betas,
    policyTags,
    personalDetails,
    transactionReport,
    expenseReport,
    isOffline,
}: UpdateSplitTransactionsParams) {
    const chatReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.chatReportID}`];
    const expenseReportParentChat = getReportOrDraftReport(chatReport?.parentReportID);
    const originalTransactionID = transactionData?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const originalTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const originalTransactionDetails = getTransactionDetails(originalTransaction);
    const autoParticipants = getMoneyRequestParticipantsFromReport(expenseReport, currentUserPersonalDetails.accountID);
    // Delegate split edit can reach this flow without the workspace expense chat in Onyx.
    const fallbackPolicyParticipant =
        autoParticipants.length === 0 && !chatReport && expenseReport?.chatReportID && expenseReport?.policyID
            ? {
                  accountID: 0,
                  reportID: expenseReport.chatReportID,
                  isPolicyExpenseChat: true,
                  selected: true,
                  policyID: expenseReport.policyID,
              }
            : undefined;
    const participants = fallbackPolicyParticipant ? [fallbackPolicyParticipant] : autoParticipants;
    let fallbackPolicyParentChatReport = expenseReportParentChat;
    if (!fallbackPolicyParentChatReport && chatReport && isPolicyExpenseChatReportUtil(chatReport)) {
        fallbackPolicyParentChatReport = chatReport;
    }
    if (!fallbackPolicyParentChatReport && fallbackPolicyParticipant) {
        fallbackPolicyParentChatReport = {
            reportID: fallbackPolicyParticipant.reportID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: fallbackPolicyParticipant.policyID,
            ownerAccountID: expenseReport?.ownerAccountID,
        } as OnyxTypes.Report;
    }
    const splitExpenses = transactionData?.splitExpenses ?? [];

    // Get all children once (including orphaned), then filter for non-orphaned
    const allChildTransactions = getChildTransactions(allTransactionsList, allReportsList, originalTransactionID, true);
    const originalChildTransactions = allChildTransactions.filter((tx) => tx?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID);
    const processedChildTransactionIDs: string[] = [];

    const splitExpensesTotal = transactionData?.splitExpensesTotal ?? 0;

    const isCreationOfSplits = originalChildTransactions.length === 0;
    const hasEditableSplitExpensesLeft = splitExpenses.some((expense) => (expense.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED);
    // Don't revert split if there are orphaned children (reportID '0') - they're still part of the split
    const isReverseSplitOperation =
        splitExpenses.length === 1 && originalChildTransactions.length > 0 && hasEditableSplitExpensesLeft && allChildTransactions.length === originalChildTransactions.length;

    let splitThreadComments: OnyxTypes.ReportAction[] = [];
    let splitThreadReportAction: OnyxTypes.ReportAction | undefined;
    let splitTransactionThreadReportID: string | undefined;

    if (isReverseSplitOperation) {
        const revertSplitTransactionID = splitExpenses.at(0)?.transactionID;
        const revertSplitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${revertSplitTransactionID}`];
        const revertSplitReportActions = getAllReportActions(revertSplitTransaction?.reportID);
        splitThreadReportAction = revertSplitTransactionID ? getIOUActionForTransactionID(Object.values(revertSplitReportActions ?? {}), revertSplitTransactionID) : undefined;
        splitTransactionThreadReportID = splitThreadReportAction?.childReportID;
        if (splitTransactionThreadReportID) {
            const splitTransactionThreadActions = getAllReportActions(splitTransactionThreadReportID);
            splitThreadComments = Object.values(splitTransactionThreadActions).filter(
                (action): action is OnyxTypes.ReportAction =>
                    isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) && !isDeletedAction(action) && (action.actorAccountID ?? CONST.DEFAULT_NUMBER_ID) > 0,
            );
        }
    }

    let changesInReportTotal = 0;
    // Validate custom unit rate before proceeding with split
    const customUnitRateID = originalTransaction?.comment?.customUnit?.customUnitRateID;
    const isPerDiem = isPerDiemRequestTransactionUtils(originalTransaction);

    if (customUnitRateID && policy && !isPerDiem && isCreationOfSplits && !isFromSplitExpensesFlow) {
        const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);

        // If the rate doesn't exist or is disabled, show an error and return early
        if (!customUnitRate?.enabled) {
            // Show error to user
            Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.invalidRate'),
            });
            return;
        }
    }

    const splits: SplitTransactionSplitsParam =
        splitExpenses.map((split) => {
            const currentDescription = getParsedComment(Parser.htmlToMarkdown(split.description ?? ''));
            changesInReportTotal += split.amount;
            return {
                amount: split.amount,
                category: split.category ?? '',
                tag: split.tags?.[0] ?? '',
                created: split.created,
                merchant: split?.merchant ?? '',
                transactionID: split.transactionID,
                comment: {
                    comment: currentDescription,
                },
                reimbursable: split?.reimbursable,
                billable: split?.billable,
                quantity: split.customUnit?.quantity ?? undefined,
                customUnitRateID: split.customUnit?.customUnitRateID,
                odometerStart: split.odometerStart,
                odometerEnd: split.odometerEnd,
                waypoints: split.waypoints,
            };
        }) ?? [];
    changesInReportTotal -= splitExpensesTotal;

    const onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys | UpdateMoneyRequestDataKeys> = {
        successData: [],
        failureData: [],
        optimisticData: [],
    };

    // The split transactions can be in different reports, so we need to calculate the total for each report.
    const reportTotals = new Map<string, number>();
    const expenseReportID = expenseReport?.reportID;

    if (expenseReportID) {
        const expenseReportKey = `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`;
        const expenseReportTotal = allReportsList?.[expenseReportKey]?.total ?? expenseReport?.total ?? 0;
        reportTotals.set(expenseReportID, expenseReportTotal - changesInReportTotal);
    }

    for (const expense of splitExpenses) {
        const splitExpenseReportID = expense.reportID;
        if (!splitExpenseReportID || reportTotals.has(splitExpenseReportID)) {
            continue;
        }

        const splitExpenseReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpenseReportID}`];
        reportTotals.set(splitExpenseReportID, splitExpenseReport?.total ?? 0);
    }

    let updatedReportPreviewAction: Partial<OnyxTypes.ReportAction> | undefined;
    const originalReportPreviewAction = getReportPreviewAction(expenseReport?.chatReportID, expenseReport?.reportID);
    const transactionReportActions = getAllReportActions(firstIOU?.childReportID);
    const expenseReportNameValuePairs = allReportNameValuePairsList?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport?.reportID}`];
    const isArchivedExpenseReport = isArchivedReport(expenseReportNameValuePairs);
    const canUserPerformWriteAction = chatReport ? !!canUserPerformWriteActionReportUtils(chatReport, isArchivedExpenseReport) : true;
    const lastVisibleAction = getLastVisibleAction(expenseReport?.reportID, canUserPerformWriteAction);
    const isTransactionOnHold = isOnHold(originalTransaction);
    const holdReportAction = getReportAction(firstIOU?.childReportID, `${originalTransaction?.comment?.hold ?? ''}`);

    let holdCommentReportAction: OnyxTypes.ReportAction<'ADDCOMMENT'> | undefined;
    const allCommentActionsFromOriginalTransactionThread: Array<OnyxTypes.ReportAction<'ADDCOMMENT'>> = [];
    for (const action of Object.values(transactionReportActions ?? {})) {
        if (!isAddCommentAction(action)) {
            continue;
        }

        if (holdReportAction && !(holdCommentReportAction?.timestamp && holdReportAction?.timestamp === holdCommentReportAction.timestamp)) {
            // The HOLD report action and its corresponding comment share the same `timestamp` value.
            if (holdReportAction.timestamp !== undefined && holdReportAction.timestamp === action.timestamp) {
                holdCommentReportAction = action;
            } else if (action.created >= holdReportAction.created && (!holdCommentReportAction || holdCommentReportAction.created >= action.created)) {
                // If `timestamp` is unavailable, fall back to finding the comment whose `created` value
                // is greater than and closest to that of the holdReportAction.
                holdCommentReportAction = action;
            }
        }

        if (isDeletedAction(action) || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        allCommentActionsFromOriginalTransactionThread.push(action);
    }
    // We will pre-sort to ensure that comments are inserted in the correct order.
    allCommentActionsFromOriginalTransactionThread.sort((a, b) => (a.created > b.created ? 1 : -1));

    const updateParentActions = (iouAction: OnyxTypes.ReportAction, childVisibleActionCountToAdd: number) => {
        if (childVisibleActionCountToAdd <= 0) {
            return undefined;
        }

        const updatedIOUAction = updateOptimisticParentReportAction(iouAction, iouAction.created, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, childVisibleActionCountToAdd);

        if (originalReportPreviewAction) {
            const nextUpdatedReportPreviewAction = updateOptimisticParentReportAction(
                (updatedReportPreviewAction ?? originalReportPreviewAction) as OnyxTypes.ReportAction,
                lastVisibleAction?.childLastVisibleActionCreated ?? lastVisibleAction?.created ?? '',
                CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                childVisibleActionCountToAdd,
            ) as Partial<OnyxTypes.ReportAction>;
            nextUpdatedReportPreviewAction.reportActionID = originalReportPreviewAction.reportActionID;
            updatedReportPreviewAction = nextUpdatedReportPreviewAction;
        }

        return updatedIOUAction;
    };
    const updateParentActionsFromSourceThread = (
        sourceThreadReportAction: OnyxEntry<OnyxTypes.ReportAction>,
        sourceThreadCommentActions: OnyxTypes.ReportAction[],
        isSourceTransactionOnHold: boolean,
    ) => {
        // Keep positive stored counts when available, but recover from stale zero/negative metadata using the derived fallback.
        const getMergedPositiveCount = (storedCount: number | undefined, fallbackCount: number) => {
            if ((storedCount ?? 0) <= 0) {
                return fallbackCount;
            }
            return Math.max(storedCount ?? 0, fallbackCount);
        };

        const fallbackChildVisibleActionCount = sourceThreadCommentActions.length + (isSourceTransactionOnHold ? 1 : 0);
        const childVisibleActionCount = getMergedPositiveCount(sourceThreadReportAction?.childVisibleActionCount, fallbackChildVisibleActionCount);

        if (childVisibleActionCount <= 0) {
            return undefined;
        }

        const commenterAccountIDs = new Set<number>();
        const storedChildLastVisibleActionCreated = sourceThreadReportAction?.childLastVisibleActionCreated ?? '';
        let latestCommentCreated = storedChildLastVisibleActionCreated;

        for (const sourceThreadCommentAction of sourceThreadCommentActions) {
            if (sourceThreadCommentAction.actorAccountID && sourceThreadCommentAction.actorAccountID > 0) {
                commenterAccountIDs.add(sourceThreadCommentAction.actorAccountID);
            }
            if (!storedChildLastVisibleActionCreated && sourceThreadCommentAction.created > latestCommentCreated) {
                latestCommentCreated = sourceThreadCommentAction.created;
            }
        }

        const fallbackThreadMetadata = {
            childCommenterCount: commenterAccountIDs.size,
            childOldestFourAccountIDs: [...commenterAccountIDs].slice(0, 4).join(','),
        };
        const storedThreadMetadata = {
            childCommenterCount: sourceThreadReportAction?.childCommenterCount,
            childOldestFourAccountIDs: sourceThreadReportAction?.childOldestFourAccountIDs ?? '',
        };
        const childCommenterCount = getMergedPositiveCount(storedThreadMetadata.childCommenterCount, fallbackThreadMetadata.childCommenterCount);
        const storedChildOldestFourAccountIDSet = new Set(storedThreadMetadata.childOldestFourAccountIDs.split(',').filter(Boolean));
        const hasConsistentStoredCommenterIDs =
            fallbackThreadMetadata.childCommenterCount === 0 || [...commenterAccountIDs].every((accountID) => storedChildOldestFourAccountIDSet.has(String(accountID)));
        const childOldestFourAccountIDs =
            (storedThreadMetadata.childCommenterCount ?? 0) > 0 && storedThreadMetadata.childOldestFourAccountIDs && hasConsistentStoredCommenterIDs
                ? storedThreadMetadata.childOldestFourAccountIDs
                : fallbackThreadMetadata.childOldestFourAccountIDs;

        return {
            childVisibleActionCount,
            childCommenterCount,
            childLastVisibleActionCreated: latestCommentCreated,
            childOldestFourAccountIDs,
        };
    };
    const pushUpdatedReportPreviewActionToOnyxData = () => {
        if (!updatedReportPreviewAction) {
            return;
        }

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [updatedReportPreviewAction?.reportActionID ?? CONST.DEFAULT_NUMBER_ID]: updatedReportPreviewAction,
            },
        });

        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [updatedReportPreviewAction?.reportActionID ?? CONST.DEFAULT_NUMBER_ID]: {
                    childVisibleActionCount: originalReportPreviewAction?.childVisibleActionCount,
                    childCommenterCount: originalReportPreviewAction?.childCommenterCount,
                    childLastVisibleActionCreated: originalReportPreviewAction?.childLastVisibleActionCreated,
                    childOldestFourAccountIDs: originalReportPreviewAction?.childOldestFourAccountIDs,
                },
            },
        });
    };

    // Collect optimistic child transactions to add to the search snapshot (forward split only)
    const optimisticChildSnapshotEntries: SearchResultDataType = {};
    const optimisticChildSnapshotKeys: Array<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`> = [];

    for (const [index, splitExpense] of splitExpenses.entries()) {
        const existingTransactionID = isReverseSplitOperation ? originalTransactionID : splitExpense.transactionID;
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`];
        if (splitTransaction) {
            processedChildTransactionIDs.push(splitTransaction.transactionID);
        }

        const splitReportActions = getAllReportActions(isReverseSplitOperation ? expenseReport?.reportID : splitTransaction?.reportID);
        const currentReportAction = Object.values(splitReportActions).find((action) => {
            const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
            return transactionID === existingTransactionID;
        });

        const splitExpenseMerchant = splitExpense.merchant ?? '';

        const requestMoneyInformation = {
            participantParams: {
                participant: participants.at(0) ?? ({} as Participant),
                payeeEmail: currentUserPersonalDetails?.login ?? '',
                payeeAccountID: currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            },
            policyParams: {
                policy,
                policyCategories,
                policyTags,
            },
            transactionParams: {
                amount: Math.abs(originalTransaction?.amount ?? 0),
                modifiedAmount: splitExpense.amount ?? 0,
                currency: originalTransactionDetails?.currency ?? CONST.CURRENCY.USD,
                created: splitExpense.created,
                merchant: splitExpenseMerchant,
                comment: splitExpense.description,
                category: splitExpense.category,
                tag: splitExpense.tags?.[0],
                originalTransactionID,
                attendees: splitTransaction?.comment?.attendees ?? originalTransactionDetails?.attendees,
                source: CONST.IOU.TYPE.SPLIT,
                linkedTrackedExpenseReportAction: currentReportAction,
                pendingAction: splitTransaction ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                pendingFields: splitTransaction ? splitTransaction.pendingFields : undefined,
                reimbursable: originalTransactionDetails?.reimbursable,
                taxCode: originalTransactionDetails?.taxCode,
                taxAmount: calculateIOUAmount(splitExpenses.length - 1, originalTransactionDetails?.taxAmount ?? 0, originalTransactionDetails?.currency ?? CONST.CURRENCY.USD, false),
                taxValue: originalTransactionDetails?.taxValue,
                billable: originalTransactionDetails?.billable,
                waypoints: splitExpense.waypoints,
                customUnit: splitExpense.customUnit,
                // For distance transactions, also pass distance from customUnit.quantity so buildOptimisticTransaction sets it correctly
                distance: splitExpense.customUnit?.quantity,
                odometerStart: splitExpense.odometerStart,
                odometerEnd: splitExpense.odometerEnd,
            },
            parentChatReport: fallbackPolicyParentChatReport,
            existingTransaction: originalTransaction,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
            currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            betas,
            personalDetails,
        } as MoneyRequestInformationParams;

        if (isReverseSplitOperation) {
            requestMoneyInformation.transactionParams = {
                amount: splitExpense.amount ?? 0,
                currency: originalTransactionDetails?.currency ?? CONST.CURRENCY.USD,
                created: splitExpense.created,
                merchant: splitExpense.merchant ?? '',
                comment: splitExpense.description,
                category: splitExpense.category,
                tag: splitExpense.tags?.[0],
                attendees: originalTransactionDetails?.attendees as Attendee[],
                linkedTrackedExpenseReportAction: currentReportAction,
                taxCode: originalTransactionDetails?.taxCode,
                taxAmount: calculateIOUAmount(splitExpenses.length - 1, originalTransactionDetails?.taxAmount ?? 0, originalTransactionDetails?.currency ?? CONST.CURRENCY.USD, false),
                taxValue: originalTransactionDetails?.taxValue,
                billable: originalTransactionDetails?.billable,
                waypoints: splitExpense.waypoints,
                customUnit: splitExpense.customUnit,
                // For distance transactions, also pass distance from customUnit.quantity so buildOptimisticTransaction sets it correctly
                distance: splitExpense.customUnit?.quantity ?? undefined,
                odometerStart: splitExpense.odometerStart,
                odometerEnd: splitExpense.odometerEnd,
            };
            requestMoneyInformation.existingTransaction = undefined;
        }

        const {participantParams, policyParams, transactionParams, parentChatReport, existingTransaction} = requestMoneyInformation;
        const parsedComment = getParsedComment(Parser.htmlToMarkdown(transactionParams.comment ?? ''));
        transactionParams.comment = parsedComment;

        const {
            transactionThreadReportID,
            createdReportActionIDForThread,
            transaction: optimisticTransactionFromGetMoneyRequest,
            onyxData: moneyRequestInformationOnyxData,
            iouAction,
        } = getMoneyRequestInformation({
            participantParams,
            parentChatReport,
            policyParams: {
                ...policyParams,
                policyTagList: getMoneyRequestPolicyTags({moneyRequestReportID: splitExpense?.reportID, parentChatReport, participant: participantParams.participant}),
            },
            transactionParams,
            moneyRequestReportID: splitExpense?.reportID,
            existingTransaction,
            existingTransactionID,
            newReportTotal: reportTotals.get(splitExpense?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)) ?? 0,
            newNonReimbursableTotal: (transactionReport?.nonReimbursableTotal ?? 0) - changesInReportTotal,
            isSplitExpense: true,
            currentReportActionID: !isReverseSplitOperation ? currentReportAction?.reportActionID : undefined,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
            currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
            transactionViolations,
            quickAction,
            shouldGenerateTransactionThreadReport: true,
            policyRecentlyUsedCurrencies,
            betas,
            personalDetails,
        });

        let updateMoneyRequestParamsOnyxData: OnyxData<UpdateMoneyRequestDataKeys> = {};
        const currentSplit = splits.at(index);

        // For existing split transactions, update the field change messages
        // For new transactions, skip this step
        if (splitTransaction) {
            const transactionChanges = {
                ...currentSplit,
                comment: currentSplit?.comment?.comment,
                customUnitRateID: currentSplit?.customUnitRateID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID,
            } as TransactionChanges;

            const existing = getTransactionDetails(splitTransaction);
            const oldTransactionChanges = {
                ...existing,
                quantity: splitTransaction.comment?.customUnit?.quantity ?? existing?.distance,
            } as TransactionChanges;

            if (currentSplit) {
                currentSplit.reimbursable = splitTransaction.reimbursable;
                currentSplit.billable = splitTransaction.billable;
            }

            for (const key of Object.keys(transactionChanges)) {
                const newValue = transactionChanges[key as keyof typeof transactionChanges];
                const oldValue = oldTransactionChanges?.[key as keyof typeof oldTransactionChanges];
                if (newValue === oldValue) {
                    delete transactionChanges[key as keyof typeof transactionChanges];
                    // Ensure we pass the currency to getUpdateMoneyRequestParams as well, so the amount message is created correctly
                } else if (key === 'amount') {
                    transactionChanges.currency = originalTransactionDetails?.currency;
                } else if (key === 'waypoints') {
                    // For waypoints, we need to compare the stringified version of the arrays since they are arrays of objects
                    const newWaypoints = JSON.stringify(transactionChanges.waypoints);
                    const oldWaypoints = JSON.stringify(oldTransactionChanges?.waypoints);
                    if (newWaypoints === oldWaypoints) {
                        delete transactionChanges.waypoints;
                    }
                }
            }

            if (isReverseSplitOperation) {
                delete transactionChanges.transactionID;
            }

            if (Object.keys(transactionChanges).length > 0) {
                const transactionThreadReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${isReverseSplitOperation ? splitExpense?.reportID : transactionThreadReportID}`];
                const transactionIOUReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpense?.reportID ?? transactionThreadReport?.parentReportID}`];
                const {onyxData: moneyRequestParamsOnyxData, params} = getUpdateMoneyRequestParams({
                    transactionID: existingTransactionID,
                    transactionThreadReport,
                    iouReport: transactionIOUReport,
                    transactionChanges,
                    policy,
                    policyTagList: policyTags ?? null,
                    // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) with useOnyx hook
                    reportPolicyTags: getPolicyTagsData(transactionIOUReport?.policyID),
                    policyCategories: policyCategories ?? null,
                    newTransactionReportID: splitExpense?.reportID,
                    policyRecentlyUsedCategories,
                    currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
                    currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
                    isASAPSubmitBetaEnabled,
                    iouReportNextStep,
                    isSplitTransaction: true,
                    isOffline,
                });
                if (currentSplit) {
                    currentSplit.modifiedExpenseReportActionID = params.reportActionID;
                }
                updateMoneyRequestParamsOnyxData = moneyRequestParamsOnyxData;
            }
            // For new split transactions, set the reportID once the transaction and associated report are created
        } else if (currentSplit) {
            currentSplit.reportID = splitExpense?.reportID;
        }

        if (currentSplit) {
            currentSplit.transactionThreadReportID = transactionThreadReportID;
            currentSplit.createdReportActionIDForThread = createdReportActionIDForThread;
            currentSplit.splitReportActionID = iouAction.reportActionID;
        }

        // Copy comments to the transaction report thread of the split expense
        const optimisticDataComments: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];
        const successDataComments: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];
        const failureDataComments: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];
        const addCommentToSplitTransactionThread = (commentAction: OnyxTypes.ReportAction) => {
            const newReportActionID = rand64();
            // delegateAccountIDParam: will be threaded in PR 11; buildOptimisticAddCommentReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)
            const reportComment = buildOptimisticAddCommentReportAction({
                text: '',
                actorAccountID: commentAction.actorAccountID,
                reportID: transactionThreadReportID,
                reportActionID: newReportActionID,
                delegateAccountIDParam: undefined,
            });
            const reportActionComment = {
                ...reportComment.reportAction,
                created: DateUtils.getDBTime(),
                message: commentAction.message,
                originalMessage: getOriginalMessage(commentAction),
            };

            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {[newReportActionID]: reportActionComment},
            });
            successDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {[newReportActionID]: {pendingAction: null, isOptimisticAction: null}},
            });
            failureDataComments.push({onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, value: {[newReportActionID]: null}});

            if (currentSplit) {
                currentSplit.copiedComments ??= {};
                currentSplit.copiedComments[commentAction.reportActionID] = newReportActionID;
            }
        };

        // An internal helper to find transaction violations within onyxUpdates.
        // If one exists, it modifies the value for the update instead of adding a new one.
        const updateTransactionViolationsOnyxData = (
            targetTransactionID: string,
            onyxUpdates: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys | UpdateMoneyRequestDataKeys>> | undefined,
            fallbackViolations: OnyxTypes.TransactionViolation[],
        ) => {
            const transactionViolationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${targetTransactionID}` as typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS;
            const latestViolationUpdate = onyxUpdates?.findLast((update) => update.key === transactionViolationsKey) as OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>;
            const baseViolations = latestViolationUpdate && 'value' in latestViolationUpdate && Array.isArray(latestViolationUpdate.value) ? latestViolationUpdate.value : fallbackViolations;
            const nextViolations = [
                ...baseViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.HOLD),
                {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true},
            ];

            if (latestViolationUpdate && 'value' in latestViolationUpdate) {
                latestViolationUpdate.value = nextViolations;
                return;
            }

            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.SET,
                key: transactionViolationsKey,
                value: nextViolations,
            });

            failureDataComments.push({
                onyxMethod: Onyx.METHOD.SET,
                key: transactionViolationsKey,
                value: fallbackViolations,
            });
        };
        const addHoldToTransactionThread = (commentAction?: OnyxTypes.ReportAction) => {
            if (!holdReportAction) {
                return;
            }
            // Generate new IDs and timestamps for each split
            const newHoldReportActionID = rand64();
            const timestamp = DateUtils.getDBTime();

            // Create new optimistic hold report action with new ID and timestamp, keeping other information
            const newHoldReportAction = {
                ...holdReportAction,
                reportActionID: newHoldReportActionID,
                created: timestamp,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                timestamp: undefined,
            };

            const newHoldReportActionCommentID = commentAction ? rand64() : undefined;
            const newHoldReportActionComment =
                commentAction && newHoldReportActionCommentID
                    ? {
                          ...commentAction,
                          reportActionID: newHoldReportActionCommentID,
                          created: DateUtils.addMillisecondsFromDateTime(timestamp, 1),
                          pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                          timestamp: undefined,
                      }
                    : undefined;

            // Add to optimisticData for this split's reportActions
            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [newHoldReportActionID]: newHoldReportAction,
                    ...(newHoldReportActionCommentID && newHoldReportAction ? {[newHoldReportActionCommentID]: newHoldReportActionComment} : {}),
                },
            });

            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                value: {
                    comment: {
                        hold: newHoldReportActionID,
                    },
                },
            });

            // Add successData to clear pendingAction after API call succeeds
            successDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [newHoldReportActionID]: {pendingAction: null},
                    ...(newHoldReportActionCommentID ? {[newHoldReportActionCommentID]: {pendingAction: null}} : {}),
                },
            });

            // Add failureData to remove optimistic hold report actions if the request fails
            failureDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [newHoldReportActionID]: null,
                    ...(newHoldReportActionCommentID ? {[newHoldReportActionCommentID]: null} : {}),
                },
            });
            failureDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                value: {
                    comment: {
                        hold: splitTransaction?.comment?.hold ?? null,
                    },
                },
            });

            // Add hold transaction violation to optimisticData
            updateTransactionViolationsOnyxData(
                existingTransactionID,
                updateMoneyRequestParamsOnyxData.optimisticData ?? moneyRequestInformationOnyxData.optimisticData,
                transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${existingTransactionID}`] ?? [],
            );

            if (currentSplit) {
                currentSplit.holdReportActionID = newHoldReportActionID;
                currentSplit.holdReportActionCommentID = newHoldReportActionCommentID;
            }
        };

        let updatedIOUAction: Partial<OnyxTypes.ReportAction> | undefined;
        const copyCommentsAndHoldState = ({commentActions, isSourceTransactionOnHold}: {commentActions: OnyxTypes.ReportAction[]; isSourceTransactionOnHold: boolean}) => {
            let hasInsertedHoldState = !isSourceTransactionOnHold || !holdReportAction;

            for (const commentAction of commentActions) {
                if (!hasInsertedHoldState && holdReportAction && commentAction.reportActionID === holdCommentReportAction?.reportActionID) {
                    addHoldToTransactionThread(commentAction);
                    hasInsertedHoldState = true;
                    continue;
                }

                addCommentToSplitTransactionThread(commentAction);
            }

            // If the commentAction is not found, it means the action has been deleted.
            // We call insertHoldState here to ensure the hold state is always added.
            if (!hasInsertedHoldState) {
                addHoldToTransactionThread();
            }
        };

        if (isCreationOfSplits && transactionThreadReportID && firstIOU?.childReportID) {
            copyCommentsAndHoldState({
                commentActions: allCommentActionsFromOriginalTransactionThread,
                isSourceTransactionOnHold: isTransactionOnHold,
            });
            updatedIOUAction = updateParentActions(iouAction, firstIOU.childVisibleActionCount ?? 0);
        }

        // When isReverseSplitOperation is true, we move all comments from the remaining transaction to the original transaction
        if (isReverseSplitOperation && transactionThreadReportID) {
            const remainingTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${splitExpense.transactionID}`];
            const remainTransactionThreadReportAction = getIOUActionForReportID(splitExpense.reportID, splitExpense.transactionID);
            const allReportActions = getAllReportActions(remainTransactionThreadReportAction?.childReportID);
            const isRemainingTransactionOnHold = isOnHold(remainingTransaction);
            const remainingHoldReportAction = getReportAction(remainTransactionThreadReportAction?.childReportID, `${remainingTransaction?.comment?.hold ?? ''}`);

            const optimisticActionsData: OnyxTypes.ReportActions = {};
            const successActionsData: Record<string, Record<string, null>> = {};
            const failureActionsData: Record<string, null> = {};
            const remainingCommentActions: OnyxTypes.ReportAction[] = [];

            for (const action of Object.values(allReportActions)) {
                if (!isAddCommentAction(action) || isDeletedAction(action) || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    continue;
                }
                remainingCommentActions.push(action);
                optimisticActionsData[action.reportActionID] = {...action, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
                successActionsData[action.reportActionID] = {pendingAction: null, isOptimisticAction: null};
                failureActionsData[action.reportActionID] = null;
            }
            if (isRemainingTransactionOnHold && remainingHoldReportAction) {
                optimisticActionsData[remainingHoldReportAction.reportActionID] = {...remainingHoldReportAction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
                successActionsData[remainingHoldReportAction.reportActionID] = {pendingAction: null, isOptimisticAction: null};
                failureActionsData[remainingHoldReportAction.reportActionID] = null;

                optimisticDataComments.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                    value: {
                        comment: {
                            hold: remainingHoldReportAction.reportActionID,
                        },
                    },
                });

                failureDataComments.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                    value: {
                        comment: {
                            hold: splitTransaction?.comment?.hold ?? null,
                        },
                    },
                });

                // Add hold transaction violation to optimisticData
                updateTransactionViolationsOnyxData(
                    existingTransactionID,
                    updateMoneyRequestParamsOnyxData.optimisticData ?? moneyRequestInformationOnyxData.optimisticData,
                    transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${existingTransactionID}`] ?? [],
                );
            }
            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: optimisticActionsData,
            });

            successDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: successActionsData,
            });

            failureDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: failureActionsData,
            });

            const sourceThreadReportAction = remainTransactionThreadReportAction ?? splitThreadReportAction;
            const sourceThreadCommentActions = remainingCommentActions.length > 0 ? remainingCommentActions : splitThreadComments;
            updateParentActions(iouAction, sourceThreadReportAction?.childVisibleActionCount ?? sourceThreadCommentActions.length + (isRemainingTransactionOnHold ? 1 : 0));
            updatedIOUAction = updateParentActionsFromSourceThread(sourceThreadReportAction, sourceThreadCommentActions, isRemainingTransactionOnHold);
        }

        if (updatedIOUAction) {
            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                value: {[iouAction.reportActionID]: updatedIOUAction},
            });
            failureDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
                value: {
                    [iouAction.reportActionID]: {
                        childVisibleActionCount: iouAction.childVisibleActionCount,
                        childCommenterCount: iouAction.childCommenterCount,
                        childLastVisibleActionCreated: null,
                        childOldestFourAccountIDs: null,
                    },
                },
            });
        }

        // Ensure merchant from splitExpense is preserved in optimisticData for new and existing transactions
        const transactionIDFromOptimistic = optimisticTransactionFromGetMoneyRequest?.transactionID;
        if (transactionIDFromOptimistic && moneyRequestInformationOnyxData.optimisticData) {
            const transactionUpdate = moneyRequestInformationOnyxData.optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDFromOptimistic}`);
            if (transactionUpdate && 'value' in transactionUpdate && typeof transactionUpdate.value === 'object' && transactionUpdate.value !== null) {
                const transactionUpdateValue = transactionUpdate.value as OnyxTypes.Transaction;
                const expectedMerchant = optimisticTransactionFromGetMoneyRequest?.merchant;
                if (expectedMerchant && transactionUpdateValue.merchant !== expectedMerchant) {
                    transactionUpdateValue.merchant = expectedMerchant;
                    // For distance transactions, also update modifiedMerchant to ensure consistency
                    if (isDistanceRequestTransactionUtils(transactionUpdateValue)) {
                        transactionUpdateValue.modifiedMerchant = expectedMerchant;
                    }
                }
            }
        }

        // Collect the optimistic child transaction for snapshot update (forward split only)
        if (!isReverseSplitOperation && optimisticTransactionFromGetMoneyRequest) {
            const childTransactionID = optimisticTransactionFromGetMoneyRequest.transactionID;
            const transactionKey: `${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` = `${ONYXKEYS.COLLECTION.TRANSACTION}${childTransactionID}`;
            // Use the transaction value from optimisticData if available (it may have merchant fixes applied),
            // otherwise fall back to the raw optimistic transaction
            const transactionUpdate = moneyRequestInformationOnyxData.optimisticData?.find((update) => update.key === transactionKey);
            const snapshotTransaction =
                transactionUpdate && 'value' in transactionUpdate && typeof transactionUpdate.value === 'object' && transactionUpdate.value !== null
                    ? (transactionUpdate.value as OnyxTypes.Transaction)
                    : optimisticTransactionFromGetMoneyRequest;
            optimisticChildSnapshotEntries[transactionKey] = snapshotTransaction;
            optimisticChildSnapshotKeys.push(transactionKey);
        }

        onyxData.optimisticData?.push(...(moneyRequestInformationOnyxData.optimisticData ?? []), ...(updateMoneyRequestParamsOnyxData.optimisticData ?? []), ...optimisticDataComments);
        onyxData.successData?.push(...(moneyRequestInformationOnyxData.successData ?? []), ...(updateMoneyRequestParamsOnyxData.successData ?? []), ...successDataComments);
        onyxData.failureData?.push(...(moneyRequestInformationOnyxData.failureData ?? []), ...(updateMoneyRequestParamsOnyxData.failureData ?? []), ...failureDataComments);
    }

    // All transactions that were deleted in the split list will be marked as deleted in onyx
    const undeletedTransactions = originalChildTransactions.filter(
        (currentTransaction) => !processedChildTransactionIDs.includes(currentTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID),
    );

    for (const undeletedTransaction of undeletedTransactions) {
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${undeletedTransaction?.transactionID}`];
        const splitReportActions = getAllReportActions(splitTransaction?.reportID);
        const reportNameValuePairs = allReportNameValuePairsList?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${splitTransaction?.reportID}`];
        const splitTransactionReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitTransaction?.reportID}`];
        const isReportArchived = isArchivedReport(reportNameValuePairs);
        const currentReportAction = Object.values(splitReportActions).find((action) => {
            const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
            return transactionID === undeletedTransaction?.transactionID;
        });

        if (!currentReportAction) {
            Log.warn(`[Split] Can't find the report action for transaction ${undeletedTransaction?.transactionID} in report ${splitTransaction?.reportID}`);
            continue;
        }

        // For a reverse split operation (i.e. deleting one transaction from a 2-split), the other split(undeleted)
        // transaction also gets marked for deletion optimistically. This causes the undeleted split to remain visible,
        // resulting in 3 transactions(deleted, undeleted, and original) being shown at the same time when offline.
        // Since original transaction will be reverted and both splits will eventually be deleted, we remove
        // the undeleted split entirely instead of marking it for deletion.
        const forceDeleteSplitTransactionID = isReverseSplitOperation ? splitExpenses.at(0)?.transactionID : undefined;

        const {
            optimisticData: deleteExpenseOptimisticData,
            failureData: deleteExpenseFailureData,
            successData: deleteExpenseSuccessData,
        } = getDeleteTrackExpenseInformation(
            splitTransactionReport,
            undeletedTransaction?.transactionID,
            currentReportAction,
            undefined,
            currentUserPersonalDetails.accountID,
            undefined,
            undefined,
            undefined,
            undefined,
            isReportArchived || undeletedTransaction?.transactionID === forceDeleteSplitTransactionID,
        );

        // getDeleteTrackExpenseInformation only handles deleting the transaction report thread, so we need to update the report preview action here
        if (originalReportPreviewAction) {
            const cleanUpTransactionThreadReportOnyxData = getCleanUpTransactionThreadReportOnyxData({
                shouldDeleteTransactionThread: false,
                reportAction: currentReportAction,
                updatedReportPreviewAction: (updatedReportPreviewAction ?? originalReportPreviewAction) as OnyxTypes.ReportAction,
                shouldAddUpdatedReportPreviewActionToOnyxData: false,
                currentUserAccountID: currentUserPersonalDetails.accountID,
            });
            updatedReportPreviewAction = cleanUpTransactionThreadReportOnyxData.updatedReportPreviewAction;
        }

        onyxData.optimisticData?.push(...(deleteExpenseOptimisticData ?? []));
        onyxData.successData?.push(...(deleteExpenseSuccessData ?? []));
        onyxData.failureData?.push(...(deleteExpenseFailureData ?? []));
    }

    if (isReverseSplitOperation) {
        const deletedSplitSnapshotKeys = originalChildTransactions.reduce<Array<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`>>((acc, childTransaction) => {
            if (!childTransaction?.transactionID) {
                return acc;
            }

            acc.push(`${ONYXKEYS.COLLECTION.TRANSACTION}${childTransaction.transactionID}`);
            return acc;
        }, []);

        if (deletedSplitSnapshotKeys.length > 0) {
            const snapshotKeysToUpdate = new Set<`${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`>();
            const currentSearchHash = searchContext?.currentSearchHash;
            const activeGroupSearchHashes = searchContext?.activeGroupSearchHashes ?? [];

            if (currentSearchHash !== undefined && currentSearchHash >= 0) {
                snapshotKeysToUpdate.add(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}` as const);
            }

            for (const searchHash of activeGroupSearchHashes) {
                if (searchHash >= 0) {
                    snapshotKeysToUpdate.add(`${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}` as const);
                }
            }

            const relevantSnapshotKeys = Array.from(snapshotKeysToUpdate).filter((snapshotKey) => {
                const snapshot = allSnapshots?.[snapshotKey];
                if (!snapshot?.data) {
                    return false;
                }

                return deletedSplitSnapshotKeys.some((deletedSplitSnapshotKey) => Object.hasOwn(snapshot.data, deletedSplitSnapshotKey));
            });

            const originalSnapshotTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}` as const;
            const revertedOriginalTransactionUpdate = [...(onyxData.optimisticData ?? [])].reverse().find((update) => {
                return update.key === originalSnapshotTransactionKey && update.value && typeof update.value === 'object' && 'reportID' in update.value;
            });
            const revertedOriginalTransaction = revertedOriginalTransactionUpdate?.value as OnyxTypes.Transaction | undefined;

            for (const snapshotKey of relevantSnapshotKeys) {
                const previousSnapshotData = allSnapshots?.[snapshotKey]?.data;
                const optimisticSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};
                const failureSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};

                for (const deletedSplitSnapshotKey of deletedSplitSnapshotKeys) {
                    optimisticSnapshotData[deletedSplitSnapshotKey] = null;
                    failureSnapshotData[deletedSplitSnapshotKey] = previousSnapshotData?.[deletedSplitSnapshotKey] ?? null;
                }

                if (revertedOriginalTransaction) {
                    optimisticSnapshotData[originalSnapshotTransactionKey] = revertedOriginalTransaction;
                    failureSnapshotData[originalSnapshotTransactionKey] = previousSnapshotData?.[originalSnapshotTransactionKey] ?? null;
                }

                onyxData.optimisticData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: snapshotKey,
                    value: {
                        data: optimisticSnapshotData,
                    },
                });
                onyxData.failureData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: snapshotKey,
                    value: {
                        data: failureSnapshotData,
                    },
                });
            }
        }
    }

    if (!isReverseSplitOperation) {
        // Use SET to update originalTransaction more quickly in Onyx as compared to MERGE to prevent UI inconsistency
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: {
                ...originalTransaction,
                reportID: CONST.REPORT.SPLIT_REPORT_ID,
            },
        });

        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: originalTransaction ?? null,
        });

        if (firstIOU) {
            const updatedReportAction = {
                [firstIOU.reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    previousMessage: firstIOU.message,
                    message: [
                        {
                            type: 'COMMENT',
                            html: '',
                            text: '',
                            isEdited: true,
                            isDeletedParentAction: true,
                        },
                    ],
                    originalMessage: {
                        IOUTransactionID: null,
                    },
                    errors: null,
                },
            };

            const {optimisticData, successData, failureData} = getCleanUpTransactionThreadReportOnyxData({
                transactionThreadID: firstIOU.childReportID,
                shouldDeleteTransactionThread: true,
                reportAction: firstIOU,
                updatedReportPreviewAction: updatedReportPreviewAction as OnyxTypes.ReportAction,
                currentUserAccountID: currentUserPersonalDetails.accountID,
            });

            onyxData.optimisticData?.push(...optimisticData);
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: updatedReportAction,
            });

            onyxData.successData?.push(...successData);

            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [firstIOU.reportActionID]: {
                        ...firstIOU,
                        pendingAction: null,
                    },
                },
            });
            onyxData.failureData?.push(...failureData);
        } else {
            pushUpdatedReportPreviewActionToOnyxData();
        }

        // Build the snapshot data update: remove original transaction and add child transactions
        const optimisticSnapshotData: SearchResultDataType = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`]: null,
            ...optimisticChildSnapshotEntries,
        };

        // On failure, restore the original transaction and remove the child transactions
        // Initializing as an empty typed object to allow dynamic key assignment resolves TypeScript type inference issue
        const failureSnapshotData: NullishDeep<SearchResultDataType> = {};
        failureSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`] = originalTransaction ?? null;
        for (const childKey of optimisticChildSnapshotKeys) {
            failureSnapshotData[childKey] = null;
        }

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContext?.currentSearchHash}`,
            value: {
                data: optimisticSnapshotData,
            },
        });

        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchContext?.currentSearchHash}`,
            value: {
                data: failureSnapshotData,
            },
        });
    } else {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            value: {
                errors: null,
            },
        });
        pushUpdatedReportPreviewActionToOnyxData();
        const isLastTransactionInReport = Object.values(allTransactionsList ?? {}).filter((itemTransaction) => itemTransaction?.reportID === expenseReportID).length === 1;
        if (isLastTransactionInReport) {
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionData.reportID}`,
                value: {
                    reportID: null,
                    pendingFields: {
                        preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            });
            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionData.reportID}`,
                value: null,
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionData.reportID}`,
                value: {
                    reportID: transactionData.reportID,
                    pendingFields: null,
                },
            });
            if (expenseReport?.parentReportID && expenseReport?.parentReportActionID) {
                onyxData.optimisticData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.parentReportID}`,
                    value: {
                        [expenseReport?.parentReportActionID]: {
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        },
                    },
                });
                onyxData.successData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.parentReportID}`,
                    value: {
                        [expenseReport?.parentReportActionID]: {
                            pendingAction: null,
                        },
                    },
                });
                onyxData.failureData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.parentReportID}`,
                    value: {
                        [expenseReport?.parentReportActionID]: {
                            pendingAction: null,
                        },
                    },
                });
            }
        }

        const originalTransactionThreadReportID = splits.at(0)?.transactionThreadReportID;
        if (splitThreadComments.length > 0 && originalTransactionThreadReportID && splitTransactionThreadReportID) {
            const optimisticMovedComments: Record<string, OnyxTypes.ReportAction> = {};
            const optimisticRemovedComments: Record<string, null> = {};
            const successMovedComments: OnyxCollection<NullishDeep<OnyxTypes.ReportAction>> = {};
            const failureMovedCommentsRemoval: Record<string, null> = {};
            const failureRestoredComments: Record<string, OnyxTypes.ReportAction> = {};

            for (const comment of splitThreadComments) {
                optimisticMovedComments[comment.reportActionID] = {
                    ...comment,
                    reportID: originalTransactionThreadReportID,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                };
                optimisticRemovedComments[comment.reportActionID] = null;
                successMovedComments[comment.reportActionID] = {pendingAction: null};
                failureMovedCommentsRemoval[comment.reportActionID] = null;
                failureRestoredComments[comment.reportActionID] = comment;
            }

            onyxData.optimisticData?.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalTransactionThreadReportID}`,
                    value: optimisticMovedComments,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitTransactionThreadReportID}`,
                    value: optimisticRemovedComments,
                },
            );

            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalTransactionThreadReportID}`,
                value: successMovedComments,
            });

            onyxData.failureData?.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalTransactionThreadReportID}`,
                    value: failureMovedCommentsRemoval,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitTransactionThreadReportID}`,
                    value: failureRestoredComments,
                },
            );
        }
    }

    if (isReverseSplitOperation) {
        const parameters = {
            ...splits.at(0),
            comment: splits.at(0)?.comment?.comment,
            waypoints: splits.at(0)?.waypoints ? JSON.stringify(splits.at(0)?.waypoints) : undefined,
            copiedComments: splits.at(0)?.copiedComments ? JSON.stringify(splits.at(0)?.copiedComments) : undefined,
        } as RevertSplitTransactionParams;
        apiWrite(WRITE_COMMANDS.REVERT_SPLIT_TRANSACTION, parameters, onyxData);
    } else {
        // Prepare splitApiParams for the Transaction_Split API call which requires a specific format for the splits
        // The format is: splits[0][amount], splits[0][category], splits[0][tag] etc.
        const splitApiParams = {} as Record<string, string | number | boolean>;
        for (const [i, split] of splits.entries()) {
            for (const [key, value] of Object.entries(split)) {
                splitApiParams[`splits[${i}][${key}]`] = value !== null && typeof value === 'object' ? JSON.stringify(value) : value;
            }
        }

        const splitParameters: SplitTransactionParams = {
            ...splitApiParams,
            transactionID: originalTransactionID,
        };

        if (isCreationOfSplits) {
            apiWrite(WRITE_COMMANDS.SPLIT_TRANSACTION, splitParameters, onyxData);
        } else {
            apiWrite(WRITE_COMMANDS.UPDATE_SPLIT_TRANSACTION, splitParameters, onyxData);
        }
    }
    InteractionManager.runAfterInteractions(() => removeDraftSplitTransaction(originalTransactionID));
}

function updateSplitTransactionsFromSplitExpensesFlow(params: UpdateSplitTransactionsParams) {
    // Detect if this will be a reverse split that deletes the expense report.
    // When splits are reduced to 1, updateSplitTransactions performs a reverse split which
    // optimistically deletes the expense report if it's the last transaction. We need to
    // set the navigate-back URL before the deletion to prevent the "Not Found" page.
    const splitExpenses = params.transactionData?.splitExpenses ?? [];
    const originalTransactionID = params.transactionData?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const allChildTransactions = getChildTransactions(params.allTransactionsList, params.allReportsList, originalTransactionID, true);
    const originalChildTransactions = allChildTransactions.filter((tx) => tx?.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID);
    const hasEditableSplitExpensesLeft = splitExpenses.some((expense) => (expense.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED);
    const isReverseSplitOperation =
        splitExpenses.length === 1 && originalChildTransactions.length > 0 && hasEditableSplitExpensesLeft && allChildTransactions.length === originalChildTransactions.length;
    const expenseReportID = params.expenseReport?.reportID;
    const isLastTransactionInReport =
        isReverseSplitOperation && Object.values(params.allTransactionsList ?? {}).filter((itemTransaction) => itemTransaction?.reportID === expenseReportID).length === 1;
    const fallbackReportID = params.expenseReport?.chatReportID ?? params.expenseReport?.parentReportID;

    if (isLastTransactionInReport && fallbackReportID) {
        setDeleteTransactionNavigateBackUrl(ROUTES.REPORT_WITH_ID.getRoute(fallbackReportID));
    }

    updateSplitTransactions({...params, isFromSplitExpensesFlow: true});
    const isSearchPageTopmostFullScreenRoute = isSearchTopmostFullScreenRoute();
    const transactionThreadReportID = params.firstIOU?.childReportID;
    const transactionThreadReportScreen = Navigation.getReportRouteByID(transactionThreadReportID);

    // Reset selected transactions in search after saving split expenses
    const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
    const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;
    if (isUserOnSearchPage) {
        params?.searchContext?.clearSelectedTransactions?.(undefined, true);
    } else {
        params?.searchContext?.clearSelectedTransactions?.(true);
    }

    if (isSearchPageTopmostFullScreenRoute || !params.transactionReport?.parentReportID) {
        Navigation.navigateBackToLastSuperWideRHPScreen();

        // After the modal is dismissed, remove the transaction thread report screen
        // to avoid navigating back to a report removed by the split transaction.
        requestAnimationFrame(() => {
            if (!transactionThreadReportScreen?.key) {
                return;
            }

            Navigation.removeScreenByKey(transactionThreadReportScreen.key);
        });

        return;
    }

    // When the reverse split deletes the expense report, use the backward navigation pattern
    // (dismissToSuperWideRHP + goBack) instead of dismissModalWithReport. This naturally pops
    // stale screens from the stack instead of leaving them behind.
    if (isLastTransactionInReport && fallbackReportID) {
        const backRoute = ROUTES.REPORT_WITH_ID.getRoute(fallbackReportID);
        navigateBackOnDeleteTransaction(backRoute);

        // Remove the transaction thread report screen to avoid navigating back to a removed report
        requestAnimationFrame(() => {
            if (!transactionThreadReportScreen?.key) {
                return;
            }
            Navigation.removeScreenByKey(transactionThreadReportScreen.key);
        });

        return;
    }

    const targetReportID = params.expenseReport?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);

    if (isTracking()) {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, targetReportID);
    }
    Navigation.dismissModalWithReport({reportID: targetReportID});

    // After the modal is dismissed, remove the transaction thread report screen
    // to avoid navigating back to a report removed by the split transaction.
    requestAnimationFrame(() => {
        if (!transactionThreadReportScreen?.key) {
            return;
        }
        Navigation.removeScreenByKey(transactionThreadReportScreen.key);
    });
}

export {updateSplitTransactions, updateSplitTransactionsFromSplitExpensesFlow};

export type {UpdateSplitTransactionsParams};
