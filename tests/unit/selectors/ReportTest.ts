import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import {reportAvatarFieldsSelector, reportAvatarKindSelector, reportParentChainSelector, reportPolicyFieldsSelector, reportViolationVisibilitySelector} from '@selectors/Report';

import createMock from '../../utils/createMock';

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
        // A trip room is itself a thread of its trip preview, so it routes to the thread wrapper.
        ['a trip room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM, ...threadFields}, CONST.REPORT_AVATAR_KIND.CHAT_THREAD],
        ['a trip room without parent fields', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}, CONST.REPORT_AVATAR_KIND.TRIP_ROOM],
        ['a report without a type', {}, CONST.REPORT_AVATAR_KIND.DEFAULT],
        // Legacy getIcons classifies chats purely off chatType — a chat row whose type hasn't populated yet still routes by it.
        ['a group chat without a type', {chatType: CONST.REPORT.CHAT_TYPE.GROUP}, CONST.REPORT_AVATAR_KIND.GROUP_CHAT],
        ['a policy room without a type', {chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}, CONST.REPORT_AVATAR_KIND.ROOM],
        // The thread check requires type=chat (isChatThread semantics), so without a type the chatType wins.
        ['a group chat without a type but with parent fields', {chatType: CONST.REPORT.CHAT_TYPE.GROUP, ...threadFields}, CONST.REPORT_AVATAR_KIND.GROUP_CHAT],
        // Legacy isTripRoom requires type=chat.
        ['a trip room without a type', {chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}, CONST.REPORT_AVATAR_KIND.DEFAULT],
    ] as const)('should return the kind for %s', (_case, overrides, expectedKind) => {
        expect(reportAvatarKindSelector(createReport(overrides))).toBe(expectedKind);
    });

    it('should return undefined when the report is not in Onyx', () => {
        expect(reportAvatarKindSelector(undefined)).toBeUndefined();
    });
});

describe('reportAvatarFieldsSelector', () => {
    it('should project exactly the fields the report-type avatar wrappers render from', () => {
        const report = createReport({
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: 42,
            chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
            policyID: 'policy123',
            policyAvatar: 'https://example.com/policy-avatar.png',
            policyName: 'Policy Name',
            oldPolicyName: 'Old Policy Name',
            chatReportID: 'chatReport123',
            ...threadFields,
            // A field the avatars do not read, to prove it is stripped
            lastMessageText: 'Hello',
        });

        expect(reportAvatarFieldsSelector(report)).toEqual({
            ownerAccountID: 42,
            chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
            policyID: 'policy123',
            policyAvatar: 'https://example.com/policy-avatar.png',
            policyName: 'Policy Name',
            oldPolicyName: 'Old Policy Name',
            chatReportID: 'chatReport123',
            ...threadFields,
        });
    });

    it('should return undefined when the report is not in Onyx', () => {
        expect(reportAvatarFieldsSelector(undefined)).toBeUndefined();
    });
});

describe('reportPolicyFieldsSelector', () => {
    it('should project exactly the policy fallback fields', () => {
        const report = createReport({
            type: CONST.REPORT.TYPE.CHAT,
            policyName: 'Policy Name',
            oldPolicyName: 'Old Policy Name',
            policyAvatar: 'https://example.com/policy-avatar.png',
            lastMessageText: 'Hello',
        });

        expect(reportPolicyFieldsSelector(report)).toEqual({policyName: 'Policy Name', oldPolicyName: 'Old Policy Name', policyAvatar: 'https://example.com/policy-avatar.png'});
    });

    it('should return undefined when the report is not in Onyx', () => {
        expect(reportPolicyFieldsSelector(undefined)).toBeUndefined();
    });
});

