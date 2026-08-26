import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useWideRHPActions} from '@components/WideRHPContextProvider';

import {createTransactionThreadReport, setOptimisticTransactionThread} from '@libs/actions/Report';
import {setActiveTransactionIDs, shouldPreserveActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
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

    /** When true, keep an already-active broader carousel (e.g. the Spend page's list) instead of re-seeding it with just this report's siblings */
    shouldPreserveBroaderCarousel?: boolean;

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

    return ({transactionID, reportActions, report, transaction, siblingTransactionIDs, shouldPreserveBroaderCarousel = false, backTo}: NavigateToTransactionThreadParams) => {
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
        // display prev/next arrows for navigation between expenses. A broader carousel the user drilled in from is
        // left untouched, so its list (and the snapshot hash backing prev/next) survive navigating back out to it.
        const seedCarousel =
            shouldPreserveBroaderCarousel && shouldPreserveActiveTransactionIDs(siblingTransactionIDs, transactionID) ? Promise.resolve() : setActiveTransactionIDs(siblingTransactionIDs);

        seedCarousel.then(() => {
            if (reportIDToNavigate) {
                markReportRHPWidth(reportIDToNavigate, 'wide');
            }
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(routeParams));
        });
    };
}

export default useNavigateToTransactionThread;
