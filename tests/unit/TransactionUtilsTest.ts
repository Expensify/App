import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {shouldShowBrokenConnectionViolation, shouldShowBrokenConnectionViolationForMultipleTransactions} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {TransactionCustomUnit} from '@src/types/onyx/Transaction';
import * as TransactionUtils from '../../src/libs/TransactionUtils';
import type {Policy, Transaction} from '../../src/types/onyx';
import createRandomPolicy, {createCategoryTaxExpenseRules} from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

const CURRENT_USER_ID = 1;
const CURRENT_USER_EMAIL = 'test@example.com';
const SECOND_USER_ID = 2;
const FAKE_OPEN_REPORT_ID = 'FAKE_OPEN_REPORT_ID';
const FAKE_OPEN_REPORT_SECOND_USER_ID = 'FAKE_OPEN_REPORT_SECOND_USER_ID';
const FAKE_PROCESSING_REPORT_ID = 'FAKE_PROCESSING_REPORT_ID';
const FAKE_APPROVED_REPORT_ID = 'FAKE_APPROVED_REPORT_ID';
const openReport = {
    reportID: FAKE_OPEN_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
};
const processingReport = {
    reportID: FAKE_PROCESSING_REPORT_ID,
    ownerAccountID: CURRENT_USER_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
};
const approvedReport = {
    reportID: FAKE_APPROVED_REPORT_ID,
    ownerAccountID: SECOND_USER_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
};
const secondUserOpenReport = {
    reportID: FAKE_OPEN_REPORT_SECOND_USER_ID,
    ownerAccountID: SECOND_USER_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
};
const reportCollectionDataSet: ReportCollectionDataSet = {
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OPEN_REPORT_ID}`]: openReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_PROCESSING_REPORT_ID}`]: processingReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_APPROVED_REPORT_ID}`]: approvedReport,
    [`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OPEN_REPORT_SECOND_USER_ID}`]: secondUserOpenReport,
};
const defaultDistanceRatePolicyID1: Record<string, Rate> = {
    customUnitRateID1: {
        currency: 'USD',
        customUnitRateID: 'customUnitRateID1',
        enabled: true,
        name: 'Default Rate',
        rate: 70,
        subRates: [],
    },
};
const distanceRateTransactionID1: TransactionCustomUnit = {
    customUnitID: 'customUnitID1',
    customUnitRateID: 'customUnitRateID1',
    distanceUnit: 'mi',
    name: 'Distance',
};
const distanceRateTransactionID2: TransactionCustomUnit = {
    customUnitID: 'customUnitID2',
    customUnitRateID: 'customUnitRateID2',
    distanceUnit: 'mi',
    name: 'Distance',
};
const defaultCustomUnitPolicyID1: Record<string, CustomUnit> = {
    customUnitID1: {
        attributes: {
            unit: 'mi',
        },
        customUnitID: 'customUnitID1',
        defaultCategory: 'Car',
        enabled: true,
        name: 'Distance',
        rates: defaultDistanceRatePolicyID1,
    },
};

describe('TransactionUtils', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ID, email: 'test@example.com'},
                ...reportCollectionDataSet,
            },
        });
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

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
            const transaction = generateTransaction();

            // When retrieving the tax from the associated category
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
            const transaction = generateTransaction();

            // When retrieving the tax from a category that is not associated with the tax expense rules
            const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(selectedCategory, transaction, fakePolicy);

            // Then it should return the default tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_EXEMPT');
            expect(categoryTaxAmount).toBe(0);
        });

        it("should return the foreign default tax when the category doesn't match the tax expense rules and using a foreign currency", () => {
            // Given a policy with tax expense rules associated with a category and a transaction with a foreign currency
            const ruleCategory = 'Advertising';
            const selectedCategory = 'Benefits';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                taxRates: {
                    ...CONST.DEFAULT_TAX,
                    foreignTaxDefault: 'id_TAX_RATE_2',
                    taxes: {
                        ...CONST.DEFAULT_TAX.taxes,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        id_TAX_RATE_2: {
                            name: 'Tax rate 2',
                            value: '10%',
                        },
                    },
                },
                outputCurrency: 'IDR',
                rules: {expenseRules: createCategoryTaxExpenseRules(ruleCategory, 'id_TAX_RATE_1')},
            };
            const transaction = generateTransaction();

            // When retrieving the tax from a category that is not associated with the tax expense rules
            const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(selectedCategory, transaction, fakePolicy);

            // Then it should return the default tax code and amount
            expect(categoryTaxCode).toBe('id_TAX_RATE_2');
            expect(categoryTaxAmount).toBe(9);
        });

        describe('should return undefined tax', () => {
            it('if the transaction type is distance', () => {
                // Given a policy with tax expense rules associated with a category
                const category = 'Advertising';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(0),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {expenseRules: createCategoryTaxExpenseRules(category, 'id_TAX_RATE_1')},
                };
                const transaction: Transaction = {
                    ...generateTransaction(),
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                };

                // When retrieving the tax from the associated category
                const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy);

                // Then it should return undefined for both the tax code and the tax amount
                expect(categoryTaxCode).toBe(undefined);
                expect(categoryTaxAmount).toBe(undefined);
            });

            it('if there are no policy tax expense rules', () => {
                // Given a policy without tax expense rules
                const category = 'Advertising';
                const fakePolicy: Policy = {
                    ...createRandomPolicy(0),
                    taxRates: CONST.DEFAULT_TAX,
                    rules: {},
                };
                const transaction = generateTransaction();

                // When retrieving the tax from a category
                const {categoryTaxCode, categoryTaxAmount} = TransactionUtils.getCategoryTaxCodeAndAmount(category, transaction, fakePolicy);

                // Then it should return undefined for both the tax code and the tax amount
                expect(categoryTaxCode).toBe(undefined);
                expect(categoryTaxAmount).toBe(undefined);
            });
        });
    });

    describe('getUpdatedTransaction', () => {
        it('should return updated category and tax when updating category with a category tax rules', () => {
            // Given a policy with tax expense rules associated with a category
            const category = 'Advertising';
            const taxCode = 'id_TAX_RATE_1';
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                taxRates: CONST.DEFAULT_TAX,
                rules: {expenseRules: createCategoryTaxExpenseRules(category, taxCode)},
            };
            const transaction = generateTransaction();

            // When updating the transaction category to the category associated with the rule
            const updatedTransaction = TransactionUtils.getUpdatedTransaction({
                transaction,
                isFromExpenseReport: true,
                policy: fakePolicy,
                transactionChanges: {category},
            });

            // Then the updated transaction should contain the tax from the matched rule
            expect(updatedTransaction.category).toBe(category);
            expect(updatedTransaction.taxCode).toBe(taxCode);
            expect(updatedTransaction.taxAmount).toBe(5);
        });

        it('should update transaction when distance is changed', () => {
            // Given: a policy with a mileage rate
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: {
                    distance: {
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        customUnitID: 'distance',
                        rates: {
                            default: {
                                customUnitRateID: '1',
                                currency: CONST.CURRENCY.USD,
                                rate: 1, // 1 USD per mile
                            },
                        },
                        attributes: {
                            unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        },
                    },
                },
            };
            const transaction = generateTransaction({
                comment: {
                    customUnit: {
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        quantity: 10, // original distance
                    },
                },
                currency: CONST.CURRENCY.USD,
            });

            const newDistance = 20; // change distance to 20 miles

            // When: updating the transaction with a new distance
            const updatedTransaction = TransactionUtils.getUpdatedTransaction({
                transaction,
                isFromExpenseReport: false,
                policy: fakePolicy,
                transactionChanges: {distance: newDistance},
            });

            // Then: quantity should be updated
            expect(updatedTransaction.comment?.customUnit?.quantity).toBe(newDistance);

            // And: amount should be recalculated (20 miles × 1 USD = 20)
            expect(updatedTransaction.modifiedAmount).toBe(20);

            // And: merchant should be updated with mileage description
            expect(updatedTransaction.modifiedMerchant).toContain('20');

            // And: currency should be set from policy mileage rate
            expect(updatedTransaction.modifiedCurrency).toBe(CONST.CURRENCY.USD);

            // And: pending fields should mark distance-related updates
            expect(updatedTransaction.pendingFields).toMatchObject({
                quantity: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            });
        });
    });

    describe('shouldShowRTERViolationMessage', () => {
        it('should return true if transaction is receipt being scanned', () => {
            const transaction = generateTransaction({
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.SCAN_READY,
                },
            });
            expect(TransactionUtils.shouldShowRTERViolationMessage([transaction])).toBe(true);
        });
    });

    describe('calculateTaxAmount', () => {
        it('returns 0 for undefined percentage', () => {
            const result = TransactionUtils.calculateTaxAmount(undefined, 10000, 'USD');
            expect(result).toBe(0);
        });

        it('returns 0 for empty percentage', () => {
            const result = TransactionUtils.calculateTaxAmount('', 10000, 'USD');
            expect(result).toBe(0);
        });

        it('returns 0 for zero percentage', () => {
            const result = TransactionUtils.calculateTaxAmount('0%', 10000, 'USD');
            expect(result).toBe(0);
        });

        it('returns 0 for zero amount', () => {
            const result = TransactionUtils.calculateTaxAmount('10%', 0, 'USD');
            expect(result).toBe(0);
        });

        it('returns correct tax amount for valid percentage and amount', () => {
            const result = TransactionUtils.calculateTaxAmount('10%', 10000, 'USD');
            expect(result).toBe(9.09);
        });
    });

    describe('shouldShowBrokenConnectionViolation', () => {
        it('should return false when no broken connection violations are found for the provided transaction', () => {
            const transactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION}];
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolation(undefined, undefined, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(false);
        });

        it('should return true when a broken connection violation exists for one transaction and the user is the policy member', () => {
            const policy = {role: CONST.POLICY.ROLE.USER} as Policy;
            const transactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION}}];
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolation(undefined, policy, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(true);
        });

        it('should return true when a broken connection violation exists for any of the provided transactions and the user is the policy member', () => {
            const policy = {role: CONST.POLICY.ROLE.USER} as Policy;
            const transaction1 = generateTransaction();
            const transaction2 = generateTransaction();
            const transactionIDs = [transaction1.transactionID, transaction2.transactionID];
            const transactionViolations = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction1.transactionID}`]: [
                    {
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        name: CONST.VIOLATIONS.RTER,
                        data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION},
                    },
                ],
            };
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolationForMultipleTransactions(transactionIDs, undefined, policy, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(true);
        });

        it('should return true when a broken connection violation exists and the user is the policy admin and the expense submitter', () => {
            const policy = {role: CONST.POLICY.ROLE.ADMIN} as Policy;
            const report = processingReport;
            const transactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION}}];
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolation(report, policy, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(true);
        });

        it('should return true when a broken connection violation exists, the user is the policy admin and the expense report is in the open state', () => {
            const policy = {role: CONST.POLICY.ROLE.ADMIN} as Policy;
            const report = secondUserOpenReport;
            const transactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION}}];
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolation(report, policy, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(true);
        });

        it('should return true when a broken connection violation exists, the user is the policy admin, the expense report is in the processing state and instant submit is enabled', () => {
            const policy = {role: CONST.POLICY.ROLE.ADMIN, autoReporting: true, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT} as Policy;
            const report = processingReport;
            const transactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION}}];
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolation(report, policy, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(true);
        });

        it('should return false when a broken connection violation exists, the user is the policy admin but the expense report is in the approved state', () => {
            const policy = {role: CONST.POLICY.ROLE.ADMIN} as Policy;
            const report = approvedReport;
            const transactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.RTER, data: {rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION}}];
            const showBrokenConnectionViolation = shouldShowBrokenConnectionViolation(report, policy, transactionViolations);

            expect(showBrokenConnectionViolation).toBe(false);
        });
    });

    describe('getMerchant', () => {
        it('should return merchant if transaction has merchant', () => {
            const transaction = generateTransaction({
                merchant: 'Merchant',
            });
            const merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('Merchant');
        });

        it('should return (none) if transaction has no merchant', () => {
            const transaction = generateTransaction();
            const merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('(none)');
        });

        it('should return modified merchant if transaction has modified merchant', () => {
            const transaction = generateTransaction({
                modifiedMerchant: 'Modified Merchant',
                merchant: 'Original Merchant',
            });
            const merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('Modified Merchant');
        });

        it('should return distance merchant if transaction is distance expense and pending create', () => {
            const transaction = generateTransaction({
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
            });
            const merchant = TransactionUtils.getMerchant(transaction);
            expect(merchant).toBe('Pending...');
        });

        it('should return distance merchant if transaction is created distance expense', () => {
            return waitForBatchedUpdates()
                .then(async () => {
                    const fakePolicy: Policy = {
                        ...createRandomPolicy(0),
                        customUnits: {
                            Unit1: {
                                customUnitID: 'Unit1',
                                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                                rates: {
                                    Rate1: {
                                        customUnitRateID: 'Rate1',
                                        currency: CONST.CURRENCY.USD,
                                        rate: 100,
                                    },
                                },
                                enabled: true,
                                attributes: {
                                    unit: 'mi',
                                },
                            },
                        },
                        outputCurrency: CONST.CURRENCY.USD,
                    };
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${FAKE_OPEN_REPORT_ID}`, {policyID: fakePolicy.id});
                })
                .then(() => {
                    const transaction = generateTransaction({
                        comment: {
                            type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                            customUnit: {
                                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                                customUnitID: 'Unit1',
                                customUnitRateID: 'Rate1',
                                quantity: 100,
                                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            },
                        },
                        reportID: FAKE_OPEN_REPORT_ID,
                    });
                    const merchant = TransactionUtils.getMerchant(transaction);
                    expect(merchant).toBe('100.00 mi @ USD 1.00 / mi');
                });
        });
    });
    describe('getTransactionPendingAction', () => {
        it.each([
            ['when pendingAction is null', null, null],
            ['when pendingAction is delete', CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE],
            ['when pendingAction is add', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD],
        ])('%s', (_description, pendingAction, expected) => {
            const transaction = generateTransaction({pendingAction});
            const result = TransactionUtils.getTransactionPendingAction(transaction);
            expect(result).toEqual(expected);
        });
        it('when pendingAction is update', () => {
            const pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
            const transaction = generateTransaction({
                pendingFields: {amount: pendingAction},
                pendingAction: null,
            });
            const result = TransactionUtils.getTransactionPendingAction(transaction);
            expect(result).toEqual(pendingAction);
        });
    });

    describe('isTransactionPendingDelete', () => {
        it.each([
            ['when pendingAction is null', null, false],
            ['when pendingAction is delete', CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, true],
            ['when pendingAction is add', CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, false],
            ['when pendingAction is update', CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, false],
        ])('%s', (_description, pendingAction, expected) => {
            const transaction = generateTransaction({pendingAction});
            const result = TransactionUtils.isTransactionPendingDelete(transaction);
            expect(result).toEqual(expected);
        });
    });

    describe('isUnreportedAndHasInvalidDistanceRateTransaction', () => {
        it('should be false when transaction is null', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: defaultCustomUnitPolicyID1,
            };
            const result = TransactionUtils.isUnreportedAndHasInvalidDistanceRateTransaction(null, fakePolicy);
            expect(result).toBe(false);
        });
        it('should be false when transaction is not distance type transaction', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: defaultCustomUnitPolicyID1,
            };
            const transaction: Transaction = {
                ...generateTransaction(),
                iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            };
            const result = TransactionUtils.isUnreportedAndHasInvalidDistanceRateTransaction(transaction, fakePolicy);
            expect(result).toBe(false);
        });
        it('should be false when transaction is reported', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: defaultCustomUnitPolicyID1,
            };
            const transaction: Transaction = {
                ...generateTransaction(),
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                reportID: '1',
            };
            const result = TransactionUtils.isUnreportedAndHasInvalidDistanceRateTransaction(transaction, fakePolicy);
            expect(result).toBe(false);
        });
        it('should be false when transaction is unreported and has valid rate', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: defaultCustomUnitPolicyID1,
            };
            const transaction: Transaction = {
                ...generateTransaction(),
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                reportID: '0',
                comment: {
                    customUnit: distanceRateTransactionID1,
                    type: 'customUnit',
                },
            };

            const result = TransactionUtils.isUnreportedAndHasInvalidDistanceRateTransaction(transaction, fakePolicy);
            expect(result).toBe(false);
        });
        it('should be false when transaction is unreported, has invalid rate but policy has default rate', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: defaultCustomUnitPolicyID1,
            };
            const transaction: Transaction = {
                ...generateTransaction(),
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                reportID: '0',
                comment: {
                    customUnit: distanceRateTransactionID2,
                    type: 'customUnit',
                },
            };

            const result = TransactionUtils.isUnreportedAndHasInvalidDistanceRateTransaction(transaction, fakePolicy);
            expect(result).toBe(false);
        });
        it('should be true when transaction is unreported, has invalid rate and policy has no default rate', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(0),
                customUnits: {},
            };
            const transaction: Transaction = {
                ...generateTransaction(),
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                reportID: '0',
                comment: {
                    customUnit: distanceRateTransactionID2,
                    type: 'customUnit',
                },
            };

            const result = TransactionUtils.isUnreportedAndHasInvalidDistanceRateTransaction(transaction, fakePolicy);
            expect(result).toBe(true);
        });
    });

    describe('isViolationDismissed', () => {
        it('should return true when violation is dismissed for current user', () => {
            const transaction = generateTransaction({
                comment: {
                    dismissedViolations: {
                        [CONST.VIOLATIONS.DUPLICATED_TRANSACTION]: {
                            [CURRENT_USER_EMAIL]: DateUtils.getDBTime(),
                        },
                    },
                },
            });
            const violation = {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION};
            const result = TransactionUtils.isViolationDismissed(transaction, violation);
            expect(result).toBe(true);
        });
    });
});
