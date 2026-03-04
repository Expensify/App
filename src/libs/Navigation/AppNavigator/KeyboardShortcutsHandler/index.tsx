import React from 'react';
import EscapeHandler from './EscapeHandler';
import MarkAllMessagesAsReadHandler from './MarkAllMessagesAsReadHandler';
import NewChatHandler from './NewChatHandler';
import SearchHandler from './SearchHandler';
import ShortcutsOverviewHandler from './ShortcutsOverviewHandler';

type KeyboardShortcutsHandlerProps = {
    /** Whether the 2FA requirement page should be shown */
    shouldShowRequire2FAPage: boolean;
};

function KeyboardShortcutsHandler({shouldShowRequire2FAPage}: KeyboardShortcutsHandlerProps) {
    return (
        <>
            <EscapeHandler />
            <ShortcutsOverviewHandler shouldShowRequire2FAPage={shouldShowRequire2FAPage} />
            <SearchHandler shouldShowRequire2FAPage={shouldShowRequire2FAPage} />
            <NewChatHandler shouldShowRequire2FAPage={shouldShowRequire2FAPage} />
            <MarkAllMessagesAsReadHandler />
        </>
    );
}

export default KeyboardShortcutsHandler;
