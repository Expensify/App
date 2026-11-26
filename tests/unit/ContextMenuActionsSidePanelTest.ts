import Navigation from '@libs/Navigation/Navigation';

import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';
import type {ContextMenuActionPayload} from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import {explain} from '@userActions/Report';

import CONST from '@src/CONST';

import createMock from '../utils/createMock';

jest.mock('expo-web-browser', () => ({
    openAuthSessionAsync: jest.fn(),
}));

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
}));

jest.mock('@userActions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Report'),
    explain: jest.fn(() => 'explanationThreadReportID'),
}));

const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');

const replyInThreadAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD);
const explainAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.EXPLAIN);

if (!replyInThreadAction || !('onPress' in replyInThreadAction) || !explainAction || !('onPress' in explainAction)) {
    throw new Error('Thread context menu actions were not found');
}

const THREAD_REPORT_ID = 'threadReportID';

const getPayload = (isInSidePanel: boolean, openSidePanel: jest.Mock): ContextMenuActionPayload =>
    createMock<ContextMenuActionPayload>({
        reportAction: {reportActionID: 'conciergeReplyID', actorAccountID: CONST.ACCOUNT_ID.CONCIERGE, childReportID: THREAD_REPORT_ID},
        childReport: {reportID: THREAD_REPORT_ID},
        originalReport: {reportID: 'conciergeReportID'},
        currentUserAccountID: 1,
        currentUserPersonalDetails: {accountID: 1},
        isInSidePanel,
        openSidePanel,
    });

describe('ContextMenuActions in the side panel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens Reply in thread in the side panel', () => {
        // Given a Concierge reply with a thread, whose menu was opened in the side panel
        const openSidePanel = jest.fn();

        // When Reply in thread is pressed
        replyInThreadAction.onPress(false, getPayload(true, openSidePanel));

        // Then the side panel switches to the thread, and the main pane does not navigate
        expect(openSidePanel).toHaveBeenCalledWith({reportID: THREAD_REPORT_ID});
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('keeps opening Reply in thread in the main pane outside the side panel', () => {
        // Given the same reply, whose menu was opened in the main pane
        const openSidePanel = jest.fn();

        // When Reply in thread is pressed
        replyInThreadAction.onPress(false, getPayload(false, openSidePanel));

        // Then the main pane navigates to the thread, and the side panel is left alone
        expect(Navigation.navigate).toHaveBeenCalled();
        expect(openSidePanel).not.toHaveBeenCalled();
    });

    it.each([
        [true, 'side panel', {shouldNavigateToThread: false, opensSidePanel: true}],
        [false, 'main pane', {shouldNavigateToThread: true, opensSidePanel: false}],
    ])('opens the Explain thread where the menu was opened (isInSidePanel: %s, %s)', (isInSidePanel, _place, expected) => {
        // Given an action with reasoning, whose menu was opened in the side panel or the main pane
        const openSidePanel = jest.fn();

        // When Explain is pressed
        explainAction.onPress(false, getPayload(isInSidePanel, openSidePanel));

        // Then explain only navigates the main pane outside the side panel, and the side panel opens the thread otherwise
        expect(jest.mocked(explain)).toHaveBeenCalledWith(expect.objectContaining({shouldNavigateToThread: expected.shouldNavigateToThread}));
        if (expected.opensSidePanel) {
            expect(openSidePanel).toHaveBeenCalledWith({reportID: 'explanationThreadReportID'});
        } else {
            expect(openSidePanel).not.toHaveBeenCalled();
        }
    });
});
