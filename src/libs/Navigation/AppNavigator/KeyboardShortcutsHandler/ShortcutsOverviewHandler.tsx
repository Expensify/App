import {useEffect} from 'react';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ShortcutsOverviewHandlerProps = {
    shouldShowRequire2FAPage: boolean;
};

function ShortcutsOverviewHandler({shouldShowRequire2FAPage}: ShortcutsOverviewHandlerProps) {
    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUTS;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }

                    if (Navigation.isActiveRoute(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()))) {
                        return;
                    }
                    return Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()));
                });
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );

        return () => unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ShortcutsOverviewHandler;
