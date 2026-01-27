import Onyx from 'react-native-onyx';
import {
    areTransactionsEligibleForMerge,
    buildMergedTransactionData,
    getDisplayValue,
    getMergeableDataAndConflictFields,
    getMergeFieldErrorText,
    getMergeFieldTranslationKey,
    getMergeFieldUpdatedValues,
    getMergeFieldValue,
    getRateFromMerchant,
    isEmptyMergeValue,
    selectTargetAndSourceTransactionsForMerge,
    shouldNavigateToReceiptReview,
} from '@libs/MergeTransactionUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import createRandomMergeTransaction from '../utils/collections/mergeTransaction';
import {createRandomReport} from '../utils/collections/reports';
import createRandomTransaction, {createRandomDistanceRequestTransaction} from '../utils/collections/transaction';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Mock localeCompare function for tests
const mockLocaleCompare = (a: string, b: string) => a.localeCompare(b);

describe('MergeTransactionUtils', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    describe('shouldNavigateToReceiptReview', () => {
        it('should return false when any transaction has no receipt', () => {
            // Given transactions where one has no receipt
            const transaction1 = {
                ...createRandomTransaction(0),
                receipt: {receiptID: 123},
            };
            const transaction2 = {
                ...createRandomTransaction(1),
                receipt: undefined,
            };
            const transactions = [transaction1, transaction2];

            // When we check if should navigate to receipt review
            const result = shouldNavigateToReceiptReview(transactions);

            // Then it should return false because not all transactions have receipts
            expect(result).toBe(false);
        });

        it('should return true when all transactions have receipts with receiptIDs', () => {
            // Given transactions where all have receipts with receiptIDs
            const transaction1 = {
                ...createRandomTransaction(0),
                receipt: {receiptID: 123},
            };
            const transaction2 = {
                ...createRandomTransaction(1),
                receipt: {receiptID: 456},
            };
            const transactions = [transaction1, transaction2];

            // When we check if should navigate to receipt review
            const result = shouldNavigateToReceiptReview(transactions);

            // Then it should return true because all transactions have valid receipts
            expect(result).toBe(true);
        });

        it('should return false when both transactions are distance requests', () => {
            // Given two distance request transactions (with or without receipts)
            const distanceTransaction1 = {
                ...createRandomDistanceRequestTransaction(0),
                receipt: {receiptID: 333},
            };
            const distanceTransaction2 = {
                ...createRandomDistanceRequestTransaction(1),
                receipt: {receiptID: 444},
            };

            const transactions = [distanceTransaction1, distanceTransaction2];

            // When we check if should navigate to receipt review
            const result = shouldNavigateToReceiptReview(transactions);

            // Then it should return false because distance requests skip receipt review
            expect(result).toBe(false);
        });
    });

    describe('getMergeFieldValue', () => {
        it('should return empty string when transaction is undefined', () => {
            // Given an undefined transaction
            const transactionDetails = undefined;
            const transaction = undefined;

            // When we try to get a merge field value
            const result = getMergeFieldValue(transactionDetails, transaction, 'merchant');

            // Then it should return an empty string because the transaction is undefined
            expect(result).toBe('');
        });

        it('should return merchant value from transaction', () => {
            // Given a transaction with a merchant value
            const transaction = {
                ...createRandomTransaction(0),
                merchant: 'Test Merchant',
                modifiedMerchant: 'Test Merchant',
            };

            // When we get the merchant field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'merchant');

            // Then it should return the merchant value from the transaction
            expect(result).toBe('Test Merchant');
        });

        it('should return category value from transaction', () => {
            // Given a transaction with a category value
            const transaction = {
                ...createRandomTransaction(0),
                category: 'Food',
            };

            // When we get the category field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'category');

            // Then it should return the category value from the transaction
            expect(result).toBe('Food');
        });

        it('should handle amount field for unreported expense correctly', () => {
            // Given a transaction that is an unreported expense (no reportID or unreported reportID)
            const transaction = {
                ...createRandomTransaction(0),
                amount: -1000, // Stored as negative
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            };

            // When we get the amount field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'amount');

            // Then it should return the amount as positive because it's an unreported expense
            expect(result).toBe(1000);
        });

        it('should return empty string when merchant is missing', () => {
            // Given a transaction with a missing merchant
            const transaction = {...createRandomTransaction(0), merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT, modifiedMerchant: ''};

            // When we get the merchant field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'merchant');

            // Then it should return an empty string because the merchant is missing
            expect(result).toBe('');
        });
    });

    describe('getMergeFieldTranslationKey', () => {
        it('should return correct translation key for amount field', () => {
            // When we get the translation key for amount field
            const result = getMergeFieldTranslationKey('amount');

            // Then it should return the correct translation key for amount
            expect(result).toBe('iou.amount');
        });

        it('should return correct translation key for merchant field', () => {
            // When we get the translation key for merchant field
            const result = getMergeFieldTranslationKey('merchant');

            // Then it should return the correct translation key for merchant
            expect(result).toBe('common.merchant');
        });

        it('should return correct translation key for category field', () => {
            // When we get the translation key for category field
            const result = getMergeFieldTranslationKey('category');

            // Then it should return the correct translation key for category
            expect(result).toBe('common.category');
        });

        it('should return correct translation key for description field', () => {
            // When we get the translation key for description field
            const result = getMergeFieldTranslationKey('description');

            // Then it should return the correct translation key for description
            expect(result).toBe('common.description');
        });

        it('should return correct translation key for reimbursable field', () => {
            // When we get the translation key for reimbursable field
            const result = getMergeFieldTranslationKey('reimbursable');

            // Then it should return the correct translation key for reimbursable
            expect(result).toBe('common.reimbursable');
        });

        it('should return correct translation key for billable field', () => {
            // When we get the translation key for billable field
            const result = getMergeFieldTranslationKey('billable');

            // Then it should return the correct translation key for billable
            expect(result).toBe('common.billable');
        });
    });

    describe('isEmptyMergeValue', () => {
        it('should return true for null value', () => {
            // Given a null value
            const value = null;

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return true because null is considered empty
            expect(result).toBe(true);
        });

        it('should return true for undefined value', () => {
            // Given an undefined value
            const value = undefined;

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return true because undefined is considered empty
            expect(result).toBe(true);
        });

        it('should return true for empty string', () => {
            // Given an empty string
            const value = '';

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return true because empty string is considered empty
            expect(result).toBe(true);
        });

        it('should return false for false boolean value', () => {
            // Given a false boolean value
            const value = false;

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return false because false is a valid value, not empty
            expect(result).toBe(false);
        });

        it('should return false for zero number', () => {
            // Given a zero number value
            const value = 0;

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return false because zero is a valid number, not empty
            expect(result).toBe(false);
        });

        it('should return false for non-empty string', () => {
            // Given a non-empty string
            const value = 'test';

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return false because the string has content
            expect(result).toBe(false);
        });

        it('should return true for empty array', () => {
            // Given an empty array
            const value: unknown[] = [];

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return true because empty array is considered empty
            expect(result).toBe(true);
        });

        it('should return false for non-empty array', () => {
            // Given a non-empty array
            const value: unknown[] = [1, 2, 3];

            // When we check if it's empty
            const result = isEmptyMergeValue(value);

            // Then it should return false because the array has content
            expect(result).toBe(false);
        });
    });

    describe('getMergeableDataAndConflictFields', () => {
        it('should merge matching values and identify conflicts for different ones', () => {
            // When target and source have some same, and some different values
            const targetTransaction = {
                ...createRandomTransaction(0),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                merchant: 'Same Merchant',
                modifiedMerchant: 'Same Merchant',
                category: 'Food',
                tag: '', // Empty
                comment: {comment: 'Different description 1'},
                reimbursable: true,
                billable: false,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                created: '2025-01-01T00:00:00.000Z',
            };
            const sourceTransaction = {
                ...createRandomTransaction(1),
                amount: 1000, // Same amount but different currency
                currency: CONST.CURRENCY.AUD,
                merchant: '', // Empty
                modifiedMerchant: '',
                category: 'Food', // Same
                tag: 'Same Tag', // Have value
                comment: {comment: 'Different description 2'}, // Different
                reimbursable: false, // Different
                billable: undefined, // Undefined value
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                created: '2025-01-02T00:00:00.000Z',
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            // Only the different values are in the conflict fields
            expect(result.conflictFields).toEqual(['amount', 'created', 'description', 'reimbursable', 'reportID']);

            // The same values or either target or source has value are in the mergeable data
            expect(result.mergeableData).toEqual({
                merchant: 'Same Merchant',
                category: 'Food',
                tag: 'Same Tag',
                billable: false,
                attendees: [],
            });
        });

        it('should merge amount field correctly when they are same', () => {
            const targetTransaction = {
                ...createRandomTransaction(1),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };
            const sourceTransaction = {
                ...createRandomTransaction(2),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            expect(result.conflictFields).not.toContain('amount');
            expect(result.mergeableData).toMatchObject({
                amount: 1000, // Unreported expenses return positive values
            });
        });

        it('should merge amount field when target transaction is card transaction', () => {
            const targetTransaction = {
                ...createRandomTransaction(1),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                managedCard: true,
            };
            const sourceTransaction = {
                ...createRandomTransaction(2),
                amount: 1000,
                currency: CONST.CURRENCY.AUD,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            expect(result.conflictFields).not.toContain('amount');
            expect(result.mergeableData).toMatchObject({
                amount: 1000, // Card transactions also return positive values when unreported
                currency: CONST.CURRENCY.USD,
            });
        });

        it('should keep card expense when merging split and card expenses', () => {
            const targetTransaction = {
                ...createRandomTransaction(1),
                amount: 2000,
                currency: CONST.CURRENCY.AUD,
                managedCard: true,
            };
            const sourceTransaction = {
                ...createRandomTransaction(2),
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    ...createRandomTransaction(1).comment,
                    originalTransactionID: 'original-split-transaction-123',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            expect(result.conflictFields).not.toContain('amount');
            expect(result.mergeableData).toMatchObject({
                amount: targetTransaction.amount,
                currency: targetTransaction.currency,
            });
        });

        it('should keep split expense when merging split and cash expenses', () => {
            const targetTransaction = {
                ...createRandomTransaction(1),
                reportID: CONST.REPORT.SPLIT_REPORT_ID,
                amount: 1000,
                currency: CONST.CURRENCY.USD,
                comment: {
                    ...createRandomTransaction(1).comment,
                    originalTransactionID: 'original-split-transaction-123',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            };
            const sourceTransaction = {
                ...createRandomTransaction(2),
                amount: 2000,
                currency: CONST.CURRENCY.AUD,
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            expect(result.conflictFields).not.toContain('amount');
            expect(result.mergeableData).toMatchObject({
                amount: targetTransaction.amount,
                currency: targetTransaction.currency,
                originalTransactionID: targetTransaction.comment?.originalTransactionID,
            });
        });

        describe('merge attendees', () => {
            it('should automatically merge attendees when they are the same', () => {
                const targetTransaction = {
                    ...createRandomTransaction(0),
                    comment: {
                        ...createRandomTransaction(0).comment,
                        attendees: [
                            {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                            {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                        ],
                    },
                };
                const sourceTransaction = {
                    ...createRandomTransaction(1),
                    comment: {
                        ...createRandomTransaction(1).comment,
                        attendees: [
                            {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                            {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                        ],
                    },
                };

                const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

                expect(result.conflictFields).not.toContain('attendees');
                expect(result.mergeableData).toMatchObject({
                    attendees: [
                        {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                        {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                    ],
                });
            });

            it('should automatically merge attendees when they are same but just order is different', () => {
                const targetTransaction = {
                    ...createRandomTransaction(0),
                    comment: {
                        ...createRandomTransaction(0).comment,
                        attendees: [
                            {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                            {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                        ],
                    },
                };
                const sourceTransaction = {
                    ...createRandomTransaction(1),
                    comment: {
                        ...createRandomTransaction(1).comment,
                        attendees: [
                            {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                            {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                        ],
                    },
                };

                const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

                expect(result.conflictFields).not.toContain('attendees');
                expect(result.mergeableData).toMatchObject({
                    attendees: [
                        {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                        {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                    ],
                });
            });

            it('should conflict when attendees are different', () => {
                const targetTransaction = {
                    ...createRandomTransaction(0),
                    comment: {
                        ...createRandomTransaction(0).comment,
                        attendees: [
                            {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                            {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                        ],
                    },
                };
                const sourceTransaction = {
                    ...createRandomTransaction(1),
                    comment: {
                        ...createRandomTransaction(1).comment,
                        attendees: [
                            {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                            {email: 'test3@example.com', displayName: 'Test User 3', avatarUrl: '', login: 'test3'},
                        ],
                    },
                };

                const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

                expect(result.conflictFields).toContain('attendees');
            });
        });

        it('auto-merges reportID and populates reportName when reportIDs match', () => {
            const sharedReportID = 'R123';
            const targetTransaction = {
                ...createRandomTransaction(10),
                reportID: sharedReportID,
                reportName: 'Shared Report Name',
            };
            const sourceTransaction = {
                ...createRandomTransaction(11),
                reportID: sharedReportID,
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            expect(result.conflictFields).not.toContain('reportID');
            expect(result.mergeableData).toMatchObject({
                reportID: sharedReportID,
                reportName: 'Shared Report Name',
            });
        });
    });

    describe('buildMergedTransactionData', () => {
        it('should build merged transaction data correctly', () => {
            const targetTransaction = {
                ...createRandomTransaction(0),
                amount: 1000,
                merchant: 'Original Merchant',
                category: 'Original Category',
                tag: 'Original Tag',
                comment: {
                    comment: 'Original description',
                    waypoints: {waypoint0: {name: 'Original waypoint'}},
                },
                reimbursable: true,
                billable: false,
                receipt: {receiptID: 1234, source: 'original.jpg', filename: 'original.jpg'},
            };

            const mergeTransaction = {
                ...createRandomMergeTransaction(0),
                amount: 2000,
                merchant: 'Merged Merchant',
                category: 'Merged Category',
                tag: 'Merged Tag',
                description: 'Merged description',
                reimbursable: false,
                billable: true,
                receipt: {receiptID: 1235, source: 'merged.jpg', filename: 'merged.jpg'},
                created: '2025-01-02T00:00:00.000Z',
                reportID: '1',
                reportName: 'Test Report',
                waypoints: {waypoint0: {name: 'Selected waypoint'}},
                customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE, customUnitID: 'distance1', quantity: 100},
            };

            const result = buildMergedTransactionData(targetTransaction, mergeTransaction);

            // The result should be the target transaction with the merge transaction updates
            expect(result).toEqual({
                ...targetTransaction,
                amount: 2000,
                modifiedAmount: 2000,
                merchant: 'Merged Merchant',
                modifiedMerchant: 'Merged Merchant',
                modifiedCurrency: 'USD',
                category: 'Merged Category',
                tag: 'Merged Tag',
                comment: {
                    ...targetTransaction.comment,
                    comment: 'Merged description',
                    customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE, customUnitID: 'distance1', quantity: 100},
                    waypoints: {waypoint0: {name: 'Selected waypoint'}},
                },
                reimbursable: false,
                billable: true,
                receipt: {receiptID: 1235, source: 'merged.jpg', filename: 'merged.jpg'},
                created: '2025-01-02T00:00:00.000Z',
                modifiedCreated: '2025-01-02T00:00:00.000Z',
                reportID: '1',
                reportName: 'Test Report',
            });
        });
    });

    describe('selectTargetAndSourceTransactionsForMerge', () => {
        it('should handle undefined transactions gracefully', () => {
            const result = selectTargetAndSourceTransactionsForMerge(undefined, undefined);

            expect(result).toEqual({
                targetTransaction: undefined,
                sourceTransaction: undefined,
            });
        });

        it('should make card transaction the target when 2nd transaction is card transaction', () => {
            const cashTransaction = {
                ...createRandomTransaction(0),
                transactionID: 'cash1',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const cardTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'card1',
                managedCard: true,
            };

            const result = selectTargetAndSourceTransactionsForMerge(cashTransaction, cardTransaction);

            expect(result).toEqual({
                targetTransaction: cardTransaction,
                sourceTransaction: cashTransaction,
            });
        });

        it('should keep original order when 1st transaction is card transaction', () => {
            const cardTransaction = {
                ...createRandomTransaction(0),
                transactionID: 'card1',
                managedCard: true,
            };
            const cashTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'cash1',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };

            const result = selectTargetAndSourceTransactionsForMerge(cardTransaction, cashTransaction);

            expect(result).toEqual({
                targetTransaction: cardTransaction,
                sourceTransaction: cashTransaction,
            });
        });

        it('should keep original order when both are cash transactions', () => {
            const cashTransaction1 = {
                ...createRandomTransaction(0),
                transactionID: 'cash1',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const cashTransaction2 = {
                ...createRandomTransaction(1),
                transactionID: 'cash2',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };

            const result = selectTargetAndSourceTransactionsForMerge(cashTransaction1, cashTransaction2);

            expect(result).toEqual({
                targetTransaction: cashTransaction1,
                sourceTransaction: cashTransaction2,
            });
        });

        it('should keep split expense when merging split and cash expenses', () => {
            const cashTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'cash1',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const splitExpenseTransaction = {
                ...createRandomTransaction(0),
                transactionID: 'split1',
                comment: {
                    ...createRandomTransaction(0).comment,
                    originalTransactionID: 'original-split-transaction',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            };

            const result = selectTargetAndSourceTransactionsForMerge(cashTransaction, splitExpenseTransaction);

            expect(result).toEqual({
                targetTransaction: splitExpenseTransaction,
                sourceTransaction: cashTransaction,
            });
        });

        it('should keep card expense when merging split and card expenses', () => {
            const cardTransaction = {
                ...createRandomTransaction(1),
                transactionID: 'card1',
                managedCard: true,
            };
            const splitExpenseTransaction = {
                ...createRandomTransaction(0),
                transactionID: 'split1',
                comment: {
                    ...createRandomTransaction(0).comment,
                    originalTransactionID: 'original-split-transaction',
                    source: CONST.IOU.TYPE.SPLIT,
                },
            };

            const result = selectTargetAndSourceTransactionsForMerge(splitExpenseTransaction, cardTransaction);

            expect(result).toEqual({
                targetTransaction: cardTransaction,
                sourceTransaction: splitExpenseTransaction,
            });
        });
    });

    describe('getDisplayValue', () => {
        it('should return empty string for empty values', () => {
            // Given a transaction with empty merchant
            const transaction = {
                ...createRandomTransaction(0),
                merchant: '',
                modifiedMerchant: '',
            };

            // When we get display value for merchant
            const result = getDisplayValue('merchant', transaction, translateLocal);

            // Then it should return empty string
            expect(result).toBe('');
        });

        it('should return "Yes"/"No" for boolean values', () => {
            // Given a transaction with boolean fields
            const transaction = {
                ...createRandomTransaction(0),
                reimbursable: true,
                billable: false,
            };

            // When we get display values for boolean fields
            const reimbursableResult = getDisplayValue('reimbursable', transaction, translateLocal);
            const billableResult = getDisplayValue('billable', transaction, translateLocal);

            // Then it should return translated Yes/No values
            expect(reimbursableResult).toBe('common.yes');
            expect(billableResult).toBe('common.no');
        });

        it('should format amount with currency', () => {
            // Given a transaction with amount and USD currency
            const transaction = {
                ...createRandomTransaction(0),
                amount: -1000,
                currency: CONST.CURRENCY.USD,
            };

            // When we get display value for amount
            const result = getDisplayValue('amount', transaction, translateLocal);

            // Then it should return formatted currency string
            expect(result).toBe('$10.00');
        });

        it('should clean HTML and line breaks from description', () => {
            // Given a transaction with HTML description containing line breaks
            const transaction = {
                ...createRandomTransaction(0),
                comment: {
                    comment: '<p>This is a <strong>test</strong> description</p>\nwith line breaks\r\nand more text',
                },
            };

            // When we get display value for description
            const result = getDisplayValue('description', transaction, translateLocal);

            // Then it should return cleaned text without HTML and with spaces instead of line breaks
            expect(result).toBe('This is a test description with line breaks and more text');
        });

        it('should sanitize tag with colons', () => {
            // Given a transaction with tag containing colons
            const transaction = {
                ...createRandomTransaction(0),
                tag: 'Department::Engineering::Frontend',
            };

            // When we get display value for tag
            const result = getDisplayValue('tag', transaction, translateLocal);

            // Then it should return sanitized tag names separated by commas
            expect(result).toBe('Department, Engineering, Frontend');
        });

        it('should return correct value for attendees field', () => {
            const transaction = {
                ...createRandomTransaction(0),
                comment: {
                    ...createRandomTransaction(0).comment,
                    attendees: [
                        {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                        {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                    ],
                },
            };
            const result = getDisplayValue('attendees', transaction, translateLocal);

            expect(result).toBe('Test User 2, Test User 1');
        });

        it('should return string values directly', () => {
            // Given a transaction with string fields
            const transaction = {
                ...createRandomTransaction(0),
                merchant: 'Starbucks Coffee',
                modifiedMerchant: '',
                category: 'Food & Dining',
            };

            // When we get display values for string fields
            const merchantResult = getDisplayValue('merchant', transaction, translateLocal);
            const categoryResult = getDisplayValue('category', transaction, translateLocal);

            // Then it should return the string values
            expect(merchantResult).toBe('Starbucks Coffee');
            expect(categoryResult).toBe('Food & Dining');
        });

        it('should return "None" for unreported reportID', () => {
            // Given a transaction with unreported reportID
            const transaction = {
                ...createRandomTransaction(0),
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            };

            // When we get display value for reportID
            const result = getDisplayValue('reportID', transaction, translateLocal);

            // Then it should return translated "None"
            expect(result).toBe('common.none');
        });

        it("should return transaction's reportName when available for reportID", () => {
            // Given a transaction with reportID and reportName
            const transaction = {
                ...createRandomTransaction(0),
                reportID: '123',
                reportName: 'Test Report Name',
            };

            // When we get display value for reportID
            const result = getDisplayValue('reportID', transaction, translateLocal);

            // Then it should return the reportName
            expect(result).toBe('Test Report Name');
        });

        it("should return report's name when no reportName available on transaction", async () => {
            // Given a random report
            const reportID = 456;
            const report = {
                ...createRandomReport(reportID, undefined),
                reportName: 'Test Report Name',
            };

            // Store the report in Onyx
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
            await waitForBatchedUpdates();

            // Given a transaction with reportID but no reportName
            const transaction = {
                ...createRandomTransaction(0),
                reportID: report.reportID,
                reportName: undefined,
            };

            // When we get display value for reportID
            const result = getDisplayValue('reportID', transaction, translateLocal);

            // Then it should return the report's name from Onyx
            expect(result).toBe(report.reportName);
        });
    });

    describe('getMergeFieldUpdatedValues', () => {
        it('should return updated values with the field value for non-special fields', () => {
            // Given a transaction and a basic field like merchant
            const transaction = {
                ...createRandomTransaction(0),
            };
            const fieldValue = 'New Merchant Name';

            // When we get updated values for merchant field
            const result = getMergeFieldUpdatedValues(transaction, 'merchant', fieldValue);

            // Then it should return an object with the field value
            expect(result).toEqual({
                merchant: 'New Merchant Name',
            });
        });

        it('should include currency when field is amount', () => {
            // Given a transaction with EUR currency
            const transaction = {
                ...createRandomTransaction(0),
                currency: CONST.CURRENCY.EUR,
            };
            const fieldValue = 2500;

            // When we get updated values for amount field
            const result = getMergeFieldUpdatedValues(transaction, 'amount', fieldValue);

            // Then it should include both amount and currency
            expect(result).toEqual({
                amount: 2500,
                currency: CONST.CURRENCY.EUR,
            });
        });

        it('should include reportName when field is reportID', () => {
            // Given a transaction with a reportID and reportName
            const transaction = {
                ...createRandomTransaction(0),
                reportID: '123',
                reportName: 'Test Report',
            };
            const fieldValue = '456';

            // When we get updated values for reportID field
            const result = getMergeFieldUpdatedValues(transaction, 'reportID', fieldValue);

            // Then it should include both reportID and reportName
            expect(result).toEqual({
                reportID: '456',
                reportName: 'Test Report',
            });
        });

        it('should include additional fields when merchant field is selected for distance request', () => {
            // Given a distance request transaction
            const transaction = {
                ...createRandomDistanceRequestTransaction(0),
                currency: CONST.CURRENCY.USD,
                amount: 2500,
                receipt: {receiptID: 123, source: 'receipt.jpg'},
                comment: {
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitID: 'unit123',
                        quantity: 25.5,
                    },
                    waypoints: {
                        waypoint0: {name: 'Start Location', address: '123 Start St'},
                        waypoint1: {name: 'End Location', address: '456 End Ave'},
                    },
                },
            };
            const fieldValue = 'New Distance Merchant';

            // When we get updated values for merchant field
            const result = getMergeFieldUpdatedValues(transaction, 'merchant', fieldValue);

            // Then it should include merchant plus all distance-specific fields
            expect(result).toEqual({
                merchant: 'New Distance Merchant',
                amount: -2500,
                currency: CONST.CURRENCY.USD,
                receipt: {receiptID: 123, source: 'receipt.jpg'},
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    customUnitID: 'unit123',
                    quantity: 25.5,
                },
                waypoints: {
                    waypoint0: {name: 'Start Location', address: '123 Start St'},
                    waypoint1: {name: 'End Location', address: '456 End Ave'},
                },
                routes: null,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            });
        });
    });

    describe('getMergeFieldErrorText', () => {
        it('should return specific error message for attendees field', () => {
            // Given a merge field data object for attendees field
            const mergeField = {
                field: 'attendees' as const,
                label: 'Attendees',
                options: [],
            };

            // When we get the error text for attendees field
            const result = getMergeFieldErrorText(translateLocal, mergeField);

            // Then it should return the specific attendees error message
            expect(result).toBe(translateLocal('transactionMerge.detailsPage.pleaseSelectAttendees'));
        });

        it('should return generic error message for merchant field', () => {
            // Given a merge field data object for merchant field
            const mergeField = {
                field: 'merchant' as const,
                label: 'Merchant',
                options: [],
            };

            // When we get the error text for merchant field
            const result = getMergeFieldErrorText(translateLocal, mergeField);

            // Then it should return the generic error message with lowercase field name
            expect(result).toBe(translateLocal('transactionMerge.detailsPage.pleaseSelectError', {field: 'merchant'}));
        });
    });

    describe('areTransactionsEligibleForMerge', () => {
        it('should return false when either transaction is undefined', () => {
            // Given one transaction is undefined
            const transaction = createRandomTransaction(0);

            // When we check if they are eligible for merge
            const result1 = areTransactionsEligibleForMerge(undefined, transaction);
            const result2 = areTransactionsEligibleForMerge(transaction, undefined);
            const result3 = areTransactionsEligibleForMerge(undefined, undefined);

            // Then it should return false because both transactions are required
            expect(result1).toBe(false);
            expect(result2).toBe(false);
            expect(result3).toBe(false);
        });

        it('should return false when source transaction is pending delete', () => {
            // Given transactions where source is pending delete
            const targetTransaction = {
                ...createRandomTransaction(0),
            };
            const sourceTransaction = {
                ...createRandomTransaction(1),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(targetTransaction, sourceTransaction);

            // Then it should return false because source transaction is pending delete
            expect(result).toBe(false);
        });

        it('should return true if both transactions are cash', () => {
            // Given both transactions are cash transactions
            const transaction1 = {
                ...createRandomTransaction(0),
                merchant: 'Starbucks Coffee',
                modifiedMerchant: '',
                category: 'Food & Dining',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            };
            const transaction2 = {
                ...createRandomTransaction(1),
                merchant: 'Caribou Coffee',
                modifiedMerchant: '',
                category: 'Food & Dining',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(transaction1, transaction2);

            // Then it should return true because both are cash transactions
            expect(result).toBe(true);
        });

        it('should return true if one transaction is cash and one is card', () => {
            // Given one cash and one card transaction
            const cashTransaction = {
                ...createRandomTransaction(0),
                merchant: 'Starbucks Coffee',
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
            };
            const cardTransaction = {
                ...createRandomTransaction(1),
                merchant: 'Caribou Coffee',
                managedCard: true,
            };

            // When we check if they are eligible for merge
            const result1 = areTransactionsEligibleForMerge(cashTransaction, cardTransaction);
            const result2 = areTransactionsEligibleForMerge(cardTransaction, cashTransaction);

            // Then it should return true for both orders
            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });

        it('should return false if both transactions are from a card', () => {
            // Given both transactions are card transactions
            const transaction1 = {
                ...createRandomTransaction(0),
                merchant: 'Starbucks Coffee',
                modifiedMerchant: '',
                category: 'Food & Dining',
                managedCard: true,
                comment: {},
            };
            const transaction2 = {
                ...createRandomTransaction(1),
                merchant: 'Caribou Coffee',
                modifiedMerchant: '',
                category: 'Food & Dining',
                managedCard: true,
                comment: {},
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(transaction1, transaction2);

            // Then it should return false because both are card transactions
            expect(result).toBe(false);
        });

        it('should return false if both transactions have $0 amount', () => {
            // Given both transactions have $0 amount
            const transaction1 = {
                ...createRandomTransaction(0),
                amount: 0,
            };
            const transaction2 = {
                ...createRandomTransaction(1),
                amount: 0,
            };

            // When we check if they are eligible for merge
            const result = areTransactionsEligibleForMerge(transaction1, transaction2);

            // Then it should return false because both have $0 amount
            expect(result).toBe(false);
        });

        it('should return true if only one transaction has $0 amount', () => {
            // Given one transaction has $0 amount and the other has a non-zero amount
            const zeroTransaction = {
                ...createRandomTransaction(0),
                amount: 0,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            };
            const nonZeroTransaction = {
                ...createRandomTransaction(1),
                amount: 1000,
                managedCard: false,
                cardName: CONST.EXPENSE.TYPE.CASH_CARD_NAME,
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            };

            // When we check if they are eligible for merge
            const result1 = areTransactionsEligibleForMerge(zeroTransaction, nonZeroTransaction);
            const result2 = areTransactionsEligibleForMerge(nonZeroTransaction, zeroTransaction);

            // Then it should return true for both orders
            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });

        it('should return false if per diem transaction is merged with card transaction', () => {
            // Given a per diem transaction and a card transaction
            const perDiemTransaction = {
                ...createRandomTransaction(0),
                comment: {
                    type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                    customUnit: {
                        name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    },
                },
            };
            const cardTransaction = {
                ...createRandomTransaction(1),
                managedCard: true,
            };

            // When we check if they are eligible for merge
            const result1 = areTransactionsEligibleForMerge(perDiemTransaction, cardTransaction);
            const result2 = areTransactionsEligibleForMerge(cardTransaction, perDiemTransaction);

            // Then it should return false for both orders
            expect(result1).toBe(false);
            expect(result2).toBe(false);
        });
    });

    describe('getRateFromMerchant', () => {
        it('should return empty string for undefined merchant', () => {
            // Given an undefined merchant
            const merchant = undefined;

            // When we get rate from merchant
            const result = getRateFromMerchant(merchant);

            // Then it should return empty string
            expect(result).toBe('');
        });

        it('should extract rate from distance merchant string', () => {
            // Given a distance merchant string with rate
            const merchant = '5.2 mi @ $0.50 / mi';

            // When we get rate from merchant
            const result = getRateFromMerchant(merchant);

            // Then it should return the rate portion
            expect(result).toBe('$0.50 / mi');
        });
    });
});
