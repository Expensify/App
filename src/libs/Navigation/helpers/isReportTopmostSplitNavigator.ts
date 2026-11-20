import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';
import {isReportSplitNavigatorName} from './isNavigatorName';

const isReportTopmostSplitNavigator = (): boolean => {
    const topmostFullScreenRoute = getTopmostFullScreenRoute();
    if (!topmostFullScreenRoute) {
        return false;
    }
    return isReportSplitNavigatorName(topmostFullScreenRoute.name);
};

export default isReportTopmostSplitNavigator;
