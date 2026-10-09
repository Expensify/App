import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';

import createMock from '../utils/createMock';

jest.mock(
    'expo-web-browser',
    () => ({
        openAuthSessionAsync: jest.fn(),
    }),
    {virtual: true},
);

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');

const quickEmojiAction = ContextMenuActions.at(0);
const replyInThreadAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD);
const joinThreadAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.JOIN_THREAD);
const leaveThreadAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.LEAVE_THREAD);
const copyMessageAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE);

if (!quickEmojiAction || !replyInThreadAction || !joinThreadAction || !leaveThreadAction || !copyMessageAction) {
    throw new Error('Support ticket context menu actions were not found');
}

type ShouldShowArgs = Parameters<typeof quickEmojiAction.shouldShow>[0];

const getSupportTicketArgs = (): ShouldShowArgs =>
    createMock<ShouldShowArgs>({
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        reportID: 'supportTicketReportID',
        report: {
            reportID: 'supportTicketReportID',
            type: CONST.REPORT.TYPE.SUPPORT_TICKET,
        },
        reportAction: {
            reportActionID: 'supportTicketCommentID',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            message: [{type: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, html: 'Need help', text: 'Need help'}],
        },
        isThreadReportParentAction: false,
        isArchivedRoom: false,
    });

const getSupportTicketParentActionArgs = (): ShouldShowArgs =>
    createMock<ShouldShowArgs>({
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        reportID: 'conciergeReportID',
        report: {
            reportID: 'conciergeReportID',
            type: CONST.REPORT.TYPE.CHAT,
        },
        reportAction: {
            reportActionID: 'supportTicketPreviewID',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            childType: CONST.REPORT.TYPE.SUPPORT_TICKET,
            message: [{type: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, html: '', text: ''}],
        },
    });

describe('ContextMenuActions support tickets', () => {
    it('hides actions that do not apply to customer comments', () => {
        // Given a customer comment in a support ticket
        const args = getSupportTicketArgs();

        // When the context menu is built
        const shouldShowActions = [quickEmojiAction, replyInThreadAction, joinThreadAction, leaveThreadAction].map((action) => action.shouldShow(args));

        // Then reactions and every thread action are unavailable
        expect(shouldShowActions).toEqual([false, false, false, false]);
    });

    it('hides Copy message for support ticket parent actions', () => {
        // Given the support ticket preview action in the Concierge report
        const args = getSupportTicketParentActionArgs();

        // When the context menu is built
        const shouldShowCopyMessage = copyMessageAction.shouldShow(args);

        // Then its message cannot be copied
        expect(shouldShowCopyMessage).toBe(false);
    });

    it('keeps Copy message for normal report actions', () => {
        // Given a regular report action
        const args = getSupportTicketArgs();

        // When the context menu is built
        const shouldShowCopyMessage = copyMessageAction.shouldShow(args);

        // Then its message can still be copied
        expect(shouldShowCopyMessage).toBe(true);
    });
});
