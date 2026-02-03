import {beforeEach} from '@jest/globals';
import Onyx from 'react-native-onyx';
import {convertAmountToDisplayString} from '@libs/CurrencyUtils';
import {getTransactionViolations, hasWarningTypeViolation, isViolationDismissed} from '@libs/TransactionUtils';
import ViolationsUtils, {filterReceiptViolations, getIsViolationFixed} from '@libs/Violations/ViolationsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import {translateLocal} from '../utils/TestHelper';

// Mock getCurrentUserEmail from Report actions
const MOCK_CURRENT_USER_EMAIL = 'test@expensify.com';
jest.mock('@libs/actions/Report', () => ({
    getCurrentUserEmail: jest.fn(() => MOCK_CURRENT_USER_EMAIL),
}));

const categoryOutOfPolicyViolation = {
    name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const missingCategoryViolation = {
    name: CONST.VIOLATIONS.MISSING_CATEGORY,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const futureDateViolation = {
    name: CONST.VIOLATIONS.FUTURE_DATE,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const receiptRequiredViolation = {
    name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        formattedLimit: convertAmountToDisplayString(CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT),
    },
};

const categoryReceiptRequiredViolation = {
    name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: undefined,
};

const overLimitViolation = {
    name: CONST.VIOLATIONS.OVER_LIMIT,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        formattedLimit: convertAmountToDisplayString(CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT),
    },
};

const categoryOverLimitViolation = {
    name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        formattedLimit: convertAmountToDisplayString(CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT),
    },
};

