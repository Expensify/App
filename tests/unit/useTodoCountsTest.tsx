import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useTodoCounts from '@hooks/useTodoCounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {ACHAccount} from '@src/types/onyx/Policy';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';
const OTHER_USER_ACCOUNT_ID = 2;

const POLICY_ID = 'policy123';
const POLICY_WITH_CONNECTION_ID = 'policy_with_connection';

// Helper functions that mirror the precise control the removed TODOS derived-value tests relied on.
const createMockReport = (reportID: string, overrides: Partial<Report> = {}): Report => ({
    reportID,
    chatReportID: `chat_${reportID}`,
    policyID: POLICY_ID,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    managerID: OTHER_USER_ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    type: CONST.REPORT.TYPE.EXPENSE,
    parentReportID: '123',
    parentReportActionID: '456',
    reportName: 'Test Report',
    currency: 'USD',
    isOwnPolicyExpenseChat: false,
    isPinned: false,
    isWaitingOnBankAccount: false,
    ...overrides,
});

const createMockPolicy = (policyID: string, overrides: Partial<Policy> = {}): Policy => ({
    id: policyID,
    name: 'Test Policy',
    role: CONST.POLICY.ROLE.USER,
    type: CONST.POLICY.TYPE.TEAM,
    owner: CURRENT_USER_EMAIL,
    outputCurrency: 'USD',
    isPolicyExpenseChatEnabled: true,
    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    ...overrides,
});

// Builds an admin policy with a QBO connection whose auto-sync is disabled, so a report on it is manually exportable.
// The `Connections` type requires an entry for every supported integration, so a single-integration literal can only
// be supplied through an assertion - isolated here so it is the one such cast in this file.
const createPolicyWithQBOConnection = (policyID: string, {policyExporter, connectionExporter}: {policyExporter: string; connectionExporter: string}): Policy =>
    ({
        ...createMockPolicy(policyID, {role: CONST.POLICY.ROLE.ADMIN, exporter: policyExporter}),
        connections: {
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
                    export: {
                        exporter: connectionExporter,
                    },
                },
            },
        },
    }) as unknown as Policy;

const createMockTransaction = (transactionID: string, reportID: string, overrides: Partial<Transaction> = {}): Transaction =>
    ({
        transactionID,
        reportID,
        amount: 100,
        modifiedAmount: 0,
        reimbursable: true,
        status: CONST.TRANSACTION.STATUS.POSTED,
        currency: 'USD',
        merchant: 'Test Merchant',
        created: '2024-01-01',
        ...overrides,
    }) as Transaction;

const setReports = (reports: Report[]) => Promise.all(reports.map((report) => Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report)));
const setTransactions = (transactions: Transaction[]) =>
    Promise.all(transactions.map((transaction) => Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction)));
const setPolicies = (policies: Policy[]) => Promise.all(policies.map((policy) => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy)));

