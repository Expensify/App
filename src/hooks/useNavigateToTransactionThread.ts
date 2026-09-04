import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction, Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

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

    /** Identity of the screen seeding the carousel, so it can later refresh or release only its own list */
    carouselSource?: string;

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
    const {markReportRHPWidth} = useWideRHPActions();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    return ({transactionID, reportActions, report, transaction, siblingTransactionIDs, carouselSource, backTo}: NavigateToTransactionThreadParams) => {
        const iouAction = getIOUActionForTransactionID(reportActions, transactionID);
        const resolvedBackTo = backTo ?? Navigation.getActiveRoute();
        let reportIDToNavigate = iouAction?.childReportID;

        const routeParams: {reportID: string | undefined; reportActionID?: string; backTo?: string; anchorTransactionID?: string} = {
            reportID: reportIDToNavigate,
            backTo: resolvedBackTo,
            // Anchors the thread to this expense so the header can show the carousel before the thread's own
            // parent report action has loaded.
            anchorTransactionID: transactionID,
        };

        if (!reportIDToNavigate) {
            const transactionThreadReport = createTransactionThreadReport({
                introSelected,
                conciergeChat,
                currentUserLogin: currentUserDetails.email ?? '',
                currentUserAccountID: currentUserDetails.accountID,
                betas,
                iouReport: report,
                iouReportAction: iouAction,
                transaction,
                personalDetails,
            });
            if (transactionThreadReport) {
                reportIDToNavigate = transactionThreadReport.reportID;
                routeParams.reportID = reportIDToNavigate;
            }
        } else {
            setOptimisticTransactionThread(reportIDToNavigate, report?.reportID, iouAction?.reportActionID, report?.policyID);
        }

        // Single transaction report opens in RHP. We seed every sibling transaction ID so the RHP can
        // display prev/next arrows for navigation between expenses. The pressed row's own screen takes ownership
        // of the carousel: an earlier version kept a broader list (e.g. the Spend page's) alive here, which left
        // the report showing a counter and arrows for expenses that weren't in it.
        setActiveTransactionIDs(siblingTransactionIDs, {source: carouselSource}).then(() => {
            if (reportIDToNavigate) {
                markReportRHPWidth(reportIDToNavigate, 'wide');
            }
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(routeParams));
        });
    };
}

export default useNavigateToTransactionThread;
