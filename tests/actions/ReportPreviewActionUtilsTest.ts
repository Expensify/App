import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import getReportPreviewAction from '@libs/ReportPreviewActionUtils';
// eslint-disable-next-line no-restricted-syntax
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportViolations, TransactionViolation} from '@src/types/onyx';
import type {Connections, NetSuiteConnection} from '@src/types/onyx/Policy';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';

const SESSION = {
    email: CURRENT_USER_EMAIL,
    accountID: CURRENT_USER_ACCOUNT_ID,
};

const PERSONAL_DETAILS = {
    accountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
};

const REPORT_ID = 1;
const TRANSACTION_ID = 1;
const VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    hasViolations: jest.fn().mockReturnValue(false),
    getReportTransactions: jest.fn().mockReturnValue(['mockValue']),
}));
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPrefferedExporter: jest.fn().mockReturnValue(true),
    hasAccountingConnections: jest.fn().mockReturnValue(true),
}));

describe('getReportPreviewAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('canSubmit should return true for expense preview report with manual submit', async () => {
        const report: Report = {
            ...createRandomReport(REPORT_ID),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        const policy = createRandomPolicy(0);
        policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        if (policy.harvesting) {
            policy.harvesting.enabled = false;
        }
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT);
    });

    it('canApprove should return true for report being processed', async () => {
        const report = {
            ...createRandomReport(REPORT_ID),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        };

        const policy = createRandomPolicy(0);
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.approver = CURRENT_USER_EMAIL;
        policy.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
        policy.preventSelfApproval = false;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
    });

    it('canPay should return true for expense report with payments enabled', async () => {
        const report = {
            ...createRandomReport(REPORT_ID),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -100,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    });

    it('canPay should return true for submitted invoice', async () => {
        const report = {
            ...createRandomReport(REPORT_ID),
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    });

    it('canPay should return false for archived invoice', async () => {
        const report = {
            ...createRandomReport(REPORT_ID),
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
            private_isArchived: new Date().toString(),
        });

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    });

    it('canExport should return true for finished reports', async () => {
        const report = {
            ...createRandomReport(REPORT_ID),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        };

        const policy = createRandomPolicy(0);
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.connections = {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {} as NetSuiteConnection} as Connections;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING);
    });

    it('canReview should return true for reports where there are violations, user is submitter or approver and Workflows are enabled', async () => {
        (ReportUtils.hasViolations as jest.Mock).mockReturnValue(true);
        const report = {
            ...createRandomReport(REPORT_ID),
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const REPORT_VIOLATION = {
            FIELD_REQUIRED: 'fieldRequired',
        } as unknown as ReportViolations;
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${REPORT_ID}`, REPORT_VIOLATION);

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
            {
                name: CONST.VIOLATIONS.OVER_LIMIT,
            } as TransactionViolation,
        ]);

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, report, policy, undefined, isReportArchived.current)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
    });

    it('canReview should return true for reports with RTER violations regardless of workspace workflow configuration', async () => {
        (ReportUtils.hasViolations as jest.Mock).mockReturnValue(true);
        const report = {
            ...createRandomReport(REPORT_ID),
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const REPORT_VIOLATION = {
            FIELD_REQUIRED: 'fieldRequired',
        } as unknown as ReportViolations;
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${REPORT_ID}`, REPORT_VIOLATION);

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
            {
                name: CONST.VIOLATIONS.RTER,
                data: {
                    pendingPattern: true,
                    rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
                },
            } as TransactionViolation,
        ]);

        expect(getReportPreviewAction(VIOLATIONS, report, policy)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
    });
});
