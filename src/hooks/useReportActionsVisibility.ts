import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getMostRecentIOURequestActionID, isCreatedAction, isDeletedParentAction, isIOUActionMatchingTransactionList, isReportActionVisible} from '@libs/ReportActionsUtils';
import {isConciergeChatReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import useConciergeSidePanelReportActions from './useConciergeSidePanelReportActions';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

type UseReportActionsVisibilityResult = {
    visibleReportActions: ReportAction[];
    mostRecentIOUReportActionID: string | null;
    isConciergeSidePanel: boolean;
    hasPreviousMessages: boolean;
    showConciergeSidePanelWelcome: boolean;
    showFullHistory: boolean;
    handleShowPreviousMessages: () => void;
};

type UseReportActionsVisibilityParams = {
    reportID: string | undefined;
    reportActions: ReportAction[];
    canPerformWriteAction: boolean;
    hasOlderActions: boolean;
    loadOlderChats: (force?: boolean) => void;
};

function useReportActionsVisibility({reportID, reportActions, canPerformWriteAction, hasOlderActions, loadOlderChats}: UseReportActionsVisibilityParams): UseReportActionsVisibilityResult {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);

    const {transactions} = useTransactionsAndViolationsForReport(reportID);
    const reportTransactionIDs = getAllNonDeletedTransactions(transactions, reportActions).map((t) => t.transactionID);

    const baseFilteredActions = reportActions.filter((reportAction) => {
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

    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    const {sessionStartTime} = useSidePanelState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const hasUserSentMessage =
        isConciergeSidePanel && sessionStartTime
            ? reportActions.some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime)
            : false;

    const concierge = useConciergeSidePanelReportActions({
        report,
        reportActions,
        visibleReportActions: baseFilteredActions,
        isConciergeSidePanel,
        hasUserSentMessage,
        hasOlderActions,
        sessionStartTime,
        currentUserAccountID,
        greetingText: translate('common.concierge.sidePanelGreeting'),
        loadOlderChats,
    });

    const visibleReportActions = isConciergeSidePanel ? concierge.filteredVisibleActions : baseFilteredActions;

    return {
        visibleReportActions,
        mostRecentIOUReportActionID: getMostRecentIOURequestActionID(reportActions),
        isConciergeSidePanel,
        hasPreviousMessages: concierge.hasPreviousMessages,
        showConciergeSidePanelWelcome: concierge.showConciergeSidePanelWelcome,
        showFullHistory: concierge.showFullHistory,
        handleShowPreviousMessages: concierge.handleShowPreviousMessages,
    };
}

export default useReportActionsVisibility;
