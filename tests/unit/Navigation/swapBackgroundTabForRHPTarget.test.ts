import {getMatchingFullScreenRoute} from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NavigationPartialRoute} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

import createMock from '../../utils/createMock';

jest.mock('@libs/Navigation/helpers/getAdaptedStateFromPath', () => ({getMatchingFullScreenRoute: jest.fn()}));
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@libs/Navigation/navigationRef', () => ({dispatch: jest.fn()}));

const mockedGetMatchingFullScreenRoute = jest.mocked(getMatchingFullScreenRoute);
const mockedGetStateFromPath = jest.mocked(getStateFromPath);
// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() does not rely on `this` binding
const mockedDispatch = jest.mocked(navigationRef.dispatch);

describe('swapBackgroundTabForRHPTarget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('preserves the nested workspace state when switching an initialized background tab', () => {
        const splitState = {
            routes: [
                {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: '1'}},
                {name: SCREENS.WORKSPACE.DISTANCE_RATES, params: {policyID: '1'}},
            ],
            index: 1,
        };
        const matchingWorkspaceRoute: NavigationPartialRoute = {
            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
            state: {
                routes: [{name: SCREENS.WORKSPACES_LIST}, {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: splitState}],
                index: 1,
            },
        };
        mockedGetStateFromPath.mockReturnValue({routes: [{name: SCREENS.WORKSPACE.DISTANCE_RATES_SETTINGS}]});
        mockedGetMatchingFullScreenRoute.mockReturnValue({
            name: NAVIGATORS.TAB_NAVIGATOR,
            state: {routes: [matchingWorkspaceRoute], index: 0},
        });
        const currentState = createMock<NavigationState>({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        key: 'tab-state-key',
                        routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {...matchingWorkspaceRoute, state: {routes: [{name: SCREENS.WORKSPACES_LIST}]}}],
                        index: 0,
                    },
                },
            ],
            index: 0,
        });

        expect(swapBackgroundTabForRHPTarget(currentState, ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute('1'))).toBe(true);
        expect(mockedDispatch).toHaveBeenCalledWith({
            type: CONST.NAVIGATION.ACTION_TYPE.NAVIGATE,
            payload: {
                name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                params: {
                    screen: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    params: {state: splitState},
                },
            },
            target: 'tab-state-key',
        });
    });

    it('does not dispatch without navigation state', () => {
        expect(swapBackgroundTabForRHPTarget(undefined, ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute('1'))).toBe(false);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });
});
