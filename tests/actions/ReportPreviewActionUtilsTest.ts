import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {canApprove, canExport, canPay, canReview, canSubmit} from '@libs/ReportPreviewActionUtils';
// eslint-disable-next-line no-restricted-syntax
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportViolations, TransactionViolation} from '@src/types/onyx';

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
const TRANSACTION_ID = 'TRANSACTION_ID';
const VIOLATIONS = {} as OnyxCollection<TransactionViolation[]>;

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    hasViolations: jest.fn().mockReturnValue(false),
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
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(canSubmit(report, policy as Policy, VIOLATIONS)).toBe(true);
    });

    it('canApprove should return true for report being processed', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;
        const policy = {
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(canApprove(report, policy as Policy, VIOLATIONS)).toBe(true);
    });

    it('canPay should return true for expense report with payments enabled', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(canPay(report, policy as Policy, VIOLATIONS)).toBe(true);
    });

    it('canPay should return true for submitted invoice', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(canPay(report, policy as Policy, VIOLATIONS)).toBe(true);
    });

    it('canExport should return true for finished reports', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        } as unknown as Report;
        const policy = {
            connections: {
                intacct: {
                    config: {
                        export: {
                            exporter: CURRENT_USER_EMAIL,
                        },
                    },
                },
            },
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(canExport(report, policy as Policy, VIOLATIONS)).toBe(true);
    });

    it('canReview should return true for reports where there are violations, user is submitter or approver and Workflows are enabled', async () => {
        (ReportUtils.hasViolations as jest.Mock).mockReturnValue(true);
        const report = {
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            areWorkflowsEnabled: true,
        };
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

        expect(canReview(report, policy as Policy, VIOLATIONS)).toBe(true);
    });
});
