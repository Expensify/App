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
import popReportsSplitNavigatorToReport from '@libs/Navigation/helpers/popReportsSplitNavigatorToReport';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
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
    getTrackExpenseActionableWhisper,
    isActionOfType,
    isAddCommentAction,
    isDeletedAction,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import {
    buildOptimisticAddCommentReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getParsedComment,
    getPolicyExpenseChat,
    getReportOrDraftReport,
    getTransactionDetails,
    isArchivedReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isSelfDM,
    navigateBackOnDeleteTransaction,
    updateOptimisticParentReportAction,
} from '@libs/ReportUtils';
import {isTracking, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {
    getChildTransactions,
    hasValidModifiedAmount,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isOnHold,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
} from '@libs/TransactionUtils';
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
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getCleanUpTransactionThreadReportOnyxData} from './DeleteMoneyRequest';
import {getAllReports, getMoneyRequestPolicyTags, getPolicyTagsData} from './index';
import {getMoneyRequestParticipantsFromReport} from './MoneyRequest';
import {getMoneyRequestInformation, getReportPreviewAction} from './MoneyRequestBuilder';
import type {BuildOnyxDataForMoneyRequestKeys, MoneyRequestInformationParams} from './MoneyRequestBuilder';
import {addPendingNewTransactionIDs} from './PendingNewTransactions';
import {getDeleteTrackExpenseInformation} from './TrackExpense';
import {getUpdateMoneyRequestParams} from './UpdateMoneyRequest';
import type {UpdateMoneyRequestDataKeys} from './UpdateMoneyRequest';

