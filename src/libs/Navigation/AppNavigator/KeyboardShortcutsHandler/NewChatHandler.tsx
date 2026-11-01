import useOnyx from '@hooks/useOnyx';
import useShouldShowRequire2FAPage from '@hooks/useShouldShowRequire2FAPage';

import KeyboardShortcut from '@libs/KeyboardShortcut';
import Navigation from '@libs/Navigation/Navigation';

import * as Modal from '@userActions/Modal';
import {startNewChat} from '@userActions/Report';
import * as Session from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
import {useEffect, useRef} from 'react';

function NewChatHandler() {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    // The shortcut callback below is registered once, so read the latest session from a ref at fire time.
    const sessionRef = useRef(session);

    useEffect(() => {
        sessionRef.current = session;
    }, [session]);
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_CHAT;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                    return;
                }
                Session.callFunctionIfActionIsAllowed(() => Modal.close(startNewChat), false, sessionRef.current)();
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