const categoryMissingCommentViolation = {
    name: CONST.VIOLATIONS.MISSING_COMMENT,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const customUnitOutOfPolicyViolation = {
    name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY,
    type: CONST.VIOLATION_TYPES.VIOLATION,
};

const missingTagViolation = {
    name: CONST.VIOLATIONS.MISSING_TAG,
    type: CONST.VIOLATION_TYPES.VIOLATION,
};

const tagOutOfPolicyViolation = {
    name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
};

const smartScanFailedViolation = {
    name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
    type: CONST.VIOLATION_TYPES.WARNING,
};

const duplicatedTransactionViolation = {
    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
    type: CONST.VIOLATION_TYPES.WARNING,
};

describe('getViolationsOnyxData', () => {
    let transaction: Transaction;
    let transactionViolations: TransactionViolation[];
    let policy: Policy;
    let policyTags: PolicyTagLists;
    let policyCategories: PolicyCategories;

    beforeEach(() => {
        transaction = {
            transactionID: '123',
            reportID: '1234',
            amount: 100,
            comment: {attendees: [{email: 'text@expensify.com', displayName: 'Test User', avatarUrl: ''}]},
            created: '2023-07-24 13:46:20',
            merchant: 'United Airlines',
            currency: CONST.CURRENCY.USD,
        };
        transactionViolations = [];
        policy = {requiresTag: false, requiresCategory: false} as Policy;
        policyTags = {};
        policyCategories = {};
    });

    it('should return an object with correct shape and with empty transactionViolations array', () => {
        const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

        expect(result).toEqual({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: transactionViolations,
        });
    });

    it('should handle multiple violations', () => {
        policy.type = 'corporate';
        policy.maxExpenseAmountNoReceipt = 25;
        transaction.amount = 100;
        transactionViolations = [
            {name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION},
            {name: 'receiptRequired', type: CONST.VIOLATION_TYPES.VIOLATION},
        ];
        const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
        expect(result.value).toEqual(expect.arrayContaining(transactionViolations));
    });

    describe('distance rate was modified', () => {
        beforeEach(() => {
            transactionViolations = [customUnitOutOfPolicyViolation];

            const customUnitRateID = 'rate_id';
            transaction.comment = {
                ...transaction.comment,
                customUnit: {
                    ...(transaction?.comment?.customUnit ?? {}),
                    customUnitRateID,
                },
            };
            policy.customUnits = {
                unitId: {
                    attributes: {unit: 'mi'},
                    customUnitID: 'unitId',
                    defaultCategory: 'Car',
                    enabled: true,
                    name: 'Distance',
                    rates: {
                        [customUnitRateID]: {
                            currency: 'USD',
                            customUnitRateID,
                            enabled: true,
                            name: 'Default Rate',
                            rate: 65.5,
                        },
                    },
                },
            };
        });

        it('should remove the customUnitOutOfPolicy violation if the modified one belongs to the policy', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).not.toContainEqual(customUnitOutOfPolicyViolation);
        });
    });

    describe('per diem rate validation', () => {
        beforeEach(() => {
            transactionViolations = [customUnitOutOfPolicyViolation];

            const customUnitRateID = 'per_diem_rate_id';
            transaction.comment = {
                ...transaction.comment,
                customUnit: {
                    ...(transaction?.comment?.customUnit ?? {}),
                    customUnitRateID,
                },
            };
            transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
            policy.customUnits = {
                perDiemUnitId: {
                    customUnitID: 'perDiemUnitId',
                    defaultCategory: '',
                    enabled: true,
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    rates: {
                        [customUnitRateID]: {
                            currency: 'USD',
                            customUnitRateID,
                            enabled: true,
                            name: 'Spain',
                            rate: 0,
                        },
                    },
                },
            };
        });

        it('should remove the customUnitOutOfPolicy violation if the per diem rate is valid for the policy', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).not.toContainEqual(customUnitOutOfPolicyViolation);
        });
    });

    describe('controlPolicyViolations', () => {
        beforeEach(() => {
            policy.type = 'corporate';
            policy.outputCurrency = CONST.CURRENCY.USD;
        });

        it('should not add futureDate violation if the policy is not corporate', () => {
            transaction.created = '9999-12-31T23:59:59Z';
            policy.type = 'personal';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(transactionViolations);
        });

        it('should add futureDate violation if the transaction has a future date and policy is corporate', () => {
            transaction.created = '9999-12-31T23:59:59Z';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([futureDateViolation, ...transactionViolations]));
        });

        it('should remove futureDate violation if the policy is downgraded', () => {
            transaction.created = '9999-12-31T23:59:59Z';
            policy.type = 'personal';
            transactionViolations = [futureDateViolation];
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(futureDateViolation);
        });

        it('should add receiptRequired violation if the transaction has no receipt', () => {
            transaction.amount = -1000000;
            policy.maxExpenseAmountNoReceipt = 2500;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([receiptRequiredViolation, ...transactionViolations]));
        });

        it('should not add receiptRequired violation if the transaction has different currency than the workspace currency', () => {
            transaction.amount = -1000000;
            transaction.modifiedCurrency = CONST.CURRENCY.CAD;
            policy.maxExpenseAmountNoReceipt = 2500;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });

        it('should add overLimit violation if the transaction amount is over the policy limit', () => {
            transaction.amount = -1000000;
            policy.maxExpenseAmount = 200000;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([overLimitViolation, ...transactionViolations]));
        });

        it('should not add overLimit violation if the transaction currency is different from the workspace currency', () => {
            transaction.amount = -1000000;
            transaction.modifiedCurrency = CONST.CURRENCY.NZD;
            policy.maxExpenseAmount = 200000;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });

        it('should add itemizedReceiptRequired violation if the transaction exceeds itemized receipt threshold and has no receipt', () => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -10000;
            policy.maxExpenseAmountNoItemizedReceipt = 7500;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeDefined();
            expect(itemizedReceiptViolation?.type).toBe(CONST.VIOLATION_TYPES.VIOLATION);
        });

        it('should not add receiptRequired violation if the transaction has a receipt attached', () => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -10000;
            transaction.receipt = {state: CONST.IOU.RECEIPT_STATE.SCAN_READY, source: 'https://example.com/receipt.jpg'};
            policy.maxExpenseAmountNoReceipt = 2500;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const foundReceiptRequiredViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
            expect(foundReceiptRequiredViolation).toBeUndefined();
        });

        it('should not show regular receiptRequired violation when itemizedReceiptRequired applies', () => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -10000;
            policy.maxExpenseAmountNoReceipt = 2500; // Regular receipt required over $25
            policy.maxExpenseAmountNoItemizedReceipt = 7500; // Itemized receipt required over $75
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const receiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            // Should have itemized receipt violation but NOT regular receipt violation
            expect(itemizedReceiptViolation).toBeDefined();
            expect(receiptViolation).toBeUndefined();
        });

        it('should not add itemizedReceiptRequired violation if the amount is below the threshold', () => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -5000;
            transaction.receipt = {state: CONST.IOU.RECEIPT_STATE.SCAN_READY, source: 'https://example.com/receipt.jpg'};
            policy.maxExpenseAmountNoItemizedReceipt = 7500;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeUndefined();
        });

        it('should not add itemizedReceiptRequired violation if the transaction has different currency than the workspace currency', () => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -10000;
            transaction.modifiedCurrency = CONST.CURRENCY.CAD;
            policy.maxExpenseAmountNoItemizedReceipt = 7500;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeUndefined();
        });
    });

    describe('policyCategoryRules', () => {
        beforeEach(() => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            policyCategories = {
                Food: {
                    name: 'Food',
                    enabled: true,
                    areCommentsRequired: true,
                    maxAmountNoReceipt: 0,
                    maxExpenseAmount: CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT,
                },
            };
            transaction.category = 'Food';
            transaction.amount = -CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT - 1;
            transaction.comment = {comment: ''};
        });

        it('should add category specific violations', () => {
            policy.areRulesEnabled = true;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([categoryOverLimitViolation, categoryReceiptRequiredViolation, categoryMissingCommentViolation, ...transactionViolations]));
        });

        it('should add category-level itemizedReceiptRequired violation when category is set to always', () => {
            policyCategories.Food.maxAmountNoItemizedReceipt = 0; // Category set to "Always"
            transaction.amount = -10000;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeDefined();
            expect(itemizedReceiptViolation?.data).toBeUndefined(); // Category-level violations don't have data
        });

        it('should not add itemizedReceiptRequired violation when category is set to never', () => {
            policy.maxExpenseAmountNoItemizedReceipt = 7500; // Policy requires itemized receipt over $75
            policyCategories.Food.maxAmountNoItemizedReceipt = CONST.DISABLED_MAX_EXPENSE_VALUE; // Category set to "Never"
            transaction.amount = -10000; // $100 expense - would trigger policy-level but category overrides
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeUndefined(); // Category "Never" should override policy
        });

        it('should use policy-level threshold when category is set to default', () => {
            policy.maxExpenseAmountNoItemizedReceipt = 7500; // Policy requires itemized receipt over $75
            // policyCategories.Food.maxAmountNoItemizedReceipt is undefined (Default - follow policy)
            transaction.amount = -10000; // $100 expense - exceeds policy threshold
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeDefined(); // Should follow policy threshold
        });

        it('should add receiptRequired when itemizedReceiptRequired existed but category changed to never require itemized', () => {
            // Given a transaction that previously had an itemizedReceiptRequired violation because the policy requires itemized receipts
            policy.maxExpenseAmountNoReceipt = 100; // $1.00
            policy.maxExpenseAmountNoItemizedReceipt = 100; // $1.00
            policyCategories.Food.maxAmountNoReceipt = undefined;
            policyCategories.Food.maxAmountNoItemizedReceipt = CONST.DISABLED_MAX_EXPENSE_VALUE;
            transaction.amount = -300; // $3.00
            const existingViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}];

            // When the category is changed to "never require itemized receipt"
            const result = ViolationsUtils.getViolationsOnyxData(transaction, existingViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];

            // Then the itemized violation should be removed and replaced with receiptRequired because the policy still requires receipts
            const itemizedViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            const receiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
            expect(itemizedViolation).toBeUndefined();
            expect(receiptViolation).toBeDefined();
        });

        it('should update itemizedReceiptRequired violation data when threshold changes', () => {
            // Given a transaction with an existing itemizedReceiptRequired violation that has stale threshold data
            policy.maxExpenseAmountNoItemizedReceipt = 7500; // $75.00
            transaction.amount = -10000; // $100.00
            const existingViolations: TransactionViolation[] = [
                {name: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true, data: {formattedLimit: '$50.00'}},
            ];

            // When violations are recalculated after the policy threshold changed
            const result = ViolationsUtils.getViolationsOnyxData(transaction, existingViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];

            // Then the violation should have updated threshold data to reflect the current policy settings
            const itemizedViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedViolation).toBeDefined();
            expect(itemizedViolation?.data?.formattedLimit).not.toBe('$50.00');
        });

        it('should replace receiptRequired with itemizedReceiptRequired when category changes to always require itemized', () => {
            // Given a transaction with a receiptRequired violation from the policy threshold
            policy.maxExpenseAmountNoReceipt = 2500; // $25.00
            policyCategories.Food.maxAmountNoReceipt = undefined;
            policyCategories.Food.maxAmountNoItemizedReceipt = 0;
            transaction.amount = -5000; // $50.00
            const existingViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}];

            // When the category is changed to "always require itemized receipts"
            const result = ViolationsUtils.getViolationsOnyxData(transaction, existingViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];

            // Then itemized should supersede receipt because itemized is more restrictive
            const receiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
            const itemizedViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(receiptViolation).toBeUndefined();
            expect(itemizedViolation).toBeDefined();
        });

        it('should remove both violations when category is set to never for both receipt and itemized', () => {
            // Given a transaction with an itemizedReceiptRequired violation from the policy
            policy.maxExpenseAmountNoReceipt = 100; // $1.00
            policy.maxExpenseAmountNoItemizedReceipt = 100; // $1.00
            policyCategories.Food.maxAmountNoReceipt = CONST.DISABLED_MAX_EXPENSE_VALUE;
            policyCategories.Food.maxAmountNoItemizedReceipt = CONST.DISABLED_MAX_EXPENSE_VALUE;
            transaction.amount = -10000; // $100.00
            const existingViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}];

            // When the category is set to "never" for both receipt types
            const result = ViolationsUtils.getViolationsOnyxData(transaction, existingViolations, policy, policyTags, policyCategories, false, false);
            const violations = result.value as TransactionViolation[];

            // Then no receipt violations should exist because category overrides take precedence over policy settings
            const itemizedViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            const receiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.RECEIPT_REQUIRED);
            expect(itemizedViolation).toBeUndefined();
            expect(receiptViolation).toBeUndefined();
        });
    });

    describe('policyRequiresCategories', () => {
        beforeEach(() => {
            policy.requiresCategory = true;
            policyCategories = {Food: {name: 'Food', unencodedName: '', enabled: true, areCommentsRequired: false, externalID: '1234', origin: '12345'}};
            transaction.category = 'Food';
            transaction.amount = 100;
        });

        it('should add missingCategory violation if no category is included', () => {
            transaction.category = undefined;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });

        it('should add categoryOutOfPolicy violation when category is not in policy', () => {
            transaction.category = 'Bananas';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should not include a categoryOutOfPolicy violation when category is in policy', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should not add a category violation when the transaction is scanning', () => {
            const partialTransaction = {
                ...transaction,
                amount: 0,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                category: undefined,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
            };
            const result = ViolationsUtils.getViolationsOnyxData(partialTransaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(missingCategoryViolation);
        });

        it('should not add categoryOutOfPolicy violation when category is Uncategorized', () => {
            transaction.category = 'Uncategorized';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should not add categoryOutOfPolicy violation when category is none', () => {
            transaction.category = 'none';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should add categoryOutOfPolicy violation to existing violations if they exist', () => {
            transaction.category = 'Bananas';
            transaction.amount = 1000000;
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should add missingCategory violation to existing violations if they exist', () => {
            transaction.category = undefined;
            transaction.amount = 1000000;
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });

        it('should keep other violations while adding smartscanFailed for smart scan failed transactions', () => {
            const partialTransaction = {
                ...transaction,
                amount: 0,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                category: undefined,
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
            };
            const result = ViolationsUtils.getViolationsOnyxData(partialTransaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual(
                expect.arrayContaining([{name: CONST.VIOLATIONS.SMARTSCAN_FAILED, type: CONST.VIOLATION_TYPES.WARNING, showInReview: true}, missingCategoryViolation]),
            );
        });

        it('should not add smartscanFailed when scan failed but required fields are filled', () => {
            const transactionWithEnteredDetails = {
                ...transaction,
                amount: 10000,
                merchant: 'Coffee Shop',
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
            };
            const result = ViolationsUtils.getViolationsOnyxData(transactionWithEnteredDetails, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.SMARTSCAN_FAILED}));
        });

        it('should not add smartscanFailed when scan failed but modified fields are filled (amount and merchant)', () => {
            const transactionWithModifiedDetails = {
                ...transaction,
                amount: 0,
                modifiedAmount: 12345,
                merchant: '',
                modifiedMerchant: 'Manual Merchant',
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
            };
            const result = ViolationsUtils.getViolationsOnyxData(
                transactionWithModifiedDetails as unknown as Transaction,
                transactionViolations,
                policy,
                policyTags,
                policyCategories,
                false,
                false,
            );
            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.SMARTSCAN_FAILED}));
        });
    });

    describe('policy does not require Categories', () => {
        beforeEach(() => {
            policy.requiresCategory = false;
        });

        it('should not add any violations when categories are not required', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
            expect(result.value).not.toContainEqual(missingCategoryViolation);
        });
    });

    describe('policyRequiresTags', () => {
        beforeEach(() => {
            policy.requiresTag = true;
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
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual(transactionViolations);
        });

        it('should add a missingTag violation if none is provided and policy requires tags', () => {
            transaction.tag = undefined;

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual(expect.arrayContaining([{...missingTagViolation, showInReview: true, data: {tagName: 'Meals'}}]));
        });

        it('should add a tagOutOfPolicy violation when policy requires tags and tag is not in the policy', () => {
            policyTags = {};

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual([]);
        });

        it('should not add a tag violation when the transaction is scanning', () => {
            const partialTransaction = {
                ...transaction,
                amount: 0,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                tag: undefined,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
            };
            const result = ViolationsUtils.getViolationsOnyxData(partialTransaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).not.toContainEqual(missingTagViolation);
        });

        it('should add tagOutOfPolicy violation to existing violations if transaction has tag that is not in the policy', () => {
            transaction.tag = 'Bananas';
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual(expect.arrayContaining([{...tagOutOfPolicyViolation, data: {tagName: 'Meals'}}, ...transactionViolations]));
        });

        it('should add missingTag violation to existing violations if transaction does not have a tag', () => {
            transaction.tag = undefined;
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).toEqual(expect.arrayContaining([{...missingTagViolation, showInReview: true, data: {tagName: 'Meals'}}, ...transactionViolations]));
        });
    });

    describe('policy does not require Tags', () => {
        beforeEach(() => {
            policy.requiresTag = false;
        });

        it('should not add any violations when tags are not required', () => {
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);

            expect(result.value).not.toContainEqual(tagOutOfPolicyViolation);
            expect(result.value).not.toContainEqual(missingTagViolation);
        });
    });

    describe('policy has multi level tags', () => {
        beforeEach(() => {
            policy.requiresTag = true;
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
                    orderWeight: 2,
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
                    orderWeight: 1,
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
                type: CONST.VIOLATION_TYPES.VIOLATION,
                showInReview: true,
                data: {
                    errorIndexes: [0, 1, 2],
                },
            };

            // Test case where transaction has no tags
            let result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has 1 tag
            transaction.tag = 'Africa';
            someTagLevelsRequiredViolation.data = {errorIndexes: [1, 2]};
            result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has 2 tags
            transaction.tag = 'Africa::Project1';
            someTagLevelsRequiredViolation.data = {errorIndexes: [1]};
            result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has all tags
            transaction.tag = 'Africa:Accounting:Project1';
            result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            expect(result.value).toEqual([]);
        });
        it('should return tagOutOfPolicy when a tag is not enabled in the policy but is set in the transaction', () => {
            policyTags.Department.tags.Accounting.enabled = false;
            transaction.tag = 'Africa:Accounting:Project1';
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false);
            const violation = {...tagOutOfPolicyViolation, data: {tagName: 'Department'}};
            expect(result.value).toEqual([violation]);
        });
        it('should return missingTag when all dependent tags are enabled in the policy but are not set in the transaction', () => {
            const missingDepartmentTag = {...missingTagViolation, data: {tagName: 'Department'}};
            const missingRegionTag = {...missingTagViolation, data: {tagName: 'Region'}};
            const missingProjectTag = {...missingTagViolation, data: {tagName: 'Project'}};
            transaction.tag = undefined;
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, true, false);
            expect(result.value).toEqual(expect.arrayContaining([missingDepartmentTag, missingRegionTag, missingProjectTag]));
        });
    });

    describe('missingAttendees violation', () => {
        const missingAttendeesViolation = {
            name: CONST.VIOLATIONS.MISSING_ATTENDEES,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        };

        const ownerAccountID = 123;
        const otherAccountID = 456;

        let iouReport: Report;

        beforeEach(() => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.isAttendeeTrackingEnabled = true;
            policyCategories = {
                Meals: {
                    name: 'Meals',
                    enabled: true,
                    areAttendeesRequired: true,
                },
            };
            transaction.category = 'Meals';
            iouReport = {
                reportID: '1234',
                ownerAccountID,
            } as Report;
        });

        (!CONST.IS_ATTENDEES_REQUIRED_ENABLED ? it.skip : it)('should add missingAttendees violation when no attendees are present', () => {
            transaction.comment = {attendees: []};
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, iouReport);
            expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        (!CONST.IS_ATTENDEES_REQUIRED_ENABLED ? it.skip : it)('should add missingAttendees violation when only owner is an attendee', () => {
            transaction.comment = {
                attendees: [{email: 'owner@example.com', displayName: 'Owner', avatarUrl: '', accountID: ownerAccountID}],
            };
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, iouReport);
            expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should not add missingAttendees violation when there is at least one non-owner attendee', () => {
            transaction.comment = {
                attendees: [
                    {email: 'owner@example.com', displayName: 'Owner', avatarUrl: '', accountID: ownerAccountID},
                    {email: 'other@example.com', displayName: 'Other', avatarUrl: '', accountID: otherAccountID},
                ],
            };
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, iouReport);
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should remove missingAttendees violation when attendees are added', () => {
            transactionViolations = [missingAttendeesViolation];
            transaction.comment = {
                attendees: [
                    {email: 'owner@example.com', displayName: 'Owner', avatarUrl: '', accountID: ownerAccountID},
                    {email: 'other@example.com', displayName: 'Other', avatarUrl: '', accountID: otherAccountID},
                ],
            };
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, iouReport);
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should not add missingAttendees violation when attendee tracking is disabled', () => {
            policy.isAttendeeTrackingEnabled = false;
            transaction.comment = {attendees: []};
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, iouReport);
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should not add missingAttendees violation when category does not require attendees', () => {
            policyCategories.Meals.areAttendeesRequired = false;
            transaction.comment = {attendees: []};
            const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, iouReport);
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        describe('optimistic / offline scenarios (iouReport is undefined)', () => {
            // In offline scenarios, iouReport is undefined so we can't get ownerAccountID.
            // The code falls back to using getCurrentUserEmail() to identify the owner by login/email.
            (!CONST.IS_ATTENDEES_REQUIRED_ENABLED ? it.skip : it)('should correctly calculate violation when iouReport is undefined but attendees have matching email', () => {
                // When iouReport is undefined, we use getCurrentUserEmail() as fallback
                // If only the current user (matching MOCK_CURRENT_USER_EMAIL) is an attendee, violation should show
                transactionViolations = [];
                transaction.comment = {
                    attendees: [{email: MOCK_CURRENT_USER_EMAIL, displayName: 'Test User', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // Violation should be added since the only attendee is the current user (owner)
                expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should not add violation when iouReport is undefined but there are non-owner attendees (by email)', () => {
                // When there are attendees with different emails than the current user, no violation
                transactionViolations = [];
                transaction.comment = {
                    attendees: [
                        {email: MOCK_CURRENT_USER_EMAIL, displayName: 'Test User', avatarUrl: ''},
                        {email: 'other@example.com', displayName: 'Other User', avatarUrl: ''},
                    ],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // Violation should NOT be added since there's a non-owner attendee
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should remove violation when non-owner attendee is added (offline)', () => {
                // If violation existed and a non-owner attendee is added, violation should be removed
                transactionViolations = [missingAttendeesViolation];
                transaction.comment = {
                    attendees: [
                        {email: MOCK_CURRENT_USER_EMAIL, displayName: 'Test User', avatarUrl: ''},
                        {email: 'other@example.com', displayName: 'Other User', avatarUrl: ''},
                    ],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // Violation should be removed
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            (!CONST.IS_ATTENDEES_REQUIRED_ENABLED ? it.skip : it)('should preserve violation when only owner attendee remains (offline)', () => {
                // If violation existed and only owner attendee remains, violation stays
                transactionViolations = [missingAttendeesViolation];
                transaction.comment = {
                    attendees: [{email: MOCK_CURRENT_USER_EMAIL, displayName: 'Test User', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // Violation should be preserved
                expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });
        });

        describe('fallback case (iouReport undefined AND getCurrentUserEmail returns falsy)', () => {
            // This tests the edge case where we cannot identify the owner at all:
            // - ownerAccountID is undefined (iouReport unavailable)
            // - getCurrentUserEmail() returns falsy (no current user email)
            // In this case, we assume owner is one of the attendees, so we need at least 2 attendees
            // for there to be a non-owner attendee.

            beforeEach(() => {
                // Mock getCurrentUserEmail to return empty string
                jest.spyOn(require('@libs/actions/Report'), 'getCurrentUserEmail').mockReturnValue('');
            });

            afterEach(() => {
                jest.restoreAllMocks();
            });

            (!CONST.IS_ATTENDEES_REQUIRED_ENABLED ? it.skip : it)("should add missingAttendees violation when no attendees are present (can't identify owner)", () => {
                transactionViolations = [];
                transaction.comment = {attendees: []};
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // With 0 attendees, attendeesMinusOwnerCount = Math.max(0, 0 - 1) = 0, violation should be added
                expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            (!CONST.IS_ATTENDEES_REQUIRED_ENABLED ? it.skip : it)('should add missingAttendees violation when only 1 attendee exists (assumed to be owner)', () => {
                transactionViolations = [];
                transaction.comment = {
                    attendees: [{email: 'anyone@example.com', displayName: 'Someone', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // With 1 attendee, attendeesMinusOwnerCount = Math.max(0, 1 - 1) = 0, violation should be added
                expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should not add missingAttendees violation when 2+ attendees exist (assumes owner is one of them)', () => {
                transactionViolations = [];
                transaction.comment = {
                    attendees: [
                        {email: 'person1@example.com', displayName: 'Person 1', avatarUrl: ''},
                        {email: 'person2@example.com', displayName: 'Person 2', avatarUrl: ''},
                    ],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // With 2 attendees, attendeesMinusOwnerCount = Math.max(0, 2 - 1) = 1, no violation
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should remove missingAttendees violation when second attendee is added', () => {
                transactionViolations = [missingAttendeesViolation];
                transaction.comment = {
                    attendees: [
                        {email: 'person1@example.com', displayName: 'Person 1', avatarUrl: ''},
                        {email: 'person2@example.com', displayName: 'Person 2', avatarUrl: ''},
                    ],
                };
                const result = ViolationsUtils.getViolationsOnyxData(transaction, transactionViolations, policy, policyTags, policyCategories, false, false, false, undefined);
                // Violation should be removed since we now have 2 attendees
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });
        });
    });
});

const getFakeTransaction = (transactionID: string, comment?: Transaction['comment']) => ({
    transactionID,
    attendees: [{email: 'text@expensify.com'}],
    reportID: '1234',
    amount: 100,
    comment: comment ?? {},
    created: '2023-07-24 13:46:20',
    merchant: 'United Airlines',
    currency: 'USD',
});

const CARLOS_EMAIL = 'cmartins@expensifail.com';
const CARLOS_ACCOUNT_ID = 1;

describe('getViolations', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {
                    email: CARLOS_EMAIL,
                    accountID: CARLOS_ACCOUNT_ID,
                },
            },
        });
    });

    afterEach(() => Onyx.clear());

    it('should check if violation is dismissed or not', async () => {
        const transaction = getFakeTransaction('123', {
            dismissedViolations: {smartscanFailed: {[CARLOS_EMAIL]: CARLOS_ACCOUNT_ID.toString()}},
        });

        const transactionCollectionDataSet: TransactionCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
        };

        await Onyx.multiSet({...transactionCollectionDataSet});

        const isSmartScanDismissed = isViolationDismissed(transaction, smartScanFailedViolation, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, undefined, undefined);
        const isDuplicateViolationDismissed = isViolationDismissed(transaction, duplicatedTransactionViolation, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, undefined, undefined);

        expect(isSmartScanDismissed).toBeTruthy();
        expect(isDuplicateViolationDismissed).toBeFalsy();
    });

    it('should check if violation is dismissed or not (with report and policy params)', async () => {
        const policy: Policy = {
            id: 'test-policy-id',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: CARLOS_EMAIL,
            isPolicyExpenseChatEnabled: false,
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
            outputCurrency: CONST.CURRENCY.USD,
        };

        const report: Report = {
            reportID: 'test-report-id',
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CARLOS_ACCOUNT_ID,
            policyID: policy.id,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        const transaction = getFakeTransaction('123', {
            dismissedViolations: {smartscanFailed: {[CARLOS_EMAIL]: CARLOS_ACCOUNT_ID.toString()}},
        });

        const transactionCollectionDataSet: TransactionCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
        };

        await Onyx.multiSet({...transactionCollectionDataSet});

        const isSmartScanDismissed = isViolationDismissed(transaction, smartScanFailedViolation, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, report, policy);
        const isDuplicateViolationDismissed = isViolationDismissed(transaction, duplicatedTransactionViolation, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, report, policy);

        expect(isSmartScanDismissed).toBeTruthy();
        expect(isDuplicateViolationDismissed).toBeFalsy();
    });

    it('should return filtered out dismissed violations', async () => {
        const transaction = getFakeTransaction('123', {
            dismissedViolations: {smartscanFailed: {[CARLOS_EMAIL]: CARLOS_ACCOUNT_ID.toString()}},
        });

        const transactionCollectionDataSet: TransactionCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
        };

        const transactionViolationsCollection = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [duplicatedTransactionViolation, smartScanFailedViolation, tagOutOfPolicyViolation],
        };

        await Onyx.multiSet({...transactionCollectionDataSet});

        // Should filter out the smartScanFailedViolation
        const filteredViolations = getTransactionViolations(transaction, transactionViolationsCollection, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, undefined, undefined);
        expect(filteredViolations).toEqual([duplicatedTransactionViolation, tagOutOfPolicyViolation]);
    });

    it('should return filtered out dismissed violations (with report and policy params)', async () => {
        const policy: Policy = {
            id: 'test-policy-id',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: CARLOS_EMAIL,
            isPolicyExpenseChatEnabled: false,
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            outputCurrency: CONST.CURRENCY.USD,
        };

        const report: Report = {
            reportID: 'test-report-id',
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CARLOS_ACCOUNT_ID,
            policyID: policy.id,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        const transaction = getFakeTransaction('123', {
            dismissedViolations: {smartscanFailed: {[CARLOS_EMAIL]: CARLOS_ACCOUNT_ID.toString()}},
        });

        const transactionCollectionDataSet: TransactionCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
        };

        const transactionViolationsCollection = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [duplicatedTransactionViolation, smartScanFailedViolation, tagOutOfPolicyViolation],
        };

        await Onyx.multiSet({...transactionCollectionDataSet});

        // Should filter out the smartScanFailedViolation
        const filteredViolations = getTransactionViolations(transaction, transactionViolationsCollection, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, report, policy);
        expect(filteredViolations).toEqual([duplicatedTransactionViolation, tagOutOfPolicyViolation]);
    });

    it('checks if transaction has warning type violation after filtering dismissed violations', async () => {
        const transaction = getFakeTransaction('123', {
            dismissedViolations: {smartscanFailed: {[CARLOS_EMAIL]: CARLOS_ACCOUNT_ID.toString()}},
        });

        const transactionCollectionDataSet: TransactionCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
        };

        const transactionViolationsCollection = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [duplicatedTransactionViolation, smartScanFailedViolation, tagOutOfPolicyViolation],
        };

        await Onyx.multiSet({...transactionCollectionDataSet});
        const hasWarningTypeViolationRes = hasWarningTypeViolation(transaction, transactionViolationsCollection, '', CONST.DEFAULT_NUMBER_ID, undefined, undefined);
        expect(hasWarningTypeViolationRes).toBeTruthy();
    });

    it('checks if transaction has warning type violation after filtering dismissed violations (with report and policy params)', async () => {
        const policy: Policy = {
            id: 'test-policy-id',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: CARLOS_EMAIL,
            isPolicyExpenseChatEnabled: false,
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
            outputCurrency: CONST.CURRENCY.USD,
            pendingAction: undefined,
        };

        const report: Report = {
            reportID: 'test-report-id',
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CARLOS_ACCOUNT_ID,
            policyID: policy.id,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };

        const transaction = getFakeTransaction('123', {
            dismissedViolations: {smartscanFailed: {[CARLOS_EMAIL]: CARLOS_ACCOUNT_ID.toString()}},
        });

        const transactionCollectionDataSet: TransactionCollectionDataSet = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction,
        };

        const transactionViolationsCollection = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [duplicatedTransactionViolation, smartScanFailedViolation, tagOutOfPolicyViolation],
        };

        await Onyx.multiSet({...transactionCollectionDataSet});
        const hasWarningTypeViolationRes = hasWarningTypeViolation(transaction, transactionViolationsCollection, CARLOS_EMAIL, CARLOS_ACCOUNT_ID, report, policy);
        expect(hasWarningTypeViolationRes).toBeTruthy();
    });
});

