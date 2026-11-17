import {getLatestHomeTodoReportAction, getNextHomeTodoReportID, isHomeTodoActionComplete} from '@libs/HomeTodoReviewUtils';
import {sortTodoReportsBySearchOrder} from '@libs/TodosUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';

const CURRENT_USER_ACCOUNT_ID = 1;
const NEXT_APPROVER_ACCOUNT_ID = 2;

function buildReport(overrides: Partial<Report>): Report {
    return {reportID: 'r1', type: CONST.REPORT.TYPE.EXPENSE, ...overrides};
}

function buildReportAction(overrides: Partial<ReportAction>): ReportAction {
    return {reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, created: '2026-01-01 10:00:00.000', actorAccountID: CURRENT_USER_ACCOUNT_ID, ...overrides};
}

function buildReportActions(reportActions: ReportAction[]): ReportActions {
    return Object.fromEntries(reportActions.map((reportAction) => [reportAction.reportActionID, reportAction]));
}

describe('HomeTodoReviewUtils', () => {
    describe('isHomeTodoActionComplete', () => {
        it('treats a submitted report as submitted', () => {
            // Given a report the user just submitted
            const report = buildReport({stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED});

            // When the submit row checks it
            // Then it counts as the row's action, so the review moves on
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.SUBMIT, report, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(true);
        });

        it('does not treat an open report as submitted', () => {
            // Given a draft that is still open, like one sent back after a rejection
            const report = buildReport({stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN});

            // When the submit row checks it
            // Then the submit row keeps the user on it
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.SUBMIT, report, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(false);
        });

        it('treats a final approval and a forward to the next approver as approvals', () => {
            // Given one report fully approved and one forwarded to the next approver
            const approved = buildReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED});
            const forwarded = buildReport({stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, managerID: NEXT_APPROVER_ACCOUNT_ID});

            // When the approve row checks them
            // Then both count as the approve row's action
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.APPROVE, approved, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(true);
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.APPROVE, forwarded, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(true);
        });

        it('does not treat a report still waiting on the current user as approved', () => {
            // Given a submitted report the current user still has to approve, for example after holding an expense
            const report = buildReport({stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, managerID: CURRENT_USER_ACCOUNT_ID});

            // When the approve row checks it
            // Then the approve row keeps the user on it
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.APPROVE, report, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(false);
        });

        it('treats a paid report and a payment waiting on a bank account as paid', () => {
            // Given a reimbursed report and one whose payment waits on the payee's bank account
            const paid = buildReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED});
            const waiting = buildReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED, isWaitingOnBankAccount: true});

            // When the pay row checks them
            // Then both count as the pay row's action
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.PAY, paid, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(true);
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.PAY, waiting, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(true);
        });

        it('treats an exported report as exported', () => {
            // Given a report flagged as exported, which also covers marking it as manually exported
            const report = buildReport({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED, isExportedToIntegration: true});

            // When the export row checks it
            // Then it counts as the export row's action
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.EXPORT, report, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(true);
        });

        it('does not treat a deleted report as completed', () => {
            // Given a submitted report the user is deleting
            const report = buildReport({stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});

            // When the submit row checks it
            // Then deleting never moves the review on
            expect(isHomeTodoActionComplete(CONST.SEARCH.SEARCH_KEYS.SUBMIT, report, undefined, CURRENT_USER_ACCOUNT_ID)).toBe(false);
        });
    });

    describe('getLatestHomeTodoReportAction', () => {
        it('returns the newest approval or forward', () => {
            // Given an older approval by another approver and a newer forward by the current user
            const reportActions = buildReportActions([
                buildReportAction({reportActionID: 'old', actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED, created: '2026-01-01 10:00:00.000', actorAccountID: NEXT_APPROVER_ACCOUNT_ID}),
                buildReportAction({reportActionID: 'new', actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED, created: '2026-01-02 10:00:00.000'}),
            ]);

            // When the approve row looks for its newest action
            // Then it finds the forward, so the review can check who took it
            expect(getLatestHomeTodoReportAction(CONST.SEARCH.SEARCH_KEYS.APPROVE, reportActions)?.reportActionID).toBe('new');
        });

        it('ignores actions that are not the row action', () => {
            // Given a report whose only new action is a comment, as when an admin changes the approver
            const reportActions = buildReportActions([buildReportAction({reportActionID: 'comment'})]);

            // When the approve row looks for its newest action
            // Then there is none, so the review does not move on
            expect(getLatestHomeTodoReportAction(CONST.SEARCH.SEARCH_KEYS.APPROVE, reportActions)).toBeUndefined();
        });

        it('ignores an action that is being deleted', () => {
            // Given a submit action whose optimistic add is being rolled back
            const reportActions = buildReportActions([
                buildReportAction({reportActionID: 'submitted', actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            ]);

            // When the submit row looks for its newest action
            // Then the deleted action does not count
            expect(getLatestHomeTodoReportAction(CONST.SEARCH.SEARCH_KEYS.SUBMIT, reportActions)).toBeUndefined();
        });
    });

    describe('getNextHomeTodoReportID', () => {
        it('opens the next report after the current one that still needs the action', () => {
            // Given five reports where report 3 was already handled by someone else
            const reportIDs = ['1', '2', '3', '4', '5'];

            // When the user finishes report 2
            // Then report 3 is skipped and report 4 opens
            expect(getNextHomeTodoReportID(reportIDs, '2', ['1', '4', '5'])).toBe('4');
        });

        it('wraps around to a report the user skipped with the arrows', () => {
            // Given the user skipped report 1 and has finished reports 2 to 4
            const reportIDs = ['1', '2', '3', '4', '5'];

            // When they finish report 5
            // Then the review goes back to report 1
            expect(getNextHomeTodoReportID(reportIDs, '5', ['1'])).toBe('1');
        });

        it('returns nothing once no report needs the action', () => {
            // Given every other report is done
            // When the user finishes report 2
            // Then there is no next report, so the review returns to Home
            expect(getNextHomeTodoReportID(['1', '2'], '2', [])).toBeUndefined();
        });

        it('never returns the current report', () => {
            // Given the current report still shows as needing the action, for example before its change is applied
            // When the user finishes it
            // Then it is not opened again
            expect(getNextHomeTodoReportID(['1'], '1', ['1'])).toBeUndefined();
        });
    });

    describe('sortTodoReportsBySearchOrder', () => {
        it('lists the newest report first, as the Spend search does', () => {
            // Given reports created on different days
            const reports = [buildReport({reportID: 'old', created: '2026-01-01 10:00:00.000'}), buildReport({reportID: 'new', created: '2026-03-01 10:00:00.000'})];

            // When they are sorted for the Home review
            // Then the newest comes first
            expect(sortTodoReportsBySearchOrder(reports).map((report) => report.reportID)).toEqual(['new', 'old']);
        });
    });
});