describe('reportParentChainSelector', () => {
    const GRANDPARENT_REPORT_ID = 'grandparentReport123';
    const GRANDPARENT_REPORT_ACTION_ID = 'grandparentReportAction123';
    const UNRELATED_REPORT_ID = 'unrelatedReport123';

    const reportKey = (reportID: string) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;

    it('should return the parent links of the report and every ancestor, and nothing else', () => {
        // Given a thread -> parent -> grandparent chain plus an unrelated report in the collection
        const reports = {
            [reportKey(REPORT_ID)]: createReport({...threadFields, lastMessageText: 'Hello'}),
            [reportKey(PARENT_REPORT_ID)]: createReport({reportID: PARENT_REPORT_ID, parentReportID: GRANDPARENT_REPORT_ID, parentReportActionID: GRANDPARENT_REPORT_ACTION_ID}),
            [reportKey(GRANDPARENT_REPORT_ID)]: createReport({reportID: GRANDPARENT_REPORT_ID}),
            [reportKey(UNRELATED_REPORT_ID)]: createReport({reportID: UNRELATED_REPORT_ID, ...threadFields}),
        };

        // When the selector is applied for the thread
        const result = reportParentChainSelector(REPORT_ID)(reports);

        // Then only the chain entries are returned, projected to the parent link fields, so unrelated reports cannot affect the result
        expect(result).toEqual({
            [reportKey(REPORT_ID)]: threadFields,
            [reportKey(PARENT_REPORT_ID)]: {parentReportID: GRANDPARENT_REPORT_ID, parentReportActionID: GRANDPARENT_REPORT_ACTION_ID},
            [reportKey(GRANDPARENT_REPORT_ID)]: {parentReportID: undefined, parentReportActionID: undefined},
        });
    });

    it('should stop at the first ancestor that is not in Onyx', () => {
        // Given a thread whose parent report is not loaded
        const reports = {[reportKey(REPORT_ID)]: createReport(threadFields)};

        // When the selector is applied for the thread
        const result = reportParentChainSelector(REPORT_ID)(reports);

        // Then only the thread's own links are returned, which is all the error-clearing walk can use
        expect(result).toEqual({[reportKey(REPORT_ID)]: threadFields});
    });

    it('should terminate when the parent links form a cycle', () => {
        // Given two reports that list each other as parent (corrupt data must not hang the UI thread)
        const reports = {
            [reportKey(REPORT_ID)]: createReport(threadFields),
            [reportKey(PARENT_REPORT_ID)]: createReport({reportID: PARENT_REPORT_ID, parentReportID: REPORT_ID, parentReportActionID: 'action1'}),
        };

        // When the selector is applied for the thread
        const result = reportParentChainSelector(REPORT_ID)(reports);

        // Then each report on the cycle appears once
        expect(Object.keys(result ?? {})).toEqual([reportKey(REPORT_ID), reportKey(PARENT_REPORT_ID)]);
    });

    it('should return an empty collection when the report ID is missing or the collection is not loaded', () => {
        // Given no report ID, or no report collection
        // When the selector is applied
        // Then nothing is returned, so the caller's walk does not fall back to stale data
        expect(reportParentChainSelector(undefined)({[reportKey(REPORT_ID)]: createReport(threadFields)})).toEqual({});
        expect(reportParentChainSelector(REPORT_ID)(undefined)).toEqual({});
    });
});

describe('reportViolationVisibilitySelector', () => {
    it('should keep only the fields violation visibility reads', () => {
        // Given a report with the fields violation visibility reads, plus totals and last-activity fields
        const fullReport = createMock<Report>({
            reportID: '1',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            ownerAccountID: 1,
            managerID: 2,
            total: 1000,
            lastMessageText: 'Hi',
            lastReadTime: '2026-01-01',
        });

        // When the row builds the report for violation visibility
        const violationReport = reportViolationVisibilitySelector(fullReport);

        // Then a new message or total can't re-render the row, while the state, type and roles the violation check reads stay
        expect(violationReport).toEqual({
            reportID: '1',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            ownerAccountID: 1,
            managerID: 2,
        });
    });

    it('should return undefined when the report is not loaded', () => {
        // Given a report that is not in Onyx
        // When the row builds the report for violation visibility
        // Then it gets undefined, like the full report read would
        expect(reportViolationVisibilitySelector(undefined)).toBeUndefined();
    });
});
