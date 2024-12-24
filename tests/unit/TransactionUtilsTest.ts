import CONST from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {Policy, Transaction} from '../../src/types/onyx';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../utils/collections/policies';

function generateTransaction(values: Partial<Transaction> = {}): Transaction {
    const reportID = '1';
    const amount = 100;
    const currency = 'USD';
    const comment = '';
    const attendees: Attendee[] = [];
    const created = '2023-10-01';
    const baseValues = TransactionUtils.buildOptimisticTransaction({
        transactionParams: {
            amount,
            currency,
            reportID,
            comment,
            attendees,
            created,
        },
    });

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

                const result = TransactionUtils.getFormattedCreated(transaction);

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

                    const result = TransactionUtils.getFormattedCreated(transaction);

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

                    const result = TransactionUtils.getFormattedCreated(transaction);

                    expect(result).toEqual(expectedResult);
                });
            });
        });
    });
    describe('getPostedDate', () => {
        describe('when posted date is undefined', () => {
            const transaction = generateTransaction({
                posted: undefined,
            });

            it('returns an empty string', () => {
                const expectedResult = '';

                const result = TransactionUtils.getFormattedPostedDate(transaction);

                expect(result).toEqual(expectedResult);
            });
        });

        describe('when posted date has value with format YYYYMMdd', () => {
            const transaction = generateTransaction({
                posted: '20241125',
            });

            it('returns the posted date with the correct format YYYY-MM-dd', () => {
                const expectedResult = '2024-11-25';

                const result = TransactionUtils.getFormattedPostedDate(transaction);

                expect(result).toEqual(expectedResult);
            });
        });
    });

    describe('getCategoryTaxCodeAndAmount', () => {
        it('should return the associated tax when the category matches the tax expense rules', () => {
            // Given a policy with tax expense rules associated with a category
            const category = 'Advertising';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, 'id_TAX_RATE_1')},
            };

            // When retrieving the tax from the associated category
            const transaction = generateTransaction();
            const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy);

            // Then it should return the associated tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_RATE_1');
            expect(categoryTaxAmount).toBe(5);
        });

        it("should return the default tax when the category doesn't match the tax expense rules", () => {
            // Given a policy with tax expense rules associated with a category
            const ruleCategory = 'Advertising';
            const selectedCategory = 'Benefits';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(ruleCategory, 'id_TAX_RATE_1')},
            };

            // When retrieving the tax from a category that is not associated with the tax expense rules
            const transaction = generateTransaction();
            const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(selectedCategory, transaction, fakePolicy);

            // Then it should return the default tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_EXEMPT');
            expect(categoryTaxAmount).toBe(0);
        });

        it('should return and undefined tax when there are no policy tax expense rules', () => {
            // Given a policy without tax expense rules
            const category = 'Advertising';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                taxRates: CONST.DEFAULT_TAX,
                rules: {},
            };

            // When retrieving the tax from a category
            const transaction = generateTransaction();
            const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy);

            // Then it should return undefined for both the tax code and the tax amount
            expect(categoryTaxCode).toBe(undefined);
            expect(categoryTaxAmount).toBe(undefined);
        });
    });
});
