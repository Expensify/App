import recordBlockedNavigation from '@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation';
import RootStackRouter from '@libs/Navigation/AppNavigator/createRootStackNavigator/RootStackRouter';
import {evaluateGuards} from '@libs/Navigation/guards';

import NAVIGATORS from '@src/NAVIGATORS';

import type {ParamListBase, StackNavigationState} from '@react-navigation/native';

jest.mock('@libs/Navigation/guards', () => ({
    __esModule: true,
    createGuardContext: jest.fn(),
    evaluateGuards: jest.fn(),
}));

jest.mock('@libs/Navigation/AppNavigator/createRootStackNavigator/recordBlockedNavigation', () => ({
    __esModule: true,
    default: jest.fn(),
    addBlockedBrowserBackListener: jest.fn(),
}));

const mockedEvaluateGuards = jest.mocked(evaluateGuards);
const mockedRecordBlockedNavigation = jest.mocked(recordBlockedNavigation);

const routeNames = [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR];

describe('handleNavigationGuards BLOCK', () => {
    const router = RootStackRouter({});
    const configOptions = {
        routeNames,
        routeParamList: {} as ParamListBase,
        routeGetIdList: {} as Record<string, ((params: Record<string, unknown>) => string) | undefined>,
    };
    const state: StackNavigationState<ParamListBase> = {
        key: 'root',
        index: 1,
        routeNames,
        routes: [
            {key: 'home', name: NAVIGATORS.TAB_NAVIGATOR},
            {key: 'onboarding', name: NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR},
        ],
        stale: false,
        type: 'stack',
        preloadedRoutes: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedEvaluateGuards.mockReturnValue({type: 'BLOCK', reason: 'test'});
    });

    it('should record the blocked navigation and keep the state in a new object', () => {
        // Given a guard blocks the GO_BACK that a browser back press dispatches while onboarding is open
        const action = {type: 'GO_BACK' as const};

        // When the router handles it
        const result = router.getStateForAction(state, action, configOptions);

        // Then the block is recorded, so a screen can run its own back logic
        expect(mockedRecordBlockedNavigation).toHaveBeenCalledTimes(1);

        // Then the state is kept, but in a new object, because React Navigation only syncs the browser history back when the state object changes
        expect(result).toEqual(state);
        expect(result).not.toBe(state);
    });

    it('should not record a navigation that a guard allows', () => {
        // Given no guard blocks the action
        mockedEvaluateGuards.mockReturnValue({type: 'ALLOW'});

        // When the router handles a GO_BACK
        router.getStateForAction(state, {type: 'GO_BACK'}, configOptions);

        // Then nothing is recorded, so no screen treats the press as blocked
        expect(mockedRecordBlockedNavigation).not.toHaveBeenCalled();
    });
});
