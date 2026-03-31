import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';

function getTopmostReportsSplitNavigator() {
    const rootState = navigationRef.getRootState();
    const topmostRootTab = rootState?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = topmostRootTab?.state;
    return tabState?.routes?.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
}

export default getTopmostReportsSplitNavigator;
