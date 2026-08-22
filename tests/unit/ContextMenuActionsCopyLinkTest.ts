import Clipboard from '@libs/Clipboard';
import type * as EnvironmentModule from '@libs/Environment/Environment';
import {getDisplayedReportID} from '@libs/ReportUtils';
// eslint-disable-next-line no-restricted-imports -- type-only namespace (erased at runtime) used solely for the requireActual generic; no restricted functions are actually imported
import type * as ReportUtilsModule from '@libs/ReportUtils';

import ContextMenuActions from '@pages/inbox/report/ContextMenu/ContextMenuActions';
import type {ContextMenuActionPayload} from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';

import createRandomReportAction from '../utils/collections/reportActions';

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
    ...jest.requireActual<typeof EnvironmentModule>('@libs/Environment/Environment'),
    getEnvironmentURL: jest.fn(() => Promise.resolve('https://new.expensify.com')),
}));

jest.mock('@libs/ReportUtils', () => ({
    __esModule: true,
    ...jest.requireActual<typeof ReportUtilsModule>('@libs/ReportUtils'),
    getDisplayedReportID: jest.fn(),
}));

const mockClipboard = jest.mocked(Clipboard);
const mockGetDisplayedReportID = jest.mocked(getDisplayedReportID);

// ContextMenuAction is a union; sentryLabel/onPress only exist on the icon variant, so narrow with `in`.
const copyLinkAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK);

// Flush the microtasks queued by getEnvironmentURL().then(...) inside the onPress handler.
const flushPromises = () =>
    new Promise((resolve) => {
        process.nextTick(resolve);
    });

function createPayload(overrides: Partial<ContextMenuActionPayload>): ContextMenuActionPayload {
    // The copy-link handler only reads reportAction, originalReportID, and isOffline; the rest of the
    // (large) payload type is irrelevant to this action, so we assert the minimal shape it needs.
    const payload = {
        reportAction: {...createRandomReportAction(1), reportActionID: 'action-1'},
        originalReportID: 'transaction-thread-1',
        isOffline: false,
        ...overrides,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test payload only needs the fields the copy-link handler reads
    return payload as ContextMenuActionPayload;
}

describe('ContextMenuActions copy link', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('copies a link using the displayed (parent) report ID for one-transaction expense flows', async () => {
        mockGetDisplayedReportID.mockReturnValue('parent-expense-1');

        if (!copyLinkAction || !('onPress' in copyLinkAction)) {
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
        if (!copyLinkAction || !('onPress' in copyLinkAction)) {
            throw new Error('Copy link context menu action was not found');
        }

        copyLinkAction.onPress(true, createPayload({originalReportID: undefined}));
        await flushPromises();

        expect(mockGetDisplayedReportID).not.toHaveBeenCalled();
        expect(mockClipboard.setString).toHaveBeenCalledTimes(1);
    });
});
