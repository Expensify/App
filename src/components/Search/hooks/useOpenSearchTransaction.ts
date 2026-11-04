import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {isOneTransactionReport} from '@libs/ReportUtils';
import {createAndOpenSearchTransactionThread} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {hasCompletedGuidedSetupFlowSelector, hasSeenTourSelector} from '@src/selectors/Onboarding';
import {fullPolicySnapshotLastModifiedByPolicyIDSelector} from '@src/selectors/Policy';

/** Returns a handler that opens an expense from a search snapshot in the RHP, creating its transaction thread first when it has none. */
function useOpenSearchTransaction() {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const email = session?.email;
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const delegateAccountID = useDelegateAccountID();
    const [fullPolicySnapshotLastModifiedByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT, {selector: fullPolicySnapshotLastModifiedByPolicyIDSelector});

    return (item: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        if (!item.reportAction?.childReportID) {
            const shouldOpenTransactionThread = !isOneTransactionReport(item.report) || item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            // introSelected and conciergeChat are passed as undefined to avoid extra Onyx subscriptions.
            // They're only used for guided-setup onboarding data, which is gated behind introSelected/onboarding checks
            // that won't apply here - the user has already completed onboarding if they're submitting expenses.
            createAndOpenSearchTransactionThread({
                getCurrencyDecimals,
                item,
                introSelected: undefined,
                conciergeChat: undefined,
                backTo,
                currentUserLogin: email ?? '',
                currentUserAccountID: accountID,
                personalDetails,
                isSelfTourViewed,
                hasCompletedGuidedSetupFlow,
                delegateAccountID,
                IOUTransactionID: item.reportAction?.childReportID,
                shouldNavigate: shouldOpenTransactionThread,
                fullPolicySnapshotLastModifiedByPolicyID,
            });
            if (shouldOpenTransactionThread) {
                return;
            }
        }

        const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        const isFromOneTransactionReport = isOneTransactionReport(item.report);

        let reportID = item.reportID;
        if (item.reportAction?.childReportID && (isFromSelfDM || !isFromOneTransactionReport)) {
            reportID = item.reportAction.childReportID;
        }

        if (!reportID) {
            return;
        }

        requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
    };
}

export default useOpenSearchTransaction;