const brokenCardConnectionViolation: TransactionViolation = {
    name: CONST.VIOLATIONS.RTER,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    data: {
        brokenBankConnection: true,
        isAdmin: true,
        rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
    },
};

const brokenCardConnection530Violation: TransactionViolation = {
    name: CONST.VIOLATIONS.RTER,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    data: {
        brokenBankConnection: true,
        isAdmin: false,
        rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530,
    },
};

describe('getViolationTranslation', () => {
    it('should return the correct message for broken card connection violation', () => {
        const testPolicyID = 'test-policy-123';
        const companyCardPageURL = `workspaces/${testPolicyID}/company-cards`;
        const brokenCardConnectionViolationExpected = translateLocal('violations.rter', {
            brokenBankConnection: true,
            isAdmin: true,
            rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            isTransactionOlderThan7Days: false,
            companyCardPageURL,
        });
        expect(ViolationsUtils.getViolationTranslation(brokenCardConnectionViolation, translateLocal)).toBe(brokenCardConnectionViolationExpected);
        const brokenCardConnection530ViolationExpected = translateLocal('violations.rter', {
            brokenBankConnection: true,
            isAdmin: false,
            rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530,
            isTransactionOlderThan7Days: false,
            companyCardPageURL,
        });
        expect(ViolationsUtils.getViolationTranslation(brokenCardConnection530Violation, translateLocal)).toBe(brokenCardConnection530ViolationExpected);
    });
});

