import {useEffect, useRef} from 'react';
import useArchivedReportsIDSet from '@hooks/useArchivedReportsIDSet';
import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

function MarkAllMessagesAsReadHandler() {
    const archivedReportsIDSet = useArchivedReportsIDSet();
    const archivedReportsIDSetRef = useRef(archivedReportsIDSet);

    useEffect(() => {
        archivedReportsIDSetRef.current = archivedReportsIDSet;
    }, [archivedReportsIDSet]);

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => markAllMessagesAsRead(archivedReportsIDSetRef.current),
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
