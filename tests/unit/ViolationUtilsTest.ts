import {beforeEach} from '@jest/globals';
import Onyx from 'react-native-onyx';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories, PolicyTagList, Transaction, TransactionViolation} from '@src/types/onyx';

const categoryOutOfPolicyViolation = {
    name: 'categoryOutOfPolicy',
    type: 'violation',
};

const missingCategoryViolation = {
    name: 'missingCategory',
    type: 'violation',
};

const tagOutOfPolicyViolation = {
    name: 'tagOutOfPolicy',
    type: 'violation',
};

const missingTagViolation = {
    name: 'missingTag',
    type: 'violation',
};

describe('getViolationsOnyxData', () => {
    let transaction: Transaction;
    let transactionViolations: TransactionViolation[];
    let policyRequiresTags: boolean;
    let policyTags: PolicyTagList;
    let policyRequiresCategories: boolean;
    let policyCategories: PolicyCategories;

    beforeEach(() => {
        transaction = {transactionID: '123', reportID: '1234', amount: 100, comment: {}, created: '2023-07-24 13:46:20', merchant: 'United Airlines', currency: 'USD'};
        transactionViolations = [];
        policyRequiresTags = false;
        policyTags = {};
        policyRequiresCategories = false;
        policyCategories = {};
    });

    it('should return an object with correct shape and with empty transactionViolations array', () => {
        const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

        expect(result).toEqual({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: transactionViolations,
        });
    });

    it('should handle multiple violations', () => {
        transactionViolations = [
            {name: 'duplicatedTransaction', type: 'violation'},
            {name: 'receiptRequired', type: 'violation'},
        ];
        const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
        expect(result.value).toEqual(expect.arrayContaining(transactionViolations));
    });

    describe('policyRequiresCategories', () => {
        beforeEach(() => {
            policyRequiresCategories = true;
            policyCategories = {Food: {name: 'Food', unencodedName: '', enabled: true, areCommentsRequired: false, externalID: '1234', origin: '12345'}};
            transaction.category = 'Food';
        });

        it('should add missingCategory violation if no category is included', () => {
            transaction.category = undefined;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });

        it('should add categoryOutOfPolicy violation when category is not in policy', () => {
            transaction.category = 'Bananas';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should not include a categoryOutOfPolicy violation when category is in policy', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should add categoryOutOfPolicy violation to existing violations if they exist', () => {
            transaction.category = 'Bananas';
            transactionViolations = [
                {name: 'duplicatedTransaction', type: 'violation'},
                {name: 'receiptRequired', type: 'violation'},
            ];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should add missingCategory violation to existing violations if they exist', () => {
            transaction.category = undefined;
            transactionViolations = [
                {name: 'duplicatedTransaction', type: 'violation'},
                {name: 'receiptRequired', type: 'violation'},
            ];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });
    });

    describe('policy does not require Categories', () => {
        beforeEach(() => {
            policyRequiresCategories = false;
        });

        it('should not add any violations when categories are not required', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).not.toContainEqual([categoryOutOfPolicyViolation]);
            expect(result.value).not.toContainEqual([missingCategoryViolation]);
        });
    });

    describe('policyRequiresTags', () => {
        beforeEach(() => {
            policyRequiresTags = true;
            policyTags = {
                Meals: {
                    name: 'Meals',
                    required: true,
                    tags: {
                        Lunch: {name: 'Lunch', enabled: true},
                        Dinner: {name: 'Dinner', enabled: true},
                    },
                    orderWeight: 1,
                },
            };
            transaction.tag = 'Lunch';
        });

        it("shouldn't update the transactionViolations if the policy requires tags and the transaction has a tag from the policy", () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(transactionViolations);
        });

        it('should add a missingTag violation if none is provided and policy requires tags', () => {
            transaction.tag = undefined;

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([{...missingTagViolation}]));
        });

        it('should add a tagOutOfPolicy violation when policy requires tags and tag is not in the policy', () => {
            policyTags = {};

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual([]);
        });

        it('should add tagOutOfPolicy violation to existing violations if transaction has tag that is not in the policy', () => {
            transaction.tag = 'Bananas';
            transactionViolations = [
                {name: 'duplicatedTransaction', type: 'violation'},
                {name: 'receiptRequired', type: 'violation'},
            ];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([{...tagOutOfPolicyViolation}, ...transactionViolations]));
        });

        it('should add missingTag violation to existing violations if transaction does not have a tag', () => {
            transaction.tag = undefined;
            transactionViolations = [
                {name: 'duplicatedTransaction', type: 'violation'},
                {name: 'receiptRequired', type: 'violation'},
            ];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).toEqual(expect.arrayContaining([{...missingTagViolation}, ...transactionViolations]));
        });
    });

    describe('policy does not require Tags', () => {
        beforeEach(() => {
            policyRequiresTags = false;
        });

        it('should not add any violations when tags are not required', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);

            expect(result.value).not.toContainEqual([tagOutOfPolicyViolation]);
            expect(result.value).not.toContainEqual([missingTagViolation]);
        });
    });
    describe('policy has multi level tags', () => {
        beforeEach(() => {
            policyRequiresTags = true;
            policyTags = {
                Department: {
                    name: 'Department',
                    tags: {
                        Accounting: {
                            name: 'Accounting',
                            enabled: true,
                        },
                    },
                    required: true,
                    orderWeight: 1,
                },
                Region: {
                    name: 'Region',
                    tags: {
                        Africa: {
                            name: 'Africa',
                            enabled: true,
                        },
                    },
                    required: true,
                    orderWeight: 2,
                },
                Project: {
                    name: 'Project',
                    tags: {
                        Project1: {
                            name: 'Project1',
                            enabled: true,
                        },
                    },
                    required: true,
                    orderWeight: 3,
                },
            };
        });
        it('should return someTagLevelsRequired when a required tag is missing', () => {
            const someTagLevelsRequiredViolation = {
                name: 'someTagLevelsRequired',
                type: 'violation',
                data: {
                    errorIndexes: [0, 1, 2],
                },
            };

            // Test case where transaction has no tags
            let result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has 1 tag
            transaction.tag = 'Accounting';
            someTagLevelsRequiredViolation.data = {errorIndexes: [1, 2]};
            result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has 2 tags
            transaction.tag = 'Accounting::Project1';
            someTagLevelsRequiredViolation.data = {errorIndexes: [1]};
            result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has all tags
            transaction.tag = 'Accounting:Africa:Project1';
            result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            expect(result.value).toEqual([]);
        });
        it('should return tagOutOfPolicy when a tag is not enabled in the policy but is set in the transaction', () => {
            policyTags.Department.tags.Accounting.enabled = false;
            transaction.tag = 'Accounting:Africa:Project1';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policyRequiresTags, policyTags, policyRequiresCategories, policyCategories);
            const violation = {...tagOutOfPolicyViolation, data: {tagName: 'Department'}};
            expect(result.value).toEqual([violation]);
        });
    });
});
