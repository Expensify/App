import type {OnyxEntry} from 'react-native-onyx';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

type NavigateToTransactionThreadParams = {
    /** The transaction whose thread should be opened */
    transactionID: string;

    /** Report actions of the parent (IOU/expense) report, used to resolve the IOU action and its thread */
    reportActions: ReportAction[];

    /** The parent (IOU/expense) report that owns the transaction */
    report: OnyxEntry<Report>;

    /** The transaction being opened, used to build the thread optimistically when it doesn't exist yet */
    transaction: OnyxEntry<Transaction>;

    /** Ordered list of sibling transaction IDs used to drive the prev/next carousel in the thread RHP */
    siblingTransactionIDs: string[];

    /** Route to return to when navigating back; defaults to the current active route */
    backTo?: string;
};

/**
 * Shared navigation algorithm for opening a transaction thread (single-expense RHP view with the
 * prev/next carousel). It resolves the IOU action's `childReportID`, creates the thread optimistically
 * when it doesn't exist yet, seeds the sibling transaction IDs for the carousel, and navigates to the
 * SEARCH_REPORT route.
 *
 * Callers are responsible for gathering their own `reportActions`, `report`, `transaction`, and
 * `siblingTransactionIDs` because the data sources differ per screen.
 */
function useNavigateToTransactionThread() {
    const {markReportIDAsExpense} = useWideRHPActions();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    return ({transactionID, reportActions, report, transaction, siblingTransactionIDs, backTo}: NavigateToTransactionThreadParams) => {
        const iouAction = getIOUActionForTransactionID(reportActions, transactionID);
        const resolvedBackTo = backTo ?? Navigation.getActiveRoute();
        let reportIDToNavigate = iouAction?.childReportID;

        const routeParams: {reportID: string | undefined; reportActionID?: string; backTo?: string} = {
            reportID: reportIDToNavigate,
            backTo: resolvedBackTo,
        };

        if (!reportIDToNavigate) {
            const transactionThreadReport = createTransactionThreadReport({
                introSelected,
                currentUserLogin: currentUserDetails.email ?? '',
                currentUserAccountID: currentUserDetails.accountID,
                betas,
                iouReport: report,
                iouReportAction: iouAction,
                transaction,
            });
            if (transactionThreadReport) {
                reportIDToNavigate = transactionThreadReport.reportID;
                routeParams.reportID = reportIDToNavigate;
            }
        } else {
            setOptimisticTransactionThread(reportIDToNavigate, report?.reportID, iouAction?.reportActionID, report?.policyID);
        }

        // Single transaction report opens in RHP. We seed every sibling transaction ID so the RHP can
        // display prev/next arrows for navigation between expenses.
        setActiveTransactionIDs(siblingTransactionIDs).then(() => {
            if (reportIDToNavigate) {
                markReportIDAsExpense(reportIDToNavigate);
            }
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(routeParams));
        });
    };
}

export default useNavigateToTransactionThread;
