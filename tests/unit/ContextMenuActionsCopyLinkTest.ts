import Clipboard from '@libs/Clipboard';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import {getDisplayedReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';

// Verifies the "Copy link" context menu action (change A for issue #86919): for one-transaction
// expense flows the copied link must use the DISPLAYED (parent expense) report ID rather than the
// transaction thread's `originalReportID`, so the link opens the combined view where the parent
// "Submitted" system message is present and the linked message can be scrolled to.

jest.mock(
    'expo-web-browser',
    () => ({
        openAuthSessionAsync: jest.fn(),
    }),
    {virtual: true},
);

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

jest.mock('@libs/Clipboard', () => ({
    __esModule: true,
    default: {
        canSetHtml: jest.fn(),
        setString: jest.fn(),
        setHtml: jest.fn(),
    },
}));

jest.mock('@libs/Environment/Environment', () => ({
    __esModule: true,
    ...jest.requireActual('@libs/Environment/Environment'),
    getEnvironmentURL: jest.fn(() => Promise.resolve('https://new.expensify.com')),
}));

jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    ...jest.requireActual('@libs/ReportUtils'),
    getDisplayedReportID: jest.fn(),
}));

const mockClipboard = Clipboard as {
    canSetHtml: jest.Mock;
    setString: jest.Mock;
    setHtml: jest.Mock;
};
const mockGetDisplayedReportID = getDisplayedReportID as jest.Mock;

type ContextMenuAction = {
    sentryLabel?: string;
    onPress?: (closePopover: boolean, payload: Record<string, unknown>) => void;
};

const {default: ContextMenuActions} = require('@pages/inbox/report/ContextMenu/ContextMenuActions') as {default: ContextMenuAction[]};

const copyLinkAction = ContextMenuActions.find((action) => action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK);

// Flush the microtasks queued by getEnvironmentURL().then(...) inside the onPress handler.
const flushPromises = () => new Promise(process.nextTick);

const createPayload = (payload: Record<string, unknown>): Record<string, unknown> => ({
    reportAction: {reportActionID: 'action-1'},
    originalReportID: 'transaction-thread-1',
    isOffline: false,
    ...payload,
});

describe('ContextMenuActions copy link', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('copies a link using the displayed (parent) report ID for one-transaction expense flows', async () => {
        mockGetDisplayedReportID.mockReturnValue('parent-expense-1');

        if (!copyLinkAction?.onPress) {
            throw new Error('Copy link context menu action was not found');
        }

        copyLinkAction.onPress(true, createPayload({originalReportID: 'transaction-thread-1', isOffline: false}));
        await flushPromises();

        // The displayed report ID is resolved from the original (transaction-thread) report ID and the offline flag.
        expect(mockGetDisplayedReportID).toHaveBeenCalledWith('transaction-thread-1', false);
        // The copied link points at the parent expense report, not the transaction thread.
        expect(mockClipboard.setString).toHaveBeenCalledWith('https://new.expensify.com/r/parent-expense-1/action-1');
    });

    it('does not resolve a displayed report ID when there is no original report ID', async () => {
        if (!copyLinkAction?.onPress) {
            throw new Error('Copy link context menu action was not found');
        }

        copyLinkAction.onPress(true, createPayload({originalReportID: undefined}));
        await flushPromises();

        expect(mockGetDisplayedReportID).not.toHaveBeenCalled();
        expect(mockClipboard.setString).toHaveBeenCalledTimes(1);
    });
});
