/* eslint-disable @typescript-eslint/naming-convention */
import CONST from '../../src/CONST';
import UnreadIndicatorUpdater from '../../src/libs/UnreadIndicatorUpdater';
import * as TestHelper from '../utils/TestHelper';

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';

describe('UnreadIndicatorUpdater chats read up to their newest message and mention', () => {
    const chat = (reportID: string, fields: Record<string, string | undefined>) => ({
        reportID,
        reportName: 'test',
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        lastMessageText: 'test',
        // Someone else wrote last, since a chat whose last actor is the current user is never unread
        lastActorAccountID: TEST_USER_ACCOUNT_ID + 1,
        participants: {[TEST_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
        ...fields,
    });
    const getUnreadIDs = (reports: Record<string, ReturnType<typeof chat>>) =>
        UnreadIndicatorUpdater.getUnreadReportIDsForUnreadIndicator(reports, undefined, undefined, {currentUserAccountID: TEST_USER_ACCOUNT_ID, currentUserLogin: TEST_USER_LOGIN});

    beforeAll(async () => {
        await TestHelper.setPersonalDetails(TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID);
    });

    it('does not count a chat read after its newest message and mention', () => {
        // Given a chat whose last read time is newer than its last visible action and its last mention
        const reports = {
            1: chat('1', {lastReadTime: '2023-08-09 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030', lastMentionedTime: '2023-08-07 07:15:44.030'}),
        };

        // When the unread report IDs are collected
        const unreadReportIDs = getUnreadIDs(reports);

        // Then nothing is returned, because the chat has nothing unread
        expect(unreadReportIDs).toEqual([]);
    });

    it('does not count a chat read at exactly its newest message', () => {
        // Given a chat whose last read time equals its last visible action, the boundary the early skip compares with >=
        const reports = {1: chat('1', {lastReadTime: '2023-08-08 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'})};

        // When the unread report IDs are collected
        const unreadReportIDs = getUnreadIDs(reports);

        // Then the chat is not unread
        expect(unreadReportIDs).toEqual([]);
    });

    it('counts a chat with a message newer than its last read time', () => {
        // Given a chat read before its newest message
        const reports = {1: chat('1', {lastReadTime: '2023-08-07 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'})};

        // When the unread report IDs are collected
        const unreadReportIDs = getUnreadIDs(reports);

        // Then the early skip must not swallow it and its ID is returned
        expect(unreadReportIDs).toEqual(['1']);
    });

    it('counts a chat with a mention newer than its last read time even when its last message is older', () => {
        // Given a chat whose newest message was read but whose last mention is newer, for example after the mentioning comment was deleted
        const reports = {
            1: chat('1', {lastReadTime: '2023-08-08 07:15:44.030', lastVisibleActionCreated: '2023-08-07 07:15:44.030', lastMentionedTime: '2023-08-09 07:15:44.030'}),
        };

        // When the unread report IDs are collected
        const unreadReportIDs = getUnreadIDs(reports);

        // Then the mention keeps it unread, so the early skip must also compare the mention time
        expect(unreadReportIDs).toEqual(['1']);
    });

    it('counts a chat that was never read', () => {
        // Given a chat with a message and no last read time
        const reports = {1: chat('1', {lastVisibleActionCreated: '2023-08-08 07:15:44.030'})};

        // When the unread report IDs are collected
        const unreadReportIDs = getUnreadIDs(reports);

        // Then it is unread, since a missing last read time must not be treated as read
        expect(unreadReportIDs).toEqual(['1']);
    });

    it('returns only the IDs of the unread chats', () => {
        // Given one read chat and one unread chat
        const reports = {
            1: chat('1', {lastReadTime: '2023-08-09 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'}),
            2: chat('2', {lastReadTime: '2023-08-07 07:15:44.030', lastVisibleActionCreated: '2023-08-08 07:15:44.030'}),
        };

        // When the unread report IDs are collected
        const unreadReportIDs = getUnreadIDs(reports);

        // Then only the unread chat's ID is returned, not its report
        expect(unreadReportIDs).toEqual(['2']);
    });
});
