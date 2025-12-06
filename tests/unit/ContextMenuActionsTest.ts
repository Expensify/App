import CONST from '@src/CONST';
import {shouldShowJoinThread, shouldShowLeaveThread} from '@src/libs/ContextMenuUtils';
import type {ReportAction} from '@src/types/onyx';

/**
 * Creates a base ADD_COMMENT report action for testing.
 */
function createBaseReportAction(overrides: Partial<ReportAction> = {}): ReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportActionID: '12345',
        actorAccountID: 1,
        created: '2024-01-01 12:00:00.000',
        message: [{type: 'COMMENT', html: 'Test message', text: 'Test message'}],
        originalMessage: {html: 'Test message', whisperedTo: []},
        avatar: '',
        automatic: false,
        shouldShow: true,
        ...overrides,
    } as ReportAction;
}

describe('ContextMenuActions - Join/Leave Thread', () => {
    describe('shouldShowJoinThread', () => {
        it('should show Join Thread for a regular message with thread replies when user is not subscribed', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should show Join Thread for a regular message without thread replies in a non-archived room when user is not subscribed', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 0,
                childCommenterCount: 0,
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should NOT show Join Thread when user is already subscribed', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Join Thread for whisper actions', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                originalMessage: {html: 'Whisper', whisperedTo: [1]},
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Join Thread for IOU/money request actions', () => {
            const reportAction = createBaseReportAction({
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: 'txn123',
                    IOUReportID: 'report123',
                    amount: 100,
                    currency: 'USD',
                    comment: '',
                },
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Join Thread when viewing the thread report parent action', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: true,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Join Thread for deleted actions in archived rooms without thread replies', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 0,
                childCommenterCount: 0,
                message: [{type: 'COMMENT', html: '', text: '', deleted: '2024-01-01 12:00:00.000'}],
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: true,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should show Join Thread for deleted actions that have thread replies', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
                message: [{type: 'COMMENT', html: '', text: '', deleted: '2024-01-01 12:00:00.000'}],
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: true,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });
    });

    describe('shouldShowLeaveThread', () => {
        it('should show Leave Thread for a regular message when user is subscribed', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should show Leave Thread for a message the user created (subscribed by default)', () => {
            // When a user creates a message, they are automatically subscribed to it
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                actorAccountID: 12345, // Current user
                childVisibleActionCount: 0,
                childCommenterCount: 0,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should show Leave Thread for a message the user is the only participant in', () => {
            // User should be able to leave any thread they are subscribed to,
            // regardless of whether they created it or are the only participant
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                actorAccountID: 12345,
                childVisibleActionCount: 1,
                childCommenterCount: 1,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should NOT show Leave Thread when user is not subscribed', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Leave Thread for whisper actions', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                originalMessage: {html: 'Whisper', whisperedTo: [1]},
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Leave Thread for IOU/money request actions', () => {
            const reportAction = createBaseReportAction({
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: 'txn123',
                    IOUReportID: 'report123',
                    amount: 100,
                    currency: 'USD',
                    comment: '',
                },
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Leave Thread when viewing the thread report parent action', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: true,
            });

            expect(result).toBe(false);
        });

        it('should NOT show Leave Thread for deleted actions in archived rooms without thread replies', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 0,
                childCommenterCount: 0,
                message: [{type: 'COMMENT', html: '', text: '', deleted: '2024-01-01 12:00:00.000'}],
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: true,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(false);
        });

        it('should show Leave Thread for deleted actions that have thread replies when subscribed', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
                message: [{type: 'COMMENT', html: '', text: '', deleted: '2024-01-01 12:00:00.000'}],
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: true,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });
    });

    describe('User-owned threads', () => {
        it('should show Leave Thread for threads created by the user when subscribed', () => {
            // This is the expected behavior: users should be able to leave any thread,
            // including ones they created
            const userCreatedAction = createBaseReportAction({
                actorAccountID: 12345, // Simulating current user
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 0,
                childCommenterCount: 0,
            });

            const result = shouldShowLeaveThread({
                reportAction: userCreatedAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            // User should be able to leave threads they created
            expect(result).toBe(true);
        });

        it('should show Leave Thread for threads where user is the only participant', () => {
            // Users should be able to leave threads even if they are the only participant
            const soleParticipantAction = createBaseReportAction({
                actorAccountID: 12345,
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 3,
                childCommenterCount: 1, // Only one commenter (the user)
            });

            const result = shouldShowLeaveThread({
                reportAction: soleParticipantAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should show Leave Thread for threads with multiple participants when user is subscribed', () => {
            const multiParticipantAction = createBaseReportAction({
                actorAccountID: 12345,
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 10,
                childCommenterCount: 5,
            });

            const result = shouldShowLeaveThread({
                reportAction: multiParticipantAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });
    });

    describe('Notification preference variations', () => {
        it('should show Leave Thread when notification preference is DAILY', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should show Leave Thread when notification preference is MUTE', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowLeaveThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });

        it('should show Join Thread only when notification preference is HIDDEN', () => {
            const reportAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const result = shouldShowJoinThread({
                reportAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            });

            expect(result).toBe(true);
        });
    });

    describe('Join/Leave Thread mutual exclusivity', () => {
        it('should show exactly one of Join Thread or Leave Thread for a valid action, never both', () => {
            const subscribedAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const params = {
                reportAction: subscribedAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            };

            const showJoin = shouldShowJoinThread(params);
            const showLeave = shouldShowLeaveThread(params);

            // Should show Leave Thread (subscribed), not Join Thread
            expect(showJoin).toBe(false);
            expect(showLeave).toBe(true);
        });

        it('should show Join Thread and not Leave Thread when not subscribed', () => {
            const unsubscribedAction = createBaseReportAction({
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                childVisibleActionCount: 2,
                childCommenterCount: 1,
            });

            const params = {
                reportAction: unsubscribedAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            };

            const showJoin = shouldShowJoinThread(params);
            const showLeave = shouldShowLeaveThread(params);

            // Should show Join Thread (not subscribed), not Leave Thread
            expect(showJoin).toBe(true);
            expect(showLeave).toBe(false);
        });

        it('should show neither Join nor Leave Thread for excluded action types', () => {
            const iouAction = createBaseReportAction({
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportNotificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                originalMessage: {
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    IOUTransactionID: 'txn123',
                    IOUReportID: 'report123',
                    amount: 100,
                    currency: 'USD',
                    comment: '',
                },
            });

            const params = {
                reportAction: iouAction,
                isArchivedRoom: false,
                isThreadReportParentAction: false,
            };

            const showJoin = shouldShowJoinThread(params);
            const showLeave = shouldShowLeaveThread(params);

            // Neither should show for IOU actions
            expect(showJoin).toBe(false);
            expect(showLeave).toBe(false);
        });
    });
});
