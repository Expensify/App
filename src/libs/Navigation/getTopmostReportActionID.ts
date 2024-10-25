import type {NavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {RootStackParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the linked reportActionID of it.
 *
 * @param state - The react-navigation state
 * @returns - It's possible that there is no report screen
 */
function getTopmostReportActionID(state: NavigationState | NavigationState<RootStackParamList> | PartialState<NavigationState>): string | undefined {
    if (!state) {
        return;
    }

    const topmostReportsSplitNavigator = state.routes.filter((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR).at(-1);
    if (!topmostReportsSplitNavigator?.state) {
        return;
    }

    const topmostReport = topmostReportsSplitNavigator.state?.routes.filter((route) => route.name === SCREENS.REPORT).at(-1);

    if (!topmostReport || !topmostReport?.params) {
        return;
    }

    const reportActionID = 'reportActionID' in topmostReport.params && topmostReport.params.reportActionID;

    if (typeof reportActionID !== 'string') {
        return;
    }

    return reportActionID;
}

export default getTopmostReportActionID;
