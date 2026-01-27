import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {
    getIcons,
    isAdminRoom,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isChatReport,
    isChatRoom,
    isChatThread,
    isExpenseReport,
    isExpenseRequest,
    isGroupChat,
    isIndividualInvoiceRoom,
    isInvoiceReport,
    isInvoiceRoom,
    isIOUReport,
    isMoneyRequestReport,
    isPolicyExpenseChat,
    isSelfDM,
    isTaskReport,
    isThread,
    isUserCreatedPolicyRoom,
    isWorkspaceTaskReport,
    isWorkspaceThread,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import {actionR14932, actionR98765} from '../../__mocks__/reportData/actions';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {formatPhoneNumber} from '../utils/TestHelper';

const FAKE_PERSONAL_DETAILS = LHNTestUtils.fakePersonalDetails;
/* eslint-disable @typescript-eslint/naming-convention */
const FAKE_REPORT_ACTIONS: OnyxCollection<Record<string, ReportAction>> = {
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: {
        '1': {...actionR14932, actorAccountID: 2},
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: {
        '2': {...actionR98765, actorAccountID: 1},
    },
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: {
        '2': {...actionR98765, actorAccountID: 1},
    },
    // For workspace thread test - parent report actions
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}workspaceParent`]: {
        '1': {...actionR14932, actorAccountID: 2, actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT},
    },
    // For multi-transaction IOU test - multiple transactions
    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}multiTxn`]: {
        '1': {...actionR14932, actorAccountID: 1},
        '2': {...actionR98765, actorAccountID: 1},
    },
};
/* eslint-enable @typescript-eslint/naming-convention */
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
    // Parent workspace chat for workspace thread test
    [`${ONYXKEYS.COLLECTION.REPORT}workspaceParent`]: {
        ...LHNTestUtils.getFakeReport([1], 0, true),
        reportID: 'workspaceParent',
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID: '1',
    },
    // Parent policy expense chat for workspace task test
    [`${ONYXKEYS.COLLECTION.REPORT}taskParent`]: {
        ...LHNTestUtils.getFakeReport([1], 0, true),
        reportID: 'taskParent',
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID: '1',
    },
    // Chat report for multi-transaction IOU test
    [`${ONYXKEYS.COLLECTION.REPORT}chatReport`]: {
        ...LHNTestUtils.getFakeReport([1, 2], 0, true),
        reportID: 'chatReport',
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Onyx.connect({key: ONYXKEYS.NVP_PRIVATE_DOMAINS, callback: () => {}});
});