describe('getRBRMessages', () => {
    const mockTransaction: Transaction = {
        transactionID: 'test-transaction-id',
        reportID: 'test-report-id',
        amount: 100,
        currency: CONST.CURRENCY.USD,
        created: '2023-07-24 13:46:20',
        merchant: 'Test Merchant',
    };

    const mockViolations: TransactionViolation[] = [
        {
            name: CONST.VIOLATIONS.MISSING_CATEGORY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        },
        {
            name: CONST.VIOLATIONS.MISSING_TAG,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        },
    ];

    it('should return all violations and missing field error', () => {
        const missingFieldError = 'Missing required field';
        const result = ViolationsUtils.getRBRMessages(mockTransaction, mockViolations, translateLocal, missingFieldError, []);
        const expectedResult = `Missing required field. ${translateLocal('violations.missingCategory')}. ${translateLocal('violations.missingTag')}.`;

        expect(result).toBe(expectedResult);
    });

    it('should filter out empty strings', () => {
        const result = ViolationsUtils.getRBRMessages(mockTransaction, mockViolations, translateLocal, undefined, []);
        const expectedResult = `${translateLocal('violations.missingCategory')}. ${translateLocal('violations.missingTag')}.`;

        expect(result).toBe(expectedResult);
    });
});

describe('hasVisibleViolationsForUser', () => {
    const submitterAccountID = 12345;
    const testReportID = 'test-report-123';
    const testTransactionID = 'test-transaction-123';
    const testPolicyID = 'test-policy-123';

    const mockReport = {
        reportID: testReportID,
        ownerAccountID: submitterAccountID,
        policyID: testPolicyID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    } as Report;

    const mockPolicy = {
        id: testPolicyID,
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
    } as Policy;

    const mockTransaction = {
        transactionID: testTransactionID,
        reportID: testReportID,
        accountID: submitterAccountID,
        amount: 1000,
        created: '2023-01-01',
        currency: 'USD',
        merchant: 'Test Merchant',
    } as Transaction;

    beforeEach(() => {
        Onyx.set(ONYXKEYS.SESSION, {accountID: submitterAccountID});
    });

    it('should return false when report is null', () => {
        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${testTransactionID}`]: [missingCategoryViolation],
        };

        const result = ViolationsUtils.hasVisibleViolationsForUser(undefined, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction]);
        expect(result).toBe(false);
    });

    it('should return false when violations is null', () => {
        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, undefined, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction]);
        expect(result).toBe(false);
    });

    it('should return false when transactions is empty', () => {
        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${testTransactionID}`]: [missingCategoryViolation],
        };

        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, []);
        expect(result).toBe(false);
    });

    it('should return false when no violations exist for transactions', () => {
        const violations = {};

        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction]);
        expect(result).toBe(false);
    });

    it('should return true when violations are visible to submitter', () => {
        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${testTransactionID}`]: [missingCategoryViolation],
        };

        // Mock shouldShowViolation to return true for missing category
        jest.spyOn(require('@src/libs/TransactionUtils'), 'shouldShowViolation').mockReturnValue(true);

        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction]);
        expect(result).toBe(true);
    });

    it('should return false when violations are hidden from submitter', () => {
        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${testTransactionID}`]: [
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.NOTICE,
                },
            ],
        };

        // Mock shouldShowViolation to return false for RECEIPT_NOT_SMART_SCANNED (hidden from submitter)
        jest.spyOn(require('@src/libs/TransactionUtils'), 'shouldShowViolation').mockImplementation((report, policy, violationName) => {
            if (violationName === CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED) {
                return false; // Hidden from submitter
            }
            return true;
        });

        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction]);
        expect(result).toBe(false);
    });

    it('should return true when at least one violation is visible', () => {
        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${testTransactionID}`]: [
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.NOTICE,
                },
                missingCategoryViolation,
            ],
        };

        jest.spyOn(require('@src/libs/TransactionUtils'), 'shouldShowViolation').mockImplementation((report, policy, violationName) => {
            if (violationName === CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED) {
                return false;
            }
            if (violationName === CONST.VIOLATIONS.MISSING_CATEGORY) {
                return true;
            }
            return true;
        });

        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction]);
        expect(result).toBe(true);
    });

    it('should handle multiple transactions correctly', () => {
        const secondTransactionID = 'test-transaction-456';
        const secondTransaction = {
            transactionID: secondTransactionID,
            reportID: testReportID,
            accountID: submitterAccountID,
            amount: 2000,
            created: '2023-01-02',
            currency: 'USD',
            merchant: 'Test Merchant 2',
        } as Transaction;

        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${testTransactionID}`]: [
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.NOTICE,
                },
            ],
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${secondTransactionID}`]: [missingCategoryViolation],
        };

        jest.spyOn(require('@src/libs/TransactionUtils'), 'shouldShowViolation').mockImplementation((report, policy, violationName) => {
            if (violationName === CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED) {
                return false;
            }
            if (violationName === CONST.VIOLATIONS.MISSING_CATEGORY) {
                return true;
            }
            return true;
        });

        const result = ViolationsUtils.hasVisibleViolationsForUser(mockReport, violations, '', CONST.DEFAULT_NUMBER_ID, mockPolicy, [mockTransaction, secondTransaction]);
        expect(result).toBe(true);
    });
});

describe('getIsViolationFixed', () => {
    const mockCurrentUserPersonalDetails = {
        accountID: 1,
        login: 'user@example.com',
        email: 'user@example.com',
    };

    const defaultParams = {
        category: '',
        tag: '',
        taxCode: undefined,
        policyCategories: undefined,
        policyTagLists: undefined,
        policyTaxRates: undefined,
        iouAttendees: undefined,
        currentUserPersonalDetails: mockCurrentUserPersonalDetails,
        isAttendeeTrackingEnabled: false,
    };

    const createPolicyTagList = (tagName: string, enabled: boolean) => ({
        Meals: {
            name: 'Meals',
            required: true,
            orderWeight: 1,
            tags: {[tagName]: {name: tagName, enabled}},
        },
    });

    const createAttendee = (email: string) => ({
        email,
        displayName: email.split('@')?.at(0) ?? '',
        avatarUrl: '',
    });

    describe('violations.categoryOutOfPolicy', () => {
        it('should return false when category is empty', () => {
            const result = getIsViolationFixed('violations.categoryOutOfPolicy', {
                ...defaultParams,
                category: '',
                policyCategories: {Food: {name: 'Food', enabled: true}},
            });
            expect(result).toBe(false);
        });

        it('should return false when category is not in policy', () => {
            const result = getIsViolationFixed('violations.categoryOutOfPolicy', {
                ...defaultParams,
                category: 'Travel',
                policyCategories: {Food: {name: 'Food', enabled: true}},
            });
            expect(result).toBe(false);
        });

        it('should return false when category exists but is disabled', () => {
            const result = getIsViolationFixed('violations.categoryOutOfPolicy', {
                ...defaultParams,
                category: 'Food',
                policyCategories: {Food: {name: 'Food', enabled: false}},
            });
            expect(result).toBe(false);
        });

        it('should return true when category exists and is enabled', () => {
            const result = getIsViolationFixed('violations.categoryOutOfPolicy', {
                ...defaultParams,
                category: 'Food',
                policyCategories: {Food: {name: 'Food', enabled: true}},
            });
            expect(result).toBe(true);
        });
    });

    describe('violations.tagOutOfPolicy', () => {
        it('should return true when tag is empty', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: '',
            });
            expect(result).toBe(true);
        });

        it('should return false when policyTagLists is undefined', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: 'Lunch',
                policyTagLists: undefined,
            });
            expect(result).toBe(false);
        });

        it('should return false when tag is not in policy', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: 'Breakfast',
                policyTagLists: createPolicyTagList('Lunch', true),
            });
            expect(result).toBe(false);
        });

        it('should return false when tag exists but is disabled', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: 'Lunch',
                policyTagLists: createPolicyTagList('Lunch', false),
            });
            expect(result).toBe(false);
        });

        it('should return true when tag exists and is enabled', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: 'Lunch',
                policyTagLists: createPolicyTagList('Lunch', true),
            });
            expect(result).toBe(true);
        });
    });

    describe('violations.taxOutOfPolicy', () => {
        it('should return true when taxCode is empty', () => {
            const result = getIsViolationFixed('violations.taxOutOfPolicy', {
                ...defaultParams,
                taxCode: undefined,
            });
            expect(result).toBe(true);
        });

        it('should return false when taxCode is not in policy tax rates', () => {
            const result = getIsViolationFixed('violations.taxOutOfPolicy', {
                ...defaultParams,
                taxCode: 'TAX_20',
                policyTaxRates: {TAX_10: {name: '10%', value: '10'}},
            });
            expect(result).toBe(false);
        });

        it('should return true when taxCode exists in policy tax rates', () => {
            const result = getIsViolationFixed('violations.taxOutOfPolicy', {
                ...defaultParams,
                taxCode: 'TAX_10',
                policyTaxRates: {TAX_10: {name: '10%', value: '10'}},
            });
            expect(result).toBe(true);
        });
    });

    describe('violations.missingAttendees', () => {
        it('should return true when attendee tracking is disabled', () => {
            const result = getIsViolationFixed('violations.missingAttendees', {
                ...defaultParams,
                isAttendeeTrackingEnabled: false,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: true}},
            });
            expect(result).toBe(true);
        });

        it('should return true when category does not require attendees', () => {
            const result = getIsViolationFixed('violations.missingAttendees', {
                ...defaultParams,
                isAttendeeTrackingEnabled: true,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: false}},
            });
            expect(result).toBe(true);
        });

        it('should return false when no attendees are present and category requires them', () => {
            const result = getIsViolationFixed('violations.missingAttendees', {
                ...defaultParams,
                isAttendeeTrackingEnabled: true,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: true}},
                iouAttendees: [],
            });
            expect(result).toBe(false);
        });

        it('should return false when only the creator is an attendee', () => {
            const result = getIsViolationFixed('violations.missingAttendees', {
                ...defaultParams,
                isAttendeeTrackingEnabled: true,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: true}},
                iouAttendees: [createAttendee('user@example.com')],
            });
            expect(result).toBe(false);
        });

        it('should return true when there is a non-creator attendee', () => {
            const result = getIsViolationFixed('violations.missingAttendees', {
                ...defaultParams,
                isAttendeeTrackingEnabled: true,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: true}},
                iouAttendees: [createAttendee('user@example.com'), createAttendee('other@example.com')],
            });
            expect(result).toBe(true);
        });
    });

    describe('unknown violations', () => {
        it('should return false for unknown violation types', () => {
            const result = getIsViolationFixed('violations.unknownViolation', defaultParams);
            expect(result).toBe(false);
        });
    });
});

describe('filterReceiptViolations', () => {
    const itemizedReceiptRequiredViolation: TransactionViolation = {
        name: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
        data: {
            formattedLimit: '$75.00',
        },
    };

    const receiptRequiredViolationWithData: TransactionViolation = {
        name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
        data: {
            formattedLimit: '$25.00',
        },
    };

    it('should return violations unchanged when only receiptRequired is present', () => {
        const violations: TransactionViolation[] = [receiptRequiredViolationWithData, missingCategoryViolation];
        const result = filterReceiptViolations(violations);
        expect(result).toEqual(violations);
        expect(result).toHaveLength(2);
    });

    it('should return violations unchanged when only itemizedReceiptRequired is present', () => {
        const violations: TransactionViolation[] = [itemizedReceiptRequiredViolation, missingCategoryViolation];
        const result = filterReceiptViolations(violations);
        expect(result).toEqual(violations);
        expect(result).toHaveLength(2);
    });

    it('should filter out receiptRequired when both receiptRequired and itemizedReceiptRequired are present', () => {
        const violations: TransactionViolation[] = [receiptRequiredViolationWithData, itemizedReceiptRequiredViolation, missingCategoryViolation];
        const result = filterReceiptViolations(violations);

        expect(result).toHaveLength(2);
        expect(result).toContainEqual(itemizedReceiptRequiredViolation);
        expect(result).toContainEqual(missingCategoryViolation);
        expect(result).not.toContainEqual(receiptRequiredViolationWithData);
    });

    it('should return empty array when given empty array', () => {
        const result = filterReceiptViolations([]);
        expect(result).toEqual([]);
    });

    it('should return violations unchanged when neither receiptRequired nor itemizedReceiptRequired is present', () => {
        const violations: TransactionViolation[] = [missingCategoryViolation, missingTagViolation];
        const result = filterReceiptViolations(violations);
        expect(result).toEqual(violations);
        expect(result).toHaveLength(2);
    });

    it('should handle violations with category receipt required (no data)', () => {
        const violations: TransactionViolation[] = [categoryReceiptRequiredViolation, itemizedReceiptRequiredViolation];
        const result = filterReceiptViolations(violations);

        expect(result).toHaveLength(1);
        expect(result).toContainEqual(itemizedReceiptRequiredViolation);
        expect(result).not.toContainEqual(categoryReceiptRequiredViolation);
    });
});
