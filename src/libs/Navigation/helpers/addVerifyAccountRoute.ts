import type {NavigationState, PartialState} from '@react-navigation/native';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
// eslint-disable-next-line import/no-cycle
import {getAdaptedState, getRoutesWithIndex} from './getAdaptedStateFromPath';
// eslint-disable-next-line import/no-cycle
import getStateFromPath from './getStateFromPath';

function addVerifyAccountRoute(path: string) {
    const verifyAccountState = {
        routes: [
            {
                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                state: {
                    routes: [
                        {
                            name: SCREENS.RIGHT_MODAL.SETTINGS,
                            state: {
                                routes: [
                                    {
                                        name: SCREENS.SETTINGS.VERIFY_ACCOUNT,
                                        path,
                                    },
                                ],
                                index: 0,
                            },
                        },
                    ],
                    index: 0,
                },
            },
        ],
    };

    return verifyAccountState;
}

const addVerifyAccountState = (path: string) => {
    const pathWithoutVerifyAccount = path.replace('/verify-account', '').replace('/Settings_Verify_Account', '/Settings');

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

    return finalState;
};

export default addVerifyAccountRoute;
export {addVerifyAccountState};
