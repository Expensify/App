import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {isCreatedAction, isCurrentUserPendingAddAction, isDeletedParentAction, isIOUActionMatchingTransactionList, isReportActionVisible} from '@libs/ReportActionsUtils';
import {isConciergeChatReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {reportVisibleActionsSelector} from '@selectors/ReportAction';

import useConciergeSidePanelReportActions from './useConciergeSidePanelReportActions';
import useCurrentSessionActionIDs from './useCurrentSessionActionIDs';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseReportActionsVisibilityParams = {
    reportID: string | undefined;
    reportActions: ReportAction[];
    allReportActions: ReportAction[];
    canPerformWriteAction: boolean;
    hasOlderActions: boolean;
    loadOlderChats: (force?: boolean) => void;
    mainDMSessionStartTime?: string | null;
    conciergeShowFullHistory?: boolean;
    setConciergeShowFullHistory?: (show: boolean) => void;
    conciergeHadMessagesAtSessionStart?: boolean;
    setConciergeHadMessagesAtSessionStart?: (value: boolean) => void;
};

type UseReportActionsVisibilityResult = {
    sortedReportActions: ReportAction[];
    sortedVisibleReportActions: ReportAction[];
    isConciergeSidePanel: boolean;
    isConciergeMainDM: boolean;
    isConciergeHiddenHistory: boolean;
    showConciergeSidePanelWelcome: boolean;
    showFullHistory: boolean;
    hasPreviousMessages: boolean;
    handleShowPreviousMessages: () => void;
};

function useReportActionsVisibility({
    reportID,
    reportActions,
    allReportActions,
    canPerformWriteAction,
    hasOlderActions,
    loadOlderChats,
    mainDMSessionStartTime,
    conciergeShowFullHistory,
    setConciergeShowFullHistory,
    conciergeHadMessagesAtSessionStart,
    setConciergeHadMessagesAtSessionStart,
}: UseReportActionsVisibilityParams): UseReportActionsVisibilityResult {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {
        selector: reportVisibleActionsSelector(reportID),
    });

    const isInSidePanel = useIsInSidePanel();
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);
    const isConciergeMainDM = !isInSidePanel && isConciergeChatReport(report, conciergeReportID);
    const isConciergeHiddenHistory = isConciergeSidePanel || isConciergeMainDM;

    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const sessionStartTime = isConciergeSidePanel ? sidePanelSessionStartTime : (mainDMSessionStartTime ?? null);

    // IDs of the current session's messages (the user's own messages and the Concierge replies to
    // them) captured by arrival, so a clock-skewed just-sent message or reply keeps counting as
    // current-session regardless of its timestamp.
    const currentSessionActionIDs = useCurrentSessionActionIDs(allReportActions, currentUserAccountID, sessionStartTime);

    const hasUserSentMessage =
        isConciergeHiddenHistory && sessionStartTime
            ? allReportActions.some(
                  (action) =>
                      !isCreatedAction(action) &&
                      action.actorAccountID === currentUserAccountID &&
                      (isCurrentUserPendingAddAction(action, currentUserAccountID) || currentSessionActionIDs.has(action.reportActionID) || action.created >= sessionStartTime),
              )
            : false;

    const {transactions: reportTransactions, isLoaded: areTransactionsLoaded} = useTransactionsAndViolationsForReport(reportID);
    // When transactions haven't loaded yet, pass undefined to skip IOU filtering entirely
    // (undefined = "don't filter" in isIOUActionMatchingTransactionList).
    // Once loaded, filter normally — even if transactions is empty (genuinely no transactions).
    const reportTransactionIDs = areTransactionsLoaded ? getAllNonDeletedTransactions(reportTransactions, allReportActions ?? []).map((transaction) => transaction.transactionID) : undefined;

    const visibleReportActions = reportActions.filter((reportAction) => {
        const passesOfflineCheck = isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors;

        if (!passesOfflineCheck) {
            return false;
        }

        const actionReportID = reportAction.reportID ?? reportID;
        if (!isReportActionVisible(reportAction, actionReportID, canPerformWriteAction, visibleReportActionsData)) {
            return false;
        }

        if (!isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs)) {
            return false;
        }

        return true;
    });

    const {filteredVisibleActions, filteredReportActions, showConciergeSidePanelWelcome, showFullHistory, hasPreviousMessages, handleShowPreviousMessages} =
        useConciergeSidePanelReportActions({
            report,
            reportActions,
            visibleReportActions,
            isConciergeHiddenHistory,
            hasUserSentMessage,
            hasOlderActions,
            sessionStartTime,
            currentUserAccountID,
            currentSessionActionIDs,
            greetingText: translate('common.concierge.greeting'),
            loadOlderChats,
            isConciergeMainDM,
            showFullHistory: isConciergeMainDM ? conciergeShowFullHistory : undefined,
            onSetShowFullHistory: isConciergeMainDM ? setConciergeShowFullHistory : undefined,
            hadMessagesAtSessionStart: isConciergeMainDM ? conciergeHadMessagesAtSessionStart : undefined,
            onSetHadMessagesAtSessionStart: isConciergeMainDM ? setConciergeHadMessagesAtSessionStart : undefined,
        });

    return {
        sortedReportActions: filteredReportActions,
        sortedVisibleReportActions: filteredVisibleActions,
        isConciergeSidePanel,
        isConciergeMainDM,
        isConciergeHiddenHistory,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    };
}

export default useReportActionsVisibility;
