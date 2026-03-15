import * as ReportUtils from '@libs/ReportUtils';
import {canActionTask} from '@libs/actions/Task';
import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

describe('canActionTask reproduction for issue #85220', () => {
    const ownerAccountID = 1;
    const assigneeAccountID = 2;
    const otherParticipantAccountID = 3;
    const nonParticipantAccountID = 4;

    const taskReport: Report = {
        reportID: '1',
        ownerAccountID,
        managerID: assigneeAccountID,
        parentReportID: '2',
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        type: CONST.REPORT.TYPE.TASK,
        reportName: 'Task',
    } as Report;

    const groupChatParentReport: Report = {
        reportID: '2',
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        participants: {
            [ownerAccountID]: {role: CONST.REPORT.ROLE.MEMBER},
            [assigneeAccountID]: {role: CONST.REPORT.ROLE.MEMBER},
            [otherParticipantAccountID]: {role: CONST.REPORT.ROLE.MEMBER},
        },
    } as Report;

    const oneOnOneParentReport: Report = {
        reportID: '3',
        type: CONST.REPORT.TYPE.CHAT,
        participants: {
            [ownerAccountID]: {role: CONST.REPORT.ROLE.MEMBER},
            [assigneeAccountID]: {role: CONST.REPORT.ROLE.MEMBER},
        },
    } as Report;

    it('should allow the owner to action the task', () => {
        expect(canActionTask(taskReport, undefined, ownerAccountID, groupChatParentReport)).toBe(true);
    });

    it('should allow the assignee to action the task', () => {
        expect(canActionTask(taskReport, undefined, assigneeAccountID, groupChatParentReport)).toBe(true);
    });

    it('should allow other participants in a group chat to action the task (THE BUG)', () => {
        // Currently this fails (returns false), but it should be true for issue #85220
        expect(canActionTask(taskReport, undefined, otherParticipantAccountID, groupChatParentReport)).toBe(true);
    });

    it('should NOT allow non-participants to action the task', () => {
        expect(canActionTask(taskReport, undefined, nonParticipantAccountID, groupChatParentReport)).toBe(false);
    });

    it('should NOT allow other participants in a 1:1 chat to action the task if they are not owner/assignee', () => {
        // In a 1:1 chat, "other participants" who are not owner/assignee shouldn't exist in the context of a task
        // but let's say a 3rd person somehow gets the report
        expect(canActionTask(taskReport, undefined, nonParticipantAccountID, oneOnOneParentReport)).toBe(false);
    });
});
