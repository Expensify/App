import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, RootTabNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import {isFullScreenName} from './isNavigatorName';

const isReportTopmostSplitNavigator = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;

    if (!rootState) {
        return false;
    }

    const topmostFullScreenRoute = rootState.routes.findLast((route) => isFullScreenName(route.name));
    if (topmostFullScreenRoute?.name === NAVIGATORS.ROOT_TAB_NAVIGATOR) {
        const tabState = topmostFullScreenRoute.state as {routes: {name: keyof RootTabNavigatorParamList}[]; index: number} | undefined;
        return tabState?.routes?.[tabState?.index ?? 0]?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
    }
    return topmostFullScreenRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
};

export default isReportTopmostSplitNavigator;
