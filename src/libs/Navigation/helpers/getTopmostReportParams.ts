import type {NavigationState, PartialState} from '@react-navigation/native';
import type {ReportsSplitNavigatorParamList, RootNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get its params.
 *
 * @param state - The react-navigation state
 * @returns - It's possible that there is no report screen
 */

type State = NavigationState | NavigationState<RootNavigatorParamList> | PartialState<NavigationState>;

function getTopmostReportParams(state: State): ReportsSplitNavigatorParamList[typeof SCREENS.REPORT] | undefined {
    if (!state) {
        return;
    }

    const topmostReportsSplitNavigator = state.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

    if (!topmostReportsSplitNavigator) {
        return;
    }

    const topmostReport = topmostReportsSplitNavigator.state?.routes.findLast((route) => route.name === SCREENS.REPORT);

    if (!topmostReport) {
        return;
    }

    return topmostReport?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
}

export default getTopmostReportParams;
