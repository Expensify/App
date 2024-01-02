import CONST from '@src/CONST';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {Transaction} from '../../src/types/onyx';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const reportID = '1';
    const amount = 100;
    const currency = 'USD';
    const comment = '';
    const created = '2023-10-01';
    const baseValues = TransactionUtils.buildOptimisticTransaction(amount, currency, reportID, comment, created);

    return {...baseValues, ...values};
}

describe('TransactionUtils', () => {
    describe('getCreated', () => {
        describe('when the transaction property "modifiedCreated" has value', () => {
            const transaction = generateTransaction({
                created: '2023-10-01',
                modifiedCreated: '2023-10-25',
            });

            it('returns the "modifiedCreated" date with the correct format', () => {
                const expectedResult = '2023-10-25';

                const result = TransactionUtils.getCreated(transaction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the transaction property "modifiedCreated" does not have value', () => {
            describe('and the transaction property "created" has value', () => {
                const transaction = generateTransaction({
                    created: '2023-10-01',
                    modifiedCreated: undefined,
                });

                it('returns the "created" date with the correct format', () => {
                    const expectedResult = '2023-10-01';

                    const result = TransactionUtils.getCreated(transaction);

                    expect(result).toEqual(expectedResult);
                });
            });

            describe('and the transaction property "created" does not have value', () => {
                const transaction = generateTransaction({
                    created: undefined,
                    modifiedCreated: undefined,
                });

                it('returns an empty string', () => {
                    const expectedResult = '';

                    const result = TransactionUtils.getCreated(transaction);

                    expect(result).toEqual(expectedResult);
                });
            });
        });
    });

    describe('getCurrency', () => {
        describe('when the transaction has a receipt with a failed scan', () => {
            const transaction = generateTransaction({
                currency: 'BRL',
                modifiedCurrency: 'USD',
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                receipt: {
                    receiptID: 668988678,
                    state: 'OPEN',
                    source: 'https://www.expensify.com/receipts/w_1dc0503005ad60e4d34f88aeea24c4920ab2231f.png',
                },
            });

            it('returns the created currency', () => {
                const expectedResult = 'BRL';

                const result = TransactionUtils.getCurrency(transaction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when the transaction has a receipt with successful scan', () => {
            const transaction = generateTransaction({
                currency: 'BRL',
                modifiedCurrency: 'USD',
                merchant: 'Test Merchant',
                receipt: {
                    receiptID: 668988678,
                    state: 'OPEN',
                    source: 'https://www.expensify.com/receipts/w_1dc0503005ad60e4d34f88aeea24c4920ab2231f.png',
                },
            });

            it('returns the modified currency', () => {
                const expectedResult = 'USD';

                const result = TransactionUtils.getCurrency(transaction);

                expect(result).toEqual(expectedResult);
            });
        });
    });
});
