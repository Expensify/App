import Clipboard from '@libs/Clipboard';
import type * as EnvironmentModule from '@libs/Environment/Environment';

import ContextMenuActions from '@pages/inbox/report/ContextMenu/ContextMenuActions';
import type {ContextMenuActionPayload} from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';

import createRandomReportAction from '../utils/collections/reportActions';

// Guards the copied-link format for issue #86919. The link must point at the report that OWNS the action
// (`originalReportID` — for a one-transaction expense that is the transaction thread) and must not be rewritten to the
// parent expense report. Rewriting it at copy time made links go stale: once the report gained a second expense the
// parent no longer resolved the child thread and the link fell through to the not-found page. The parent redirect is
// instead decided at open time in ReportFetchHandler (see shouldRedirectLinkedActionToParentReport).

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

const mockClipboard = jest.mocked(Clipboard);

// ContextMenuAction is a union; sentryLabel/onPress only exist on the icon variant, so narrow with `in`.
const copyLinkAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_LINK);

// Flush the microtasks queued by getEnvironmentURL().then(...) inside the onPress handler.
const flushPromises = () =>
    new Promise((resolve) => {
        process.nextTick(resolve);
    });

function createPayload(overrides: Partial<ContextMenuActionPayload>): ContextMenuActionPayload {
    // The copy-link handler only reads reportAction and originalReportID; the rest of the (large) payload type is
    // irrelevant to this action, so we assert the minimal shape it needs.
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

    it('copies a link pointing at the report that owns the action, not a rewritten parent report', async () => {
        if (!copyLinkAction || !('onPress' in copyLinkAction)) {
            throw new Error('Copy link context menu action was not found');
        }

        copyLinkAction.onPress(true, createPayload({originalReportID: 'transaction-thread-1'}));
        await flushPromises();

        expect(mockClipboard.setString).toHaveBeenCalledWith('https://new.expensify.com/r/transaction-thread-1/action-1');
    });
});
