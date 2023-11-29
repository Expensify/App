import Onyx from 'react-native-onyx';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

describe('getViolationsOnyxData', () => {
    let transaction;
    let transactionViolations;
    let policyRequiresTags;
    let policyTags;
    let policyRequiresCategories;
    let policyCategories;

    beforeEach(() => {
        transaction = {category: 'Food', tag: 'Lunch', transactionID: '123'};
        transactionViolations = [
            {name: 'duplicatedTransaction', type: 'violation', userMessage: ''},
            {name: 'receiptRequired', type: 'violation', userMessage: ''},
        ];
        policyRequiresTags = false;
        policyTags = {};
        policyRequiresCategories = true;
        policyCategories = {Food: {enabled: true}};
    });

    const execute = () => ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

    describe('ordinary operations', () => {
        it('should return an object with correct shape', () => {
            // setup test conditions
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: true}};
            // run test
            const result = execute();
            // verify results
            expect(result).toEqual({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: transactionViolations,
            });
        });

        it('should handle single violation', () => {
            // setup test conditions
            transaction.category = null;
            transaction.tag = null;
            transactionViolations = [transactionViolations[0]];
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'duplicatedTransaction',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });
    });

    describe('categories', () => {
        beforeEach(() => {
            policyRequiresCategories = true;
        });
        it('should handle policyRequiresCategories correctly when categories are enabled', () => {
            // setup test conditions
            policyCategories = {Food: {enabled: true}};
            transaction.category = 'Food';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(transactionViolations);
        });

        it('should handle missingCategory violation', () => {
            // setup test conditions
            transaction.category = null;
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'missingCategory',
                        type: 'violation',
                        userMessage: '',
                    },
                    ...transactionViolations,
                ]),
            );
        });

        it('should handle categoryOutOfPolicy violation when category does not exist', () => {
            // setup test conditions
            policyRequiresCategories = true;
            policyCategories = {};
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'categoryOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                    ...transactionViolations,
                ]),
            );
        });

        it('should handle categoryOutOfPolicy violation when category is not enabled', () => {
            // setup test conditions
            policyRequiresCategories = true;
            policyCategories = {Food: {enabled: false}};
            transaction.category = 'Food';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'categoryOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                    ...transactionViolations,
                ]),
            );
        });

        it('should handle policy with multiple categories', () => {
            // setup test conditions
            policyCategories = {Food: {enabled: true}, Drinks: {enabled: true}};
            transaction.category = 'Food';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(transactionViolations);
        });

        it('should not add a categoryOutOfPolicy violation when category is in policy', () => {
            // setup test conditions
            policyCategories = {Food: {enabled: true}};
            transaction.category = 'Food';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(transactionViolations);
        });

        it('should handle undefined or invalid category types', () => {
            // setup test conditions
            policyCategories = {Food: {enabled: true}};
            transaction.category = undefined; // or any invalid type
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'missingCategory',
                        type: 'violation',
                        userMessage: '',
                    },
                    ...transactionViolations,
                ]),
            );
        });
    });

    describe('tags', () => {
        beforeEach(() => {
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: true}};
        });

        it('should handle policyRequiresTags correctly', () => {
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(transactionViolations);
        });

        it('should handle missingTag violation', () => {
            // setup test conditions
            transaction.tag = null;
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'missingTag',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });

        it('should handle tagOutOfPolicy violation when tag does not exist', () => {
            // setup test conditions
            policyTags = {};
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'tagOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });

        it('should handle tagOutOfPolicy violation when tag is not enabled', () => {
            // setup test conditions
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: false}};
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'tagOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });

        it('should handle policy with multiple tags', () => {
            // setup test conditions
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: true}, Dinner: {enabled: true}};
            transaction.tag = 'Lunch';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(transactionViolations);
        });

        it('should not add a tagOutOfPolicy violation when tag is in policy', () => {
            // setup test conditions
            policyRequiresTags = true;
            policyTags = {Lunch: {enabled: true}};
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(transactionViolations);
        });
        it('should handle empty string for tag', () => {
            // setup test conditions
            transaction.tag = '';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'missingTag',
                        type: 'violation',
                        userMessage: '',
                    },
                    ...transactionViolations,
                ]),
            );
        });
    });

    describe('missing or invalid data', () => {
        it('should handle empty transaction', () => {
            // setup test conditions
            transaction = {};
            transactionViolations = [];
            policyRequiresCategories = undefined;
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual([]);
        });

        it('should handle nonexistent category in policy', () => {
            // setup test conditions
            transaction.category = 'Nonexistent';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(expect.arrayContaining([{name: 'categoryOutOfPolicy', type: 'violation', userMessage: ''}]));
        });

        it('should handle nonexistent tag in policy', () => {
            // setup test conditions
            transaction.tag = 'Nonexistent';
            policyRequiresTags = true;
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(expect.arrayContaining([{name: 'tagOutOfPolicy', type: 'violation', userMessage: ''}]));
        });

        it('should handle invalid policy settings', () => {
            // setup test conditions
            policyRequiresTags = true;
            policyTags = {};
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'tagOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });

        it('should handle case sensitivity', () => {
            // setup test conditions
            transaction.category = 'food';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'categoryOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });

        it('should handle null or undefined values', () => {
            // setup test conditions
            transaction = null;
            policyRequiresTags = null;
            policyTags = null;
            policyRequiresCategories = null;
            policyCategories = null;
            // run test
            expect(() => execute()).toThrow();
        });

        it('should handle invalid data types', () => {
            // setup test conditions
            transaction.category = 123;
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'categoryOutOfPolicy',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });

        it('should handle empty string for category', () => {
            // setup test conditions
            transaction.category = '';
            // run test
            const result = execute();
            // verify results
            expect(result.value).toEqual(
                expect.arrayContaining([
                    {
                        name: 'missingCategory',
                        type: 'violation',
                        userMessage: '',
                    },
                ]),
            );
        });
    });
});
