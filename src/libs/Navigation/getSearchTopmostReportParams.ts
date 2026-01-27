import type {NavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList, RootNavigatorParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

type State = NavigationState | NavigationState<RootNavigatorParamList> | PartialState<NavigationState>;

function getReportRHPParams(state: State): RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT] | undefined {
    const lastRoute = state?.routes?.at(-1);
    if (!lastRoute || lastRoute.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return;
    }
    const topmostRHPReport = lastRoute.state?.routes?.findLast((route) => route?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route?.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT || route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT);
    if (!topmostRHPReport) {
        return;
    }
    return topmostRHPReport?.params as RightModalNavigatorParamList[typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT];
}

/**
 * Find the last visited report screen (Inbox report/RHP report/Search money request report) in the navigation state and get its params.
 *
 * @param state - The react-navigation state
 * @returns - It's possible that there is no report screen
 */

function getSearchTopmostReportParams(state: State): ReportsSplitNavigatorParamList[typeof SCREENS.REPORT] | undefined {
    if (!state) {
        return;
    }

    const RHPReportParams = getReportRHPParams(state);
    if (RHPReportParams) {
        return RHPReportParams;
    }

    const topmostReportsSplitNavigator = state.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);

    if (!topmostReportsSplitNavigator) {
        return;
    }

    let topmostReport;

    if (topmostReportsSplitNavigator.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        topmostReport = topmostReportsSplitNavigator.state?.routes.findLast((route) => route.name === SCREENS.REPORT);
    } else {
        topmostReport = topmostReportsSplitNavigator.state?.routes.findLast((route) => route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT);
    }

    if (!topmostReport) {
        return;
    }

    return topmostReport?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
}

export default getSearchTopmostReportParams;
