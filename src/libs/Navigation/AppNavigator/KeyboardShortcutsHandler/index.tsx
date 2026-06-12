import React from 'react';
import EscapeHandler from './EscapeHandler';
import ExpenseReportSearchHandler from './ExpenseReportSearchHandler';
import GoToWorkspaceHandler from './GoToWorkspaceHandler';
import MarkAllMessagesAsReadHandler from './MarkAllMessagesAsReadHandler';
import NewChatHandler from './NewChatHandler';
import SearchHandler from './SearchHandler';
import ShortcutsOverviewHandler from './ShortcutsOverviewHandler';

function KeyboardShortcutsHandler() {
    return (
        <>
            <EscapeHandler />
            <ShortcutsOverviewHandler />
            <SearchHandler />
            <NewChatHandler />
            <MarkAllMessagesAsReadHandler />
            <ExpenseReportSearchHandler />
            <GoToWorkspaceHandler />
        </>
    );
}

export default KeyboardShortcutsHandler;
