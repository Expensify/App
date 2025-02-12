import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import Log from '@libs/Log';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Closes the last RHP flow, if there is only one, closes the entire RHP.
 */
export default function closeRHPFlow(navigationRef: NavigationContainerRef<RootNavigatorParamList>) {
    if (!navigationRef.isReady()) {
        return;
    }
    const state = navigationRef.getState();
    const lastRoute = state.routes.at(-1);
    const isLastRouteRHP = lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

    if (!isLastRouteRHP) {
        Log.warn('RHP Navigator has not been found when calling closeRHPFlow function');
        return;
    }

    let target = state.key;

    const hasMoreThanOneRoute = lastRoute?.state?.routes?.length && lastRoute.state.routes.length > 1;
    if (lastRoute?.state?.key && hasMoreThanOneRoute) {
        target = lastRoute.state.key;
    }
    navigationRef.dispatch({...StackActions.pop(), target});
}
