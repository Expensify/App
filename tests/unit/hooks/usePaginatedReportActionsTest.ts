import {act, renderHook, waitFor} from '@testing-library/react-native';

import usePaginatedReportActions from '@hooks/usePaginatedReportActions';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const REPORT_ID = '1';
const CREATED_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    created: '2026-08-21 10:00:00.000',
    reportActionID: '1',
};
const DEW_FORWARDED_ACTION: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.FORWARDED> = {
    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
    created: '2026-08-21 11:00:00.000',
    reportActionID: '2',
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the DEW forward is detected from the stored originalMessage
    originalMessage: {
        amount: 100,
        currency: CONST.CURRENCY.USD,
        expenseReportID: REPORT_ID,
        to: 'approver@example.com',
        workflow: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
    },
};
const CURRENT_USER_ACCOUNT_ID = 10;
const OTHER_USER_ACCOUNT_ID = 20;
const LAST_READ_TIME = '2026-08-21 12:30:00.000';

function buildComment(reportActionID: string, created: string, actorAccountID: number): ReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        actorAccountID,
        created,
        reportActionID,
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, html: 'hi', text: 'hi'}],
    };
}

const APPROVED_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
    created: '2026-08-21 12:00:00.000',
    reportActionID: '3',
};

describe('usePaginatedReportActions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('keeps the DEW routed row when a linked page starts at its forward action', async () => {
        // Given a linked page whose newest action is a DEW forward, with a newer approval outside the page.
        // The page includes its routed row so the linked slice starts at that row, not at the forward action.
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [CREATED_ACTION.reportActionID]: CREATED_ACTION,
            [DEW_FORWARDED_ACTION.reportActionID]: DEW_FORWARDED_ACTION,
            [APPROVED_ACTION.reportActionID]: APPROVED_ACTION,
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`, [
            [CONST.PAGINATION_START_ID, APPROVED_ACTION.reportActionID],
            [`${DEW_FORWARDED_ACTION.reportActionID}DEW`, DEW_FORWARDED_ACTION.reportActionID, CREATED_ACTION.reportActionID, CONST.PAGINATION_END_ID],
        ]);
        await waitForBatchedUpdates();

        // When the report is opened through a link to an action in that page
        const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, CREATED_ACTION.reportActionID));

        // Then the routed row still renders before its forward action, so the routed message is not lost
        await waitFor(() => {
            expect(result.current.reportActions.map((reportAction) => reportAction.reportActionID)).toEqual([
                `${DEW_FORWARDED_ACTION.reportActionID}DEW`,
                DEW_FORWARDED_ACTION.reportActionID,
                CREATED_ACTION.reportActionID,
            ]);
        });
        expect(result.current.hasNewerActions).toBe(true);
    });

    it('does not anchor to a message the current user sent after opening the chat', async () => {
        const OTHERS_COMMENT = buildComment('10', '2026-08-21 12:00:00.000', OTHER_USER_ACCOUNT_ID);
        const OWN_COMMENT = buildComment('11', '2026-08-21 12:45:00.000', CURRENT_USER_ACCOUNT_ID);

        // Given a read chat, so the only action newer than lastReadTime is the user's own message
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, lastReadTime: LAST_READ_TIME});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [CREATED_ACTION.reportActionID]: CREATED_ACTION,
            [OTHERS_COMMENT.reportActionID]: OTHERS_COMMENT,
        });
        await waitForBatchedUpdates();
        const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, undefined, {shouldLinkToOldestUnreadReportAction: true}));
        await waitFor(() => {
            expect(result.current.sortedAllReportActions?.length).toBe(2);
        });

        // When the user sends a message, which is newer than the lastReadTime the hook captured on first render
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
                [OWN_COMMENT.reportActionID]: OWN_COMMENT,
            });
        });

        // Then the new message is not the unread anchor, so the list key does not change and the list does not remount
        await waitFor(() => {
            expect(result.current.sortedAllReportActions?.length).toBe(3);
        });
        expect(result.current.oldestUnreadReportAction).toBeUndefined();
    });

    it('anchors to the oldest message from someone else that arrived after lastReadTime', async () => {
        const OWN_COMMENT = buildComment('10', '2026-08-21 12:45:00.000', CURRENT_USER_ACCOUNT_ID);
        const OLDEST_UNREAD_COMMENT = buildComment('11', '2026-08-21 12:50:00.000', OTHER_USER_ACCOUNT_ID);
        const NEWEST_UNREAD_COMMENT = buildComment('12', '2026-08-21 12:55:00.000', OTHER_USER_ACCOUNT_ID);

        // Given a chat where the user's own message sits between lastReadTime and two newer messages from someone else
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, lastReadTime: LAST_READ_TIME});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [CREATED_ACTION.reportActionID]: CREATED_ACTION,
            [OWN_COMMENT.reportActionID]: OWN_COMMENT,
            [OLDEST_UNREAD_COMMENT.reportActionID]: OLDEST_UNREAD_COMMENT,
            [NEWEST_UNREAD_COMMENT.reportActionID]: NEWEST_UNREAD_COMMENT,
        });
        await waitForBatchedUpdates();

        // When the chat is opened with unread tracking on, the only mode where the hook picks an unread anchor
        const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, undefined, {shouldLinkToOldestUnreadReportAction: true}));

        // Then the anchor is the oldest unread message from someone else, so opening a chat with real unread messages still scrolls to them
        await waitFor(() => {
            expect(result.current.oldestUnreadReportAction?.reportActionID).toBe(OLDEST_UNREAD_COMMENT.reportActionID);
        });
    });

    it('does not anchor to a report preview whose last activity is from the current user', async () => {
        // Given a read chat where a report preview, created by someone else, was last updated by the current user.
        // The preview's author is not the user, so only its last actor tells that the user is the one who changed it
        const OWN_PREVIEW = {
            ...buildComment('10', '2026-08-21 12:45:00.000', OTHER_USER_ACCOUNT_ID),
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            childLastActorAccountID: CURRENT_USER_ACCOUNT_ID,
        };
        await Onyx.set(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, lastReadTime: LAST_READ_TIME});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {
            [CREATED_ACTION.reportActionID]: CREATED_ACTION,
            [OWN_PREVIEW.reportActionID]: OWN_PREVIEW,
        });
        await waitForBatchedUpdates();

        // When the chat is opened with unread tracking on
        const {result} = renderHook(() => usePaginatedReportActions(REPORT_ID, undefined, {shouldLinkToOldestUnreadReportAction: true}));

        // Then the preview is part of the list but is not the unread anchor, because the user made its last change
        await waitFor(() => {
            expect(result.current.sortedAllReportActions?.map((reportAction) => reportAction.reportActionID)).toContain(OWN_PREVIEW.reportActionID);
        });
        expect(result.current.oldestUnreadReportAction).toBeUndefined();
    });
});
