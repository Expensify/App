import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/**
 * TEMPORARY instrumentation for https://github.com/Expensify/App/issues/95430
 * ("Hidden" is shown in the LHN for card expense / transaction threads).
 *
 * Every line is printed as `[95430][<event>] {...json...}` on a single line so it can be filtered
 * with a plain text search in the browser console, Metro or `adb logcat`.
 *
 * `dump95430()` and `dump95430('<reportID>')` are exposed globally for on-demand inspection.
 *
 * Delete this file together with its call sites in `ReportNameUtils.ts` and `SidebarUtils.ts`
 * once the root cause is confirmed.
 */
import Onyx from 'react-native-onyx';

/** Search for this string to find every line produced by this module */
const DEBUG_TAG = '[95430]';

/** The same report is recomputed many times, so identical payloads are only printed once */
const lastPayloadByKey = new Map<string, string>();

/** What each report last rendered as in the LHN, so the on-demand dump can report it */
const lastLHNTextByReportID = new Map<string, string>();

type OnyxSnapshot = {
    reports: OnyxCollection<Report>;
    transactions: OnyxCollection<Transaction>;
    reportActions: OnyxCollection<ReportActions>;
    personalDetailsList: OnyxEntry<PersonalDetailsList>;
};

/** Latest collections seen by `computeReportName`, used by the on-demand dump */
let lastSnapshot: OnyxSnapshot | undefined;

function print(event: string, dedupeKey: string, payload: Record<string, unknown>, shouldDedupe = true) {
    const serialized = JSON.stringify(payload);
    const key = `${event}:${dedupeKey}`;
    if (shouldDedupe && lastPayloadByKey.get(key) === serialized) {
        return;
    }
    lastPayloadByKey.set(key, serialized);
    // eslint-disable-next-line no-console -- temporary debugging output for issue #95430
    console.log(`${DEBUG_TAG}[${event}] ${serialized}`);
}

function getOriginalMessage(action: OnyxEntry<ReportAction>): Record<string, unknown> | undefined {
    if (!action) {
        return undefined;
    }
    return (action as {originalMessage?: Record<string, unknown>}).originalMessage;
}

function getLinkedTransactionID(action: OnyxEntry<ReportAction>): string | undefined {
    const transactionID = getOriginalMessage(action)?.IOUTransactionID;
    return typeof transactionID === 'string' ? transactionID : undefined;
}

function getParentReportAction(report: OnyxEntry<Report>, reportActions: OnyxCollection<ReportActions>): OnyxEntry<ReportAction> {
    if (!report?.parentReportID || !report.parentReportActionID) {
        return undefined;
    }
    return reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
}

function isCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return !!transaction?.managedCard || !!transaction?.cardID || !!transaction?.bank;
}

/** Unreported expenses live on the placeholder report IDs `0` and `-4` instead of a real expense report */
function isUnreportedTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return !transaction?.reportID || transaction.reportID === '0' || transaction.reportID === '-4';
}

/**
 * Only threads hanging off a real expense report can hit this issue. Track expenses in the self DM
 * resolve their name through a different, always-available path.
 */
function getThreadKind(parentReport: OnyxEntry<Report>): string {
    if (!parentReport) {
        return 'PARENT_NOT_IN_ONYX';
    }
    if (parentReport.type === CONST.REPORT.TYPE.EXPENSE) {
        return 'EXPENSE_REPORT_THREAD';
    }
    if (parentReport.type === CONST.REPORT.TYPE.IOU) {
        return 'IOU_REPORT_THREAD';
    }
    if (parentReport.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM) {
        return 'SELF_DM_TRACK_THREAD';
    }
    return `OTHER_${parentReport.type ?? 'UNKNOWN'}`;
}

function summarizeTransaction(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return null;
    }
    return {
        transactionID: transaction.transactionID,
        reportID: transaction.reportID,
        isCardTransaction: isCardTransaction(transaction),
        amount: transaction.amount,
        modifiedAmount: transaction.modifiedAmount,
        currency: transaction.currency,
        merchant: transaction.merchant,
        modifiedMerchant: transaction.modifiedMerchant,
        created: transaction.created,
        cardID: transaction.cardID,
        cardName: transaction.cardName,
        managedCard: transaction.managedCard,
        bank: transaction.bank,
        hasEReceipt: transaction.hasEReceipt,
        liabilityType: transaction.comment?.liabilityType,
    };
}

