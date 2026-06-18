import type {NavigationAction, NavigationState} from '@react-navigation/native';
import getPlatform from '@libs/getPlatform';
import InvalidMoneyRequestModalGuard, {clearActiveInvalidMoneyRequestRoute, setActiveInvalidMoneyRequestRoute} from '@libs/Navigation/guards/InvalidMoneyRequestModalGuard';
import type {GuardContext} from '@libs/Navigation/guards/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const mockDismissModal = jest.fn();

jest.mock('@libs/getPlatform', () => jest.fn(() => 'web'));
jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: (...args: unknown[]) => {
        mockDismissModal(...args);
    },
}));

const defaultContext: GuardContext = {
    isAuthenticated: true,
    isLoading: false,
    currentUrl: '',
};

const MANUAL_MONEY_REQUEST_TAB_NAME = 'manual';

function buildMoneyRequestState(focusedScreenName: string, focusedRouteKey: string): NavigationState {
    return {
        key: 'root',
        index: 1,
        routeNames: [NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR],
        routes: [
            {key: 'tab', name: NAVIGATORS.TAB_NAVIGATOR},
            {
                key: 'rhp',
                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                state: {
                    key: 'rhp-state',
                    index: 0,
                    routeNames: [SCREENS.RIGHT_MODAL.MONEY_REQUEST],
                    routes: [
                        {
                            key: 'money-request',
                            name: SCREENS.RIGHT_MODAL.MONEY_REQUEST,
                            state: {
                                key: 'money-request-state',
                                index: 0,
                                routeNames: [focusedScreenName],
                                routes: [{key: focusedRouteKey, name: focusedScreenName}],
                                stale: false,
                                type: 'stack',
                            },
                        },
                    ],
                    stale: false,
                    type: 'stack',
                },
            },
        ],
        stale: false,
        type: 'stack',
    };
}

function buildMoneyRequestStateWithNestedFocusedRoute(parentScreenName: string, parentRouteKey: string, focusedScreenName: string, focusedRouteKey: string): NavigationState {
    const state = buildMoneyRequestState(parentScreenName, parentRouteKey);
    const rightModalRoute = state.routes.at(1);
    const moneyRequestRoute = rightModalRoute?.state?.routes.at(0);
    const parentRoute = moneyRequestRoute?.state?.routes.at(0);

    if (parentRoute) {
        parentRoute.state = {
            key: 'nested-money-request-state',
            index: 0,
            routeNames: [focusedScreenName],
            routes: [{key: focusedRouteKey, name: focusedScreenName}],
            stale: false,
            type: 'stack',
        };
    }

    return state;
}

function buildReportState(): NavigationState {
    return {
        key: 'root',
        index: 0,
        routeNames: [NAVIGATORS.TAB_NAVIGATOR],
        routes: [{key: 'tab', name: NAVIGATORS.TAB_NAVIGATOR}],
        stale: false,
        type: 'stack',
    };
}

describe('InvalidMoneyRequestModalGuard', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockDismissModal.mockClear();
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.WEB);
        clearActiveInvalidMoneyRequestRoute('confirmation-key');
        clearActiveInvalidMoneyRequestRoute('create-key');
        clearActiveInvalidMoneyRequestRoute('start-key');
    });

    afterEach(() => {
        clearActiveInvalidMoneyRequestRoute('confirmation-key');
        clearActiveInvalidMoneyRequestRoute('create-key');
        clearActiveInvalidMoneyRequestRoute('start-key');
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('blocks browser reset from an active invalid money request fallback to another money request step and dismisses the modal', () => {
        const currentState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, 'confirmation-key');
        const targetState = buildMoneyRequestStateWithNestedFocusedRoute(SCREENS.MONEY_REQUEST.CREATE, 'start-key', MANUAL_MONEY_REQUEST_TAB_NAME, 'manual-key');
        const resetAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: targetState,
        };

        setActiveInvalidMoneyRequestRoute('confirmation-key');

        const result = InvalidMoneyRequestModalGuard.evaluate(currentState, resetAction, defaultContext);

        expect(result.type).toBe('BLOCK');
        expect(mockDismissModal).not.toHaveBeenCalled();

        jest.runOnlyPendingTimers();
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
    });

    it('blocks browser reset when the active invalid money request route is focused through a child tab route', () => {
        const currentState = buildMoneyRequestStateWithNestedFocusedRoute(SCREENS.MONEY_REQUEST.CREATE, 'create-key', MANUAL_MONEY_REQUEST_TAB_NAME, 'manual-key');
        const targetState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, 'confirmation-key');
        const resetAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: targetState,
        };

        setActiveInvalidMoneyRequestRoute('create-key');

        const result = InvalidMoneyRequestModalGuard.evaluate(currentState, resetAction, defaultContext);

        expect(result.type).toBe('BLOCK');
        expect(mockDismissModal).not.toHaveBeenCalled();

        jest.runOnlyPendingTimers();
        expect(mockDismissModal).toHaveBeenCalledTimes(1);
    });

    it('allows browser reset between money request steps when the invalid fallback is not active', () => {
        const currentState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, 'confirmation-key');
        const targetState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.CREATE, 'start-key');
        const resetAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: targetState,
        };

        const result = InvalidMoneyRequestModalGuard.evaluate(currentState, resetAction, defaultContext);

        expect(result.type).toBe('ALLOW');
        jest.runOnlyPendingTimers();
        expect(mockDismissModal).not.toHaveBeenCalled();
    });

    it('allows browser reset away from the money request RHP', () => {
        const currentState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, 'confirmation-key');
        const resetAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: buildReportState(),
        };

        setActiveInvalidMoneyRequestRoute('confirmation-key');

        const result = InvalidMoneyRequestModalGuard.evaluate(currentState, resetAction, defaultContext);

        expect(result.type).toBe('ALLOW');
        jest.runOnlyPendingTimers();
        expect(mockDismissModal).not.toHaveBeenCalled();
    });

    it('allows native resets even when the invalid fallback is active', () => {
        jest.mocked(getPlatform).mockReturnValue(CONST.PLATFORM.IOS);
        const currentState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.STEP_CONFIRMATION, 'confirmation-key');
        const targetState = buildMoneyRequestState(SCREENS.MONEY_REQUEST.CREATE, 'start-key');
        const resetAction: NavigationAction = {
            type: CONST.NAVIGATION.ACTION_TYPE.RESET,
            payload: targetState,
        };

        setActiveInvalidMoneyRequestRoute('confirmation-key');

        const result = InvalidMoneyRequestModalGuard.evaluate(currentState, resetAction, defaultContext);

        expect(result.type).toBe('ALLOW');
        jest.runOnlyPendingTimers();
        expect(mockDismissModal).not.toHaveBeenCalled();
    });
});