describe('getIcons', () => {
    it('should return a fallback icon if the report is empty', () => {
        const report = {} as Report;
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
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

        // Verify report type conditions
        expect(isExpenseRequest(report)).toBe(true);
        expect(isThread(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons.at(0)?.name).toBe('Email One');
    });

    it('should return the correct icons for archived non expense request/report', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            type: CONST.REPORT.CHAT_TYPE.INVOICE,
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isArchivedNonExpenseReport(report, true)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy, undefined, true);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe(policy.name);
        expect(icons.at(0)?.type).toBe('workspace');
    });

    it('should return the correct icons for a chat thread', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            parentReportID: '1',
            parentReportActionID: '1',
        };

        // Verify report type conditions
        expect(isChatThread(report)).toBe(true);
        expect(isThread(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('Email\u00A0Two');
    });

    it('should return the correct icons for a task report', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            type: CONST.REPORT.TYPE.TASK,
            ownerAccountID: 1,
        };

        // Verify report type conditions
        expect(isTaskReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('Email One');
    });

    it('should return the correct icons for a domain room', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            reportName: '#domain-test',
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('domain-test');
    });

    it('should return the correct icons for a policy room', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('Workspace-Test-001');
    });

    it('should return the correct icons for a user created policy room', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID: '1',
            avatarUrl: 'https://example.com/avatar.png',
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isUserCreatedPolicyRoom(report)).toBe(true);
        expect(isChatReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(0)?.source).toBe('https://example.com/avatar.png');
    });

    it('should return the correct icons for a policy expense chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isPolicyExpenseChat(report)).toBe(true);
        expect(isChatReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(1)?.type).toBe(CONST.ICON_TYPE_AVATAR);
    });

    it('should return the correct icons for an expense report', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isExpenseReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(icons.at(1)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('should return the correct icons for an IOU report with one transaction', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            reportID: '1',
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: 1,
            managerID: 2,
            transactionCount: 1,
        };

        // Verify report type conditions
        expect(isIOUReport(report)).toBe(true);
        expect(isMoneyRequestReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('Email One');
    });

    it('should return the correct icons for a Self DM', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        };

        // Verify report type conditions
        expect(isSelfDM(report)).toBe(true);
        expect(isChatReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('Email Five');
    });

    it('should return the correct icons for a system chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.id).toBe(CONST.ACCOUNT_ID.NOTIFICATIONS);
    });

    it('should return the correct icons for a group chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        };

        // Verify report type conditions
        expect(isGroupChat(report)).toBe(true);
        expect(isChatReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
    });

    it('should return the correct icons for a group chat without an avatar', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
    });

    it('should return the correct icons for a group chat with an avatar', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            avatarUrl: 'https://example.com/avatar.png',
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
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

        // Verify report type conditions
        expect(isInvoiceReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(1)?.name).toBe('Email Three');
    });

    it('should return all participant icons for a one-on-one chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.name).toBe('Email One');
    });

    it('should return all participant icons as a fallback', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2, 3, 4], 0, true),
            type: undefined,
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(4);
    });

    it('should return the correct icons for a workspace thread', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            parentReportID: 'workspaceParent',
            parentReportActionID: '1',
            policyID: '1',
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isChatThread(report)).toBe(true);
        expect(isWorkspaceThread(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);

        expect(icons).toHaveLength(2); // Actor + workspace icon
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(icons.at(1)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('should return the correct icons for a workspace task report', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1], 0, true),
            type: CONST.REPORT.TYPE.TASK,
            ownerAccountID: 1,
            parentReportID: 'taskParent',
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isTaskReport(report)).toBe(true);
        expect(isWorkspaceTaskReport(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);

        expect(icons).toHaveLength(2); // Owner + workspace icon
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_AVATAR);
        expect(icons.at(1)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('should return the correct icons for an admin room', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isAdminRoom(report)).toBe(true);
        expect(isChatRoom(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('should return the correct icons for an announce room', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            policyID: '1',
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isAnnounceRoom(report)).toBe(true);
        expect(isChatRoom(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
    });

    it('should return the correct icons for an invoice room with individual receiver', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            policyID: '1',
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: 2,
            },
        };
        const policy = LHNTestUtils.getFakePolicy('1');

        // Verify report type conditions
        expect(isInvoiceRoom(report)).toBe(true);
        expect(isIndividualInvoiceRoom(report)).toBe(true);

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2); // Workspace + individual receiver
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(1)?.type).toBe(CONST.ICON_TYPE_AVATAR);
    });

    it('should return the correct icons for an invoice room with business receiver', () => {
        const receiverPolicy = LHNTestUtils.getFakePolicy('2', 'Receiver-Policy');
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            policyID: '1',
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: '2',
            },
        };
        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy, receiverPolicy);
        expect(icons).toHaveLength(2); // Workspace + receiver workspace
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(1)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(1)?.name).toBe('Receiver-Policy');
    });

    it('should return the correct icons for a multi-transaction IOU report where current user is not manager', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([1, 2], 0, true),
            reportID: 'multiTxn',
            chatReportID: 'chatReport',
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: 1,
            managerID: 2, // Different from current user (5)
            // eslint-disable-next-line @typescript-eslint/naming-convention
            participants: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1': {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '2': {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
            },
        };

        const reportActions = FAKE_REPORT_ACTIONS?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`];
        const chatReport = FAKE_REPORTS?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];

        // Verify report type conditions
        expect(isIOUReport(report)).toBe(true);
        expect(isMoneyRequestReport(report)).toBe(true);
        expect(getOneTransactionThreadReportID(report, chatReport, reportActions)).toBeFalsy();

        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);

        expect(icons).toHaveLength(2);
        expect(icons.at(0)?.name).toBe('Email\u0020One');
        expect(icons.at(1)?.name).toBe('Email\u0020Two');
    });

    it('should return the correct icons for a concierge chat', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([CONST.ACCOUNT_ID.CONCIERGE], 0, true),
            participants: {
                [CONST.ACCOUNT_ID.CONCIERGE]: {
                    notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                },
            },
        };
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS);
        expect(icons).toHaveLength(1);
        expect(icons.at(0)?.id).toBe(CONST.ACCOUNT_ID.CONCIERGE);
    });

    it('should return the correct icons for an invoice report with individual receiver', () => {
        const report: Report = {
            ...LHNTestUtils.getFakeReport([], 0, true),
            type: CONST.REPORT.TYPE.INVOICE,
            chatReportID: '1',
            policyID: '1',
        };

        // Verify report type conditions
        expect(isInvoiceReport(report)).toBe(true);

        const policy = LHNTestUtils.getFakePolicy('1');
        const icons = getIcons(report, formatPhoneNumber, FAKE_PERSONAL_DETAILS, null, '', -1, policy);
        expect(icons).toHaveLength(2);
        expect(icons.at(0)?.type).toBe(CONST.ICON_TYPE_WORKSPACE);
        expect(icons.at(1)?.name).toBe('Email Three');
    });
});
