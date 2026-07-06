import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getReportIDFromLink, getRouteFromLink, isMoneyRequestReport, parseReportRouteParams} from '@libs/ReportUtils';

import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

function isAlreadyRHPRoute(path: string): boolean {
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    return normalizedPath.startsWith('e/') || normalizedPath.startsWith('search/view/') || normalizedPath.startsWith('search/r/');
}

function getReportIDFromNewDotReportURL(href: string): string | null {
    const index = href.indexOf('newdotreport?reportID=');
    if (index === -1) {
        return null;
    }

    const reportID = href.split('newdotreport?reportID=').pop()?.split(/[#&?]/).at(0);
    return reportID || null;
}

function getReportActionIDFromReportLink(url: string): string | undefined {
    const route = getRouteFromLink(url);
    const {reportID, isSubReportPageRoute} = parseReportRouteParams(route);
    if (!reportID || isSubReportPageRoute) {
        return undefined;
    }

    const state = getStateFromPath(route as Route);
    const focusedRoute = findFocusedRoute(state);
    if (focusedRoute?.name !== SCREENS.REPORT) {
        return undefined;
    }

    return focusedRoute?.params && 'reportActionID' in focusedRoute.params ? (focusedRoute.params.reportActionID as string) : undefined;
}

/**
 * When a report hyperlink is opened from Inbox or Search chat, resolve it to a context-preserving
 * navigation route (RHP on wide layouts, full-screen with backTo on narrow) instead of raw r/:id.
 * Returns null when the link should keep its default openLink handling.
 */
function resolveOpenLinkReportRoute(href: string, internalNewExpensifyPath = ''): Route | null {
    if (internalNewExpensifyPath && isAlreadyRHPRoute(internalNewExpensifyPath)) {
        return null;
    }

    let reportID = getReportIDFromLink(href);
    if (!reportID) {
        const newDotReportID = getReportIDFromNewDotReportURL(href);
        if (!newDotReportID) {
            return null;
        }
        reportID = newDotReportID;
    }

    if (!isReportTopmostSplitNavigator() && !isSearchTopmostFullScreenRoute()) {
        return null;
    }

    // When the linked report is already open in the Inbox central pane, scroll in place instead of
    // opening the same report again in the RHP on top of itself.
    if (isReportTopmostSplitNavigator() && Navigation.getTopmostReportId() === reportID) {
        return null;
    }

    const backTo = Navigation.getActiveRoute();
    const reportActionID = getReportActionIDFromReportLink(href);
    const isNarrowLayout = getIsNarrowLayout();

    if (isNarrowLayout) {
        return ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID, undefined, backTo);
    }

    const isInSearchContext = isSearchTopmostFullScreenRoute();
    const isExpenseReport = isMoneyRequestReport(reportID);

    if (isInSearchContext) {
        if (isExpenseReport) {
            return ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo});
        }

        return ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo});
    }

    if (isExpenseReport) {
        return ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo});
    }

    return ROUTES.SEARCH_REPORT.getRoute({reportID, reportActionID, backTo});
}

export default resolveOpenLinkReportRoute;
