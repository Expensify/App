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

function getReportParamsFromRoute(route: {params?: Record<string, unknown>} | undefined): FocusedReportParams | undefined {
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
 * Finds a navigator by name in the navigation state, including when it is nested inside TAB_NAVIGATOR.
 * This mirrors the TAB_NAVIGATOR fallback used by getTopmostReportParams.
 */
function findNavigatorInState(state: State, navigatorName: string) {
    let navigator = state.routes?.findLast((route) => route.name === navigatorName);

    if (!navigator) {
        const rootTab = state.routes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
        navigator = rootTab?.state?.routes?.findLast((route) => route.name === navigatorName);
    }

    return navigator;
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

function getSearchFullscreenMoneyRequestReportParams(state: State): FocusedReportParams | undefined {
    const searchFullscreenNavigator = findNavigatorInState(state, NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    if (!searchFullscreenNavigator) {
        return;
    }

    const topmostReport = searchFullscreenNavigator.state?.routes?.findLast((route) => route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT);
    if (!topmostReport) {
        return;
    }

    return getReportParamsFromRoute(topmostReport);
}

/**
 * Find the report screen the user is focused on across RHP, central-pane inbox, and search fullscreen.
 *
 * RHP is checked first. On wide layouts the central-pane chat report usually remains mounted behind the RHP,
 * so checking the central pane first would return the wrong report ID.
 *
 * For central-pane inbox reports, this delegates to getTopmostReportParams, which resolves
 * REPORTS_SPLIT_NAVIGATOR inside TAB_NAVIGATOR when it is not mounted at the root.
 */
function getFocusedReportParams(state: State): FocusedReportParams | undefined {
    if (!state) {
        return;
    }

    const rhpReportParams = getRHPFocusedReportParams(state);
    if (rhpReportParams?.reportID) {
        return rhpReportParams;
    }

    const centralPaneReportParams = getTopmostReportParams(state);
    if (centralPaneReportParams?.reportID) {
        return centralPaneReportParams;
    }

    return getSearchFullscreenMoneyRequestReportParams(state);
}

function getFocusedReportId(state: State): string | undefined {
    return getFocusedReportParams(state)?.reportID;
}

export default getFocusedReportParams;
export {getFocusedReportId};
export type {FocusedReportParams};