const renderTodoCounts = async (enabled = true) => {
    const hook = renderHook(({isEnabled}: {isEnabled: boolean}) => useTodoCounts(isEnabled), {initialProps: {isEnabled: enabled}});
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

describe('useTodoCounts', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('returns zero counts and no single report IDs when dependencies are not set', async () => {
        const {result} = await renderTodoCounts();

        expect(result.current.counts).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: 0,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: 0,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: 0,
        });
        expect(result.current.singleReportIDs).toEqual({
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: undefined,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: undefined,
        });
    });

    describe('excludes reports with all expenses on hold', () => {
        const HELD_SUBMIT_REPORT_ID = 'held_submit_1';
        const HELD_APPROVE_REPORT_ID = 'held_approve_1';
        const HELD_PAY_REPORT_ID = 'held_pay_1';

        beforeEach(async () => {
            const submitReport = createMockReport(HELD_SUBMIT_REPORT_ID, {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            const approveReport = createMockReport(HELD_APPROVE_REPORT_ID, {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
            });
            const payReport = createMockReport(HELD_PAY_REPORT_ID, {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
                total: -100,
            });

            const policy = createMockPolicy(POLICY_ID, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            });

            const heldOverride: Partial<Transaction> = {comment: {hold: 'HOLD_ACTION_ID'}};

            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([policy]);
            await setReports([submitReport, approveReport, payReport]);
            await setTransactions([
                createMockTransaction(`trans_${HELD_SUBMIT_REPORT_ID}`, HELD_SUBMIT_REPORT_ID, heldOverride),
                createMockTransaction(`trans_${HELD_APPROVE_REPORT_ID}`, HELD_APPROVE_REPORT_ID, heldOverride),
                createMockTransaction(`trans_${HELD_PAY_REPORT_ID}`, HELD_PAY_REPORT_ID, heldOverride),
            ]);
            await waitForBatchedUpdates();
        });

        it('does not count all-held reports in any bucket', async () => {
            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(0);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(0);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(0);
        });
    });

    describe('categorizes reports correctly', () => {
        const SUBMIT_REPORT_IDS = ['submit_1', 'submit_2', 'submit_3', 'submit_4'];
        const APPROVE_REPORT_IDS = ['approve_1', 'approve_2', 'approve_3'];
        const PAY_REPORT_IDS = ['pay_1', 'pay_2'];
        const EXPORT_REPORT_ID = 'export_1';
        const EXCLUDED_REPORT_IDS = ['excluded_1', 'excluded_2'];

        beforeEach(async () => {
            // 4 reports that can be submitted (open, owned by current user, with transactions)
            const reportsToSubmit = SUBMIT_REPORT_IDS.map((id) =>
                createMockReport(id, {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                }),
            );

            // 3 reports that can be approved (submitted, current user is manager, with transactions)
            const reportsToApprove = APPROVE_REPORT_IDS.map((id) =>
                createMockReport(id, {
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                }),
            );

            // 2 reports that can be paid (approved, current user is admin/payer, with reimbursable transactions)
            const reportsToPay = PAY_REPORT_IDS.map((id) =>
                createMockReport(id, {
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: CURRENT_USER_ACCOUNT_ID,
                    total: -100,
                    isWaitingOnBankAccount: false,
                }),
            );

            // 1 report that can be exported (approved, user is admin, valid connection with auto-sync disabled)
            const reportToExport = createMockReport(EXPORT_REPORT_ID, {
                policyID: POLICY_WITH_CONNECTION_ID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
            });

            // 2 reports that don't fit any condition
            const excludedReports = [
                createMockReport(EXCLUDED_REPORT_IDS.at(0) ?? '', {
                    type: CONST.REPORT.TYPE.CHAT,
                }),
                createMockReport(EXCLUDED_REPORT_IDS.at(1) ?? '', {
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATE_NUM.OPEN,
                    ownerAccountID: OTHER_USER_ACCOUNT_ID,
                    managerID: OTHER_USER_ACCOUNT_ID,
                }),
            ];

            const policy = createMockPolicy(POLICY_ID, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            });
            const policyWithConnection = createPolicyWithQBOConnection(POLICY_WITH_CONNECTION_ID, {policyExporter: CURRENT_USER_EMAIL, connectionExporter: CURRENT_USER_EMAIL});

            const transactions: Transaction[] = [
                ...SUBMIT_REPORT_IDS.map((reportID) => createMockTransaction(`trans_submit_${reportID}`, reportID)),
                ...APPROVE_REPORT_IDS.map((reportID) => createMockTransaction(`trans_approve_${reportID}`, reportID)),
                ...PAY_REPORT_IDS.map((reportID) => createMockTransaction(`trans_pay_${reportID}`, reportID)),
            ];

            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([policy, policyWithConnection]);
            await setReports([...reportsToSubmit, ...reportsToApprove, ...reportsToPay, reportToExport, ...excludedReports]);
            await setTransactions(transactions);
            await waitForBatchedUpdates();
        });

        it('returns the correct count for each category', async () => {
            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(4);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(3);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(2);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.EXPORT]).toBe(1);
        });

        it('exposes the report ID only for buckets that contain exactly one report', async () => {
            const {result} = await renderTodoCounts();

            // Only the export bucket has a single report, so only it surfaces an ID.
            expect(result.current.singleReportIDs[CONST.SEARCH.SEARCH_KEYS.EXPORT]).toBe(EXPORT_REPORT_ID);
            expect(result.current.singleReportIDs[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBeUndefined();
            expect(result.current.singleReportIDs[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBeUndefined();
            expect(result.current.singleReportIDs[CONST.SEARCH.SEARCH_KEYS.PAY]).toBeUndefined();
        });

        it('updates the submit count when a report state changes', async () => {
            const {result} = await renderTodoCounts();
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(4);

            // Move one submittable report to the submitted state - it should drop out of the submit bucket.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SUBMIT_REPORT_IDS.at(0)}`, {
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                });
                await waitForBatchedUpdates();
            });

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(3);
        });
    });

    it('does not count export reports when the user is a connection-level exporter but not policy.exporter', async () => {
        const EXPORT_POLICY_ID = 'policy_export_mismatch';
        const reportID = 'export_mismatch_report';

        const report = createMockReport(reportID, {
            policyID: EXPORT_POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            ownerAccountID: OTHER_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        });
        // policy.exporter is someone else, even though the connection-level exporter is the current user.
        const policy = createPolicyWithQBOConnection(EXPORT_POLICY_ID, {policyExporter: 'someone-else@mail.com', connectionExporter: CURRENT_USER_EMAIL});

        await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
        await setPolicies([policy]);
        await setReports([report]);
        await waitForBatchedUpdates();

        const {result} = await renderTodoCounts();

        expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.EXPORT]).toBe(0);
    });

    describe('uses primary login from personalDetailsList', () => {
        const SECONDARY_LOGIN = '+15555551234'; // Phone number as secondary login
        const PRIMARY_LOGIN = 'primary@example.com'; // Primary email

        const createMockAchAccount = (reimburserLogin: string): ACHAccount => ({
            reimburser: reimburserLogin,
            bankAccountID: 1,
            accountNumber: '1234567890',
            routingNumber: '1234567890',
            addressName: 'Test Address',
            bankName: 'Test Bank',
        });

        const createPayableReport = (): Report =>
            createMockReport('pay_report', {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
                total: -100,
                isWaitingOnBankAccount: false,
            });

        it('uses the primary login from personalDetailsList instead of the session email for role checks', async () => {
            const policy = createMockPolicy(POLICY_ID, {
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                achAccount: createMockAchAccount(PRIMARY_LOGIN),
            });

            const payReport = createPayableReport();

            await Onyx.set(ONYXKEYS.SESSION, {email: SECONDARY_LOGIN, accountID: CURRENT_USER_ACCOUNT_ID}); // User signed in with secondary login (phone)
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [CURRENT_USER_ACCOUNT_ID]: {
                    accountID: CURRENT_USER_ACCOUNT_ID,
                    login: PRIMARY_LOGIN, // Primary login stored in personal details
                    displayName: 'Test User',
                },
            });
            await setPolicies([policy]);
            await setReports([payReport]);
            await setTransactions([createMockTransaction('trans_pay', 'pay_report')]);
            await waitForBatchedUpdates();

            const {result} = await renderTodoCounts();

            // The report should count toward pay because the primary login matches the reimburser.
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(1);
            expect(result.current.singleReportIDs[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe('pay_report');
        });

        it('falls back to the session email when personalDetailsList is not available', async () => {
            const policy = createMockPolicy(POLICY_ID, {
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                achAccount: createMockAchAccount(CURRENT_USER_EMAIL),
            });

            const payReport = createPayableReport();

            // No PERSONAL_DETAILS_LIST set - should fall back to session email
            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([policy]);
            await setReports([payReport]);
            await setTransactions([createMockTransaction('trans_pay', 'pay_report')]);
            await waitForBatchedUpdates();

            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(1);
            expect(result.current.singleReportIDs[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe('pay_report');
        });

        it('does not count a pay todo when the secondary login does not match the reimburser and personalDetailsList is missing', async () => {
            const policy = createMockPolicy(POLICY_ID, {
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                achAccount: createMockAchAccount(PRIMARY_LOGIN),
            });

            const payReport = createPayableReport();

            // No PERSONAL_DETAILS_LIST - falls back to session email (secondary login) which doesn't match the reimburser
            await Onyx.set(ONYXKEYS.SESSION, {email: SECONDARY_LOGIN, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([policy]);
            await setReports([payReport]);
            await setTransactions([createMockTransaction('trans_pay', 'pay_report')]);
            await waitForBatchedUpdates();

            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(0);
        });
    });

    describe('freezes when disabled', () => {
        const SUBMIT_REPORT_ID = 'freeze_submit_1';
        const SECOND_SUBMIT_REPORT_ID = 'freeze_submit_2';

        const seedSubmittableReport = (reportID: string) => {
            const report = createMockReport(reportID, {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATE_NUM.OPEN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            });
            return Promise.all([setReports([report]), setTransactions([createMockTransaction(`trans_${reportID}`, reportID)])]);
        };

        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([createMockPolicy(POLICY_ID, {role: CONST.POLICY.ROLE.ADMIN, ownerAccountID: CURRENT_USER_ACCOUNT_ID})]);
            await seedSubmittableReport(SUBMIT_REPORT_ID);
            await waitForBatchedUpdates();
        });

        it('does not recompute while disabled, then recomputes once re-enabled', async () => {
            const {result, rerender} = renderHook(({isEnabled}: {isEnabled: boolean}) => useTodoCounts(isEnabled), {initialProps: {isEnabled: true}});
            await act(async () => {
                await waitForBatchedUpdates();
            });
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(1);

            // Freeze the hook.
            rerender({isEnabled: false});
            await act(async () => {
                await waitForBatchedUpdates();
            });

            // Add another submittable report while frozen - the count must stay at the captured value.
            await act(async () => {
                await seedSubmittableReport(SECOND_SUBMIT_REPORT_ID);
                await waitForBatchedUpdates();
            });
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(1);

            // Re-enable - it recomputes and picks up the report added while frozen.
            rerender({isEnabled: true});
            await act(async () => {
                await waitForBatchedUpdates();
            });
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(2);
        });
    });
});
