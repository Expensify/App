import {useRoute} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {getCombinedReportActions, getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isMoneyRequestAction, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {canEditReportAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';

/**
 * Self-contained hook that resolves the last editable report action for a given report.
 * Used by ComposerWithSuggestions to power the arrow-up-to-edit shortcut.
 */
function useLastEditableAction(reportID: string): OnyxEntry<ReportAction> {
    const {isOffline} = useNetwork();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((transaction) => transaction.pendingAction !== 'delete');
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);

    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    const parentReportAction = useParentReportAction(report);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${effectiveTransactionThreadReportID}`);
    const transactionThreadReportActionsArray = transactionThreadReportActions ? Object.values(transactionThreadReportActions) : [];
    const combinedReportActions = getCombinedReportActions(filteredReportActions, effectiveTransactionThreadReportID ?? null, transactionThreadReportActionsArray);

    const route = useRoute();
    const isOnSearchMoneyRequestReport = route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || route.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;

    return [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));
}

export default useLastEditableAction;
