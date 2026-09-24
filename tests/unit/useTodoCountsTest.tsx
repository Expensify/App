import {act, renderHook} from '@testing-library/react-native';

import useTodoCounts from '@hooks/useTodoCounts';

import {requiresAttentionFromCurrentUser} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, ReportAttributesDerivedValue, Transaction} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {ACHAccount} from '@src/types/onyx/Policy';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
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
    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
    ...overrides,
});

// Builds an admin policy with a QBO connection whose auto-sync is disabled, so a report on it is manually exportable.
// The `Connections` type requires an entry for every supported integration, while this scenario only needs QBO.
const createPolicyWithQBOConnection = (policyID: string, {policyExporter, connectionExporter}: {policyExporter: string; connectionExporter: string}): Policy =>
    createMockPolicy(policyID, {
        role: CONST.POLICY.ROLE.ADMIN,
        exporter: policyExporter,
        connections: createMock<NonNullable<Policy['connections']>>({
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
        }),
    });

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

const HOLD_ACTION_ID = 'HOLD_ACTION_ID';

// A money-request (IOU) action whose child report is the transaction thread that carries the HOLD action.
const createMoneyRequestAction = (reportActionID: string, transactionID: string, transactionThreadReportID: string): ReportAction => ({
    reportActionID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-01-01 00:00:00.000',
    actorAccountID: OTHER_USER_ACCOUNT_ID,
    childReportID: transactionThreadReportID,
    originalMessage: {
        IOUTransactionID: transactionID,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 100,
        currency: 'USD',
    },
});

