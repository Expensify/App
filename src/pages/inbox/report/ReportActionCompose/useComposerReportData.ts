import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isSentMoneyReportAction} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type ComposerReportData = {
    report: OnyxEntry<Report>;

    /** The report's own actions in the loaded window, without deleted expenses and hidden report previews. */
    reportViewActions: ReportAction[];
    effectiveTransactionThreadReportID: string | undefined;
};

function useComposerReportData(reportID: string): ComposerReportData {
    const {isOffline} = useNetwork();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const {windowActions} = usePaginatedReportActions(report?.reportID);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    // After the last hook, so React Compiler keeps this and everything derived from it between renders.
    const reportViewActions = getFilteredReportActionsForReportView(windowActions);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, reportViewActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = reportViewActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportViewActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    return {report, reportViewActions, effectiveTransactionThreadReportID};
}

export default useComposerReportData;
