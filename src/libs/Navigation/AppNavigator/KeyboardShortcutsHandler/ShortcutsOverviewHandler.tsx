import {useEffect} from 'react';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';
import Navigation from '@libs/Navigation/Navigation';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function ShortcutsOverviewHandler() {
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUTS;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }

                    const activeRoute = Navigation.getActiveRoute();
                    if (findMatchingDynamicSuffix(activeRoute) === DYNAMIC_ROUTES.KEYBOARD_SHORTCUTS.path) {
                        return;
                    }
                    return Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.KEYBOARD_SHORTCUTS.path));
                });
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );

        return () => unsubscribe();
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default ShortcutsOverviewHandler;
