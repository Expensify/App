import useOnyx from '@hooks/useOnyx';

import markAllMessagesAsRead from '@libs/actions/Report/MarkAllMessageAsRead';
import KeyboardShortcut from '@libs/KeyboardShortcut';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {reportNameValuePairsArchivedSelector} from '@selectors/ReportNameValuePairs';
import {useEffect, useRef} from 'react';

function MarkAllMessagesAsReadHandler() {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {selector: reportNameValuePairsArchivedSelector});
    // The keyboard-shortcut callback below is registered once on mount, so keep the latest archived state in a ref
    // for it to read at fire time instead of closing over a stale value.
    const reportNameValuePairsRef = useRef(reportNameValuePairs);

    useEffect(() => {
        reportNameValuePairsRef.current = reportNameValuePairs;
    }, [reportNameValuePairs]);

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ;
        const unsubscribe = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => markAllMessagesAsRead(reportNameValuePairsRef.current),
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
