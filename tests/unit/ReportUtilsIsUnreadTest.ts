import {isUnread} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const currentUserAccountID = 5;
const otherUserAccountID = 6;
const thirdUserAccountID = 7;

/** A report whose last visible action landed after the current user last read it. */
function buildUnreadReport(overrides: Partial<Report>): Report {
    return {
        reportID: '1',
        lastReadTime: '2024-03-01 12:00:00.000',
        lastVisibleActionCreated: '2024-03-01 12:00:01.000',
        // isUnread short-circuits to false for a report with no visible message, so give it one.
        lastMessageText: 'paid with Expensify via workspace rules',
        ...overrides,
    };
}

describe('ReportUtils isUnread', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await Onyx.set(ONYXKEYS.SESSION, {email: 'current@test.com', accountID: currentUserAccountID});
        await waitForBatchedUpdates();
    });

    it('returns false when the current user took the last action', () => {
        const report = buildUnreadReport({lastActorAccountID: currentUserAccountID});

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it('returns false when the current user took the last action but the backend typed the actor ID as a string', () => {
        const report = buildUnreadReport({});
        // The Report type declares this as a number, so go around it to reproduce what the backend actually sends.
        Object.assign(report, {lastActorAccountID: String(currentUserAccountID)});

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it('returns false for an automatic action when the current user does not own the report', () => {
        const report = buildUnreadReport({
            lastActorAccountID: otherUserAccountID,
            lastActionIsAutomatic: true,
            ownerAccountID: thirdUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(false);
    });

    it('returns true for an automatic action when the current user owns the report', () => {
        const report = buildUnreadReport({
            lastActorAccountID: otherUserAccountID,
            lastActionIsAutomatic: true,
            ownerAccountID: currentUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(true);
    });

    it('returns true for an automatic action that mentions the current user', () => {
        const report = buildUnreadReport({
            lastMentionedTime: '2024-03-01 12:00:01.000',
            lastActorAccountID: otherUserAccountID,
            lastActionIsAutomatic: true,
            ownerAccountID: thirdUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(true);
    });

    it('returns true for a manual action taken by someone else', () => {
        const report = buildUnreadReport({
            lastActorAccountID: otherUserAccountID,
            ownerAccountID: thirdUserAccountID,
        });

        expect(isUnread(report, undefined, false)).toBe(true);
    });
});
