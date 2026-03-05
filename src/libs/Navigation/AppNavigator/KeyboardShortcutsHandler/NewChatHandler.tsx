import {useEffect} from 'react';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import * as Modal from '@userActions/Modal';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NewChatHandler() {
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_CHAT;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                    return;
                }
                Session.callFunctionIfActionIsAllowed(() => Modal.close(() => Navigation.navigate(ROUTES.NEW)))();
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

export default NewChatHandler;