// The HOLD action lives on the transaction thread; its actor is whoever placed the hold.
const createHoldAction = (holderAccountID: number): ReportAction => ({
    reportActionID: HOLD_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
    created: '2024-01-01 00:00:00.000',
    actorAccountID: holderAccountID,
});

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
            [CONST.SEARCH.SEARCH_KEYS.BILLS_APPROVE]: 0,
            [CONST.SEARCH.SEARCH_KEYS.BILLS_PAY]: 0,
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

    describe('keeps an all-held approve/pay report only for the user who placed the hold', () => {
        const HELD_APPROVE_REPORT_ID = 'held_hold_approve';
        const HELD_PAY_REPORT_ID = 'held_hold_pay';

        // Seeds a single all-held report plus the money-request action and the thread's HOLD action (whose actor is the
        // holder), so the derivation can resolve whether the current user placed the hold.
        const seedScenario = async (report: Report, holderAccountID: number) => {
            const transactionID = `trans_${report.reportID}`;
            const transactionThreadReportID = `thread_${report.reportID}`;
            const moneyRequestActionID = `mr_${report.reportID}`;
            const policy = createMockPolicy(POLICY_ID, {
                approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                role: CONST.POLICY.ROLE.ADMIN,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            });

            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([policy]);
            await setReports([report]);
            await setTransactions([createMockTransaction(transactionID, report.reportID, {comment: {hold: HOLD_ACTION_ID}})]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [moneyRequestActionID]: createMoneyRequestAction(moneyRequestActionID, transactionID, transactionThreadReportID),
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`, {[HOLD_ACTION_ID]: createHoldAction(holderAccountID)});
            await waitForBatchedUpdates();
        };

        const approveReport = () =>
            createMockReport(HELD_APPROVE_REPORT_ID, {
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
            });

        const payReport = () =>
            createMockReport(HELD_PAY_REPORT_ID, {
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
                total: -100,
            });

        it('counts an all-held approve report when the current user placed the hold', async () => {
            await seedScenario(approveReport(), CURRENT_USER_ACCOUNT_ID);

            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(1);
        });

        it('does not count an all-held approve report when another user placed the hold', async () => {
            await seedScenario(approveReport(), OTHER_USER_ACCOUNT_ID);

            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(0);
        });

        it('counts an all-held pay report when the current user placed the hold', async () => {
            await seedScenario(payReport(), CURRENT_USER_ACCOUNT_ID);

            const {result} = await renderTodoCounts();

            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(1);
        });

        it('does not count an all-held pay report when another user placed the hold', async () => {
            await seedScenario(payReport(), OTHER_USER_ACCOUNT_ID);

            const {result} = await renderTodoCounts();

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

        it('keeps a stable result reference when an Onyx write does not change the counts', async () => {
            const {result} = await renderTodoCounts();
            const firstResult = result.current;

            // Rename an excluded chat report - the REPORT collection subscription fires, but no bucket changes.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${EXCLUDED_REPORT_IDS.at(0)}`, {reportName: 'Renamed chat'});
                await waitForBatchedUpdates();
            });

            expect(result.current).toBe(firstResult);

            // A write that changes a count must produce a new reference.
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SUBMIT_REPORT_IDS.at(0)}`, {
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                });
                await waitForBatchedUpdates();
            });

            expect(result.current).not.toBe(firstResult);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(3);
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

    describe('agrees with the Inbox To-do tab', () => {
        // One workspace chat owns two reports to approve, so the counter counts two while the Inbox renders one row.
        const CHAT_WITH_TWO_ACTIONS_ID = 'cross_surface_chat_two_actions';
        const CHAT_WITH_PARTICIPANTS_ID = 'cross_surface_chat_with_participants';
        const CHAT_TO_PAY_ID = 'cross_surface_chat_to_pay';
        const CHAT_IDLE_ID = 'cross_surface_chat_idle';

        /**
         * The workspace chat that owns expense reports. `hasOutstandingChildRequest` is what gives the current user a
         * GBR, and `participants` is omitted unless `withParticipants` is set, mirroring a search-shaped payload.
         */
        const createWorkspaceChat = (chatID: string, {actionableReportID, withParticipants = false}: {actionableReportID?: string; withParticipants?: boolean}): Report =>
            createMockReport(chatID, {
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                chatReportID: undefined,
                parentReportID: undefined,
                parentReportActionID: undefined,
                reportName: `Workspace chat ${chatID}`,
                hasOutstandingChildRequest: !!actionableReportID,
                iouReportID: actionableReportID,
                participants: withParticipants ? {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}} : undefined,
            });

        /** Submitted and managed by the current user, so it lands in the APPROVE bucket. */
        const createReportToApprove = (reportID: string, chatID: string): Report =>
            createMockReport(reportID, {
                chatReportID: chatID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
            });

        const expenseReports = [
            // Both of these hang off the same workspace chat, which is the case that breaks a naive count/row equality.
            createReportToApprove('cross_surface_approve_1', CHAT_WITH_TWO_ACTIONS_ID),
            createReportToApprove('cross_surface_approve_2', CHAT_WITH_TWO_ACTIONS_ID),
            createReportToApprove('cross_surface_approve_3', CHAT_WITH_PARTICIPANTS_ID),

            // Approved and reimbursable by the current user, so it lands in the PAY bucket.
            createMockReport('cross_surface_pay_1', {
                chatReportID: CHAT_TO_PAY_ID,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: CURRENT_USER_ACCOUNT_ID,
                total: -100,
                isWaitingOnBankAccount: false,
            }),

            // Owned and managed by somebody else, so it belongs to no bucket.
            createMockReport('cross_surface_idle_1', {
                chatReportID: CHAT_IDLE_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                ownerAccountID: OTHER_USER_ACCOUNT_ID,
                managerID: OTHER_USER_ACCOUNT_ID,
            }),
        ];
        const chatReports = [
            // No participants, as SearchForTodos returns it - the report that used to vanish from the LHN.
            createWorkspaceChat(CHAT_WITH_TWO_ACTIONS_ID, {actionableReportID: 'cross_surface_approve_1'}),
            createWorkspaceChat(CHAT_WITH_PARTICIPANTS_ID, {actionableReportID: 'cross_surface_approve_3', withParticipants: true}),
            createWorkspaceChat(CHAT_TO_PAY_ID, {actionableReportID: 'cross_surface_pay_1'}),
            createWorkspaceChat(CHAT_IDLE_ID, {}),
        ];
        const reports: OnyxCollection<Report> = Object.fromEntries([...chatReports, ...expenseReports].map((report) => [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report]));

        /** Runs the same pipeline the Inbox uses and returns the report IDs its To-do tab would render. */
        const getTodoTabReportIDs = () => {
            const reportAttributes: ReportAttributesDerivedValue['reports'] = Object.fromEntries(
                chatReports.map((chatReport) => [
                    chatReport.reportID,
                    createMock<ReportAttributes>({
                        requiresAttention: requiresAttentionFromCurrentUser(chatReport, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID),
                    }),
                ]),
            );
            const reportsToDisplay = SidebarUtils.getReportsToDisplayInLHN({
                currentReportId: undefined,
                reports,
                isDefaultRoomsBetaEnabled: false,
                priorityMode: CONST.PRIORITY_MODE.DEFAULT,
                draftComments: {},
                transactionViolations: {},
                transactions: {},
                isOffline: false,
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                reportNameValuePairs: {},
                reportAttributes,
                guideAccountIDs: [],
                conciergeReportID: undefined,
            });
            const reportIDs = Object.keys(reportsToDisplay).map((key) => key.replace(ONYXKEYS.COLLECTION.REPORT, ''));

            return SidebarUtils.filterReportsForInboxTab(reportIDs, reportsToDisplay, CONST.INBOX_TAB.TODO);
        };

        beforeEach(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: CURRENT_USER_ACCOUNT_ID});
            await setPolicies([
                createMockPolicy(POLICY_ID, {
                    approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    role: CONST.POLICY.ROLE.ADMIN,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                }),
            ]);
            await setReports([...chatReports, ...expenseReports]);
            await setTransactions(expenseReports.map((report) => createMockTransaction(`trans_${report.reportID}`, report.reportID)));
            await waitForBatchedUpdates();
        });

        it('renders a To-do row for the workspace chat of every counted report', async () => {
            // Given four expense reports the current user must act on and one that needs nothing from them

            // When the to-do counts and the Inbox To-do tab are computed from the same Onyx data
            const {result} = await renderTodoCounts();
            const todoTabReportIDs = getTodoTabReportIDs();

            // Then the counter classifies exactly the four actionable expense reports
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.APPROVE]).toBe(3);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY]).toBe(1);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.SUBMIT]).toBe(0);
            expect(result.current.counts[CONST.SEARCH.SEARCH_KEYS.EXPORT]).toBe(0);

            // Then every one of those reports has its workspace chat in the To-do tab. The chat with no participants
            // is the regression case: it used to be dropped from the option list while the counter still counted it.
            expect([...todoTabReportIDs].sort()).toEqual([CHAT_WITH_TWO_ACTIONS_ID, CHAT_WITH_PARTICIPANTS_ID, CHAT_TO_PAY_ID].sort());

            // Then the chat whose report needs nothing stays out of the tab
            expect(todoTabReportIDs).not.toContain(CHAT_IDLE_ID);
        });

        it('renders a single To-do row for a workspace chat that owns two counted reports', async () => {
            // Given two reports to approve that both hang off CHAT_WITH_TWO_ACTIONS_ID

            // When the to-do counts and the Inbox To-do tab are computed from the same Onyx data
            const {result} = await renderTodoCounts();
            const todoTabReportIDs = getTodoTabReportIDs();

            // Then the counts and the row total deliberately differ: the counter counts reports, the Inbox renders
            // chats, so the invariant is "every counted report's chat has a row".
            const countedReports = result.current.counts[CONST.SEARCH.SEARCH_KEYS.APPROVE] + result.current.counts[CONST.SEARCH.SEARCH_KEYS.PAY];
            expect(countedReports).toBe(4);
            expect(todoTabReportIDs).toHaveLength(3);

            // Then the shared chat appears exactly once
            expect(todoTabReportIDs.filter((reportID) => reportID === CHAT_WITH_TWO_ACTIONS_ID)).toHaveLength(1);
        });
    });
});