function summarizeReportAction(action: OnyxEntry<ReportAction>) {
    if (!action) {
        return null;
    }
    const originalMessage = getOriginalMessage(action);
    return {
        reportActionID: action.reportActionID,
        actionName: action.actionName,
        childReportID: action.childReportID,
        childType: action.childType,
        actorAccountID: action.actorAccountID,
        originalMessageType: originalMessage?.type,
        IOUTransactionID: originalMessage?.IOUTransactionID,
        IOUReportID: originalMessage?.IOUReportID,
    };
}

function summarizeReport(report: OnyxEntry<Report>) {
    if (!report) {
        return null;
    }
    return {
        reportID: report.reportID,
        type: report.type,
        chatType: report.chatType,
        reportName: report.reportName,
        policyID: report.policyID,
        ownerAccountID: report.ownerAccountID,
        managerID: report.managerID,
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
        stateNum: report.stateNum,
        statusNum: report.statusNum,
        participantAccountIDs: Object.keys(report.participants ?? {}),
    };
}

/**
 * Transaction threads are plain chat threads with no `chatType` whose parent action is an IOU action.
 * When the parent action has not loaded yet we cannot tell for sure, and that unresolved state is
 * exactly what this issue is about, so it counts as a candidate.
 */
function isTransactionThreadCandidate(report: OnyxEntry<Report>, parentReportAction: OnyxEntry<ReportAction>): boolean {
    if (report?.type !== CONST.REPORT.TYPE.CHAT || !report.parentReportID || !report.parentReportActionID || report.chatType) {
        return false;
    }
    if (parentReportAction) {
        return parentReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;
    }
    return true;
}

function buildDiagnostics(report: Report, snapshot: OnyxSnapshot, parentReportAction: OnyxEntry<ReportAction>, resolvedName: string | undefined) {
    const {reports, transactions, reportActions, personalDetailsList} = snapshot;

    const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    const parentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`];
    const parentReportActionList = Object.values(parentReportActions ?? {});
    const actionPointingToThisThread = parentReportActionList.find((action) => action?.childReportID === report.reportID);

    const linkedTransactionID = getLinkedTransactionID(parentReportAction);
    const linkedTransaction = linkedTransactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${linkedTransactionID}`] : undefined;

    // Scanning the whole transaction collection is expensive, so only do it when something is actually missing
    const shouldScanAllTransactions = !resolvedName || !linkedTransaction;
    const transactionsOnParentReport = shouldScanAllTransactions ? Object.values(transactions ?? {}).filter((transaction) => transaction?.reportID === report.parentReportID) : [];

    const participants = Object.keys(report.participants ?? {}).map((accountID) => {
        const personalDetails = personalDetailsList?.[accountID];
        return {
            accountID,
            hasPersonalDetails: !!personalDetails,
            displayName: personalDetails?.displayName,
            login: personalDetails?.login,
        };
    });

    let likelyCause = 'OK_NAME_RESOLVED';
    if (!resolvedName) {
        if (!parentReport) {
            likelyCause = 'PARENT_REPORT_MISSING';
        } else if (!parentReportActions) {
            likelyCause = 'PARENT_REPORT_ACTIONS_NOT_LOADED';
        } else if (!parentReportAction) {
            likelyCause = actionPointingToThisThread ? 'PARENT_REPORT_ACTION_ID_MISMATCH' : 'PARENT_REPORT_ACTION_MISSING';
        } else if (!linkedTransaction) {
            likelyCause = 'TRANSACTION_MISSING';
        } else {
            likelyCause = 'NAME_EMPTY_WITH_FULL_DATA';
        }
    }

    return {
        likelyCause,
        threadKind: getThreadKind(parentReport),
        transactionIsUnreported: isUnreportedTransaction(linkedTransaction),
        resolvedName: resolvedName ?? null,
        lastRenderedInLHNAs: lastLHNTextByReportID.get(report.reportID) ?? null,
        willFallBackToParticipantNames: !resolvedName,
        report: summarizeReport(report),
        parentReport: summarizeReport(parentReport),
        parentReportActionsLoaded: !!parentReportActions,
        parentReportActionsCount: parentReportActionList.length,
        parentReportAction: summarizeReportAction(parentReportAction),
        actionPointingToThisThread: summarizeReportAction(actionPointingToThisThread),
        linkedTransactionID: linkedTransactionID ?? null,
        linkedTransaction: summarizeTransaction(linkedTransaction),
        transactionsOnParentReport: transactionsOnParentReport.map(summarizeTransaction),
        participants,
    };
}

