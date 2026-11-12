import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {
    isCreatedAction,
    isCurrentUserPendingAddAction,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    isReportActionVisible,
    shouldHidePayAction,
} from '@libs/ReportActionsUtils';
import {isConciergeChatReport} from '@libs/ReportUtils';

import filterHiddenSupportTicketSurveys from '@pages/inbox/report/ReportActionsList/filterHiddenSupportTicketSurveys';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {reportVisibleActionsSelector} from '@selectors/ReportAction';

import useConciergeSidePanelReportActions from './useConciergeSidePanelReportActions';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useReportTransactionsCollection from './useReportTransactionsCollection';
import useSidePanelState from './useSidePanelState';

type UseReportActionsVisibilityParams = {
    reportID: string | undefined;

    /** Every action of the report in the Onyx cache, newest first, including hidden ones. */
    cachedActions: ReportAction[] | undefined;

    /** The report's own actions in the loaded window, without deleted expenses and hidden report previews. */
    reportViewActions: ReportAction[];

    /** `reportViewActions` merged with the one-expense thread's actions, plus placeholder rows while the report loads. */
    combinedActions: ReportAction[];
    canPerformWriteAction: boolean;
    hasOlderActions: boolean;
    loadOlderChats: (force?: boolean) => void;
    setConciergeShowFullHistory?: (show: boolean) => void;
};

type UseReportActionsVisibilityResult = {
    /** `combinedActions` the list works with, hidden ones included: limited to the current Concierge session where it applies, without the pay and survey rows the list never shows. */
    listActions: ReportAction[];

    /** The `listActions` that render as rows. */
    visibleActions: ReportAction[];

    /**
     * `visibleActions` plus support surveys the list hides. Only for checking whether the loaded page holds the report's
     * newest action, because the server counts a hidden survey as the newest visible action.
     */
    visibleActionsWithHiddenSurveys: ReportAction[];
    isConciergeSidePanel: boolean;
    isConciergeHiddenHistory: boolean;
    showConciergeSidePanelWelcome: boolean;
    showFullHistory: boolean;
    hasPreviousMessages: boolean;
    handleShowPreviousMessages: () => void;
};

/** Decides which actions of the report the list shows. Every visibility rule of the list lives here. */
function useReportActionsVisibility({
    reportID,
    cachedActions,
    reportViewActions,
    combinedActions,
    canPerformWriteAction,
    hasOlderActions,
    loadOlderChats,
    setConciergeShowFullHistory,
}: UseReportActionsVisibilityParams): UseReportActionsVisibilityResult {
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const isReopenedSupportTicket = !!reportNameValuePairs?.reopenedAsReportID;

    const isInSidePanel = useIsInSidePanel();
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChat;
    const isConciergeMainDM = !isInSidePanel && isConciergeChat;
    const isConciergeHiddenHistory = isConciergeSidePanel;

    const {sessionStartTime} = useSidePanelState();

    const hasUserSentMessage =
        isConciergeHiddenHistory && sessionStartTime
            ? reportViewActions.some(
                  (action) =>
                      !isCreatedAction(action) &&
                      action.actorAccountID === currentUserAccountID &&
                      (isCurrentUserPendingAddAction(action, currentUserAccountID) || action.created >= sessionStartTime),
              )
            : false;

    const visibleCombinedActions = useVisibleCombinedActions({reportID, reportViewActions, combinedActions, canPerformWriteAction});

    const {filteredVisibleActions, filteredCombinedActions, showConciergeSidePanelWelcome, showFullHistory, hasPreviousMessages, handleShowPreviousMessages} =
        useConciergeSidePanelReportActions({
            report,
            combinedActions,
            visibleActions: visibleCombinedActions,
            isConciergeHiddenHistory,
            hasUserSentMessage,
            hasOlderActions,
            sessionStartTime,
            currentUserAccountID,
            greetingText: translate('common.concierge.greeting'),
            loadOlderChats,
        });

    // The renderer hides pay actions while the report waits on a bank account. Removing them here keeps the unread
    // marker, the skeleton decision, and scroll positions in line with the rows the list shows.
    const isWaitingOnBankAccount = !!report?.isWaitingOnBankAccount;
    const withoutHiddenPayActions = (actions: ReportAction[]) => (isWaitingOnBankAccount ? actions.filter((action) => !shouldHidePayAction(action, true)) : actions);
    // Hidden surveys must not become unread targets that have no rendered row.
    const withoutHiddenSurveys = (actions: ReportAction[]) => filterHiddenSupportTicketSurveys({reportActions: actions, cachedActions, report, isReopenedSupportTicket});

    const visibleActionsWithHiddenSurveys = withoutHiddenPayActions(filteredVisibleActions);
    const visibleActions = withoutHiddenSurveys(visibleActionsWithHiddenSurveys);
    const listActions = withoutHiddenSurveys(withoutHiddenPayActions(filteredCombinedActions));

    const showConciergeMainDMHistory = () => {
        setConciergeShowFullHistory?.(true);
        loadOlderChats(true);
    };

    return {
        listActions,
        visibleActions,
        visibleActionsWithHiddenSurveys,
        isConciergeSidePanel,
        isConciergeHiddenHistory,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages: isConciergeMainDM ? showConciergeMainDMHistory : handleShowPreviousMessages,
    };
}

type UseVisibleCombinedActionsParams = Pick<UseReportActionsVisibilityParams, 'reportID' | 'reportViewActions' | 'combinedActions' | 'canPerformWriteAction'>;

/**
 * The `combinedActions` the current user may see. A hook of its own so React Compiler can keep the result between renders:
 * it is computed after this hook's subscriptions instead of being passed into the next hook.
 */
function useVisibleCombinedActions({reportID, reportViewActions, combinedActions, canPerformWriteAction}: UseVisibleCombinedActionsParams): ReportAction[] {
    const {isOffline} = useNetwork();
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
        selector: reportVisibleActionsSelector(reportID),
    });
    const reportTransactions = useReportTransactionsCollection(reportID);
    const [areTransactionsLoaded] = useOnyx(ONYXKEYS.DERIVED.REPORT_TRANSACTIONS_AND_VIOLATIONS, {
        selector: (data) => data !== undefined,
    });

    // When transactions haven't loaded yet, pass undefined to skip IOU filtering entirely
    // (undefined = "don't filter" in isIOUActionMatchingTransactionList).
    // Once loaded, filter normally — even if transactions is empty (genuinely no transactions).
    const reportTransactionIDs = areTransactionsLoaded
        ? new Set(getAllNonDeletedTransactions(reportTransactions, reportViewActions).map((transaction) => transaction.transactionID))
        : undefined;

    return combinedActions.filter((reportAction) => {
        const passesOfflineCheck = isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors;

        if (!passesOfflineCheck) {
            return false;
        }

        const actionReportID = reportAction.reportID ?? reportID;
        if (!isReportActionVisible(reportAction, actionReportID, canPerformWriteAction, visibleReportActionsData)) {
            return false;
        }

        return isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs);
    });
}

export default useReportActionsVisibility;
