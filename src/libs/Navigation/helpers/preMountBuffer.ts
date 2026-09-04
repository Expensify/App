import {clearPreInsertedOriginalTabRoute, getPreInsertedOriginalTabRoute} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {CommonActions, TabActions} from '@react-navigation/native';
import {DeviceEventEmitter} from 'react-native';

import hasNativeSwipeBackGesture from './hasNativeSwipeBackGesture';

// Always set and cleared together - the route name is only meaningful while the flag is true.
let isFullscreenPreInsertedUnderRHP = false;
let preInsertedFullscreenRouteName: string | undefined;

// Set while a neutral placeholder route sits directly under the RHP, so a native swipe-dismiss
// reveals that placeholder instead of the real destination underneath.
//
// Watches the root 'state' event instead of transitionEnd, since transitionEnd never fires on
// Android when the animation is none - 'state' fires reliably on both platforms.
let bufferTransaction: {rhpRouteKey: string; bufferRouteKey: string; mode: 'push' | 'tab'; destinationRouteKey?: string} | undefined;
let bufferStateListenerUnsubscribe: (() => void) | undefined;

function clearBufferStateListener() {
    bufferStateListenerUnsubscribe?.();
    bufferStateListenerUnsubscribe = undefined;
}

/**
 * No-op while the RHP is still in the stack. Once it is gone without commit/cancel having run, restores the
 * origin with a single reset dispatch: the original tab route, or the stack without Buffer and the pushed destination.
 */
