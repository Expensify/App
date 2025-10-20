import {act, renderHook, waitFor} from '@testing-library/react-native';
import {getUnixTime} from 'date-fns';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import useOnyx from '@hooks/useOnyx';
import * as Transaction from '@libs/actions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, Transaction as TransactionType, TransactionViolation} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import * as TestHelper from '../utils/TestHelper';
import type {MockFetch} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('Transaction', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        // Initialize Onyx before running tests
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        // Reset Onyx before each test
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = global.fetch as MockFetch;
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    afterEach(() => {
        mockFetch.mockReset();
    });

    describe('dismissDuplicateTransactionViolation', () => {
        /**
         * Sets up test data with transactions, violations, and related reports
         */
        async function setupTestData(options: {
            transactionCount?: number;
            withExpenseReport?: boolean;
            withPolicy?: boolean;
            withOtherViolations?: boolean;
            duplicateViolationIDs?: string[];
        }) {
            const {transactionCount = 2, withExpenseReport = true, withPolicy = true, withOtherViolations = false, duplicateViolationIDs} = options;

            // Create test transactions
            const transactions: TransactionType[] = [];
            const transactionIDs: string[] = [];
            const transactionViolations: Record<string, TransactionViolation[]> = {};

            for (let i = 0; i < transactionCount; i++) {
                const transaction = createRandomTransaction(i);
                transaction.transactionID = `transaction${i}`;
                transaction.reportID = 'expenseReport1';
                transactions.push(transaction);
                transactionIDs.push(transaction.transactionID);

                // Create violations for each transaction
                const violations: TransactionViolation[] = [];
                violations.push({
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    type: 'violation',
                    data: {
                        duplicates: duplicateViolationIDs ?? transactionIDs,
                    },
                });

                if (withOtherViolations) {
                    violations.push({
                        name: CONST.VIOLATIONS.RTER,
                        type: 'violation',
                    });
                }

                transactionViolations[transaction.transactionID] = violations;
            }

            // Set up Onyx with transactions
            const onyxPromises: Array<Promise<void>> = [];
            transactions.forEach((transaction) => {
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction));
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`, transactionViolations[transaction.transactionID]));
            });

            // Create expense report if requested
            let expenseReport: Report | undefined;
            if (withExpenseReport) {
                expenseReport = createExpenseReport(1);
                expenseReport.reportID = 'expenseReport1';
                expenseReport.total = 100;
                expenseReport.statusNum = CONST.REPORT.STATUS_NUM.OPEN;
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport));
            }

            // Create policy if requested
            let policy: Policy | undefined;
            if (withPolicy) {
                policy = createRandomPolicy(1);
                policy.id = 'policy1';
                onyxPromises.push(Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy));
            }

            // Create personal details
            const personalDetails: PersonalDetails = {
                accountID: 1,
                login: 'test@expensify.com',
                displayName: 'Test User',
                avatar: '',
            };
            // eslint-disable-next-line @typescript-eslint/naming-convention
            onyxPromises.push(Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {1: personalDetails}));

            await Promise.all(onyxPromises);
            await waitForBatchedUpdates();

            return {
                transactions,
                transactionIDs,
                transactionViolations,
                expenseReport,
                policy,
                personalDetails,
            };
        }

        it('should dismiss duplicate transaction violations for given transaction IDs', async () => {
            // Given a set of transactions with duplicate violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            // Get initial transaction data
            const transaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            if (transaction0) {
                allTransactions[transactionIDs[0]] = transaction0;
            }
            const transaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);
            if (transaction1) {
                allTransactions[transactionIDs[1]] = transaction1;
            }

            // Get initial violation data to verify they exist
            const initialViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            if (initialViolations0) {
                allTransactionViolation[transactionIDs[0]] = initialViolations0;
            }
            const initialViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);
            if (initialViolations1) {
                allTransactionViolation[transactionIDs[1]] = initialViolations1;
            }

            expect(initialViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
            expect(initialViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();

            mockFetch.pause();

            // When dismissing duplicate transaction violations
            Transaction.dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then check optimistic data - violations should be removed immediately
            let updatedViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            let updatedViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(updatedViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
            expect(updatedViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();

            // Check that transaction comments have dismissedViolations in optimistic data
            let updatedTransaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            let updatedTransaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);

            expect(updatedTransaction0?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();
            expect(updatedTransaction1?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();

            // Check that next step was created optimistically
            let nextStep = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`);
            expect(nextStep).toBeDefined();

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then check success data - violations should still be removed
            updatedViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            updatedViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(updatedViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
            expect(updatedViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();

            // Check that transaction comments still have dismissedViolations after success
            updatedTransaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            updatedTransaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);

            expect(updatedTransaction0?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();
            expect(updatedTransaction1?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();

            // Check that next step is still present after success
            nextStep = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`);
            expect(nextStep).toBeDefined();
        });

        it('should update transaction comment with dismissedViolations timestamp', async () => {
            // Given transactions with duplicate violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            // Get data for the function
            for (const transactionID of transactionIDs) {
                const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                if (transaction) {
                    allTransactions[transactionID] = transaction;
                }

                const violations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                if (violations) {
                    allTransactionViolation[transactionID] = violations;
                }
            }

            const dismissTime = new Date();

            // When dismissing duplicate transaction violations
            Transaction.dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then each transaction should have dismissedViolations in its comment with the dismissing user's login
            for (const transactionID of transactionIDs) {
                const updatedTransaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

                expect(updatedTransaction?.comment?.dismissedViolations).toBeDefined();
                expect(updatedTransaction?.comment?.dismissedViolations?.duplicatedTransaction).toBeDefined();
                expect(updatedTransaction?.comment?.dismissedViolations?.duplicatedTransaction?.[personalDetails.login ?? '']).toBeDefined();

                // Verify the timestamp is reasonable (within a few seconds of dismissTime)
                const timestamp = updatedTransaction?.comment?.dismissedViolations?.duplicatedTransaction?.[personalDetails.login ?? ''];
                const expectedTimestamp = getUnixTime(dismissTime);
                if (timestamp !== undefined && typeof timestamp === 'number') {
                    expect(Math.abs(timestamp - expectedTimestamp)).toBeLessThanOrEqual(5);
                }
            }
        });

        it('should preserve other violations when dismissing duplicate violations', async () => {
            // Given transactions with both duplicate violations and other violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
                withOtherViolations: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            for (const transactionID of transactionIDs) {
                const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                if (transaction) {
                    allTransactions[transactionID] = transaction;
                }

                const violations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                if (violations) {
                    allTransactionViolation[transactionID] = violations;
                }
            }

            // When dismissing duplicate transaction violations
            Transaction.dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then duplicate violations should be removed but other violations should remain
            for (const transactionID of transactionIDs) {
                const updatedViolations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);

                expect(updatedViolations).toBeDefined();
                expect(updatedViolations?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
                expect(updatedViolations?.find((v) => v.name === CONST.VIOLATIONS.RTER)).toBeDefined();
            }
        });

        it('should update next step when expense report is provided', async () => {
            // Given transactions with duplicate violations and an expense report
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};

            for (const transactionID of transactionIDs) {
                const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
                if (transaction) {
                    allTransactions[transactionID] = transaction;
                }

                const violations = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
                if (violations) {
                    allTransactionViolation[transactionID] = violations;
                }
            }

            // When dismissing duplicate transaction violations
            Transaction.dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            // Then the next step for the expense report should be updated
            const nextStep = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`);

            expect(nextStep).toBeDefined();
        });

        it('should handle API failure and restore original violations', async () => {
            // Given a set of transactions with duplicate violations
            const {transactionIDs, personalDetails, expenseReport, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            const allTransactions: Record<string, TransactionType> = {};

            // Get initial transaction data
            const transaction0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(0)}`);
            if (transaction0) {
                allTransactions[transactionIDs[0]] = transaction0;
            }

            const transaction1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDs.at(1)}`);
            if (transaction1) {
                allTransactions[transactionIDs[1]] = transaction1;
            }

            // Get initial violations to verify they exist
            const initialViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            const allTransactionViolation: Record<string, TransactionViolation[]> = {};
            if (initialViolations0) {
                allTransactionViolation[transactionIDs[0]] = initialViolations0;
            }
            const initialViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);
            if (initialViolations1) {
                allTransactionViolation[transactionIDs[1]] = initialViolations1;
            }

            expect(initialViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
            expect(initialViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();

            mockFetch.pause();

            // When dismissing duplicate transaction violations and API fails
            mockFetch.fail();
            Transaction.dismissDuplicateTransactionViolation({
                transactionIDs,
                dismissedPersonalDetails: personalDetails,
                expenseReport,
                policy,
                isASAPSubmitBetaEnabled: false,
                allTransactionsCollection: allTransactions,
                allTransactionViolationsCollection: allTransactionViolation,
            });
            await waitForBatchedUpdates();

            mockFetch.resume();
            await waitForBatchedUpdates();

            // Then the violations should be restored to original state after failure
            const restoredViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            const restoredViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(restoredViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
            expect(restoredViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeDefined();
        });

        it('should work with data from useOnyx hook', async () => {
            // Given transactions with duplicate violations set up in Onyx
            const {transactionIDs, personalDetails, policy} = await setupTestData({
                transactionCount: 2,
                withExpenseReport: true,
                withPolicy: true,
            });

            // When using useOnyx to get the data
            const {result: expenseReportResult} = renderHook(() => useOnyx(`${ONYXKEYS.COLLECTION.REPORT}expenseReport1`));
            const {result: allTransactionsResult} = renderHook(() => useOnyx(ONYXKEYS.COLLECTION.TRANSACTION));
            const {result: allTransactionViolationResult} = renderHook(() => useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS));

            await waitFor(() => {
                expect(expenseReportResult.current[0]).toBeDefined();
                expect(allTransactionsResult.current[0]).toBeDefined();
                expect(allTransactionViolationResult.current[0]).toBeDefined();
            });

            // When dismissing violations using data from useOnyx
            await act(async () => {
                Transaction.dismissDuplicateTransactionViolation({
                    transactionIDs,
                    dismissedPersonalDetails: personalDetails,
                    expenseReport: expenseReportResult.current[0],
                    policy,
                    isASAPSubmitBetaEnabled: false,
                    allTransactionsCollection: allTransactionsResult.current[0] ?? {},
                    allTransactionViolationsCollection: allTransactionViolationResult.current[0] ?? {},
                });
                await waitForBatchedUpdates();
            });

            // Then the violations should be dismissed successfully
            const updatedViolations0 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(0)}`);
            const updatedViolations1 = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionIDs.at(1)}`);

            expect(updatedViolations0?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
            expect(updatedViolations1?.find((v) => v.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)).toBeUndefined();
        });
    });
});
