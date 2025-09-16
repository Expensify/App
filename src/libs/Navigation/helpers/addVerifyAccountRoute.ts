import type {NavigationState, PartialState} from '@react-navigation/native';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
// eslint-disable-next-line import/no-cycle
import {getAdaptedState, getRoutesWithIndex} from './getAdaptedStateFromPath';
import getStateFromPath from './getStateFromPath';

function addVerifyAccountRoute(path: string) {
    const pathWithoutVerifyAccount = path.replace('/verify-account', '');

    const baseState = getStateFromPath(pathWithoutVerifyAccount as Route) as PartialState<NavigationState<RootNavigatorParamList>>;

    if (baseState === undefined) {
        throw new Error(`[addVerifyAccountRoute] Unable to get state from path: ${pathWithoutVerifyAccount}`);
    }

    const adaptedBaseState = getAdaptedState(baseState);

    if (!adaptedBaseState) {
        throw new Error(`[addVerifyAccountRoute] Unable to adapt state from path: ${pathWithoutVerifyAccount}`);
    }

    const RHPIndex = adaptedBaseState.routes.findLastIndex((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    const verifyAccountRoute = {
        name: SCREENS.SETTINGS.VERIFY_ACCOUNT,
        path,
    };

    const verifyAccountSettingsRoute = {
        name: SCREENS.RIGHT_MODAL.SETTINGS,
        state: {
            routes: [verifyAccountRoute],
            index: 0,
        },
    };

    if (RHPIndex !== -1) {
        const existingModal = adaptedBaseState.routes.at(RHPIndex);
        const existingRoutes = existingModal?.state?.routes ?? [];

        const updatedRoutes = [...existingRoutes, verifyAccountSettingsRoute];

        adaptedBaseState.routes[RHPIndex] = {
            name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
            state: {
                routes: updatedRoutes,
                index: updatedRoutes.length - 1,
            },
        };
        return adaptedBaseState;
    }
    const rightModalNavigator = {
        name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
        state: {
            routes: [verifyAccountSettingsRoute],
            index: 0,
        },
    };

    const finalState = getRoutesWithIndex([...adaptedBaseState.routes, rightModalNavigator]);

    // Remove keys from all routes to avoid RESET action in getActionFromState
    // getActionFromState returns RESET if routes have keys (existing routes)

    return finalState;
}

export default addVerifyAccountRoute;
