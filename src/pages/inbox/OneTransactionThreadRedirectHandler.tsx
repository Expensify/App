import useIsOneTransactionThread from '@hooks/useIsOneTransactionThread';
import useOnyx from '@hooks/useOnyx';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {isOneTransactionReport} from '@libs/ReportUtils';
import {getSearchParamFromPath} from '@libs/Url';

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
    backTo: string | undefined;
};

/** A route reduced to its path, so one built by `ROUTES` can be compared with a `backTo`, which carries a leading slash and usually nests a `backTo` of its own. */
function getRoutePath(route: string): string {
    return route.replace(/^\//, '').replace(/\?.*$/, '');
}

/** The route for the report that owns the expense, matching how the app opens an expense report from where we are. */
function getExpenseReportRoute({routeName, reportID, referrer, backTo}: ExpenseReportRouteParams): Route {
    if (routeName !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
        return ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, referrer, backTo);
    }

    // Clicking the expense of a single-expense report in Search opens the report on this same RHP route rather than a
    // money request report one, so staying here and swapping the report is what the user would have got by clicking it.
    if (isSearchTopmostFullScreenRoute()) {
        return ROUTES.SEARCH_REPORT.getRoute({reportID, backTo});
    }

    // Outside Search an expense report belongs in the wide RHP, and only a genuinely narrow layout falls back to the
    // full report view - the same split `navigateToChildReport` makes. `useResponsiveLayout` cannot answer this: its
    // `shouldUseNarrowLayout` counts the RHP this handler runs inside as narrow, so every screen size would end up in
    // the central pane.
    return getIsNarrowLayout() ? ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, referrer, backTo) : ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo});
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

        // A thread opened from its own report carries that report as `backTo`, which would leave the report pointing
        // at itself and make `linkTo` refuse to navigate at all. Inherit the report's own nested `backTo` instead -
        // where it would have returned to had the user opened it directly.
        const isBackToParentReport = !!backTo && getRoutePath(getExpenseReportRoute({routeName: route.name, reportID: parentReportID, referrer, backTo})) === getRoutePath(backTo);
        const resolvedBackTo = isBackToParentReport ? (getSearchParamFromPath(backTo ?? '', 'backTo') ?? undefined) : backTo;

        // Replacing rather than pushing keeps the thread we are leaving out of the history, so going back doesn't
        // land on it again.
        Navigation.navigate(getExpenseReportRoute({routeName: route.name, reportID: parentReportID, referrer, backTo: resolvedBackTo}), {forceReplace: true});
    }, [backTo, isFocused, parentReportID, referrer, route.name, shouldRedirectToParentReport]);

    return null;
}

OneTransactionThreadRedirectHandler.displayName = 'OneTransactionThreadRedirectHandler';

export default OneTransactionThreadRedirectHandler;