type UpdateSplitTransactionsParams = {
    allTransactionsList: OnyxCollection<OnyxTypes.Transaction>;
    allReportsList: OnyxCollection<OnyxTypes.Report>;
    allReportActionsList: OnyxCollection<OnyxTypes.ReportActions>;
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

function resetSnapshotGroupAmount<T extends OnyxTypes.Transaction>(transaction: T): T {
    const splitAmount = hasValidModifiedAmount(transaction) ? Number(transaction.modifiedAmount) : (transaction.amount ?? 0);
    return {
        ...transaction,
        groupAmount: splitAmount,
        groupCurrency: transaction.currency,
        groupExchangeRate: undefined,
    };
}

function updateSplitTransactions({
    allTransactionsList,
    allReportsList,
    allReportActionsList,
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
    expenseReport: expenseReportFromParams,
    isOffline,
}: UpdateSplitTransactionsParams) {
    const parentTransactionReport = getReportOrDraftReport(transactionReport?.parentReportID);
    // For selfDM-origin splits the caller can't resolve a real `expenseReport` (the draft/source
    // transaction lives in a selfDM chat whose parent isn't an expense report), so it ends up `undefined`
    let expenseReport: OnyxEntry<OnyxTypes.Report> = expenseReportFromParams;
    if (!expenseReport || expenseReport.type !== CONST.REPORT.TYPE.EXPENSE) {
        const splitExpensesForFallback = transactionData?.splitExpenses ?? [];
        for (const splitExpense of splitExpensesForFallback) {
            const candidateReportID = splitExpense?.reportID;
            if (!candidateReportID || candidateReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                continue;
            }
            const candidate = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${candidateReportID}`];
            if (candidate?.type === CONST.REPORT.TYPE.EXPENSE) {
                expenseReport = candidate;
                break;
            }
        }
    }

    const chatReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.chatReportID}`];

    // Determine if the original transaction is in a selfDM report (used for first IOU action handling)
    let isOriginalTransactionInSelfDM = false;
    let originalSelfDMReportID: string | undefined;

    if (isSelfDM(transactionReport)) {
        isOriginalTransactionInSelfDM = true;
        originalSelfDMReportID = transactionReport?.reportID;
    } else if (isSelfDM(parentTransactionReport)) {
        isOriginalTransactionInSelfDM = true;
        originalSelfDMReportID = parentTransactionReport?.reportID;
    } else if (isSelfDM(chatReport)) {
        isOriginalTransactionInSelfDM = true;
        originalSelfDMReportID = chatReport?.reportID;
    }

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

    const allChildTransactions = getChildTransactions(allTransactionsList, originalTransactionID, false);
    const processedChildTransactionIDs: string[] = [];

    const splitExpensesTotal = transactionData?.splitExpensesTotal ?? 0;

    const isCreationOfSplits = allChildTransactions.length === 0;
    const hasEditableSplitExpensesLeft = splitExpenses.some((expense) => (expense.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED);
    const isReverseSplitOperation = splitExpenses.length === 1 && allChildTransactions.length > 0 && hasEditableSplitExpensesLeft;

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
                reportID: split.reportID,
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

    const onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys | UpdateMoneyRequestDataKeys | typeof ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT> = {
        successData: [],
        failureData: [],
        optimisticData: [],
    };

    const selfDMReport = Object.values(allReportsList ?? {}).find((r) => isSelfDM(r));

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
    const originalReportPreviewAction = getReportPreviewAction(
        expenseReport?.chatReportID,
        expenseReport?.reportID,
        allReportActionsList?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.chatReportID}`],
    );
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

    const newSelfDMSplitTransactions: OnyxTypes.Transaction[] = [];
    // Collect optimistic child transactions to add to the search snapshot (forward split only)
    const optimisticChildSnapshotEntries: SearchResultDataType = {};
    const optimisticChildSnapshotKeys: Array<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`> = [];
    // Collect optimistic IOU actions (per chat report) so they can be embedded into the search
    // snapshot's report_actions. Without this, search list items for newly created / reverted
    // selfDM split transactions can't resolve their IOU action, which leaves the "From" column
    // blank and breaks downstream ownership lookups.
    const optimisticSelfDMIouActionsByReportID: Record<string, Record<string, OnyxTypes.ReportAction>> = {};

    for (const [index, splitExpense] of splitExpenses.entries()) {
        const existingTransactionID = isReverseSplitOperation ? originalTransactionID : splitExpense.transactionID;
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`];
        if (splitTransaction) {
            processedChildTransactionIDs.push(splitTransaction.transactionID);
        }

        // Determine if this split expense is going to a selfDM report FIRST
        // We need this before finding report actions because selfDM report actions are stored in selfDM report, not in "0"
        let isSelfDMSplit = splitExpense.reportID === CONST.REPORT.UNREPORTED_REPORT_ID || splitTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        let selfDMReportID: string | undefined = isSelfDMSplit ? originalSelfDMReportID : undefined;

        // If the split is selfDM but we couldn't derive the selfDM report ID from the transaction
        // context (e.g. saving from a workspace split screen where none of transactionReport/
        // expenseReport/chatReport are selfDM), fall back to finding it in allReportsList.
        if (isSelfDMSplit && !selfDMReportID) {
            selfDMReportID = selfDMReport?.reportID;
        }

        // If the existing transaction already lives in a real workspace report, it is NOT a selfDM split.
        // splitExpense.reportID may have been set to the selfDM report ID for navigation purposes
        // (see initSplitExpense), so we must not rely on it to detect workspace splits.
        const existingTransactionReport =
            splitTransaction?.reportID && splitTransaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? getReportOrDraftReport(splitTransaction.reportID) : undefined;
        const isConfirmedWorkspaceTransaction = !!existingTransactionReport && !isSelfDM(existingTransactionReport);
        if (isConfirmedWorkspaceTransaction) {
            isSelfDMSplit = false;
            selfDMReportID = undefined;
        }

        // If not already determined as selfDM and not a confirmed workspace transaction,
        // check the report hierarchy. Skip this check for confirmed workspace transactions
        // because splitExpense.reportID may point to selfDM for navigation reasons only.
        if (!isSelfDMSplit && !isConfirmedWorkspaceTransaction) {
            const splitExpenseReport = getReportOrDraftReport(splitExpense.reportID);
            const splitExpenseParentReport = getReportOrDraftReport(splitExpenseReport?.parentReportID);
            const splitExpenseChatReport = getReportOrDraftReport(splitExpenseReport?.chatReportID);

            if (isSelfDM(splitExpenseReport)) {
                isSelfDMSplit = true;
                selfDMReportID = splitExpenseReport?.reportID;
            } else if (isSelfDM(splitExpenseParentReport)) {
                isSelfDMSplit = true;
                selfDMReportID = splitExpenseParentReport?.reportID;
            } else if (isSelfDM(splitExpenseChatReport)) {
                isSelfDMSplit = true;
                selfDMReportID = splitExpenseChatReport?.reportID;
            }
        }

        // For selfDM, report actions are stored in the selfDM report, not in "0"
        let reportActionsReportID: string | undefined;
        if (isReverseSplitOperation) {
            reportActionsReportID = isOriginalTransactionInSelfDM ? originalSelfDMReportID : expenseReport?.reportID;
        } else if (isSelfDMSplit) {
            reportActionsReportID = selfDMReportID ?? originalSelfDMReportID;
        } else {
            reportActionsReportID = splitTransaction?.reportID;
        }

        const splitReportActions = getAllReportActions(reportActionsReportID);
        const currentReportAction = Object.values(splitReportActions).find((action) => {
            const transactionID = isMoneyRequestAction(action) ? (getOriginalMessage(action)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
            return transactionID === existingTransactionID;
        });

        const linkedTrackedExpenseChildReportExistsInOnyx =
            !!currentReportAction?.childReportID && !!allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReportAction.childReportID}`]?.reportID;
        const reverseSplitLinkedTrackedExpenseReportAction = isReverseSplitOperation && linkedTrackedExpenseChildReportExistsInOnyx ? currentReportAction : undefined;

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
                pendingAction: splitTransaction ? (splitTransaction.pendingAction ?? null) : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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
                // Mark this split as belonging to self DM so money-request
                // logic can route IOU actions to the self DM report instead
                // of creating separate IOU/chat reports.
                isSelfDMSplit,
                selfDMReportID,
            },
            // For selfDM, use the selfDM report as the parent chat report so report actions are stored there
            parentChatReport: isSelfDMSplit && selfDMReportID ? getReportOrDraftReport(selfDMReportID) : fallbackPolicyParentChatReport,
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
                modifiedAmount: splitExpense.amount ?? 0,
                currency: originalTransactionDetails?.currency ?? CONST.CURRENCY.USD,
                created: splitExpense.created,
                merchant: splitExpense.merchant ?? '',
                comment: splitExpense.description,
                category: splitExpense.category,
                tag: splitExpense.tags?.[0],
                attendees: originalTransactionDetails?.attendees as Attendee[],
                linkedTrackedExpenseReportAction: reverseSplitLinkedTrackedExpenseReportAction,
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
                // Preserve selfDM context so getMoneyRequestInformation doesn't create a new IOU report
                isSelfDMSplit,
                selfDMReportID,
            };
            if (originalTransaction) {
                requestMoneyInformation.existingTransaction = {
                    ...originalTransaction,
                    comment: {
                        ...originalTransaction.comment,
                        source: undefined,
                        originalTransactionID: undefined,
                        splits: undefined,
                        splitExpenses: undefined,
                        splitsStartDate: undefined,
                        splitsEndDate: undefined,
                        splitExpensesTotal: undefined,
                    },
                };
            }
        }

        // For confirmed workspace transactions, override participant and parentChatReport.
        // When viewing from selfDM context, participants and expenseReport are null/selfDM-based,
        // so we must derive the correct workspace expense chat from the existing transaction data.
        const workspaceChatReport = isConfirmedWorkspaceTransaction
            ? getPolicyExpenseChat(currentUserPersonalDetails.accountID, existingTransactionReport?.policyID, allReportsList)
            : undefined;
        if (isConfirmedWorkspaceTransaction && workspaceChatReport) {
            requestMoneyInformation.participantParams.participant = {
                accountID: 0,
                reportID: workspaceChatReport.reportID,
                isPolicyExpenseChat: true,
                selected: true,
                policyID: existingTransactionReport?.policyID,
            };
            requestMoneyInformation.parentChatReport = workspaceChatReport;
        }

        const {participantParams, policyParams, transactionParams, parentChatReport, existingTransaction} = requestMoneyInformation;
        const parsedComment = getParsedComment(Parser.htmlToMarkdown(transactionParams.comment ?? ''));
        transactionParams.comment = parsedComment;

        // For selfDM, use UNREPORTED_REPORT_ID for moneyRequestReportID.
        // For confirmed workspace transactions, use splitTransaction.reportID directly because
        // splitExpense.reportID may be set to selfDMReportID for navigation purposes.
        let moneyRequestReportIDForSplit: string | undefined;
        if (isSelfDMSplit) {
            moneyRequestReportIDForSplit = CONST.REPORT.UNREPORTED_REPORT_ID;
        } else if (isConfirmedWorkspaceTransaction) {
            moneyRequestReportIDForSplit = splitTransaction?.reportID;
        } else {
            moneyRequestReportIDForSplit = splitExpense?.reportID;
        }

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
            moneyRequestReportID: moneyRequestReportIDForSplit,
            existingTransaction,
            existingTransactionID,
            newReportTotal: reportTotals.get(splitExpense?.reportID ?? String(CONST.DEFAULT_NUMBER_ID)) ?? 0,
            newNonReimbursableTotal: (transactionReport?.nonReimbursableTotal ?? 0) - changesInReportTotal,
            isSplitExpense: true,
            isReverseSplitOperation,
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

        // Whether this split has actual changes or is brand-new.
        // getMoneyRequestInformation always generates a new iouAction with pendingAction: ADD,
        // which would overwrite the existing action's pending state for unchanged splits.
        // We still call getMoneyRequestInformation for all splits to obtain iouAction.reportActionID
        // (needed for API params), but we only push its Onyx data when the split actually changed.
        let hasChanges = !splitTransaction;

        // For existing split transactions, update the field change messages
        // For new transactions, skip this step
        if (splitTransaction) {
            const transactionChanges = {
                ...currentSplit,
                comment: currentSplit?.comment?.comment,
                customUnitRateID: currentSplit?.customUnitRateID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID,
            } as TransactionChanges;
            delete transactionChanges.reportID;

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
                // For revert splits (self-DM and workspace alike), ALL field changes are already captured in
                // requestMoneyInformation.transactionParams (amount, date, merchant, category, etc.)
                for (const key of Object.keys(transactionChanges)) {
                    delete transactionChanges[key as keyof typeof transactionChanges];
                }
                // Ensure moneyRequestInformationOnyxData is applied even though transactionChanges is now empty.
                hasChanges = true;
            }

            if (Object.keys(transactionChanges).length > 0) {
                // For confirmed workspace transactions viewed from selfDM context, we must use the
                // real workspace reports instead of splitExpense.reportID (which points to selfDM).
                const existingTransactionThreadID = isConfirmedWorkspaceTransaction ? currentReportAction?.childReportID : undefined;
                const workspaceExpenseReportID = isConfirmedWorkspaceTransaction ? (workspaceChatReport?.iouReportID ?? splitTransaction?.reportID) : undefined;
                const transactionThreadReportKey = isReverseSplitOperation ? splitExpense?.reportID : (existingTransactionThreadID ?? transactionThreadReportID);
                const transactionThreadReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportKey}`];
                const iouReportID = workspaceExpenseReportID ?? splitExpense?.reportID ?? transactionThreadReport?.parentReportID;
                const transactionIOUReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
                const newTransactionReportID = isSelfDMSplit ? CONST.REPORT.UNREPORTED_REPORT_ID : (workspaceExpenseReportID ?? splitExpense?.reportID);
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
                    newTransactionReportID,
                    policyRecentlyUsedCategories,
                    currentUserAccountIDParam: currentUserPersonalDetails?.accountID,
                    currentUserEmailParam: currentUserPersonalDetails?.login ?? '',
                    isASAPSubmitBetaEnabled,
                    iouReportNextStep,
                    isSplitTransaction: true,
                    isSelfDMSplit,
                    isOffline,
                    // delegateAccountID: will be threaded in PR 11; buildOptimisticModifiedExpenseReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)
                    delegateAccountID: undefined,
                });
                if (currentSplit) {
                    currentSplit.modifiedExpenseReportActionID = params.reportActionID;
                }
                updateMoneyRequestParamsOnyxData = moneyRequestParamsOnyxData;
                updateMoneyRequestParamsOnyxData.optimisticData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                    value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                });
                if (transactionChanges.amount !== undefined && splitTransaction) {
                    const previousAmount = splitTransaction.amount ?? 0;
                    const previousConverted = splitTransaction.convertedAmount ?? null;
                    const previousModified = splitTransaction.modifiedAmount ?? null;
                    const targetAmount = optimisticTransactionFromGetMoneyRequest?.amount ?? null;
                    const targetModified = optimisticTransactionFromGetMoneyRequest?.modifiedAmount ?? null;
                    const targetConverted = optimisticTransactionFromGetMoneyRequest?.convertedAmount ?? null;
                    if (targetAmount != null || targetConverted != null || targetModified != null) {
                        updateMoneyRequestParamsOnyxData.optimisticData?.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                            value: {
                                ...(targetAmount != null ? {amount: targetAmount} : {}),
                                ...(targetModified != null ? {modifiedAmount: targetModified} : {}),
                                ...(targetConverted != null ? {convertedAmount: targetConverted} : {}),
                            },
                        });
                        updateMoneyRequestParamsOnyxData.failureData?.push({
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`,
                            value: {
                                amount: previousAmount,
                                modifiedAmount: previousModified,
                                convertedAmount: previousConverted,
                            },
                        });
                    }
                }

                if (isReverseSplitOperation && transactionIOUReport) {
                    updateMoneyRequestParamsOnyxData.optimisticData?.push({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionIOUReport.reportID}`,
                        value: {
                            total: transactionIOUReport.total,
                            unheldTotal: transactionIOUReport.unheldTotal,
                            nonReimbursableTotal: transactionIOUReport.nonReimbursableTotal,
                            unheldNonReimbursableTotal: transactionIOUReport.unheldNonReimbursableTotal,
                        },
                    });
                }
                hasChanges = true;
            }

            // For new split transactions, set the reportID once the transaction and associated report are created
        } else if (currentSplit) {
            // For selfDM reports, use UNREPORTED_REPORT_ID (0) for the API params
            currentSplit.reportID = isSelfDMSplit ? CONST.REPORT.UNREPORTED_REPORT_ID : splitExpense?.reportID;
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
            // Prefer the count of comments we actually copied into the split thread so the parent
            // action's childVisibleActionCount stays in sync with the thread contents. When the
            // source thread's report actions aren't available in Onyx but the source IOU reports a
            // non-zero count, fall back to that count so the split doesn't drop to 0 while the
            // backend still has the original comments.
            const sourceThreadActionsUnavailable = isEmptyObject(transactionReportActions);
            const commentCount =
                sourceThreadActionsUnavailable && (firstIOU?.childVisibleActionCount ?? 0) > 0
                    ? (firstIOU?.childVisibleActionCount ?? 0)
                    : allCommentActionsFromOriginalTransactionThread.length;
            updatedIOUAction = updateParentActions(iouAction, commentCount);
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
            // For selfDM splits the new IOU action lives in the selfDM report, not the (missing)
            // expense report — write the bumped childVisibleActionCount to that same report so
            // copied comments are counted on the split's parent action. For workspace flows keep
            // writing to the expense report where the IOU action is stored.
            const iouActionReportID = isSelfDMSplit ? (selfDMReportID ?? originalSelfDMReportID) : expenseReport?.reportID;
            optimisticDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouActionReportID}`,
                value: {[iouAction.reportActionID]: updatedIOUAction},
            });
            failureDataComments.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouActionReportID}`,
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
                }
                // For distance transactions, the split inherits the original transaction's modifiedMerchant
                // (e.g. the full-distance "10.00 mi @ rate" string set when the original's rate was edited).
                // The UI shows modifiedMerchant in preference to merchant, so align it with the split's own
                // merchant — otherwise the split displays the stale original merchant instead of its own.
                if (
                    expectedMerchant &&
                    isDistanceRequestTransactionUtils(transactionUpdateValue) &&
                    !!transactionUpdateValue.modifiedMerchant &&
                    transactionUpdateValue.modifiedMerchant !== expectedMerchant
                ) {
                    transactionUpdateValue.modifiedMerchant = expectedMerchant;
                }
            }
        }

        if (isSelfDMSplit && optimisticTransactionFromGetMoneyRequest && hasChanges) {
            // For initial splits, both optimistic transactions reuse originalTransactionID as their transactionID.
            // Use splitExpense.transactionID (the real draft ID) for snapshot entries so they share the same key
            // as the Onyx transactions. This prevents getChildTransactions from treating them as separate
            // orphaned children on the next edit, which would incorrectly delete them from the snapshot.
            const snapshotTransactionID = isCreationOfSplits ? splitExpense.transactionID : optimisticTransactionFromGetMoneyRequest.transactionID;
            // Align the snapshot's modifiedMerchant with the split's own merchant for distance transactions,
            // so the Search/Expenses view doesn't show the stale inherited original merchant (see the same fix
            // applied to the main transaction's optimisticData above).
            const snapshotModifiedMerchant =
                isDistanceRequestTransactionUtils(optimisticTransactionFromGetMoneyRequest) && !!optimisticTransactionFromGetMoneyRequest.modifiedMerchant
                    ? optimisticTransactionFromGetMoneyRequest.merchant
                    : optimisticTransactionFromGetMoneyRequest.modifiedMerchant;
            newSelfDMSplitTransactions.push(
                resetSnapshotGroupAmount({
                    ...optimisticTransactionFromGetMoneyRequest,
                    transactionID: snapshotTransactionID,
                    modifiedMerchant: snapshotModifiedMerchant,
                    ...(!isCreationOfSplits && {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                }),
            );

            const reportActionsTargetReportID = selfDMReportID ?? originalSelfDMReportID;
            const targetReportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsTargetReportID}` as const;
            if (iouAction && reportActionsTargetReportID) {
                const iouActionForSnapshot: OnyxTypes.ReportAction = {
                    ...iouAction,
                    // Reuse the chat reportID so downstream consumers reading the snapshot don't lose context.
                    reportID: reportActionsTargetReportID,
                } as OnyxTypes.ReportAction;
                optimisticSelfDMIouActionsByReportID[targetReportActionsKey] ??= {};
                optimisticSelfDMIouActionsByReportID[targetReportActionsKey][iouAction.reportActionID] = iouActionForSnapshot;
            }
        }

        // Only apply the money-request Onyx data when the split actually changed or is new.
        // For unchanged existing splits we still called getMoneyRequestInformation to get the
        // iouAction.reportActionID for API params, but pushing its Onyx data would overwrite
        // the split's existing pendingAction (transaction SET) and pendingAction on the IOU action
        // (report action MERGE with pendingAction: ADD), making unmodified splits appear pending.
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
            optimisticChildSnapshotEntries[transactionKey] = resetSnapshotGroupAmount(snapshotTransaction);
            optimisticChildSnapshotKeys.push(transactionKey);
        }

        if (hasChanges) {
            onyxData.optimisticData?.push(...(moneyRequestInformationOnyxData.optimisticData ?? []));
            onyxData.successData?.push(...(moneyRequestInformationOnyxData.successData ?? []));
            onyxData.failureData?.push(...(moneyRequestInformationOnyxData.failureData ?? []));
        }
        onyxData.optimisticData?.push(...(updateMoneyRequestParamsOnyxData.optimisticData ?? []), ...optimisticDataComments);
        onyxData.successData?.push(...(updateMoneyRequestParamsOnyxData.successData ?? []), ...successDataComments);
        onyxData.failureData?.push(...(updateMoneyRequestParamsOnyxData.failureData ?? []), ...failureDataComments);
    }

    // All transactions that were deleted in the split list will be marked as deleted in onyx
    const undeletedTransactions = allChildTransactions.filter(
        (currentTransaction) => !processedChildTransactionIDs.includes(currentTransaction?.transactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID),
    );

    for (const undeletedTransaction of undeletedTransactions) {
        const splitTransaction = allTransactionsList?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${undeletedTransaction?.transactionID}`];
        const isSelfDMTransaction = splitTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        const selfDMReportIDForLookup = originalSelfDMReportID ?? selfDMReport?.reportID;
        const reportActionsReportID = isSelfDMTransaction ? selfDMReportIDForLookup : splitTransaction?.reportID;
        const splitReportActions = getAllReportActions(reportActionsReportID);
        const reportNameValuePairs = allReportNameValuePairsList?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${splitTransaction?.reportID}`];
        const splitReportID = isSelfDMTransaction ? (selfDMReportIDForLookup ?? String(CONST.DEFAULT_NUMBER_ID)) : (splitTransaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID));
        const splitTransactionReport = allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitReportID}`];
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

        if (undeletedTransaction?.transactionID && undeletedTransaction.transactionID === forceDeleteSplitTransactionID) {
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`,
                value: {[currentReportAction.reportActionID]: null},
            });
            // On failure restore the action so the user doesn't lose visibility. Strip child-thread
            // metadata fields — they are managed by the dedicated parent-metadata revert pushes elsewhere
            // in this flow, and re-emitting them here would double-count against those.
            const {childVisibleActionCount, childCommenterCount, childLastVisibleActionCreated, childOldestFourAccountIDs, ...restoredActionWithoutChildMetadata} = currentReportAction;
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`,
                value: {[currentReportAction.reportActionID]: restoredActionWithoutChildMetadata},
            });
        }
    }

    // Clean up deleted split transactions from ALL snapshots to prevent stale data from showing in search results.
    // We scan allSnapshots instead of relying on currentSearchHash because the user may navigate
    // from a non-search route (e.g., from the selfDM report), making currentSearchHash undefined
    // even when valid snapshots with stale data exist.
    if (!isReverseSplitOperation && undeletedTransactions.length > 0) {
        const deletedSplitKeys = undeletedTransactions.reduce<Array<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`>>((acc, tx) => {
            if (tx?.transactionID) {
                acc.push(`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`);
            }
            return acc;
        }, []);

        for (const [snapshotKey, snapshotValue] of Object.entries(allSnapshots ?? {})) {
            const snapshotData = snapshotValue?.data;
            if (!snapshotData) {
                continue;
            }
            const hasDeletedKey = deletedSplitKeys.some((k) => Object.hasOwn(snapshotData, k));
            if (!hasDeletedKey) {
                continue;
            }
            const optimisticSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, null>> = {};
            const failureSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};
            for (const key of deletedSplitKeys) {
                optimisticSnapshotData[key] = null;
                failureSnapshotData[key] = snapshotData[key] ?? null;
            }
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: snapshotKey as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`,
                value: {data: optimisticSnapshotData},
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: snapshotKey as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`,
                value: {data: failureSnapshotData},
            });
        }
    }
    if (isReverseSplitOperation) {
        const deletedSplitSnapshotKeys = allChildTransactions.reduce<Array<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`>>((acc, childTransaction) => {
            if (!childTransaction?.transactionID) {
                return acc;
            }

            acc.push(`${ONYXKEYS.COLLECTION.TRANSACTION}${childTransaction.transactionID}`);
            return acc;
        }, []);

        if (deletedSplitSnapshotKeys.length > 0 || newSelfDMSplitTransactions.length > 0) {
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

            const originalSnapshotTransactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}` as const;
            const revertedOriginalTransactionUpdate = [...(onyxData.optimisticData ?? [])].reverse().find((update) => {
                return update.key === originalSnapshotTransactionKey && update.value && typeof update.value === 'object' && 'reportID' in update.value;
            });
            const revertedOriginalTransaction = revertedOriginalTransactionUpdate?.value as OnyxTypes.Transaction | undefined;

            // Scan all snapshots to update any that contain the split children, regardless of whether
            // the user navigated from a search route. This mirrors the approach in the !isReverseSplitOperation
            // block and fixes the case where the user initiates the revert from the selfDM report (not the
            // Expenses page), where searchContext.currentSearchHash would be undefined.
            for (const [snapshotKey, snapshotValue] of Object.entries(allSnapshots ?? {})) {
                const previousSnapshotData = snapshotValue?.data;
                if (!previousSnapshotData) {
                    continue;
                }

                const typedSnapshotKey = snapshotKey as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`;
                const optimisticSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};
                const failureSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};

                const hasSplitKeys = deletedSplitSnapshotKeys.some((key) => Object.hasOwn(previousSnapshotData, key));
                if (hasSplitKeys) {
                    for (const deletedSplitSnapshotKey of deletedSplitSnapshotKeys) {
                        optimisticSnapshotData[deletedSplitSnapshotKey] = null;
                        failureSnapshotData[deletedSplitSnapshotKey] = previousSnapshotData[deletedSplitSnapshotKey] ?? null;
                    }

                    if (revertedOriginalTransaction) {
                        optimisticSnapshotData[originalSnapshotTransactionKey] = revertedOriginalTransaction;
                        failureSnapshotData[originalSnapshotTransactionKey] = previousSnapshotData[originalSnapshotTransactionKey] ?? null;
                    }
                } else if (snapshotKeysToUpdate.has(typedSnapshotKey)) {
                    // Snapshot doesn't contain the split children but is an active search snapshot —
                    // inject the restored original transaction so it appears in Reports > Expenses.
                    for (const tx of newSelfDMSplitTransactions) {
                        optimisticSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`] = tx;
                        failureSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`] = null;
                    }
                }

                const reportActionsMergePatch: Record<string, Record<string, OnyxTypes.ReportAction>> = {};
                const reportActionsFailurePatch: Record<string, Record<string, null>> = {};
                let didTouchReportActions = false;
                if (optimisticSnapshotData[originalSnapshotTransactionKey] || Object.keys(optimisticSnapshotData).some((k) => k.startsWith(ONYXKEYS.COLLECTION.TRANSACTION))) {
                    for (const [actionsKey, actionsMap] of Object.entries(optimisticSelfDMIouActionsByReportID)) {
                        if (Object.keys(actionsMap).length === 0) {
                            continue;
                        }
                        reportActionsMergePatch[actionsKey] = actionsMap;
                        reportActionsFailurePatch[actionsKey] = Object.fromEntries(Object.keys(actionsMap).map((actionID) => [actionID, null]));
                        didTouchReportActions = true;
                    }
                }

                if (Object.keys(optimisticSnapshotData).length === 0 && !didTouchReportActions) {
                    continue;
                }

                onyxData.optimisticData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: typedSnapshotKey,
                    value: {
                        data: {
                            ...optimisticSnapshotData,
                            ...reportActionsMergePatch,
                        },
                    },
                });
                onyxData.failureData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: typedSnapshotKey,
                    value: {
                        data: {
                            ...failureSnapshotData,
                            ...reportActionsFailurePatch,
                        },
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

        if (firstIOU && isCreationOfSplits) {
            // For selfDM splits, also resolve the Concierge "What would you like to do with this expense?"
            // whisper so it disappears along with the original expense when splits are created.
            const whisperAction = isOriginalTransactionInSelfDM ? getTrackExpenseActionableWhisper(originalTransactionID, originalSelfDMReportID) : undefined;
            const whisperActionID = whisperAction?.reportActionID;
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
                    childReportID: null,
                },
                ...(whisperActionID && {
                    [whisperActionID]: {
                        originalMessage: {resolution: CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING},
                    },
                }),
            };
            // For selfDM, use the selfDM report ID for report actions
            const reportActionsReportID = isOriginalTransactionInSelfDM ? originalSelfDMReportID : iouReport?.reportID;

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
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`,
                value: updatedReportAction,
            });

            onyxData.successData?.push(...successData);
            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${isOriginalTransactionInSelfDM ? originalSelfDMReportID : iouReport?.reportID}`,
                value: {
                    [firstIOU.reportActionID]: {
                        pendingAction: null,
                    },
                },
            });

            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionsReportID}`,
                value: {
                    [firstIOU.reportActionID]: {
                        ...firstIOU,
                        pendingAction: null,
                    },
                    // Revert the optimistic "resolved" state on the Concierge actionable whisper so that if
                    // the split API call fails, the whisper reappears alongside the restored original expense.
                    ...(whisperActionID && {
                        [whisperActionID]: {
                            originalMessage: {
                                resolution:
                                    (whisperAction && isActionOfType(whisperAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER)
                                        ? getOriginalMessage(whisperAction)?.resolution
                                        : null) ?? null,
                            },
                        },
                    }),
                },
            });
            onyxData.failureData?.push(...failureData);
        } else {
            pushUpdatedReportPreviewActionToOnyxData();
        }

        // Update all snapshots containing the relevant transactions.
        // We scan allSnapshots instead of relying solely on currentSearchHash because the user may navigate
        // from a non-search route (e.g., Inbox), making currentSearchHash undefined even when valid snapshots exist.
        if (newSelfDMSplitTransactions.length > 0) {
            const originalTransactionSnapshotKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}` as const;
            const splitTransactionKeys = newSelfDMSplitTransactions.map((tx) => `${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}` as const);

            for (const [snapshotKey, snapshot] of Object.entries(allSnapshots ?? {})) {
                if (!snapshot?.data) {
                    continue;
                }

                const optimisticSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};
                const failureSnapshotData: Partial<Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, OnyxTypes.Transaction | null>> = {};

                // When creating splits: replace the original transaction with the new split transactions.
                if (isCreationOfSplits && Object.hasOwn(snapshot.data, originalTransactionSnapshotKey)) {
                    optimisticSnapshotData[originalTransactionSnapshotKey] = null;
                    failureSnapshotData[originalTransactionSnapshotKey] = snapshot.data[originalTransactionSnapshotKey] ?? originalTransaction ?? null;
                    for (const tx of newSelfDMSplitTransactions) {
                        optimisticSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`] = tx;
                        failureSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}`] = null;
                    }
                } else if (!isCreationOfSplits && splitTransactionKeys.some((k) => Object.hasOwn(snapshot.data, k))) {
                    // When editing splits: update the existing split transactions in place.
                    for (const tx of newSelfDMSplitTransactions) {
                        const txKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${tx.transactionID}` as const;
                        optimisticSnapshotData[txKey] = tx;
                        failureSnapshotData[txKey] = snapshot.data[txKey] ?? null;
                    }
                }

                // Embed the new IOU actions for newly-written selfDM split transactions so search-page
                // rendering can resolve `from` / actorAccountID for them.
                const reportActionsMergePatch: Record<string, Record<string, OnyxTypes.ReportAction>> = {};
                const reportActionsFailurePatch: Record<string, Record<string, null>> = {};
                let didTouchReportActions = false;
                if (Object.keys(optimisticSnapshotData).length > 0) {
                    for (const [actionsKey, actionsMap] of Object.entries(optimisticSelfDMIouActionsByReportID)) {
                        if (Object.keys(actionsMap).length === 0) {
                            continue;
                        }
                        reportActionsMergePatch[actionsKey] = actionsMap;
                        reportActionsFailurePatch[actionsKey] = Object.fromEntries(Object.keys(actionsMap).map((actionID) => [actionID, null]));
                        didTouchReportActions = true;
                    }
                }

                if (Object.keys(optimisticSnapshotData).length === 0 && !didTouchReportActions) {
                    continue;
                }

                const key = snapshotKey as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`;
                onyxData.optimisticData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key,
                    value: {data: {...optimisticSnapshotData, ...reportActionsMergePatch}},
                });
                onyxData.failureData?.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key,
                    value: {data: {...failureSnapshotData, ...reportActionsFailurePatch}},
                });
            }
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
        if (isLastTransactionInReport && expenseReportID) {
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`,
                value: {
                    reportID: null,
                    pendingFields: {
                        preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            });
            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`,
                value: null,
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`,
                value: {
                    reportID: expenseReportID,
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

    if (!isCreationOfSplits && !isReverseSplitOperation) {
        const splitUpdateFailureDataKeys: Array<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}` | `${typeof ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${string}`> = [
            `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`,
            `${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`,
            ...splitExpenses.filter((splitExpense) => !!splitExpense.transactionID).map((splitExpense) => `${ONYXKEYS.COLLECTION.TRANSACTION}${splitExpense.transactionID}` as const),
        ];

        for (const key of new Set(splitUpdateFailureDataKeys)) {
            onyxData.failureData?.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key,
                    value: {errors: null},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key,
                    value: {errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')},
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
    TransitionTracker.runAfterTransitions({callback: () => removeDraftSplitTransaction(originalTransactionID), waitForUpcomingTransition: true});
}

function updateSplitTransactionsFromSplitExpensesFlow(params: UpdateSplitTransactionsParams) {
    // Detect if this will be a reverse split that deletes the expense report.
    // When splits are reduced to 1, updateSplitTransactions performs a reverse split which
    // optimistically deletes the expense report if it's the last transaction. We need to
    // set the navigate-back URL before the deletion to prevent the "Not Found" page.
    const splitExpenses = params.transactionData?.splitExpenses ?? [];
    const originalTransactionID = params.transactionData?.originalTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const allChildTransactions = getChildTransactions(params.allTransactionsList, originalTransactionID, false);
    const hasEditableSplitExpensesLeft = splitExpenses.some((expense) => (expense.statusNum ?? 0) < CONST.REPORT.STATUS_NUM.SUBMITTED);
    const isReverseSplitOperation = splitExpenses.length === 1 && allChildTransactions.length > 0 && hasEditableSplitExpensesLeft;
    const expenseReportID = params.expenseReport?.reportID;

    // Detect whether the expense report the user is editing from will be emptied by this save.
    // This covers both the pure-workspace reverse-split (handled by isReverseSplitOperation above)
    // and broader cases — e.g. the user had splits spread across multiple reports and removed all
    // splits belonging to the current expense report, or the only remaining split moved to selfDM.
    // In any of these cases we must navigate away from the soon-to-be-empty report so the user
    // isn't stranded on a "Not Found" page.
    const expenseReportTransactions = expenseReportID ? Object.values(params.allTransactionsList ?? {}).filter((itemTransaction) => itemTransaction?.reportID === expenseReportID) : [];
    const areAllExpenseReportTransactionsSplitChildren =
        expenseReportTransactions.length > 0 && expenseReportTransactions.every((itemTransaction) => itemTransaction?.comment?.originalTransactionID === originalTransactionID);
    const anyRemainingSplitStaysInExpenseReport = splitExpenses.some((expense) => expense.reportID === expenseReportID);
    const reverseSplitKeepsOriginalInExpenseReport = isReverseSplitOperation && splitExpenses.at(0)?.reportID === expenseReportID;
    const willExpenseReportBecomeEmpty =
        !!expenseReportID && areAllExpenseReportTransactionsSplitChildren && !anyRemainingSplitStaysInExpenseReport && !reverseSplitKeepsOriginalInExpenseReport;
    const isLastTransactionInReport =
        willExpenseReportBecomeEmpty ||
        (isReverseSplitOperation && Object.values(params.allTransactionsList ?? {}).filter((itemTransaction) => itemTransaction?.reportID === expenseReportID).length === 1);
    const fallbackReportID = params.expenseReport?.chatReportID ?? params.expenseReport?.parentReportID;

    if (isLastTransactionInReport && fallbackReportID) {
        setDeleteTransactionNavigateBackUrl(ROUTES.REPORT_WITH_ID.getRoute(fallbackReportID));
    }

    const isSearchPageTopmostFullScreenRoute = isSearchTopmostFullScreenRoute();
    const isSelfDMSplit = !isSearchPageTopmostFullScreenRoute && isSelfDM(params.transactionReport) && !!params.transactionReport?.reportID;

    // For selfDM splits, navigate back to the selfDM report BEFORE the data update and delay
    // updateSplitTransactions until after the navigation animation completes. This prevents
    // the brief "Not Found" flash caused by the original transaction being deleted while
    // the transaction thread is still visible in the central pane.
    //
    // Pop any intermediate report screens above selfDM in the REPORTS_SPLIT_NAVIGATOR
    // (e.g. the original transaction's thread) BEFORE dismissing the modal. Those screens
    // become stale after the split because the original transaction's reportID is set to
    // SPLIT_REPORT_ID, so if the modal dismissal animation revealed them, the user would
    // briefly see FullPageNotFoundView before the pop landed them on selfDM.
    const selfDMReportID = params.transactionReport?.reportID;
    if (isSelfDMSplit && selfDMReportID) {
        popReportsSplitNavigatorToReport(selfDMReportID);
        Navigation.dismissModal();
        requestAnimationFrame(() => {
            updateSplitTransactions({...params, isFromSplitExpensesFlow: true});
        });
        params?.searchContext?.clearSelectedTransactions?.(true);
        return;
    }

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

    const targetReportID = params.expenseReport?.reportID ?? String(CONST.DEFAULT_NUMBER_ID);

    // Register newly created split transaction IDs so they briefly highlight in the expense list.
    // We skip existing transactions (already in allChildTransactions), reverse splits (no new transactions are created),
    // and the last-transaction case (the report navigates away before the highlight renders).
    if (params.expenseReport?.reportID && !isReverseSplitOperation && !isLastTransactionInReport) {
        const existingChildTransactionIDs = new Set(allChildTransactions.map((tx) => tx?.transactionID).filter(Boolean));
        for (const splitExpense of splitExpenses) {
            if (!splitExpense.transactionID || existingChildTransactionIDs.has(splitExpense.transactionID)) {
                continue;
            }
            addPendingNewTransactionIDs(targetReportID, splitExpense.transactionID);
        }
    }

    if (isSearchPageTopmostFullScreenRoute || !params.transactionReport?.parentReportID) {
        updateSplitTransactions({...params, isFromSplitExpensesFlow: true});

        if (!isSelfDMSplit) {
            Navigation.navigateBackToLastSuperWideRHPScreen();
        }

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
        updateSplitTransactions({...params, isFromSplitExpensesFlow: true});

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

    if (isTracking()) {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, targetReportID);
    }

    popReportsSplitNavigatorToReport(targetReportID);
    Navigation.dismissModalWithReport({reportID: targetReportID});
    requestAnimationFrame(() => {
        updateSplitTransactions({...params, isFromSplitExpensesFlow: true});
        if (!transactionThreadReportScreen?.key) {
            return;
        }
        Navigation.removeScreenByKey(transactionThreadReportScreen.key);
    });
}

export {updateSplitTransactions, updateSplitTransactionsFromSplitExpensesFlow};
