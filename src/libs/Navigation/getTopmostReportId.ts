import type {NavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {RootStackParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Find the last visited report screen in the navigation state and get the id of it.
 *
 * @param state - The react-navigation state
 * @returns - It's possible that there is no report screen
 */
function getTopmostReportId(state: NavigationState | NavigationState<RootStackParamList> | PartialState<NavigationState>): string | undefined {
    if (!state) {
        return;
    }

    const topmostReportsSplitNavigator = state.routes?.filter((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR).at(-1);

    if (!topmostReportsSplitNavigator) {
        return;
    }

    const topmostReport = topmostReportsSplitNavigator.state?.routes.filter((route) => route.name === SCREENS.REPORT).at(-1);

    if (!topmostReport) {
        return;
    }

    // const directReportParams = topmostCentralPane.params;
    // const directReportIdParam = directReportParams && 'reportID' in directReportParams && directReportParams?.reportID;

    // if (!topmostCentralPane.state && !directReportIdParam) {
    //     return;
    // }

    // if (directReportIdParam) {
    //     return directReportIdParam;
    // }

    if (!topmostReport) {
        return;
    }

    const topmostReportId = topmostReport.params && 'reportID' in topmostReport.params && topmostReport.params?.reportID;
    if (typeof topmostReportId !== 'string') {
        return;
    }

    return topmostReportId;
}

export default getTopmostReportId;
