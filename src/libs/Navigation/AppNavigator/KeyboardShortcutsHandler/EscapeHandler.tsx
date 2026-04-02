import {StackActions} from '@react-navigation/native';
import {useEffect} from 'react';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useOnyx from '@hooks/useOnyx';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Pops the active WorkspaceSplitNavigator or DomainSplitNavigator when Escape is pressed inside WorkspaceNavigator.
 * If it is the only remaining route in WorkspaceNavigator, the entire WorkspaceNavigator is popped from the root stack instead.
 */
function handleEscapeKeyInWorkspaceNavigator() {
    const rootState = navigationRef.getRootState();
    const lastRootRoute = rootState?.routes.at(-1);
    const lastWorkspaceRoute = lastRootRoute?.state?.routes.at(-1);

    const isSplitNavigator = lastWorkspaceRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || lastWorkspaceRoute?.name === NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR;

    if (!rootState || !lastRootRoute?.state || !isSplitNavigator) {
        return;
    }

    const isOnlyRouteInWorkspaceNavigator = lastRootRoute.state.routes.length === 1;
    const target = isOnlyRouteInWorkspaceNavigator ? rootState.key : lastRootRoute.state.key;
    navigationRef.dispatch({...StackActions.pop(), target});
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

                if (navigationRef.getRootState()?.routes.at(-1)?.name === NAVIGATORS.WORKSPACE_NAVIGATOR) {
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
