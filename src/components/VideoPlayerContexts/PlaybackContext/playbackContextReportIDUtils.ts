import {findFocusedRoute} from '@react-navigation/native';
import type {Route} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import {getAllReportActions, getReportActionHtml} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, isChatThread} from '@libs/ReportUtils';
import getStateFromPath from '@navigation/helpers/getStateFromPath';
import Navigation from '@navigation/Navigation';
import type {ReportDetailsNavigatorParamList} from '@navigation/types';
import type {Route as ActiveRoute} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

/* NO_REPORT_ID & NO_REPORT_ID_IN_PARAMS are used to differentiate if the ReportID is simply missing or if it is just missing from the route params.
 * Since both are a unique symbol they should not be used outside of these context files to avoid having to always import them.
 * normalizeReportID is used to return the context value outside, so from a calling hook perspective these symbols doesn't matter at all */
const NO_REPORT_ID: unique symbol = Symbol(undefined);
const NO_REPORT_ID_IN_PARAMS: unique symbol = Symbol(undefined);
type ProtectedCurrentRouteReportID = string | typeof NO_REPORT_ID_IN_PARAMS | typeof NO_REPORT_ID;

const normalizeReportID = (reportID: ProtectedCurrentRouteReportID) => {
    if (reportID === NO_REPORT_ID_IN_PARAMS || reportID === NO_REPORT_ID) {
        return undefined;
    }

    return reportID;
};

type SearchRoute = Omit<Route<string>, 'key'> | undefined;
type RouteWithReportIDInParams<T> = T & {params: ReportDetailsNavigatorParamList[typeof SCREENS.REPORT_DETAILS.ROOT]};

const getCurrentRouteReportID: (url: string) => string | ProtectedCurrentRouteReportID = (url): string | typeof NO_REPORT_ID_IN_PARAMS | typeof NO_REPORT_ID => {
    const route = Navigation.getActiveRouteWithoutParams() as ActiveRoute;
    const focusedRoute = findFocusedRoute(getStateFromPath(route));
    const reportIDFromURLParams = new URLSearchParams(Navigation.getActiveRoute()).get('reportID');

    const focusedRouteReportID = hasReportIdInRouteParams(focusedRoute) ? focusedRoute.params.reportID : reportIDFromURLParams;

    if (!focusedRouteReportID) {
        return NO_REPORT_ID_IN_PARAMS;
    }

    const report = getReportOrDraftReport(focusedRouteReportID);
    const isFocusedRouteAChatThread = isChatThread(report);
    const firstReportThatHasURLInAttachments = findURLInReportOrAncestorAttachments(report, url);

    return isFocusedRouteAChatThread ? firstReportThatHasURLInAttachments : focusedRouteReportID;
};

const screensWithReportID = [
    SCREENS.RIGHT_MODAL.SEARCH_REPORT,
    SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
    SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
    SCREENS.REPORT,
    SCREENS.REPORT_ATTACHMENTS,
];

function hasReportIdInRouteParams(route: SearchRoute): route is RouteWithReportIDInParams<SearchRoute> {
    return !!route && !!route.params && !!screensWithReportID.find((screen) => screen === route.name) && 'reportID' in route.params;
}

/**
 * Searches recursively through a report and its ancestor reports to find a specified URL in their attachments.
 * The search continues up the ancestry chain until the URL is found or there are no more ancestors.
 *
 * @param currentReport - The current report entry, potentially containing the URL.
 * @param url - The URL to be located in the report or its ancestors' attachments.
 * @returns The report ID where the URL is found, or undefined if not found.
 */
function findURLInReportOrAncestorAttachments(currentReport: OnyxEntry<Report>, url: string | null): string | typeof NO_REPORT_ID {
    const {parentReportID, reportID} = currentReport ?? {};

    const reportActions = getAllReportActions(reportID);
    const hasUrlInAttachments = Object.values(reportActions).some((action) => {
        const {sourceURL, previewSourceURL} = getAttachmentDetails(getReportActionHtml(action));
        return sourceURL === url || previewSourceURL === url;
    });

    if (hasUrlInAttachments) {
        return reportID ?? NO_REPORT_ID;
    }

    if (parentReportID) {
        const parentReport = getReportOrDraftReport(parentReportID);
        return findURLInReportOrAncestorAttachments(parentReport, url);
    }

    return NO_REPORT_ID;
}

export {NO_REPORT_ID, NO_REPORT_ID_IN_PARAMS, getCurrentRouteReportID, normalizeReportID, findURLInReportOrAncestorAttachments};
export type {ProtectedCurrentRouteReportID};
