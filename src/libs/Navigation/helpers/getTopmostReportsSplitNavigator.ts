import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';

function getTopmostReportsSplitNavigator() {
    return navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
}

export default getTopmostReportsSplitNavigator;
