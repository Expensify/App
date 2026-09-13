import useIsOneTransactionThread from '@hooks/useIsOneTransactionThread';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isOneTransactionReport} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused, useRoute} from '@react-navigation/native';
import {useEffect} from 'react';

type ReportScreenRoute =
    | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
    | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>;

/** Hoisted out of the component because `useOnyx` selectors may not be defined inline. */
function selectIsSteppingThroughExpenses(transactionIDs: OnyxEntry<string[]>): boolean {
    return (transactionIDs?.length ?? 0) > 1;
}

type ExpenseReportRouteParams = {
    routeName: string;
    reportID: string;
    referrer: string | undefined;
    backTo: Route | undefined;
    shouldUseNarrowLayout: boolean;
};

/**
 * The route for the report that owns the expense, matching how the rest of the app opens an expense report: in the
 * wide RHP when we are already in one, and as a full report view otherwise. See `navigateToChildReport` and `Link.ts`.
 */
function getExpenseReportRoute({routeName, reportID, referrer, backTo, shouldUseNarrowLayout}: ExpenseReportRouteParams): Route {
    if (routeName !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
        return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, referrer, backTo);
    }

    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo});
    }

    // Narrow layouts have no wide RHP, so the expense report opens as a full report view there instead.
    return shouldUseNarrowLayout ? ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, referrer, backTo) : ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo});
}

/**
 * Renders nothing. A single-expense report renders its only expense inline (see `shouldDisplayReportTableView`), so
 * that expense's transaction thread duplicates the report. This replaces such a route with the report itself - the
 * route-level backstop for entry points that don't check the transaction count themselves.
 */
function OneTransactionThreadRedirectHandler() {
    const route = useRoute<ReportScreenRoute>();
    const reportIDFromRoute = getNonEmptyStringOnyxID(route.params?.reportID);
    const isFocused = useIsFocused();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDFromRoute}`);
    const parentReportID = getNonEmptyStringOnyxID(report?.parentReportID);

    // A multi-expense report still paginating in can briefly look like a single-expense one to the action-derived
    // check below, so gate on the count the server keeps on the report itself first.
    const [isParentOneTransactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {selector: isOneTransactionReport});

    // The same definition `HeaderView` and `SidebarUtils` use, so the redirect and the thread's own views agree.
    // Passing `undefined` keeps the call inert, so plain comment threads don't subscribe to their chat's action list.
    const isOneTransactionThread = useIsOneTransactionThread(isParentOneTransactionReport ? report : undefined);

    // The prev/next arrows only exist in a thread's header, so the flows that seed a sibling set to step through
    // expenses (Home "Recently added", "Review N flagged expenses", the duplicate review list) would dead-end
    // mid-review if we redirected out of the thread.
    const [isSteppingThroughExpenses] = useOnyx(ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS, {selector: selectIsSteppingThroughExpenses});

    // A message deep link points at an action inside the thread, so dropping the thread route would drop its anchor.
    const hasLinkedReportAction = !!route.params?.reportActionID;

    // `referrer=notification` is what lets `useMarkAsRead` mark the report read without waiting on window focus, so it
    // has to survive the redirect.
    const referrer = route.name === SCREENS.REPORT ? route.params?.referrer : undefined;
    const backTo = route.params?.backTo;

    const shouldRedirectToParentReport = !!parentReportID && isOneTransactionThread && !isSteppingThroughExpenses && !hasLinkedReportAction;

    useEffect(() => {
        if (!isFocused || !shouldRedirectToParentReport || !parentReportID) {
            return;
        }

        // Replacing rather than pushing, and reusing this route's own `backTo`, keeps the thread we are leaving out of
        // the history so going back doesn't land on it again. When `backTo` already points at the report we are
        // replacing with, `linkTo` treats the navigation as a no-op and the user stays on the thread, which is what we
        // want: that only happens for a thread opened from the report itself, which the user navigated into on purpose.
        Navigation.navigate(getExpenseReportRoute({routeName: route.name, reportID: parentReportID, referrer, backTo, shouldUseNarrowLayout}), {forceReplace: true});
    }, [backTo, isFocused, parentReportID, referrer, route.name, shouldRedirectToParentReport, shouldUseNarrowLayout]);

    return null;
}

OneTransactionThreadRedirectHandler.displayName = 'OneTransactionThreadRedirectHandler';

export default OneTransactionThreadRedirectHandler;
