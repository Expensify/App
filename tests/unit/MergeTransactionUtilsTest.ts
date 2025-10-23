// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import {
    buildMergedTransactionData,
    getDisplayValue,
    getMergeableDataAndConflictFields,
    getMergeFieldErrorText,
    getMergeFieldTranslationKey,
    getMergeFieldValue,
    getSourceTransactionFromMergeTransaction,
    isEmptyMergeValue,
    selectTargetAndSourceTransactionsForMerge,
    shouldNavigateToReceiptReview,
} from '@libs/MergeTransactionUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import createRandomMergeTransaction from '../utils/collections/mergeTransaction';
import createRandomTransaction from '../utils/collections/transaction';

// Mock localeCompare function for tests
const mockLocaleCompare = (a: string, b: string) => a.localeCompare(b);

describe('MergeTransactionUtils', () => {
    describe('getSourceTransactionFromMergeTransaction', () => {
        it('should return undefined when mergeTransaction is undefined', () => {
            // Given a null merge transaction
            const mergeTransaction = undefined;

            // When we try to get the source transaction
            const result = getSourceTransactionFromMergeTransaction(mergeTransaction);

            // Then it should return undefined because the merge transaction is undefined
            expect(result).toBeUndefined();
        });

        it('should return undefined when sourceTransactionID is not found in eligibleTransactions', () => {
            // Given a merge transaction with a sourceTransactionID that doesn't match any eligible transactions
            const transaction1 = createRandomTransaction(0);
            const transaction2 = createRandomTransaction(1);
            const mergeTransaction = {
                ...createRandomMergeTransaction(0),
                sourceTransactionID: 'nonexistent',
                eligibleTransactions: [transaction1, transaction2],
            };

            // When we try to get the source transaction
            const result = getSourceTransactionFromMergeTransaction(mergeTransaction);

            // Then it should return undefined because the source transaction ID doesn't match any eligible transaction
            expect(result).toBeUndefined();
        });

        it('should return the correct transaction when sourceTransactionID matches an eligible transaction', () => {
            // Given a merge transaction with a sourceTransactionID that matches one of the eligible transactions
            const sourceTransaction = {...createRandomTransaction(0), receipt: undefined};
            const otherTransaction = createRandomTransaction(1);
            sourceTransaction.transactionID = 'source123';

            const mergeTransaction = {
                ...createRandomMergeTransaction(0),
                sourceTransactionID: 'source123',
                eligibleTransactions: [sourceTransaction, otherTransaction],
            };

            // When we try to get the source transaction
            const result = getSourceTransactionFromMergeTransaction(mergeTransaction);

            // Then it should return the matching transaction from the eligible transactions
            expect(result).toBe(sourceTransaction);
            expect(result?.transactionID).toBe('source123');
        });
    });

    describe('shouldNavigateToReceiptReview', () => {
        it('should return false when any transaction has no receipt', () => {
            // Given transactions where one has no receipt
            const transaction1 = createRandomTransaction(0);
            const transaction2 = createRandomTransaction(1);
            transaction1.receipt = {receiptID: 123};
            transaction2.receipt = undefined;
            const transactions = [transaction1, transaction2];

            // When we check if should navigate to receipt review
            const result = shouldNavigateToReceiptReview(transactions);

            // Then it should return false because not all transactions have receipts
            expect(result).toBe(false);
        });

        it('should return true when all transactions have receipts with receiptIDs', () => {
            // Given transactions where all have receipts with receiptIDs
            const transaction1 = createRandomTransaction(0);
            const transaction2 = createRandomTransaction(1);
            transaction1.receipt = {receiptID: 123};
            transaction2.receipt = {receiptID: 456};
            const transactions = [transaction1, transaction2];

            // When we check if should navigate to receipt review
            const result = shouldNavigateToReceiptReview(transactions);

            // Then it should return true because all transactions have valid receipts
            expect(result).toBe(true);
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
            const transaction = createRandomTransaction(0);
            transaction.merchant = 'Test Merchant';
            transaction.modifiedMerchant = 'Test Merchant';

            // When we get the merchant field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'merchant');

            // Then it should return the merchant value from the transaction
            expect(result).toBe('Test Merchant');
        });

        it('should return category value from transaction', () => {
            // Given a transaction with a category value
            const transaction = createRandomTransaction(0);
            transaction.category = 'Food';

            // When we get the category field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'category');

            // Then it should return the category value from the transaction
            expect(result).toBe('Food');
        });

        it('should return currency value from transaction', () => {
            // Given a transaction with a currency value
            const transaction = createRandomTransaction(0);
            transaction.currency = CONST.CURRENCY.EUR;

            // When we get the currency field value
            const result = getMergeFieldValue(getTransactionDetails(transaction), transaction, 'currency');

            // Then it should return the currency value from the transaction
            expect(result).toBe(CONST.CURRENCY.EUR);
        });

        it('should handle amount field for unreported expense correctly', () => {
            // Given a transaction that is an unreported expense (no reportID or unreported reportID)
            const transaction = createRandomTransaction(0);
            transaction.amount = -1000; // Stored as negative
            transaction.reportID = CONST.REPORT.UNREPORTED_REPORT_ID;

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
            };

            const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

            expect(result.conflictFields).not.toContain('amount');
            expect(result.mergeableData).toMatchObject({
                amount: 1000, // Card transactions also return positive values when unreported
                currency: CONST.CURRENCY.USD,
            });
        });

        describe('merge attendees', () => {
            it('should automatically merge attendees when they are the same', () => {
                const targetTransaction = createRandomTransaction(0);
                targetTransaction.comment = targetTransaction.comment ?? {};
                targetTransaction.comment.attendees = [
                    {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                    {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                ];
                const sourceTransaction = createRandomTransaction(1);
                sourceTransaction.comment = sourceTransaction.comment ?? {};
                sourceTransaction.comment.attendees = [
                    {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                    {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                ];

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
                const targetTransaction = createRandomTransaction(0);
                targetTransaction.comment = targetTransaction.comment ?? {};
                targetTransaction.comment.attendees = [
                    {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                    {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                ];
                const sourceTransaction = createRandomTransaction(1);
                sourceTransaction.comment = sourceTransaction.comment ?? {};
                sourceTransaction.comment.attendees = [
                    {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                    {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                ];

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
                const targetTransaction = createRandomTransaction(0);
                targetTransaction.comment = targetTransaction.comment ?? {};
                targetTransaction.comment.attendees = [
                    {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                    {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                ];
                const sourceTransaction = createRandomTransaction(1);
                sourceTransaction.comment = sourceTransaction.comment ?? {};
                sourceTransaction.comment.attendees = [
                    {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
                    {email: 'test3@example.com', displayName: 'Test User 3', avatarUrl: '', login: 'test3'},
                ];

                const result = getMergeableDataAndConflictFields(targetTransaction, sourceTransaction, mockLocaleCompare);

                expect(result.conflictFields).toContain('attendees');
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
                },
                reimbursable: false,
                billable: true,
                filename: 'merged.jpg',
                receipt: {receiptID: 1235, source: 'merged.jpg', filename: 'merged.jpg'},
                created: '2025-01-02T00:00:00.000Z',
                modifiedCreated: '2025-01-02T00:00:00.000Z',
                reportID: '1',
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
                managedCard: undefined,
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
                managedCard: undefined,
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
                managedCard: undefined,
            };
            const cashTransaction2 = {
                ...createRandomTransaction(1),
                transactionID: 'cash2',
                managedCard: undefined,
            };

            const result = selectTargetAndSourceTransactionsForMerge(cashTransaction1, cashTransaction2);

            expect(result).toEqual({
                targetTransaction: cashTransaction1,
                sourceTransaction: cashTransaction2,
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const reimbursableResult = getDisplayValue('reimbursable', transaction, translateLocal);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const result = getDisplayValue('tag', transaction, translateLocal);

            // Then it should return sanitized tag names separated by commas
            expect(result).toBe('Department, Engineering, Frontend');
        });

        it('should return correct value for attendees field', () => {
            const transaction = createRandomTransaction(0);
            transaction.comment = transaction.comment ?? {};
            transaction.comment.attendees = [
                {email: 'test2@example.com', displayName: 'Test User 2', avatarUrl: '', login: 'test2'},
                {email: 'test1@example.com', displayName: 'Test User 1', avatarUrl: '', login: 'test1'},
            ];
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const merchantResult = getDisplayValue('merchant', transaction, translateLocal);
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const categoryResult = getDisplayValue('category', transaction, translateLocal);

            // Then it should return the string values
            expect(merchantResult).toBe('Starbucks Coffee');
            expect(categoryResult).toBe('Food & Dining');
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const result = getMergeFieldErrorText(translateLocal, mergeField);

            // Then it should return the specific attendees error message
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const result = getMergeFieldErrorText(translateLocal, mergeField);

            // Then it should return the generic error message with lowercase field name
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            expect(result).toBe(translateLocal('transactionMerge.detailsPage.pleaseSelectError', {field: 'merchant'}));
        });
    });
});
