import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';
import KeyboardShortcut from '@libs/KeyboardShortcut';

import CONST from '@src/CONST';

import {useEffect} from 'react';

function MarkAllMessagesAsReadHandler() {
    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => markAllMessagesAsRead(),
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
        );

        return () => unsubscribe();
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
    }, []);

    return null;
}

export default MarkAllMessagesAsReadHandler;
