import {useEffect} from 'react';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';
import * as Modal from '@userActions/Modal';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type NewChatHandlerProps = {
    shouldShowRequire2FAPage: boolean;
};

function NewChatHandler({shouldShowRequire2FAPage}: NewChatHandlerProps) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}

export default NewChatHandler;
