import {useEffect, useRef} from 'react';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import CONST from '@src/CONST';

function MarkAllMessagesAsReadHandler() {
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const archivedReportsIdSetRef = useRef(archivedReportsIdSet);

    useEffect(() => {
        archivedReportsIdSetRef.current = archivedReportsIdSet;
    }, [archivedReportsIdSet]);

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => markAllMessagesAsRead(archivedReportsIdSetRef.current),
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

export default MarkAllMessagesAsReadHandler;