type ReportNameDiagnosticsParams = OnyxSnapshot & {
    report: OnyxEntry<Report>;
    parentReportAction: OnyxEntry<ReportAction>;
    resolvedName: string | undefined;
};

/**
 * Dumps everything `computeReportName` needs to name a transaction thread, so we can tell which
 * piece of data is missing when the LHN falls back to "Hidden".
 */
function logReportNameComputation({report, reports, transactions, reportActions, personalDetailsList, parentReportAction, resolvedName}: ReportNameDiagnosticsParams) {
    lastSnapshot = {reports, transactions, reportActions, personalDetailsList};

    if (!report || !isTransactionThreadCandidate(report, parentReportAction)) {
        return;
    }

    print('name', report.reportID, buildDiagnostics(report, lastSnapshot, parentReportAction, resolvedName));
}

/**
 * Logs what the LHN row actually renders, so the computed name above can be matched with the visible row.
 */
function logSidebarRow(report: OnyxEntry<Report>, text: string, hiddenTranslation: string) {
    if (!report) {
        return;
    }
    lastLHNTextByReportID.set(report.reportID, text);

    const parentReportAction = getParentReportAction(report, lastSnapshot?.reportActions);
    const showsHidden = !text || text === hiddenTranslation;
    if (!showsHidden && !isTransactionThreadCandidate(report, parentReportAction)) {
        return;
    }

    print('lhn', report.reportID, {
        showsHidden,
        text,
        reportID: report.reportID,
        type: report.type,
        chatType: report.chatType,
        parentReportID: report.parentReportID,
        parentReportActionID: report.parentReportActionID,
    });
}

/**
 * Call `dump95430()` in the console for an overview of every card expense and transaction thread,
 * or `dump95430('<reportID>')` for the full diagnostics of a single report.
 */
