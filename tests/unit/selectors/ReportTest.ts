import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';

import {reportAvatarKindSelector} from '@selectors/Report';

const REPORT_ID = 'report123';
const PARENT_REPORT_ID = 'parentReport123';
const PARENT_REPORT_ACTION_ID = 'parentReportAction123';

const createReport = (overrides: Partial<Report> = {}): Report => ({
    reportID: REPORT_ID,
    ...overrides,
});

const threadFields = {parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_REPORT_ACTION_ID};

describe('reportAvatarKindSelector', () => {
    it.each([
        ['an expense report', {type: CONST.REPORT.TYPE.EXPENSE}, CONST.REPORT_AVATAR_KIND.EXPENSE],
        ['an IOU report', {type: CONST.REPORT.TYPE.IOU}, CONST.REPORT_AVATAR_KIND.IOU],
        ['a task report', {type: CONST.REPORT.TYPE.TASK}, CONST.REPORT_AVATAR_KIND.TASK],
        ['an invoice report', {type: CONST.REPORT.TYPE.INVOICE}, CONST.REPORT_AVATAR_KIND.INVOICE],
        // Expense/IOU/task reports also carry parent fields as report-preview children — type must win over the thread check.
        ['an expense report with parent fields', {type: CONST.REPORT.TYPE.EXPENSE, ...threadFields}, CONST.REPORT_AVATAR_KIND.EXPENSE],
        ['an IOU report with parent fields', {type: CONST.REPORT.TYPE.IOU, ...threadFields}, CONST.REPORT_AVATAR_KIND.IOU],
        ['a chat thread', {type: CONST.REPORT.TYPE.CHAT, ...threadFields}, CONST.REPORT_AVATAR_KIND.CHAT_THREAD],
        // A thread inside a policy expense chat is still a thread — the thread check wins over chatType.
        ['a policy expense chat thread', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, ...threadFields}, CONST.REPORT_AVATAR_KIND.CHAT_THREAD],
        ['a group chat', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.GROUP}, CONST.REPORT_AVATAR_KIND.GROUP_CHAT],
        ['a policy expense chat', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT}, CONST.REPORT_AVATAR_KIND.POLICY_EXPENSE_CHAT],
        ['an announce room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE}, CONST.REPORT_AVATAR_KIND.ROOM],
        ['an admins room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS}, CONST.REPORT_AVATAR_KIND.ROOM],
        ['a policy room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}, CONST.REPORT_AVATAR_KIND.ROOM],
        ['a domain room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL}, CONST.REPORT_AVATAR_KIND.ROOM],
        ['an invoice room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.INVOICE}, CONST.REPORT_AVATAR_KIND.ROOM],
        ['a DM', {type: CONST.REPORT.TYPE.CHAT}, CONST.REPORT_AVATAR_KIND.DEFAULT],
        ['a self DM', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM}, CONST.REPORT_AVATAR_KIND.DEFAULT],
        ['a system chat', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SYSTEM}, CONST.REPORT_AVATAR_KIND.DEFAULT],
        // Trip rooms keep bespoke avatar logic in the legacy hook, so they stay on the default kind for now.
        ['a trip room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}, CONST.REPORT_AVATAR_KIND.DEFAULT],
        ['a report without a type', {}, CONST.REPORT_AVATAR_KIND.DEFAULT],
        // Legacy getIcons classifies chats purely off chatType — a chat row whose type hasn't populated yet still routes by it.
        ['a group chat without a type', {chatType: CONST.REPORT.CHAT_TYPE.GROUP}, CONST.REPORT_AVATAR_KIND.GROUP_CHAT],
        ['a policy room without a type', {chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}, CONST.REPORT_AVATAR_KIND.ROOM],
        // The thread check requires type=chat (isChatThread semantics), so without a type the chatType wins.
        ['a group chat without a type but with parent fields', {chatType: CONST.REPORT.CHAT_TYPE.GROUP, ...threadFields}, CONST.REPORT_AVATAR_KIND.GROUP_CHAT],
    ] as const)('should return the kind for %s', (_case, overrides, expectedKind) => {
        expect(reportAvatarKindSelector(createReport(overrides))).toBe(expectedKind);
    });

    it('should return undefined when the report is not in Onyx', () => {
        expect(reportAvatarKindSelector(undefined)).toBeUndefined();
    });
});
