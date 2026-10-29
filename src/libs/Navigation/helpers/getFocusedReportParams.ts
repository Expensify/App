import {ALL_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';

import type {RootNavigatorParamList} from '@libs/Navigation/types';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import getTopmostReportParams from './getTopmostReportParams';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

type State = NavigationState | NavigationState<RootNavigatorParamList> | PartialState<NavigationState>;

type FocusedReportParams = {
    reportID: string;
    reportActionID?: string;
};

function getReportParamsFromRoute(route: {params?: unknown} | undefined): FocusedReportParams | undefined {
    const params = route?.params;
    if (!params || typeof params !== 'object' || !('reportID' in params) || typeof params.reportID !== 'string') {
        return;
    }

    return {
        reportID: params.reportID,
        reportActionID: 'reportActionID' in params && typeof params.reportActionID === 'string' ? params.reportActionID : undefined,
    };
}

/**
 * Returns the focused child route of TAB_NAVIGATOR based on its index.
 * Unlike findLast-based lookups, this respects which tab the user is actually viewing.
 */
function getActiveTabRoute(state: State) {
    const rootTab = state.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    if (!rootTab?.state?.routes) {
        return;
    }

    return rootTab.state.routes.at(rootTab.state.index ?? 0);
}

function getRHPFocusedReportParams(state: State): FocusedReportParams | undefined {
    const lastRoute = state?.routes?.at(-1);
    if (!lastRoute || lastRoute.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return;
    }

    const topmostRHPReport = lastRoute.state?.routes?.findLast((route) => ALL_WIDE_RIGHT_MODALS.has(route.name));
    if (!topmostRHPReport) {
        return;
    }

    return getReportParamsFromRoute(topmostRHPReport);
}

function getReportsSplitFocusedReportParams(reportsSplitRoute: {state?: State}): FocusedReportParams | undefined {
    const topmostReport = reportsSplitRoute.state?.routes?.findLast((route) => route.name === SCREENS.REPORT);
    return getReportParamsFromRoute(topmostReport);
}

function getSearchFullscreenMoneyRequestReportParams(searchFullscreenRoute: {state?: State}): FocusedReportParams | undefined {
    const topmostReport = searchFullscreenRoute.state?.routes?.findLast((route) => route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT);
    return getReportParamsFromRoute(topmostReport);
}

/**
 * Find the report screen the user is focused on across RHP, central-pane inbox, and search fullscreen.
 *
 * RHP is checked first. On wide layouts the central-pane chat report usually remains mounted behind the RHP,
 * so checking the central pane first would return the wrong report ID.
 *
 * When TAB_NAVIGATOR is present, only the *active* tab is consulted. A preserved REPORTS_SPLIT_NAVIGATOR
 * on an inactive Inbox tab must not win over a Search fullscreen money-request report the user is viewing.
 *
 * Without TAB_NAVIGATOR (root-level navigators), falls back to getTopmostReportParams then Search.
 */
function getFocusedReportParams(state: State): FocusedReportParams | undefined {
    if (!state) {
        return;
    }

    const rhpReportParams = getRHPFocusedReportParams(state);
    if (rhpReportParams?.reportID) {
        return rhpReportParams;
    }

    const activeTab = getActiveTabRoute(state);
    if (activeTab) {
        if (activeTab.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
            return getSearchFullscreenMoneyRequestReportParams(activeTab);
        }

        if (activeTab.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
            return getReportsSplitFocusedReportParams(activeTab);
        }

        return;
    }

    const centralPaneReportParams = getTopmostReportParams(state);
    if (centralPaneReportParams?.reportID) {
        return {
            reportID: centralPaneReportParams.reportID,
            reportActionID: centralPaneReportParams.reportActionID,
        };
    }

    const searchFullscreenNavigator = state.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    if (!searchFullscreenNavigator) {
        return;
    }

    return getSearchFullscreenMoneyRequestReportParams(searchFullscreenNavigator);
}

export default getFocusedReportParams;
