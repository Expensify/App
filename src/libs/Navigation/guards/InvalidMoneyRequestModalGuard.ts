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

function getFocusedRoute(state?: StateLike): StateLikeRoute | undefined {
    const focusedRoute = getFocusedRouteAtCurrentLevel(state);
    if (!focusedRoute?.state) {
        return focusedRoute;
    }

    return getFocusedRoute(focusedRoute.state) ?? focusedRoute;
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

function isMoneyRequestRightModalState(state?: StateLike): boolean {
    const focusedRightModalRoute = getFocusedMoneyRequestRightModalRoute(state);
    if (!focusedRightModalRoute) {
        return false;
    }

    const focusedRoute = getFocusedRoute(focusedRightModalRoute.state);
    return !!focusedRoute?.name && MONEY_REQUEST_SCREEN_NAMES.has(focusedRoute.name);
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

    const focusedRoute = getFocusedRoute(state);
    if (focusedRoute?.key !== activeInvalidMoneyRequestRouteKey || !isMoneyRequestRightModalState(state)) {
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