function revertPreMountBufferIfRHPClosed() {
    if (!bufferTransaction) {
        return;
    }
    const {rhpRouteKey, bufferRouteKey, mode, destinationRouteKey} = bufferTransaction;
    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return;
    }
    const stillHasRHP = rootState.routes.some((r) => r.key === rhpRouteKey);
    if (stillHasRHP) {
        return;
    }

    DeviceEventEmitter.emit(CONST.MODAL_EVENTS.RESTORE_RHP_ANIMATION);

    // Reaching here means the RHP is gone but commit/cancel never ran (they would have cleared
    // bufferTransaction and returned above) - something else removed it (native swipe, external
    // dismissal). Treat it the same as a normal cancel: end up back at the origin.
    bufferTransaction = undefined;
    clearBufferStateListener();
    isFullscreenPreInsertedUnderRHP = false;
    preInsertedFullscreenRouteName = undefined;

    if (mode === 'tab') {
        const originalTabRoute = getPreInsertedOriginalTabRoute();
        clearPreInsertedOriginalTabRoute();
        const tabNavIndex = rootState.routes.findLastIndex((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        if (!originalTabRoute || tabNavIndex < 0) {
            const fallbackRoutes = rootState.routes.filter((r) => r.key !== bufferRouteKey);
            navigationRef.current?.dispatch(CommonActions.reset({...rootState, routes: fallbackRoutes, index: fallbackRoutes.length - 1}));
            return;
        }
        const withoutBuffer = rootState.routes.filter((r) => r.key !== bufferRouteKey);
        const lastTabIndex = withoutBuffer.findLastIndex((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
        const newRoutes = withoutBuffer.map((r, i) => (i === lastTabIndex ? originalTabRoute : r));
        navigationRef.current?.dispatch(CommonActions.reset({...rootState, routes: newRoutes, index: newRoutes.length - 1}));
        return;
    }

    // Push path: this transaction pushed the destination as a new route rather than swapping it into
    // a tab, so remove both it and Buffer in one dispatch - two dispatches would leave a render in
    // between where only one of them is gone.
    const newRoutes = rootState.routes.filter((r) => r.key !== bufferRouteKey && r.key !== destinationRouteKey);
    navigationRef.current?.dispatch(
        CommonActions.reset({
            ...rootState,
            routes: newRoutes,
            index: newRoutes.length - 1,
        }),
    );
}

/** Restores the route that was visible before the pre-mount buffer route */
function recoverFromPreMountBuffer() {
    const rootState = navigationRef.getRootState();
    if (rootState?.routes.at(-1)?.name !== SCREENS.PRE_MOUNT_BUFFER) {
        return;
    }

    if (bufferTransaction) {
        revertPreMountBufferIfRHPClosed();
        return;
    }

    // Defensive fallback for a lost transaction: restore the original tab route when pre-mount
    // switched tabs, otherwise remove both Buffer and the speculative pushed destination.
    const originalTabRoute = getPreInsertedOriginalTabRoute();
    const routesWithoutBuffer = rootState.routes.slice(0, -1);
    const tabNavIndex = originalTabRoute ? routesWithoutBuffer.findLastIndex((route) => route.name === NAVIGATORS.TAB_NAVIGATOR) : -1;
    const routes = originalTabRoute && tabNavIndex >= 0 ? routesWithoutBuffer.map((route, index) => (index === tabNavIndex ? originalTabRoute : route)) : rootState.routes.slice(0, -2);
    if (!routes.length) {
        return;
    }
    isFullscreenPreInsertedUnderRHP = false;
    preInsertedFullscreenRouteName = undefined;
    clearPreInsertedOriginalTabRoute();
    clearBufferStateListener();
    navigationRef.current?.dispatch(CommonActions.reset({...rootState, routes, index: routes.length - 1}));
}

/**
 * Reads the navigation state just after Buffer was inserted (in an earlier dispatch, not here) and,
 * if Buffer really did land under the RHP, records it as `bufferTransaction` and starts watching for
 * the RHP closing so it can be cleaned up.
 */
function captureBufferTransaction(stateAfter: ReturnType<typeof navigationRef.getRootState>, wasTabSwitched: boolean) {
    if (!hasNativeSwipeBackGesture() || !stateAfter) {
        return;
    }
    const rhpRoute = stateAfter.routes.at(-1);
    const bufferRoute = stateAfter.routes.at(-2);
    const isTopModalBufferHost = rhpRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || rhpRoute?.name === NAVIGATORS.SHARE_MODAL_NAVIGATOR;
    if (!isTopModalBufferHost || bufferRoute?.name !== SCREENS.PRE_MOUNT_BUFFER) {
        return;
    }

    if (wasTabSwitched) {
        bufferTransaction = {rhpRouteKey: rhpRoute.key, bufferRouteKey: bufferRoute.key, mode: 'tab'};
    } else {
        const destinationRoute = stateAfter.routes.at(-3);
        if (!destinationRoute) {
            return;
        }
        bufferTransaction = {rhpRouteKey: rhpRoute.key, bufferRouteKey: bufferRoute.key, mode: 'push', destinationRouteKey: destinationRoute.key};
    }

    clearBufferStateListener();
    bufferStateListenerUnsubscribe = navigationRef.current?.addListener('state', revertPreMountBufferIfRHPClosed);
}

/** Removes just the Buffer route, leaving the pushed destination in place, and clears the transaction (including its own state listener). */
function removeBufferRouteOnly() {
    if (!bufferTransaction) {
        return;
    }
    const {bufferRouteKey} = bufferTransaction;
    bufferTransaction = undefined;
    clearBufferStateListener();

    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return;
    }
    const newRoutes = rootState.routes.filter((r) => r.key !== bufferRouteKey);
    if (newRoutes.length === rootState.routes.length) {
        return;
    }
    navigationRef.current?.dispatch(
        CommonActions.reset({
            ...rootState,
            routes: newRoutes,
            index: newRoutes.length - 1,
        }),
    );
}

/**
 * Whether a swipe-back gesture would dismiss the whole RHP, rather than just popping one screen off
 * its inner stack. Only true when the inner stack has nothing left to pop back to - otherwise the
 * swipe stays inside the RHP and never reaches it.
 *
 * Defaults to true (assume dismissible) when the state can't be read, so the buffer never gets
 * silently skipped on uncertain data.
 */
function canNativeSwipeDismissRHP(): boolean {
    const rootState = navigationRef.getRootState();
    const rhpRoute = rootState?.routes.at(-1);
    if (rhpRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return true;
    }

    const focusedRHPStackRoute = rhpRoute.state?.routes?.at(rhpRoute.state?.index ?? 0);
    const innerFlowState = focusedRHPStackRoute?.state;
    if (!innerFlowState) {
        return true;
    }

    return (innerFlowState.index ?? 0) === 0;
}

/** Records that `preInsertFullscreenUnderRHP` landed a destination under the RHP, so the cleanup helpers know what to remove later. */
function markFullscreenPreInsertedUnderRHP(routeName: string | undefined) {
    isFullscreenPreInsertedUnderRHP = true;
    preInsertedFullscreenRouteName = routeName;
}

function getIsFullscreenPreInsertedUnderRHP() {
    return isFullscreenPreInsertedUnderRHP;
}

function getPreInsertedFullscreenRouteName() {
    return preInsertedFullscreenRouteName;
}

/** Called once the pre-inserted destination is confirmed, so it should stay - only the Buffer route in front of it needs cleaning up. */
function clearFullscreenPreInsertedFlag() {
    removeBufferRouteOnly();
    isFullscreenPreInsertedUnderRHP = false;
    preInsertedFullscreenRouteName = undefined;
    clearPreInsertedOriginalTabRoute();
}

/**
 * Removes a pre-inserted fullscreen route when the user backs out without submitting.
 * If the RHP is still on top, the pre-inserted route is popped from under it.
 * If the RHP is already gone (back-dismissed), the pre-inserted route is the topmost
 * fullscreen and is popped directly.
 */
function removePreInsertedFullscreenIfNeeded() {
    if (!isFullscreenPreInsertedUnderRHP) {
        return;
    }

    const routeNameToRemove = preInsertedFullscreenRouteName;

    isFullscreenPreInsertedUnderRHP = false;
    preInsertedFullscreenRouteName = undefined;

    DeviceEventEmitter.emit(CONST.MODAL_EVENTS.RESTORE_RHP_ANIMATION);

    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return;
    }

    const topRoute = rootState.routes.at(-1);
    const isRHPStillOnTop = topRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;

    if (isRHPStillOnTop && routeNameToRemove) {
        // Call this before dispatching below, so its listener teardown happens before this dispatch
        // can trigger it.
        removeBufferRouteOnly();
        navigationRef.current?.dispatch({
            type: CONST.NAVIGATION.ACTION_TYPE.REMOVE_FULLSCREEN_UNDER_RHP,
            payload: {expectedRouteName: routeNameToRemove},
        });
        return;
    }

    // Skip this if a buffer transaction is still live - something else already resets the tab and
    // buffer together in one step. Doing it here too would race that and briefly show the wrong screen.
    if (bufferTransaction) {
        return;
    }

    // RHP already dismissed. For the tab-switch path, jump back to the original tab.
    // For the push path, pop the pre-inserted route directly.
    const originalTabRoute = getPreInsertedOriginalTabRoute();
    if (originalTabRoute) {
        clearPreInsertedOriginalTabRoute();
        const originalTabState = originalTabRoute.state;
        const originalFocusedTabIndex = originalTabState?.index ?? 0;
        const originalTabName = originalTabState?.routes?.[originalFocusedTabIndex]?.name;
        if (originalTabName) {
            requestAnimationFrame(() => {
                const currentState = navigationRef.getRootState();
                const tabNavRoute = currentState?.routes.findLast((r) => r.name === NAVIGATORS.TAB_NAVIGATOR);
                if (!tabNavRoute?.state?.key) {
                    return;
                }
                navigationRef.current?.dispatch({
                    ...TabActions.jumpTo(originalTabName),
                    target: tabNavRoute.state.key,
                });
            });
        }
        return;
    }

    // Push path: the pre-inserted fullscreen is now the topmost route; pop it.
    // Deferred to the next frame to avoid dispatching during a React commit.
    // Capture the route key now so the rAF callback can match on identity, not just name.
    const targetRouteKey = rootState.routes.at(-1)?.key;
    requestAnimationFrame(() => {
        const currentState = navigationRef.getRootState();
        const topmostRoute = currentState?.routes.at(-1);
        if (!topmostRoute || topmostRoute.key !== targetRouteKey || topmostRoute.name !== routeNameToRemove) {
            return;
        }
        if (!navigationRef.current?.canGoBack()) {
            return;
        }
        navigationRef.current.goBack();
    });
}

export {
    canNativeSwipeDismissRHP,
    captureBufferTransaction,
    clearFullscreenPreInsertedFlag,
    getIsFullscreenPreInsertedUnderRHP,
    getPreInsertedFullscreenRouteName,
    markFullscreenPreInsertedUnderRHP,
    recoverFromPreMountBuffer,
    removePreInsertedFullscreenIfNeeded,
};
