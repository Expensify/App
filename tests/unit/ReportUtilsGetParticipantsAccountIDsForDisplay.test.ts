import Onyx from 'react-native-onyx';
import {buildParticipantsFromAccountIDs, getParticipantsAccountIDsForDisplay} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';
import type {PendingChatMember} from '@src/types/onyx/ReportMetadata';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 5;

/* eslint-disable @typescript-eslint/naming-convention -- PersonalDetailsList uses account IDs as keys */
const PERSONAL_DETAILS: PersonalDetailsList = {
    [CURRENT_USER_ACCOUNT_ID]: {
        accountID: CURRENT_USER_ACCOUNT_ID,
        login: 'current@test.com',
        displayName: 'Current User',
        avatar: 'none',
        firstName: 'Current',
    },
    1: {
        accountID: 1,
        login: 'user1@test.com',
        displayName: 'User One',
        avatar: 'none',
        firstName: 'One',
    },
    2: {
        accountID: 2,
        login: 'user2@test.com',
        displayName: 'User Two',
        avatar: 'none',
        firstName: 'Two',
    },
    3: {
        accountID: 3,
        login: 'user3@test.com',
        displayName: 'User Three',
        avatar: 'none',
        firstName: 'Three',
    },
};
/* eslint-enable @typescript-eslint/naming-convention */

function buildReport(participantAccountIDs: number[], overrides: Partial<Report> = {}): Report {
    return {
        type: CONST.REPORT.TYPE.CHAT,
        reportID: '1',
        reportName: 'Test Report',
        participants: buildParticipantsFromAccountIDs(participantAccountIDs),
        ...overrides,
    };
}

describe('getParticipantsAccountIDsForDisplay', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('with session and personal details', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: 'current@test.com',
            });
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
            return waitForBatchedUpdates();
        });

        it('returns empty array when report is null', () => {
            expect(getParticipantsAccountIDsForDisplay(null)).toEqual([]);
        });

        it('returns empty array when report is undefined', () => {
            expect(getParticipantsAccountIDsForDisplay(undefined)).toEqual([]);
        });

        it('returns empty array when report has no participants', () => {
            const report = buildReport([]);
            expect(getParticipantsAccountIDsForDisplay(report)).toEqual([]);
        });

        it('returns all participant account IDs for a group chat', () => {
            const report = buildReport([CURRENT_USER_ACCOUNT_ID, 1, 2], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            });
            const result = getParticipantsAccountIDsForDisplay(report);
            expect(result).toHaveLength(3);
            expect(result).toContain(CURRENT_USER_ACCOUNT_ID);
            expect(result).toContain(1);
            expect(result).toContain(2);
        });

        it('excludes current user for 1:1 chat', () => {
            const report = buildReport([CURRENT_USER_ACCOUNT_ID, 1]);
            const result = getParticipantsAccountIDsForDisplay(report);
            expect(result).toEqual([1]);
        });

        it('excludes current user for system chat', () => {
            const report = buildReport([CURRENT_USER_ACCOUNT_ID, 1], {
                chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            });
            const result = getParticipantsAccountIDsForDisplay(report);
            expect(result).toEqual([1]);
        });

        it('excludes current user when shouldForceExcludeCurrentUser is true', () => {
            const report = buildReport([CURRENT_USER_ACCOUNT_ID, 1, 2], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            });
            const result = getParticipantsAccountIDsForDisplay(report, false, false, true);
            expect(result).toEqual([1, 2]);
        });

        it('excludes hidden participants when shouldExcludeHidden is true', () => {
            const participants = buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, 1, 2]);
            participants[2] = {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            };
            const report = buildReport([], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants,
            });
            const result = getParticipantsAccountIDsForDisplay(report, true);
            expect(result).toHaveLength(2);
            expect(result).toContain(CURRENT_USER_ACCOUNT_ID);
            expect(result).toContain(1);
            expect(result).not.toContain(2);
        });

        it('excludes deleted participants when shouldExcludeDeleted is true and reportMetadata has pending delete', () => {
            const report = buildReport([CURRENT_USER_ACCOUNT_ID, 1, 2], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                reportID: 'report-123',
            });
            const pendingChatMembers: PendingChatMember[] = [
                {
                    accountID: '2',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            ];
            const reportMetadata = {pendingChatMembers};
            const result = getParticipantsAccountIDsForDisplay(report, false, true, false, reportMetadata);
            expect(result).toHaveLength(2);
            expect(result).toContain(CURRENT_USER_ACCOUNT_ID);
            expect(result).toContain(1);
            expect(result).not.toContain(2);
        });

        it('includes all participants when shouldExcludeDeleted is true but no pending deletes in reportMetadata', () => {
            const report = buildReport([CURRENT_USER_ACCOUNT_ID, 1, 2], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            });
            const result = getParticipantsAccountIDsForDisplay(report, false, true, false, {});
            expect(result).toHaveLength(3);
        });

        it('filters out optimistic duplicate when same login exists as non-optimistic', async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                /* eslint-disable-next-line @typescript-eslint/naming-convention -- account ID key */
                10: {
                    accountID: 10,
                    login: 'user1@test.com',
                    displayName: 'Optimistic User',
                    isOptimisticPersonalDetail: true,
                },
            });
            await waitForBatchedUpdates();

            const participants = buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, 1, 10]);
            const report = buildReport([], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants,
            });
            const result = getParticipantsAccountIDsForDisplay(report);
            expect(result).toHaveLength(2);
            expect(result).toContain(CURRENT_USER_ACCOUNT_ID);
            expect(result).toContain(1);
            expect(result).not.toContain(10);
        });

        it('includes optimistic participant when login is unique', async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                /* eslint-disable-next-line @typescript-eslint/naming-convention -- account ID key */
                10: {
                    accountID: 10,
                    login: 'unique@test.com',
                    displayName: 'Unique User',
                    isOptimisticPersonalDetail: true,
                },
            });
            await waitForBatchedUpdates();

            const participants = buildParticipantsFromAccountIDs([CURRENT_USER_ACCOUNT_ID, 10]);
            const report = buildReport([], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants,
            });
            const result = getParticipantsAccountIDsForDisplay(report);
            expect(result).toHaveLength(2);
            expect(result).toContain(10);
        });
    });

    describe('without session (no current user)', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, PERSONAL_DETAILS);
            return waitForBatchedUpdates();
        });

        it('returns all participants when current user is not set', () => {
            const report = buildReport([1, 2], {
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            });
            const result = getParticipantsAccountIDsForDisplay(report);
            expect(result).toHaveLength(2);
            expect(result).toContain(1);
            expect(result).toContain(2);
        });
    });
});
