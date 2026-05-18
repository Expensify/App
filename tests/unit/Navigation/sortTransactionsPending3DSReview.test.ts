import {sortTransactionsPending3DSReview} from '@libs/Navigation/useNavigateTo3DSAuthorizationChallenge';
import type {TransactionPending3DSReview} from '@src/types/onyx';

describe('sortTransactionsPending3DSReview', () => {
    const createMockTransaction = (overrides?: Partial<TransactionPending3DSReview>): TransactionPending3DSReview => ({
        amount: 10000,
        currency: 'USD',
        merchant: 'Test Merchant',
        created: '2024-01-01T12:00:00.000Z',
        expires: '2024-01-01T12:08:00.000Z',
        lastFourPAN: '1234',
        transactionID: '123',
        ...overrides,
    });

    it('should return undefined when given an empty array', () => {
        const result = sortTransactionsPending3DSReview([]);
        expect(result).toBeUndefined();
    });

    it('should return the only transaction when given a single transaction', () => {
        const transaction = createMockTransaction();
        const result = sortTransactionsPending3DSReview([transaction]);
        expect(result).toBe(transaction);
    });

    describe('sorting by created date', () => {
        it('should return the earliest created transaction when created dates differ', () => {
            const earliestTransaction = createMockTransaction({
                transactionID: '1',
                created: '2024-01-01T10:00:00.000Z',
            });
            const laterTransaction = createMockTransaction({
                transactionID: '2',
                created: '2024-01-01T12:00:00.000Z',
            });
            const latestTransaction = createMockTransaction({
                transactionID: '3',
                created: '2024-01-01T14:00:00.000Z',
            });

            const result = sortTransactionsPending3DSReview([latestTransaction, earliestTransaction, laterTransaction]);

            expect(result).toBe(earliestTransaction);
            expect(result?.transactionID).toBe('1');
        });

        it('should handle date strings without milliseconds', () => {
            const earliestTransaction = createMockTransaction({
                transactionID: '1',
                created: '2024-01-01T10:00:00Z',
            });
            const laterTransaction = createMockTransaction({
                transactionID: '2',
                created: '2024-01-01T12:00:00Z',
            });

            const result = sortTransactionsPending3DSReview([laterTransaction, earliestTransaction]);

            expect(result).toBe(earliestTransaction);
        });

        it('should handle YYYY-MM-DD date format', () => {
            const earliestTransaction = createMockTransaction({
                transactionID: '1',
                created: '2024-01-01',
            });
            const laterTransaction = createMockTransaction({
                transactionID: '2',
                created: '2024-01-02',
            });

            const result = sortTransactionsPending3DSReview([laterTransaction, earliestTransaction]);

            expect(result).toBe(earliestTransaction);
        });
    });

    describe('sorting by expires date when created dates are equal', () => {
        it('should return the transaction with earliest expiration date when created dates are the same', () => {
            const soonestExpiringTransaction = createMockTransaction({
                transactionID: '1',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const laterExpiringTransaction = createMockTransaction({
                transactionID: '2',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:10:00.000Z',
            });
            const latestExpiringTransaction = createMockTransaction({
                transactionID: '3',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:12:00.000Z',
            });

            const result = sortTransactionsPending3DSReview([latestExpiringTransaction, soonestExpiringTransaction, laterExpiringTransaction]);

            expect(result).toBe(soonestExpiringTransaction);
            expect(result?.transactionID).toBe('1');
        });

        it('should still prioritize created date over expires date', () => {
            const earliestCreated = createMockTransaction({
                transactionID: '1',
                created: '2024-01-01T10:00:00.000Z',
                expires: '2024-01-01T12:00:00.000Z', // Latest expiration
            });
            const laterCreated = createMockTransaction({
                transactionID: '2',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T10:00:00.000Z', // Earliest expiration
            });

            const result = sortTransactionsPending3DSReview([laterCreated, earliestCreated]);

            // Should prioritize the earliest created, not the earliest expires
            expect(result).toBe(earliestCreated);
            expect(result?.transactionID).toBe('1');
        });
    });

    describe('sorting by transactionID when both created and expires dates are equal', () => {
        it('should return the transaction with lowest transactionID when created and expires dates are the same', () => {
            const transaction1 = createMockTransaction({
                transactionID: '100',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const transaction2 = createMockTransaction({
                transactionID: '200',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const transaction3 = createMockTransaction({
                transactionID: '300',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });

            const result = sortTransactionsPending3DSReview([transaction3, transaction1, transaction2]);

            expect(result).toBe(transaction1);
            expect(result?.transactionID).toBe('100');
        });

        it('should handle numeric string transaction IDs correctly', () => {
            const transaction1 = createMockTransaction({
                transactionID: '9',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const transaction2 = createMockTransaction({
                transactionID: '10',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const transaction3 = createMockTransaction({
                transactionID: '100',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });

            const result = sortTransactionsPending3DSReview([transaction3, transaction2, transaction1]);

            // Should sort numerically: 9 < 10 < 100
            expect(result).toBe(transaction1);
            expect(result?.transactionID).toBe('9');
        });
    });

    describe('complex sorting scenarios', () => {
        it('should handle a mix of different created dates, expires dates, and transaction IDs', () => {
            const transaction1 = createMockTransaction({
                transactionID: '1',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const transaction2 = createMockTransaction({
                transactionID: '2',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:09:00.000Z',
            });
            const transaction3 = createMockTransaction({
                transactionID: '3',
                created: '2024-01-01T11:00:00.000Z', // Earliest created
                expires: '2024-01-01T12:10:00.000Z',
            });

            const result = sortTransactionsPending3DSReview([transaction1, transaction2, transaction3]);

            // Should return transaction3 because it has the earliest created date
            expect(result).toBe(transaction3);
            expect(result?.transactionID).toBe('3');
        });

        it('should maintain predictable order when transactions are unsorted', () => {
            const transactions = [
                createMockTransaction({
                    transactionID: '5',
                    created: '2024-01-02T12:00:00.000Z',
                    expires: '2024-01-02T12:08:00.000Z',
                }),
                createMockTransaction({
                    transactionID: '2',
                    created: '2024-01-01T14:00:00.000Z',
                    expires: '2024-01-01T14:08:00.000Z',
                }),
                createMockTransaction({
                    transactionID: '3',
                    created: '2024-01-01T12:00:00.000Z', // Earliest
                    expires: '2024-01-01T12:08:00.000Z',
                }),
                createMockTransaction({
                    transactionID: '1',
                    created: '2024-01-01T16:00:00.000Z',
                    expires: '2024-01-01T16:08:00.000Z',
                }),
            ];

            const result = sortTransactionsPending3DSReview(transactions);

            expect(result?.transactionID).toBe('3');
        });

        it('should handle transactions without transactionID', () => {
            const transaction1 = createMockTransaction({
                transactionID: undefined,
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });
            const transaction2 = createMockTransaction({
                transactionID: '100',
                created: '2024-01-01T12:00:00.000Z',
                expires: '2024-01-01T12:08:00.000Z',
            });

            const result = sortTransactionsPending3DSReview([transaction2, transaction1]);

            // Transaction with undefined ID will be treated as NaN in Number(), which should result in consistent behavior
            expect(result).toBeDefined();
        });
    });
});
