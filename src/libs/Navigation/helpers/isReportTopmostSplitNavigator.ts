import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import {isFullScreenName} from './isNavigatorName';

const isReportTopmostSplitNavigator = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootStackParamList>;

    if (!rootState) {
        return false;
    }

    return rootState.routes.findLast((route) => isFullScreenName(route.name))?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
};

export default isReportTopmostSplitNavigator;
