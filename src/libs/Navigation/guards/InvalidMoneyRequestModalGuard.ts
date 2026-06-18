import type {NavigationAction, NavigationState} from '@react-navigation/native';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {GuardResult, NavigationGuard} from './types';

type StateLikeRoute = {
    key?: string;
    name?: string;
    state?: StateLike;
};

type StateLike = {
    index?: number;
    routes?: StateLikeRoute[];
};

const MONEY_REQUEST_SCREEN_NAMES = new Set<string>(Object.values(SCREENS.MONEY_REQUEST));

let activeInvalidMoneyRequestRouteKey: string | undefined;
let isDismissInvalidMoneyRequestModalScheduled = false;

function getFocusedRouteAtCurrentLevel(state?: StateLike): StateLikeRoute | undefined {
    if (!state?.routes?.length) {
        return;
    }

    const focusedIndex = typeof state.index === 'number' && state.routes.at(state.index) ? state.index : state.routes.length - 1;
    return state.routes.at(focusedIndex);
}

function getFocusedRoutePath(state?: StateLike): StateLikeRoute[] {
    const focusedRoute = getFocusedRouteAtCurrentLevel(state);
    if (!focusedRoute) {
        return [];
    }

    return [focusedRoute, ...getFocusedRoutePath(focusedRoute.state)];
}

function getFocusedMoneyRequestRightModalRoute(state?: StateLike): StateLikeRoute | undefined {
    const focusedRootRoute = getFocusedRouteAtCurrentLevel(state);
    if (focusedRootRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return;
    }

    const focusedRightModalRoute = getFocusedRouteAtCurrentLevel(focusedRootRoute.state);
    if (focusedRightModalRoute?.name !== SCREENS.RIGHT_MODAL.MONEY_REQUEST) {
        return;
    }

    return focusedRightModalRoute;
}

function isMoneyRequestRightModalNavigatorState(state?: StateLike): boolean {
    return !!getFocusedMoneyRequestRightModalRoute(state);
}

function getFocusedMoneyRequestScreenRoutes(state?: StateLike): StateLikeRoute[] {
    const focusedRightModalRoute = getFocusedMoneyRequestRightModalRoute(state);
    if (!focusedRightModalRoute) {
        return [];
    }

    return getFocusedRoutePath(focusedRightModalRoute.state).filter((route) => !!route.name && MONEY_REQUEST_SCREEN_NAMES.has(route.name));
}

function isActiveInvalidMoneyRequestRouteFocused(state: StateLike): boolean {
    return getFocusedMoneyRequestScreenRoutes(state).some((route) => route.key === activeInvalidMoneyRequestRouteKey);
}

function scheduleDismissInvalidMoneyRequestModal() {
    if (isDismissInvalidMoneyRequestModalScheduled) {
        return;
    }

    isDismissInvalidMoneyRequestModalScheduled = true;
    setTimeout(() => {
        Navigation.dismissModal();
        setTimeout(() => {
            isDismissInvalidMoneyRequestModalScheduled = false;
        }, CONST.ANIMATED_TRANSITION);
    }, 0);
}

function setActiveInvalidMoneyRequestRoute(routeKey: string) {
    activeInvalidMoneyRequestRouteKey = routeKey;
}

function clearActiveInvalidMoneyRequestRoute(routeKey: string) {
    if (activeInvalidMoneyRequestRouteKey !== routeKey) {
        return;
    }

    activeInvalidMoneyRequestRouteKey = undefined;
}

function shouldDismissInvalidMoneyRequestModalOnBrowserReset(state: NavigationState, action: NavigationAction): boolean {
    const actionPayload = (action as {payload?: StateLike}).payload;

    if (getPlatform() !== CONST.PLATFORM.WEB || action.type !== CONST.NAVIGATION.ACTION_TYPE.RESET || !activeInvalidMoneyRequestRouteKey) {
        return false;
    }

    if (!isActiveInvalidMoneyRequestRouteFocused(state)) {
        return false;
    }

    return isMoneyRequestRightModalNavigatorState(actionPayload);
}

const InvalidMoneyRequestModalGuard: NavigationGuard = {
    name: 'InvalidMoneyRequestModalGuard',

    evaluate: (state: NavigationState, action: NavigationAction): GuardResult => {
        if (!shouldDismissInvalidMoneyRequestModalOnBrowserReset(state, action)) {
            return {type: 'ALLOW'};
        }

        scheduleDismissInvalidMoneyRequestModal();
        return {type: 'BLOCK', reason: '[InvalidMoneyRequestModalGuard] Dismissing invalid money request modal instead of navigating to another money request step'};
    },
};

export default InvalidMoneyRequestModalGuard;
export {clearActiveInvalidMoneyRequestRoute, setActiveInvalidMoneyRequestRoute};
