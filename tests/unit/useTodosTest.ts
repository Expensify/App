import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useTodos from '@hooks/useTodos';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';
const OTHER_USER_ACCOUNT_ID = 2;

const POLICY_ID = 'policy123';
const POLICY_WITH_CONNECTION_ID = 'policy_with_connection';

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

const createMockReport = (reportID: string, overrides: Partial<Report> = {}): Report =>
    ({
        reportID,
        chatReportID: `chat_${reportID}`,
        policyID: POLICY_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        managerID: OTHER_USER_ACCOUNT_ID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        ...overrides,
    }) as Report;

const createMockPolicy = (policyID: string, overrides: Partial<Policy> = {}): Policy =>
    ({
        id: policyID,
        type: CONST.POLICY.TYPE.TEAM,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        role: CONST.POLICY.ROLE.USER,
        ...overrides,
    }) as Policy;

const createMockTransaction = (transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction =>
    ({
        transactionID,
        reportID,
        amount: 100,
        modifiedAmount: 0,
        reimbursable: true,
        ...overrides,
    }) as Transaction;

describe('useTodos', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    describe('categorizes reports correctly', () => {
        // Report IDs for each category
        const SUBMIT_REPORT_IDS = ['submit_1', 'submit_2', 'submit_3', 'submit_4'];
        const APPROVE_REPORT_IDS = ['approve_1', 'approve_2', 'approve_3'];
        const PAY_REPORT_IDS = ['pay_1', 'pay_2'];
        const EXPORT_REPORT_ID = 'export_1';
        const EXCLUDED_REPORT_IDS = ['excluded_1', 'excluded_2'];

        beforeEach(async () => {
            // Create 4 reports that can be submitted (open, owned by current user, with transactions)
            const reportsToSubmit = SUBMIT_REPORT_IDS.map((id) =>
                createMockReport(id, {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                }),
            );

            // Create 3 reports that can be approved (submitted, current user is manager, with transactions)
            const reportsToApprove = APPROVE_REPORT_IDS.map((id) =>
                createMockReport(id, {
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                }),
            );

            // Create 2 reports that can be paid (approved, current user is admin/payer, with reimbursable transactions)
            const reportsToPay = PAY_REPORT_IDS.map((id) =>
                createMockReport(id, {
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                    total: -100,
                }),
            );

            // Create 1 report that can be exported:
            // - Approved status
            // - User is admin
            // - Policy has a valid accounting connection with auto-sync disabled
            // - Not waiting on bank account
            const reportToExport = createMockReport(EXPORT_REPORT_ID, {
                policyID: POLICY_WITH_CONNECTION_ID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
            });

            // Create 2 reports that don't fit any condition:
            // 1. A chat report (not expense type)
            // 2. An expense report owned by another user that's not submitted (can't submit, approve, pay, or export)
            const excludedReports = [
                createMockReport(EXCLUDED_REPORT_IDS.at(0) ?? '', {
                    type: CONST.REPORT.TYPE.CHAT, // Not an expense report
                }),
                createMockReport(EXCLUDED_REPORT_IDS.at(1) ?? '', {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID, // Not owned by current user, so can't submit
                    managerID: OTHER_USER_ACCOUNT_ID, // Not managed by current user, so can't approve
                }),
            ];

            // Create main policy (for submit, approve, pay reports)
            const policy = createMockPolicy(POLICY_ID, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            });

            // Create policy with accounting connection (for export report)
            // Cast to Policy to avoid strict type checking on connection config
            const policyWithConnection = {
                ...createMockPolicy(POLICY_WITH_CONNECTION_ID, {
                    role: CONST.POLICY.ROLE.ADMIN,
                }),
                connections: {
                    // QuickBooks Online connection with auto-sync disabled
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        lastSync: {
                            isConnected: true,
                            isSuccessful: true,
                            isAuthenticationError: false,
                            source: 'DIRECT',
                        },
                        config: {
                            autoSync: {
                                jobID: 'job123',
                                enabled: false, // Auto-sync disabled so manual export is available
                            },
                        },
                    },
                },
            } as Policy;

            // Create transactions for each report that needs them
            const transactions: Record<string, Transaction> = {};

            // Transactions for submit reports
            for (const reportID of SUBMIT_REPORT_IDS) {
                const transactionID = `trans_submit_${reportID}`;
                transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMockTransaction(transactionID, reportID);
            }

            // Transactions for approve reports
            for (const reportID of APPROVE_REPORT_IDS) {
                const transactionID = `trans_approve_${reportID}`;
                transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMockTransaction(transactionID, reportID);
            }

            // Transactions for pay reports (must be reimbursable)
            for (const reportID of PAY_REPORT_IDS) {
                const transactionID = `trans_pay_${reportID}`;
                transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = createMockTransaction(transactionID, reportID, {
                    reimbursable: true,
                });
            }

            // Build reports object
            const reports: Record<string, Report> = {};
            for (const report of [...reportsToSubmit, ...reportsToApprove, ...reportsToPay, reportToExport, ...excludedReports]) {
                reports[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = report;
            }

            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.SESSION]: {
                        email: CURRENT_USER_EMAIL,
                        accountID: CURRENT_USER_ACCOUNT_ID,
                    },
                    [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy,
                    [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_WITH_CONNECTION_ID}`]: policyWithConnection,
                    ...reports,
                    ...transactions,
                } as unknown as OnyxMultiSetInput);
                await waitForBatchedUpdatesWithAct();
            });
        });

        it('returns correct number of reports for each category', async () => {
            const {result} = renderHook(() => useTodos());
            await waitForBatchedUpdatesWithAct();

            expect(result.current.reportsToSubmit.length).toBe(4);
            expect(result.current.reportsToApprove.length).toBe(3);
            expect(result.current.reportsToPay.length).toBe(2);
            expect(result.current.reportsToExport.length).toBe(1);

            for (const id of SUBMIT_REPORT_IDS) {
                expect(result.current.reportsToSubmit.map((r) => r.reportID)).toContain(id);
            }
            for (const id of APPROVE_REPORT_IDS) {
                expect(result.current.reportsToApprove.map((r) => r.reportID)).toContain(id);
            }
            for (const id of PAY_REPORT_IDS) {
                expect(result.current.reportsToPay.map((r) => r.reportID)).toContain(id);
            }
            expect(result.current.reportsToExport.map((r) => r.reportID)).toContain(EXPORT_REPORT_ID);
        });
    });
});
