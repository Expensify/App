import {CommonActions, StackActions} from '@react-navigation/native';
import {useEffect} from 'react';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useOnyx from '@hooks/useOnyx';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {NavigationRoute} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Pops the active WorkspaceSplitNavigator or DomainSplitNavigator when Escape is pressed inside WorkspaceNavigator.
 * If it is the only remaining route in WorkspaceNavigator, the TabNavigator is asked to go back instead,
 * which — thanks to `backBehavior="fullHistory"` — returns the user to the previously focused tab.
 */
function handleEscapeKeyInWorkspaceNavigator() {
    const rootState = navigationRef.getRootState();
    const tabNavigatorRoute = rootState?.routes.at(-1);
    if (tabNavigatorRoute?.name !== NAVIGATORS.TAB_NAVIGATOR || !tabNavigatorRoute.state) {
        return;
    }

    const tabIndex = tabNavigatorRoute.state.index ?? 0;
    const workspaceTabRoute = tabNavigatorRoute.state.routes.at(tabIndex);
    if (workspaceTabRoute?.name !== NAVIGATORS.WORKSPACE_NAVIGATOR || !workspaceTabRoute.state) {
        return;
    }

    const lastWorkspaceRoute = workspaceTabRoute.state.routes.at(-1);
    const isSplitNavigator = lastWorkspaceRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || lastWorkspaceRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR;
    if (!isSplitNavigator) {
        return;
    }

    const isOnlyRouteInWorkspaceNavigator = workspaceTabRoute.state.routes.length === 1;
    const target = isOnlyRouteInWorkspaceNavigator ? tabNavigatorRoute.state.key : workspaceTabRoute.state.key;
    const action = isOnlyRouteInWorkspaceNavigator ? CommonActions.goBack() : StackActions.pop();
    navigationRef.dispatch({...action, target});
}

function EscapeHandler() {
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const {shouldRenderSecondaryOverlayForWideRHP, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForRHPOnSuperWideRHP, shouldRenderTertiaryOverlay} =
        useWideRHPState();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        const unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (modal?.willAlertModalBecomeVisible) {
                    return;
                }

                if (modal?.disableDismissOnEscape) {
                    return;
                }

                if (shouldRenderSecondaryOverlayForWideRHP) {
                    Navigation.closeRHPFlow();
                    return;
                }

                if (shouldRenderSecondaryOverlayForRHPOnSuperWideRHP) {
                    Navigation.dismissToSuperWideRHP();
                    return;
                }

                if (shouldRenderSecondaryOverlayForRHPOnWideRHP || shouldRenderTertiaryOverlay) {
                    Navigation.dismissToPreviousRHP();
                    return;
                }

                const topmostRootRoute = navigationRef.getRootState()?.routes.at(-1);
                const isFocusedOnWorkspaceTab =
                    topmostRootRoute?.name === NAVIGATORS.TAB_NAVIGATOR && getActiveTabName(topmostRootRoute as NavigationRoute) === NAVIGATORS.WORKSPACE_NAVIGATOR;
                if (isFocusedOnWorkspaceTab) {
                    handleEscapeKeyInWorkspaceNavigator();
                    return;
                }

                Navigation.dismissModal();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );

        return () => unsubscribeEscapeKey();
    }, [
        modal?.disableDismissOnEscape,
        modal?.willAlertModalBecomeVisible,
        shouldRenderSecondaryOverlayForRHPOnSuperWideRHP,
        shouldRenderSecondaryOverlayForRHPOnWideRHP,
        shouldRenderSecondaryOverlayForWideRHP,
        shouldRenderTertiaryOverlay,
    ]);

    return null;
}

export default EscapeHandler;
