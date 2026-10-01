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
    it('hides reactions for customer comments', () => {
        // Given a customer comment in a support ticket
        const args = getSupportTicketArgs();

        // When the context menu is built
        const shouldShowReactions = quickEmojiAction.shouldShow(args);

        // Then reactions are unavailable
        expect(shouldShowReactions).toBe(false);
    });

    it('hides Reply in thread for customer comments', () => {
        // Given a customer comment in a support ticket
        const args = getSupportTicketArgs();

        // When the context menu is built
        const shouldShowReplyInThread = replyInThreadAction.shouldShow(args);

        // Then threading is unavailable
        expect(shouldShowReplyInThread).toBe(false);
    });

    it('hides Join thread for customer comments', () => {
        // Given a customer comment in a support ticket
        const args = getSupportTicketArgs();

        // When the context menu is built
        const shouldShowJoinThread = joinThreadAction.shouldShow(args);

        // Then joining a thread is unavailable
        expect(shouldShowJoinThread).toBe(false);
    });

    it('hides Leave thread for customer comments', () => {
        // Given a customer comment in a support ticket
        const args = getSupportTicketArgs();

        // When the context menu is built
        const shouldShowLeaveThread = leaveThreadAction.shouldShow(args);

        // Then leaving a thread is unavailable
        expect(shouldShowLeaveThread).toBe(false);
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
