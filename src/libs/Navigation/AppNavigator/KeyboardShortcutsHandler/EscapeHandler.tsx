import {useEffect} from 'react';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useOnyx from '@hooks/useOnyx';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
