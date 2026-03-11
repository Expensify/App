import {useRoute} from '@react-navigation/native';
import React from 'react';
import useAgentZeroStatusIndicator from '@hooks/useAgentZeroStatusIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsReportReadyToDisplay from '@hooks/useIsReportReadyToDisplay';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useSidePanelState from '@hooks/useSidePanelState';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    isCreatedAction,
    isMoneyRequestAction,
    isSentMoneyReportAction,
} from '@libs/ReportActionsUtils';
import {canEditReportAction, isConciergeChatReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import ReportFooter from './report/ReportFooter';

/**
 * Self-subscribing building block that wraps ReportFooter.
 * Owns lastReportAction, reportTransactions, transactionThreadReportID derivation.
 */
function ReportComposer() {
    const route = useRoute();
    const routeParams = route.params as {reportID?: string; reportActionID?: string} | undefined;
    const reportIDFromRoute = getNonEmptyStringOnyxID(routeParams?.reportID);
    const reportActionIDFromRoute = routeParams?.reportActionID;

    const isInSidePanel = useIsInSidePanel();
    const {isOffline} = useNetwork();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const {isCurrentReportLoadedFromOnyx} = useIsReportReadyToDisplay(report, reportIDFromRoute, isReportArchived);
    const parentReportAction = useParentReportAction(report);
    const reportID = report?.reportID;

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(reportID, reportActionIDFromRoute);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportIDFromRoute);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((transaction) => transaction.transactionID);

    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? [], isOffline, reportTransactionIDs);
    const [transactionThreadReportActions = getEmptyObject<OnyxTypes.ReportActions>()] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`);
    const combinedReportActions = getCombinedReportActions(reportActions, transactionThreadReportID ?? null, Object.values(transactionThreadReportActions));
    const isSentMoneyReport = reportActions.some((action) => isSentMoneyReportAction(action));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- canEditReportAction type is loose
    const lastReportAction = [...combinedReportActions, parentReportAction].find((action) => canEditReportAction(action) && !isMoneyRequestAction(action));

    const isConciergeChat = isConciergeChatReport(report);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);
    const {sessionStartTime} = useSidePanelState();
    const hasUserSentMessage = (() => {
        if (!isConciergeSidePanel || !sessionStartTime) {
            return false;
        }
        return reportActions.some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    })();

    const {kickoffWaitingIndicator} = useAgentZeroStatusIndicator(String(report?.reportID ?? CONST.DEFAULT_NUMBER_ID), isConciergeChat);

    if (!isCurrentReportLoadedFromOnyx) {
        return null;
    }

    return (
        <ReportFooter
            report={report}
            lastReportAction={lastReportAction}
            reportTransactions={reportTransactions}
            transactionThreadReportID={isSentMoneyReport ? undefined : transactionThreadReportID}
            shouldHideStatusIndicators={isConciergeSidePanel && !hasUserSentMessage}
            kickoffWaitingIndicator={kickoffWaitingIndicator}
        />
    );
}

export default ReportComposer;