function dump95430(reportID?: string) {
    if (!lastSnapshot) {
        print('dump', 'no-snapshot', {error: 'No Onyx snapshot captured yet - open the LHN first'}, false);
        return;
    }
    const {reports, transactions, reportActions} = lastSnapshot;

    if (reportID) {
        const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        if (!report) {
            print('dump', reportID, {error: `Report ${reportID} is not in Onyx`}, false);
            return;
        }
        print('dump', reportID, buildDiagnostics(report, lastSnapshot, getParentReportAction(report, reportActions), undefined), false);
        return;
    }

    const reportList = Object.values(reports ?? {});
    const threadsByParentActionID = new Map<string, Report>();
    for (const candidate of reportList) {
        if (candidate?.parentReportActionID) {
            threadsByParentActionID.set(candidate.parentReportActionID, candidate);
        }
    }

    const cardExpenses = Object.values(transactions ?? {})
        .filter(isCardTransaction)
        .map((transaction) => {
            const expenseReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`];
            const iouAction = Object.values(expenseReportActions ?? {}).find((action) => getLinkedTransactionID(action) === transaction?.transactionID);
            const thread = iouAction ? threadsByParentActionID.get(iouAction.reportActionID) : undefined;
            return {
                transactionID: transaction?.transactionID,
                merchant: transaction?.modifiedMerchant ?? transaction?.merchant,
                expenseReportID: transaction?.reportID,
                isUnreported: isUnreportedTransaction(transaction),
                expenseReportType: reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`]?.type ?? null,
                expenseReportActionsLoaded: !!expenseReportActions,
                iouActionID: iouAction?.reportActionID ?? null,
                threadReportIDFromAction: iouAction?.childReportID ?? null,
                threadReportInOnyx: !!thread,
                threadLastRenderedInLHNAs: thread ? (lastLHNTextByReportID.get(thread.reportID) ?? null) : null,
            };
        });

    const threads = reportList
        .filter((candidate): candidate is Report => isTransactionThreadCandidate(candidate, getParentReportAction(candidate, reportActions)))
        .map((thread) => {
            const parentReportAction = getParentReportAction(thread, reportActions);
            const parentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${thread.parentReportID}`];
            return {
                reportID: thread.reportID,
                threadKind: getThreadKind(parentReport),
                parentReportID: thread.parentReportID,
                parentReportActionID: thread.parentReportActionID,
                hasParentReport: !!parentReport,
                hasParentReportAction: !!parentReportAction,
                linkedTransactionID: getLinkedTransactionID(parentReportAction) ?? null,
                lastRenderedInLHNAs: lastLHNTextByReportID.get(thread.reportID) ?? null,
            };
        });

    print(
        'dump',
        'overview',
        {
            reportCount: reportList.length,
            transactionCount: Object.keys(transactions ?? {}).length,
            cardExpenseCount: cardExpenses.length,
            unreportedCardExpenseCount: cardExpenses.filter((cardExpense) => cardExpense.isUnreported).length,
            transactionThreadCount: threads.length,
            // Only these can hit the issue - if this is 0 the account has no data to reproduce with
            expenseReportThreadCount: threads.filter((thread) => thread.threadKind === 'EXPENSE_REPORT_THREAD').length,
            threadsMissingParentAction: threads.filter((thread) => !thread.hasParentReportAction).length,
            cardExpenses,
            threads,
        },
        false,
    );
}

/** The parent action removed by `break95430`, kept so `restore95430` can put it back */
let removedParentAction: {reportActionsKey: `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS}${string}`; reportActionID: string; reportAction: ReportAction} | undefined;

/**
 * Forces the state this issue is about by deleting a thread's parent IOU action from Onyx, which is
 * what the hydration race produces naturally. The LHN row for the thread should flip to "Hidden".
 * Call `restore95430()` to put the action back.
 */
function break95430(threadReportID: string) {
    const report = lastSnapshot?.reports?.[`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`];
    if (!report?.parentReportID || !report.parentReportActionID) {
        print('break', threadReportID, {error: `Report ${threadReportID} is not a thread, or is not in Onyx`}, false);
        return;
    }
    const reportActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}` as const;
    const reportAction = lastSnapshot?.reportActions?.[reportActionsKey]?.[report.parentReportActionID];
    if (!reportAction) {
        print('break', threadReportID, {error: `Parent action ${report.parentReportActionID} is already absent`}, false);
        return;
    }

    removedParentAction = {reportActionsKey, reportActionID: report.parentReportActionID, reportAction};
    print('break', threadReportID, {removedParentActionID: report.parentReportActionID, fromReportActionsKey: reportActionsKey}, false);
    // eslint-disable-next-line rulesdir/prefer-actions-set-data -- temporary debugging helper for issue #95430, not production code
    Onyx.merge(reportActionsKey, {[report.parentReportActionID]: null});
}

/** Restores the parent action removed by `break95430` */
function restore95430() {
    if (!removedParentAction) {
        print('restore', 'none', {error: 'Nothing to restore - call break95430(threadReportID) first'}, false);
        return;
    }
    const {reportActionsKey, reportActionID, reportAction} = removedParentAction;
    removedParentAction = undefined;
    print('restore', reportActionID, {restoredInto: reportActionsKey}, false);
    // eslint-disable-next-line rulesdir/prefer-actions-set-data -- temporary debugging helper for issue #95430, not production code
    Onyx.merge(reportActionsKey, {[reportActionID]: reportAction});
}

Object.assign(globalThis, {dump95430, break95430, restore95430});

export {break95430, dump95430, logReportNameComputation, logSidebarRow, restore95430};
