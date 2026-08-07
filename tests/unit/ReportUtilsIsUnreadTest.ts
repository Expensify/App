import {isUnread} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

/**
 * Focused, isolated coverage for the "unconfirmedReadWindow" carve-out in isUnread().
 *
 * Normally, if the newest action in a report is the current user's own message, isUnread() assumes the user
 * has already seen everything before it (you can't reply without having the report open) and reports the
 * conversation as read. That assumption breaks when the message was composed offline: another user's message
 * can reach the server first, while the current user is still offline and unaware of it, yet the delayed
 * message still ends up as the newest action once they reconnect — and the queue's read-time bump (see
 * SequentialQueue) makes the timestamp comparison read as well. unconfirmedReadWindow records the bumped
 * range so isUnread() can check the actual report actions for another user's message inside it.
 *
 * This lives in its own file (rather than the shared ReportUtilsTest.ts) because that file's tests mutate
 * global Onyx session state throughout without always restoring it, which makes isUnread's actor-based
 * check order-dependent when run as part of the full suite.
 */
describe('ReportUtils.isUnread - unconfirmedReadWindow reconciliation', () => {
    const currentUserAccountID = 42;
    const otherUserAccountID = 7;
    // A fresh reportID per test: ReportUtils' module-level caches (report actions / report metadata) survive
    // Onyx.clear(), so reusing one ID would leak actions and windows written by earlier tests into later ones.
    let testNumber = 0;
    let reportID: string;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        reportID = String(++testNumber);
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: 'user@example.com'});
        await waitForBatchedUpdates();
    });

    function buildReport(overrides: Partial<Report>): Report {
        // The cast is contained to this helper: tests only need the handful of fields isUnread() reads.
        return {
            reportID,
            type: 'chat',
            lastMessageText: 'hello',
            ...overrides,
        } as Report;
    }

    function buildCommentAction(overrides: Partial<ReportAction>): ReportAction {
        // Same containment rationale as buildReport.
        return {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            reportActionID: '100',
            created: '2026-01-01 10:00:00.000',
            actorAccountID: otherUserAccountID,
            message: [{type: 'COMMENT', html: 'hi', text: 'hi'}],
            shouldShow: true,
            ...overrides,
        } as ReportAction;
    }

    /** Keys report actions by their reportActionID (IDs are numeric strings, so literal keys would trip naming-convention lint). */
    function buildActionsMap(...actions: ReportAction[]): Record<string, ReportAction> {
        return Object.fromEntries(actions.map((action) => [action.reportActionID, action]));
    }

    it("returns false (read) when the newest action is the current user's own message and no window is recorded", () => {
        const report = buildReport({
            lastReadTime: '2026-01-01 12:00:00.000',
            lastVisibleActionCreated: '2026-01-01 12:00:01.000',
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it("returns true (unread) when another user's message landed inside the recorded window, even though the bumped lastReadTime claims to cover it", async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';
        // B's message reached the server while this device was offline — inside (stale, bumped].
        const otherUserMessageTime = '2026-01-01 10:30:00.000';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            buildActionsMap(
                buildCommentAction({reportActionID: '100', created: otherUserMessageTime, actorAccountID: otherUserAccountID}),
                buildCommentAction({reportActionID: '101', created: bumpedReadTime, actorAccountID: currentUserAccountID}),
            ),
        );
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: bumpedReadTime,
            lastVisibleActionCreated: bumpedReadTime,
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(true);
    });

    it("returns false (read) when a window is recorded but only the user's own actions fall inside it", async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            buildActionsMap(buildCommentAction({reportActionID: '101', created: bumpedReadTime, actorAccountID: currentUserAccountID})),
        );
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: bumpedReadTime,
            lastVisibleActionCreated: bumpedReadTime,
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it("returns false (read) when another user's message exists but falls OUTSIDE the window and was already covered by the stale read", async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';
        // B's message is older than the stale read time — the user had genuinely read it before going offline.
        const otherUserMessageTime = '2026-01-01 08:00:00.000';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            buildActionsMap(
                buildCommentAction({reportActionID: '99', created: otherUserMessageTime, actorAccountID: otherUserAccountID}),
                buildCommentAction({reportActionID: '101', created: bumpedReadTime, actorAccountID: currentUserAccountID}),
            ),
        );
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: bumpedReadTime,
            lastVisibleActionCreated: bumpedReadTime,
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it("returns true (unread) via the normal timestamp path when another user's message arrives after the window", async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';
        // B sends after our comment replayed — newer than the bumped read time and the newest action.
        const otherUserMessageTime = '2026-01-01 13:00:00.000';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: bumpedReadTime,
            lastVisibleActionCreated: otherUserMessageTime,
            lastActorAccountID: otherUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(true);
    });

    it('ignores a window superseded by a newer read (lastReadTime advanced past the upper bound, e.g. mark-all-as-read or another device)', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';
        const otherUserMessageTime = '2026-01-01 10:30:00.000';
        // A later read advanced lastReadTime beyond the window without clearing the metadata.
        const newerReadTime = '2026-01-01 13:00:00.000';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            buildActionsMap(buildCommentAction({reportActionID: '100', created: otherUserMessageTime, actorAccountID: otherUserAccountID})),
        );
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: newerReadTime,
            lastVisibleActionCreated: bumpedReadTime,
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it("returns true (unread) when the window belongs to the one-transaction thread and another user's message landed inside it", async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';
        const otherUserMessageTime = '2026-01-01 10:30:00.000';
        const threadReportID = `${reportID}-thread`;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${threadReportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`,
            buildActionsMap(buildCommentAction({reportActionID: '200', created: otherUserMessageTime, actorAccountID: otherUserAccountID})),
        );
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: bumpedReadTime,
            lastVisibleActionCreated: staleReadTime,
            lastActorAccountID: currentUserAccountID,
        });
        const threadReport = buildReport({
            reportID: threadReportID,
            lastReadTime: bumpedReadTime,
            lastVisibleActionCreated: bumpedReadTime,
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, threadReport, false)).toBe(true);
    });

    it('ignores the window once it has been cleared (e.g. after a genuine online read)', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const bumpedReadTime = '2026-01-01 12:00:00.000';
        const otherUserMessageTime = '2026-01-01 10:30:00.000';
        const onlineReadTime = '2026-01-01 14:00:00.000';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: {from: staleReadTime, to: bumpedReadTime}});
        await Onyx.merge(
            `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            buildActionsMap(buildCommentAction({reportActionID: '100', created: otherUserMessageTime, actorAccountID: otherUserAccountID})),
        );
        // The user opened the report online: readNewestAction clears the window and advances lastReadTime.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {unconfirmedReadWindow: null});
        await waitForBatchedUpdates();

        const report = buildReport({
            lastReadTime: onlineReadTime,
            lastVisibleActionCreated: bumpedReadTime,
            lastActorAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(false);
    });
});
