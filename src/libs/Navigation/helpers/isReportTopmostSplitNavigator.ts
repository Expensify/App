import NAVIGATORS from '@src/NAVIGATORS';

import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';

const isReportTopmostSplitNavigator = (): boolean => {
    const topmostFullScreenRoute = getTopmostFullScreenRoute();
    if (!topmostFullScreenRoute) {
        return false;
    }
    return topmostFullScreenRoute.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || topmostFullScreenRoute.name === NAVIGATORS.CONCIERGE_SPLIT_NAVIGATOR;
};

export default isReportTopmostSplitNavigator;
