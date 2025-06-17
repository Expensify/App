import Onyx from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';

const FAKE_PERSONAL_DETAILS = LHNTestUtils.fakePersonalDetails;
const FAKE_REPORT_ACTIONS = {
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
        '1': {actorAccountID: 2, actionName: CONST.REPORT.ACTIONS.TYPE.IOU},
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: {
        '2': {actorAccountID: 1, actionName: CONST.REPORT.ACTIONS.TYPE.IOU},
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: {
        '2': {
            actorAccountID: 1,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        },
    },
};
const FAKE_REPORTS = {
    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {
        ...LHNTestUtils.getFakeReport([1, 2], 0, true),
        invoiceReceiver: {
            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
            accountID: 3,
        },
    },
    // This is the parent report for the expense request test.
    // It MUST have type: 'expense' for the isExpenseRequest() check to pass.
    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {
        ...LHNTestUtils.getFakeReport([1], 0, true),
        reportID: '2',
        type: CONST.REPORT.TYPE.EXPENSE,
    },

    // This is the parent report for the expense request test.
    // It MUST have type: 'expense' for the isExpenseRequest() check to pass.
    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {
        ...LHNTestUtils.getFakeReport([1], 0, true),
        reportID: '3',
        parentReportID: '2',
        parentReportActionID: '2',
        type: CONST.REPORT.TYPE.EXPENSE,
    },
};
const FAKE_POLICIES = {
    [`${ONYXKEYS.COLLECTION.POLICY}1`]: LHNTestUtils.getFakePolicy('1'),
};

const currentUserAccountID = 5;

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.SESSION]: {email: FAKE_PERSONAL_DETAILS[currentUserAccountID]?.login, accountID: currentUserAccountID},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: FAKE_PERSONAL_DETAILS,
            ...FAKE_REPORT_ACTIONS,
            ...FAKE_REPORTS,
            ...FAKE_POLICIES,
        },
    });
    // @ts-expect-error Until we add NVP_PRIVATE_DOMAINS to ONYXKEYS, we need to mock it here
    Onyx.connect({key: ONYXKEYS.NVP_PRIVATE_DOMAINS, callback: () => {}});
});

describe('ReportUtils.getIcons', () => {
    it('should return a fallback icon if the report is empty', () => {
        const report: Partial<Report> = {};
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
    });

    it('should return the correct icons for an expense request', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            parentReportID: '3',
            parentReportActionID: '2',
            type: CONST.REPORT.TYPE.IOU,
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons[0].name).toBe('Email One');
    });

    it('should return the correct icons for a chat thread', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            parentReportID: '1',
            parentReportActionID: '1',
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Email Two');
    });

    it('should return the correct icons for a task report', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            type: CONST.REPORT.TYPE.TASK,
            ownerAccountID: 1,
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Email One');
    });

    it('should return the correct icons for a domain room', () => {
        const report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            reportName: '#domain-test',
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('domain-test');
    });

    it('should return the correct icons for a policy room', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Workspace-Test-001');
    });

    it('should return the correct icons for a policy expense chat', () => {
        const report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons[0].type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons[1].type).toBe(CONST.ICON_TYPE_AVATAR);
    });

    it('should return the correct icons for an expense report', () => {
        const report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons[0].type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(icons[1].type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('should return the correct icons for an IOU report with one transaction', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            reportID: '1',
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: 1,
            managerID: 2,
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Email One');
    });

    it('should return the correct icons for a Self DM', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Email Five');
    });

    it('should return the correct icons for a system chat', () => {
        const report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].id).toBe(CONST.ACCOUNT_ID.NOTIFICATIONS);
    });

    it('should return the correct icons for a group chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
    });

    it('should return the correct icons for a group chat without an avatar', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
    });

    it('should return the correct icons for a group chat with an avatar', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            avatarUrl: 'https://example.com/avatar.png',
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
    });

    it('should return the correct icons for an invoice report', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            type: CONST.REPORT.TYPE.INVOICE,
            chatReportID: '1',
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons[0].type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons[1].name).toBe('Email Three');
    });

    it('should return all participant icons for a one-on-one chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons[0].name).toBe('Email One');
    });

    it('should return all participant icons as a fallback', () => {
        const report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3, 4], 0, true),
            type: 'some_random_type',
        };
        const icons = ReportUtils.getIcons(report, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(4);
    });
});
