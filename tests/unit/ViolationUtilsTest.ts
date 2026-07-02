import {beforeEach} from '@jest/globals';
import Onyx from 'react-native-onyx';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Permissions from '@libs/Permissions';
import {getTransactionViolations, hasWarningTypeViolation, isViolationDismissed} from '@libs/TransactionUtils';
import ViolationsUtils, {filterReceiptViolations, getIsViolationFixed, isHardViolationOrRateDateWarning, syncCustomUnitRateOutOfDateRangeViolation} from '@libs/Violations/ViolationsUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import type {TransactionCollectionDataSet} from '@src/types/onyx/Transaction';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
        amount: CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT,
        currency: CONST.CURRENCY.USD,
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
        amount: CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT,
        currency: CONST.CURRENCY.USD,
    },
};

const categoryOverLimitViolation = {
    name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        amount: CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT,
        currency: CONST.CURRENCY.USD,
    },
};

const overTripLimitViolation = {
    name: CONST.VIOLATIONS.OVER_TRIP_LIMIT,
    type: CONST.VIOLATION_TYPES.VIOLATION,
    showInReview: true,
    data: {
        amount: 400,
        currency: CONST.CURRENCY.USD,
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

const inactiveVendorViolation = {
    name: CONST.VIOLATIONS.INACTIVE_VENDOR,
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
        const result = ViolationsUtils.getViolationsOnyxData({
            updatedTransaction: transaction,
            transactionViolations,
            policy,
            policyTagList: policyTags,
            policyCategories,
            hasDependentTags: false,
            isInvoiceTransaction: false,
        });

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
        const result = ViolationsUtils.getViolationsOnyxData({
            updatedTransaction: transaction,
            transactionViolations,
            policy,
            policyTagList: policyTags,
            policyCategories,
            hasDependentTags: false,
            isInvoiceTransaction: false,
        });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(customUnitOutOfPolicyViolation);
        });

        it('should keep the customUnitOutOfPolicy violation if the rate exists but is disabled', () => {
            const customUnitRateID = 'rate_id';
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
                            enabled: false,
                            name: 'Default Rate',
                            rate: 65.5,
                        },
                    },
                },
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY}));
        });
    });

    describe('distance rate out of date range validation', () => {
        const customUnitRateID = 'rate_id';

        beforeEach(() => {
            transactionViolations = [];
            transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.DISTANCE;
            transaction.created = '2025-06-15';
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
                            name: '2025 mileage',
                            rate: 65.5,
                            startDate: '2025-01-01',
                            endDate: '2025-12-31',
                        },
                    },
                },
            };
        });

        it('should add the customUnitRateOutOfDateRange violation when the expense date is outside the rate bounds', () => {
            transaction.created = '2026-06-15';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                }),
            );
        });

        it('should remove the customUnitRateOutOfDateRange violation when the expense date is within the rate bounds', () => {
            transactionViolations = [
                {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                },
            ];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                }),
            );
        });

        it('should not add the customUnitRateOutOfDateRange violation when the rate has no date bounds', () => {
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
            transaction.created = '2026-06-15';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                }),
            );
        });

        it('should remove the customUnitRateOutOfDateRange violation when the rate is out of policy', () => {
            transactionViolations = [
                {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                },
            ];
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
                            enabled: false,
                            name: '2025 mileage',
                            rate: 65.5,
                            startDate: '2025-01-01',
                            endDate: '2025-12-31',
                        },
                    },
                },
            };
            transaction.created = '2026-06-15';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                }),
            );
            expect(result.value).toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY}));
        });

        it('should add the customUnitRateOutOfDateRange violation for distance requests on self DM reports', () => {
            transaction.created = '2026-06-15';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: true,
            });

            expect(result.value).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                }),
            );
        });

        it('should resolve the distance rate from its owning policy on self DM reports and not add customUnitOutOfPolicy', () => {
            transaction.created = '2026-06-15';
            transactionViolations = [customUnitOutOfPolicyViolation];
            const wrongPolicy = {...policy, customUnits: {}};

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy: wrongPolicy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: true,
                distanceOriginalPolicy: policy,
            });

            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY}));
            expect(result.value).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                }),
            );
        });

        it('should not add customUnitOutOfPolicy for self DM distance requests when the rate cannot be resolved', () => {
            transaction.created = '2026-06-15';
            transactionViolations = [customUnitOutOfPolicyViolation];
            const wrongPolicy = {...policy, customUnits: {}};

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy: wrongPolicy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: true,
            });

            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY}));
            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE}));
        });

        it('should remove the customUnitRateOutOfDateRange violation for non-distance requests', () => {
            transactionViolations = [
                {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                },
            ];
            transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                }),
            );
        });
    });

    describe('isHardViolationOrRateDateWarning', () => {
        it('returns true for violation type violations', () => {
            expect(
                isHardViolationOrRateDateWarning({
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                }),
            ).toBe(true);
        });

        it('returns true for customUnitRateOutOfDateRange warnings', () => {
            expect(
                isHardViolationOrRateDateWarning({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                }),
            ).toBe(true);
        });

        it('returns false for other warning violations', () => {
            expect(
                isHardViolationOrRateDateWarning({
                    name: CONST.VIOLATIONS.MODIFIED_AMOUNT,
                    type: CONST.VIOLATION_TYPES.WARNING,
                }),
            ).toBe(false);
        });
    });

    describe('syncCustomUnitRateOutOfDateRangeViolation', () => {
        const customUnitRateID = 'rate_id';

        beforeEach(() => {
            transactionViolations = [];
            transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.DISTANCE;
            transaction.created = '2026-06-15';
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
                            name: '2025 mileage',
                            rate: 65.5,
                            startDate: '2025-01-01',
                            endDate: '2025-12-31',
                        },
                    },
                },
            };
        });

        it('should add the customUnitRateOutOfDateRange violation when the expense date is outside the rate bounds', () => {
            const result = syncCustomUnitRateOutOfDateRangeViolation(transactionViolations, transaction, policy);

            expect(result).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                }),
            );
        });

        it('should remove the customUnitRateOutOfDateRange violation when the expense date is within the rate bounds', () => {
            transaction.created = '2025-06-15';
            transactionViolations = [
                {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                },
            ];

            const result = syncCustomUnitRateOutOfDateRangeViolation(transactionViolations, transaction, policy);

            expect(result).not.toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                }),
            );
        });

        it('should update violation data when switching to a different out-of-bounds rate', () => {
            const otherRateID = 'other_rate_id';
            policy.customUnits = {
                unitId: {
                    attributes: {unit: 'mi'},
                    customUnitID: 'unitId',
                    defaultCategory: 'Car',
                    enabled: true,
                    name: 'Distance',
                    rates: {
                        [otherRateID]: {
                            currency: 'USD',
                            customUnitRateID: otherRateID,
                            enabled: true,
                            name: '2024 mileage',
                            rate: 60,
                            startDate: '2024-01-01',
                            endDate: '2024-12-31',
                        },
                    },
                },
            };
            transaction.comment = {
                ...transaction.comment,
                customUnit: {
                    ...(transaction?.comment?.customUnit ?? {}),
                    customUnitRateID: otherRateID,
                },
            };
            transactionViolations = [
                {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                },
            ];

            const result = syncCustomUnitRateOutOfDateRangeViolation(transactionViolations, transaction, policy);

            expect(result).toContainEqual(
                expect.objectContaining({
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    data: {
                        startDate: '2024-01-01',
                        endDate: '2024-12-31',
                    },
                }),
            );
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(transactionViolations);
        });

        it('should add futureDate violation if the transaction has a future date and policy is corporate', () => {
            transaction.created = '9999-12-31T23:59:59Z';
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([futureDateViolation, ...transactionViolations]));
        });

        it('should remove futureDate violation if the policy is downgraded', () => {
            transaction.created = '9999-12-31T23:59:59Z';
            policy.type = 'personal';
            transactionViolations = [futureDateViolation];
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(futureDateViolation);
        });

        it('should add receiptRequired violation if the transaction has no receipt', () => {
            transaction.amount = -1000000;
            policy.maxExpenseAmountNoReceipt = 2500;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([receiptRequiredViolation, ...transactionViolations]));
        });

        it('should not add receiptRequired violation if the transaction has different currency than the workspace currency', () => {
            transaction.amount = -1000000;
            transaction.modifiedCurrency = CONST.CURRENCY.CAD;
            policy.maxExpenseAmountNoReceipt = 2500;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([]);
        });

        it('should add overLimit violation if the transaction amount is over the policy limit', () => {
            transaction.amount = -1000000;
            policy.maxExpenseAmount = 200000;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([overLimitViolation, ...transactionViolations]));
        });

        it('should not add overLimit violation if the transaction currency is different from the workspace currency', () => {
            transaction.amount = -1000000;
            transaction.modifiedCurrency = CONST.CURRENCY.NZD;
            policy.maxExpenseAmount = 200000;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([]);
        });

        it('should add itemizedReceiptRequired violation if the transaction exceeds itemized receipt threshold and has no receipt', () => {
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -10000;
            policy.maxExpenseAmountNoItemizedReceipt = 7500;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([categoryOverLimitViolation, categoryReceiptRequiredViolation, categoryMissingCommentViolation, ...transactionViolations]));
        });

        it('should add category-level itemizedReceiptRequired violation when category is set to always', () => {
            policyCategories.Food.maxAmountNoItemizedReceipt = 0; // Category set to "Always"
            transaction.amount = -10000;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeDefined();
            expect(itemizedReceiptViolation?.data).toBeUndefined(); // Category-level violations don't have data
        });

        it('should not add itemizedReceiptRequired violation when category is set to never', () => {
            policy.maxExpenseAmountNoItemizedReceipt = 7500; // Policy requires itemized receipt over $75
            policyCategories.Food.maxAmountNoItemizedReceipt = CONST.DISABLED_MAX_EXPENSE_VALUE; // Category set to "Never"
            transaction.amount = -10000; // $100 expense - would trigger policy-level but category overrides
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            const violations = result.value as TransactionViolation[];
            const itemizedReceiptViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedReceiptViolation).toBeUndefined(); // Category "Never" should override policy
        });

        it('should use policy-level threshold when category is set to default', () => {
            policy.maxExpenseAmountNoItemizedReceipt = 7500; // Policy requires itemized receipt over $75
            // policyCategories.Food.maxAmountNoItemizedReceipt is undefined (Default - follow policy)
            transaction.amount = -10000; // $100 expense - exceeds policy threshold
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: existingViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
                {name: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true, data: {amount: 5000, currency: CONST.CURRENCY.USD}},
            ];

            // When violations are recalculated after the policy threshold changed
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: existingViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            const violations = result.value as TransactionViolation[];

            // Then the violation should have updated threshold data to reflect the current policy settings
            const itemizedViolation = violations.find((v: TransactionViolation) => v.name === CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED);
            expect(itemizedViolation).toBeDefined();
            expect(itemizedViolation?.data?.amount).toBe(7500);
            expect(itemizedViolation?.data?.currency).toBe(CONST.CURRENCY.USD);
            expect(itemizedViolation?.data?.amount).not.toBe(5000);
        });

        it('should replace receiptRequired with itemizedReceiptRequired when category changes to always require itemized', () => {
            // Given a transaction with a receiptRequired violation from the policy threshold
            policy.maxExpenseAmountNoReceipt = 2500; // $25.00
            policyCategories.Food.maxAmountNoReceipt = undefined;
            policyCategories.Food.maxAmountNoItemizedReceipt = 0;
            transaction.amount = -5000; // $50.00
            const existingViolations: TransactionViolation[] = [{name: CONST.VIOLATIONS.RECEIPT_REQUIRED, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true}];

            // When the category is changed to "always require itemized receipts"
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: existingViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: existingViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });

        it('should add categoryOutOfPolicy violation when category is not in policy', () => {
            transaction.category = 'Bananas';
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should not include a categoryOutOfPolicy violation when category is in policy', () => {
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: partialTransaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(missingCategoryViolation);
        });

        it('should not add categoryOutOfPolicy violation when category is Uncategorized', () => {
            transaction.category = 'Uncategorized';
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should add missingCategory violation when category is the Uncategorized sentinel and categories are required', () => {
            transaction.category = CONST.SEARCH.CATEGORY_DEFAULT_VALUE;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([missingCategoryViolation, ...transactionViolations]));
        });

        it('should not add categoryOutOfPolicy violation when category is none', () => {
            transaction.category = 'none';
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should add categoryOutOfPolicy violation to existing violations if they exist', () => {
            transaction.category = 'Bananas';
            transaction.amount = 1000000;
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual(expect.arrayContaining([categoryOutOfPolicyViolation, ...transactionViolations]));
        });

        it('should add missingCategory violation to existing violations if they exist', () => {
            transaction.category = undefined;
            transaction.amount = 1000000;
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

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
            const iouReport = {reportID: '1234', type: CONST.REPORT.TYPE.EXPENSE} as Report;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: partialTransaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transactionWithEnteredDetails,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transactionWithModifiedDetails as unknown as Transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.SMARTSCAN_FAILED}));
        });
    });

    describe('policy does not require Categories', () => {
        beforeEach(() => {
            policy.requiresCategory = false;
        });

        it('should not add any violations when categories are not required', () => {
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(categoryOutOfPolicyViolation);
            expect(result.value).not.toContainEqual(missingCategoryViolation);
        });

        it('should add categoryOutOfPolicy when the transaction has a category that is not in policy', () => {
            transaction.category = 'Office Supplies';
            policyCategories = {Food: {name: 'Food', enabled: true}};

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toContainEqual(categoryOutOfPolicyViolation);
        });

        it('should remove a stale missingCategory violation when categories are not required', () => {
            // e.g. after the workspace disables categories: a leftover missingCategory must clear optimistically.
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [missingCategoryViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

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
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual(transactionViolations);
        });

        it('should add a missingTag violation if none is provided and policy requires tags', () => {
            transaction.tag = undefined;

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual(expect.arrayContaining([{...missingTagViolation, showInReview: true, data: {tagName: 'Meals'}}]));
        });

        it('should not add missingTag or tagOutOfPolicy violations when policy requires tags but no tags are enabled', () => {
            policyTags = {};
            transaction.tag = undefined;

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual([]);
        });

        it('should remove an existing missingTag violation when policy requires tags but no tags are enabled', () => {
            policyTags = {};
            transaction.tag = undefined;
            transactionViolations = [missingTagViolation, {name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual([{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}]);
        });

        it('should remove existing tagOutOfPolicy when tag is cleared to empty string', () => {
            transaction.tag = '';
            transactionViolations = [tagOutOfPolicyViolation, duplicatedTransactionViolation];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(tagOutOfPolicyViolation);
            expect(result.value).toContainEqual(duplicatedTransactionViolation);
            expect(result.value).toContainEqual({...missingTagViolation, showInReview: true, data: {tagName: 'Meals'}});
        });

        it('should remove existing tagOutOfPolicy when policy requires tags, no tags are enabled, and tag is empty string', () => {
            policyTags = {};
            transaction.tag = '';
            transactionViolations = [tagOutOfPolicyViolation, duplicatedTransactionViolation];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual([duplicatedTransactionViolation]);
        });

        it('should not add a tag violation when the transaction is scanning', () => {
            const partialTransaction = {
                ...transaction,
                amount: 0,
                merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
                tag: undefined,
                receipt: {state: CONST.IOU.RECEIPT_STATE.SCANNING},
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: partialTransaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(missingTagViolation);
        });

        it('should add tagOutOfPolicy violation to existing violations if transaction has tag that is not in the policy', () => {
            transaction.tag = 'Bananas';
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual(expect.arrayContaining([{...tagOutOfPolicyViolation, data: {tagName: 'Meals'}}, ...transactionViolations]));
        });

        it('should add missingTag violation to existing violations if transaction does not have a tag', () => {
            transaction.tag = undefined;
            transactionViolations = [{name: 'duplicatedTransaction', type: CONST.VIOLATION_TYPES.VIOLATION}];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual(expect.arrayContaining([{...missingTagViolation, showInReview: true, data: {tagName: 'Meals'}}, ...transactionViolations]));
        });
    });

    describe('policy does not require Tags', () => {
        beforeEach(() => {
            policy.requiresTag = false;
        });

        it('should not add any violations when tags are not required', () => {
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(tagOutOfPolicyViolation);
            expect(result.value).not.toContainEqual(missingTagViolation);
        });

        it('should add tagOutOfPolicy when transaction has a stale tag and no tags are enabled', () => {
            policyTags = {
                Meals: {
                    name: 'Meals',
                    required: false,
                    tags: {
                        Lunch: {name: 'Lunch', enabled: false},
                        Dinner: {name: 'Dinner', enabled: false},
                    },
                    orderWeight: 1,
                },
            };
            transaction.tag = 'Lunch';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toContainEqual({...tagOutOfPolicyViolation, data: {tagName: 'Meals'}});
        });

        it('should keep existing tagOutOfPolicy when transaction has a stale tag and no tags are enabled', () => {
            policyTags = {
                Meals: {
                    name: 'Meals',
                    required: false,
                    tags: {
                        Lunch: {name: 'Lunch', enabled: false},
                        Dinner: {name: 'Dinner', enabled: false},
                    },
                    orderWeight: 1,
                },
            };
            transaction.tag = 'Lunch';
            transactionViolations = [tagOutOfPolicyViolation, duplicatedTransactionViolation];

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toContainEqual(tagOutOfPolicyViolation);
            expect(result.value).toContainEqual(duplicatedTransactionViolation);
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
            let result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has 1 tag
            transaction.tag = 'Africa';
            someTagLevelsRequiredViolation.data = {errorIndexes: [1, 2]};
            result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has 2 tags
            transaction.tag = 'Africa::Project1';
            someTagLevelsRequiredViolation.data = {errorIndexes: [1]};
            result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([someTagLevelsRequiredViolation]);

            // Test case where transaction has all tags
            transaction.tag = 'Africa:Accounting:Project1';
            result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([]);
        });
        it('should return tagOutOfPolicy when the selected tag is disabled and its level has no enabled tags left', () => {
            policyTags.Department.tags.Accounting.enabled = false;
            transaction.tag = 'Africa:Accounting:Project1';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            expect(result.value).toEqual([{...tagOutOfPolicyViolation, data: {tagName: 'Department'}}]);
        });

        it('should return tagOutOfPolicy when selected tag is disabled and another tag in that level is enabled', () => {
            policyTags.Department.tags.Engineering = {
                name: 'Engineering',
                enabled: true,
            };
            policyTags.Department.tags.Accounting.enabled = false;
            transaction.tag = 'Africa:Accounting:Project1';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            const violation = {...tagOutOfPolicyViolation, data: {tagName: 'Department'}};

            expect(result.value).toEqual([violation]);
        });
        it('should return a single tagOutOfPolicy for the first stale level when the Tags feature is disabled and no tags are enabled', () => {
            // The backend emits one tagOutOfPolicy for the whole multi-level tag (the first out-of-policy level by
            // orderWeight), so the optimistic recompute must match it instead of flagging every level.
            policyTags.Department.tags.Accounting.enabled = false;
            policyTags.Region.tags.Africa.enabled = false;
            policyTags.Project.tags.Project1.enabled = false;
            transaction.tag = 'Africa:Accounting:Project1';

            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            // Region has the lowest orderWeight (1), so it is the level the violation is reported on.
            expect(result.value).toEqual([{...tagOutOfPolicyViolation, data: {tagName: 'Region'}}]);
        });
        it('should not return allTagLevelsRequired when only non-required dependent tag levels are empty', () => {
            // Make Department non-required
            policyTags.Department.required = false;
            // Transaction has only Region and Project filled, Department (non-required) is empty
            transaction.tag = 'Africa::Project1';

            // hasDependentTags = true to exercise getTagViolationsForDependentTags
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: true,
                isInvoiceTransaction: false,
            });

            expect(result.value).not.toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED}));
        });

        it('should return allTagLevelsRequired when a required dependent tag level is empty', () => {
            // Make Project non-required, keep Region and Department required
            policyTags.Project.required = false;
            // Transaction has only Region filled, Department (required) is empty
            transaction.tag = 'Africa';

            // hasDependentTags = true to exercise getTagViolationsForDependentTags
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: true,
                isInvoiceTransaction: false,
            });

            expect(result.value).toContainEqual(expect.objectContaining({name: CONST.VIOLATIONS.ALL_TAG_LEVELS_REQUIRED}));
        });

        it('should return missingTag when all dependent tags are enabled in the policy but are not set in the transaction', () => {
            const missingDepartmentTag = {...missingTagViolation, data: {tagName: 'Department'}};
            const missingRegionTag = {...missingTagViolation, data: {tagName: 'Region'}};
            const missingProjectTag = {...missingTagViolation, data: {tagName: 'Project'}};
            transaction.tag = undefined;
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: true,
                isInvoiceTransaction: false,
            });
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

        it('should add missingAttendees violation when no attendees are present', () => {
            transaction.comment = {attendees: []};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
            expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should add missingAttendees violation when only owner is an attendee', () => {
            transaction.comment = {
                attendees: [{email: 'owner@example.com', displayName: 'Owner', avatarUrl: ''}],
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
            expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should not add missingAttendees violation when there is at least one non-owner attendee', () => {
            transaction.comment = {
                attendees: [
                    {email: 'owner@example.com', displayName: 'Owner', avatarUrl: ''},
                    {email: 'other@example.com', displayName: 'Other', avatarUrl: ''},
                ],
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should remove missingAttendees violation when attendees are added', () => {
            transactionViolations = [missingAttendeesViolation];
            transaction.comment = {
                attendees: [
                    {email: 'owner@example.com', displayName: 'Owner', avatarUrl: ''},
                    {email: 'other@example.com', displayName: 'Other', avatarUrl: ''},
                ],
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should not add missingAttendees violation when attendee tracking is disabled', () => {
            policy.isAttendeeTrackingEnabled = false;
            transaction.comment = {attendees: []};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        it('should not add missingAttendees violation when category does not require attendees', () => {
            policyCategories.Meals.areAttendeesRequired = false;
            transaction.comment = {attendees: []};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                isSelfDM: false,
                iouReport,
            });
            expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
        });

        describe('owner identified via report ownerAccountID', () => {
            const ownerLogin = 'owner@example.com';

            beforeEach(async () => {
                // Seed personal details so the report owner's accountID resolves to a login via getLoginByAccountID.
                // This populates the allPersonalDetails cache that PersonalDetailsUtils reads from.
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ownerAccountID]: {accountID: ownerAccountID, login: ownerLogin}});
                await waitForBatchedUpdates();
            });

            it('should not add missingAttendees violation for a single non-owner attendee when the owner is resolved from ownerAccountID', () => {
                // The report owner (owner@example.com) is NOT in the attendee list, so the single attendee is a genuine
                // non-owner. Without owner-aware identification, the count-based fallback would wrongly flag this as missing.
                transactionViolations = [];
                transaction.comment = {
                    attendees: [{email: 'other@example.com', displayName: 'Other', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                    iouReport,
                });
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should add missingAttendees violation when the only attendee is the report owner resolved from ownerAccountID', () => {
                transactionViolations = [];
                transaction.comment = {
                    attendees: [{email: ownerLogin, displayName: 'Owner', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                    iouReport,
                });
                expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });
        });

        describe('optimistic / offline scenarios (iouReport is undefined)', () => {
            // In offline scenarios, iouReport is undefined so we can't get ownerAccountID.
            // The code falls back to using getCurrentUserEmail() to identify the owner by login/email.
            it('should correctly calculate violation when iouReport is undefined but attendees have matching email', () => {
                // When iouReport is undefined, we use getCurrentUserEmail() as fallback
                // If only the current user (matching MOCK_CURRENT_USER_EMAIL) is an attendee, violation should show
                transactionViolations = [];
                transaction.comment = {
                    attendees: [{email: MOCK_CURRENT_USER_EMAIL, displayName: 'Test User', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
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
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
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
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
                // Violation should be removed
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should preserve violation when only owner attendee remains (offline)', () => {
                // If violation existed and only owner attendee remains, violation stays
                transactionViolations = [missingAttendeesViolation];
                transaction.comment = {
                    attendees: [{email: MOCK_CURRENT_USER_EMAIL, displayName: 'Test User', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
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

            it("should add missingAttendees violation when no attendees are present (can't identify owner)", () => {
                transactionViolations = [];
                transaction.comment = {attendees: []};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
                // With 0 attendees, attendeesMinusOwnerCount = Math.max(0, 0 - 1) = 0, violation should be added
                expect(result.value).toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });

            it('should add missingAttendees violation when only 1 attendee exists (assumed to be owner)', () => {
                transactionViolations = [];
                transaction.comment = {
                    attendees: [{email: 'anyone@example.com', displayName: 'Someone', avatarUrl: ''}],
                };
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
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
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
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
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                    isSelfDM: false,
                });
                // Violation should be removed since we now have 2 attendees
                expect(result.value).not.toEqual(expect.arrayContaining([missingAttendeesViolation]));
            });
        });
    });

    describe('taxOutOfPolicy violation', () => {
        const taxOutOfPolicyViolation = {
            name: CONST.VIOLATIONS.TAX_OUT_OF_POLICY,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        };

        describe('when tax tracking is enabled', () => {
            beforeEach(() => {
                policy.tax = {trackingEnabled: true};
            });

            it('should add taxOutOfPolicy violation when taxCode is not in policy tax rates', () => {
                transaction.taxCode = 'UNKNOWN_TAX';
                policy.taxRates = {name: 'Taxes', defaultExternalID: 'TAX_10', defaultValue: '10%', foreignTaxDefault: 'TAX_10', taxes: {TAX_10: {name: '10%', value: '10%'}}};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).toContainEqual(taxOutOfPolicyViolation);
            });

            it('should not add taxOutOfPolicy violation when taxCode is in policy tax rates', () => {
                transaction.taxCode = 'TAX_10';
                policy.taxRates = {name: 'Taxes', defaultExternalID: 'TAX_10', defaultValue: '10%', foreignTaxDefault: 'TAX_10', taxes: {TAX_10: {name: '10%', value: '10%'}}};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should remove taxOutOfPolicy violation when taxCode becomes valid', () => {
                transaction.taxCode = 'TAX_10';
                policy.taxRates = {name: 'Taxes', defaultExternalID: 'TAX_10', defaultValue: '10%', foreignTaxDefault: 'TAX_10', taxes: {TAX_10: {name: '10%', value: '10%'}}};
                transactionViolations = [taxOutOfPolicyViolation];
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should not add taxOutOfPolicy violation when the transaction has no tax code', () => {
                // An expense whose tax was deleted has an empty tax code; re-enabling tax tracking must not flag it.
                transaction.taxCode = '';
                policy.taxRates = {name: 'Taxes', defaultExternalID: 'TAX_10', defaultValue: '10%', foreignTaxDefault: 'TAX_10', taxes: {TAX_10: {name: '10%', value: '10%'}}};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should remove a stale taxOutOfPolicy violation when the tax code has been cleared', () => {
                transaction.taxCode = '';
                policy.taxRates = {name: 'Taxes', defaultExternalID: 'TAX_10', defaultValue: '10%', foreignTaxDefault: 'TAX_10', taxes: {TAX_10: {name: '10%', value: '10%'}}};
                transactionViolations = [taxOutOfPolicyViolation];
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should keep taxOutOfPolicy violation when the tax rate is disabled but still present in the policy', () => {
                // Disabling a tax rate keeps its key in the policy with `isDisabled: true` - it is no longer valid,
                // so an unrelated client-side recompute (e.g. deleting a tag offline) must not drop the violation.
                transaction.taxCode = 'TAX_10';
                policy.taxRates = {
                    name: 'Taxes',
                    defaultExternalID: 'TAX_10',
                    defaultValue: '10%',
                    foreignTaxDefault: 'TAX_10',
                    taxes: {TAX_10: {name: '10%', value: '10%', isDisabled: true}},
                };
                transactionViolations = [taxOutOfPolicyViolation];
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).toContainEqual(taxOutOfPolicyViolation);
            });
        });

        describe('when tax tracking is disabled', () => {
            beforeEach(() => {
                policy.tax = {trackingEnabled: false};
            });

            it('should add taxOutOfPolicy violation when transaction has taxCode', () => {
                transaction.taxCode = 'SOME_TAX';
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).toContainEqual(taxOutOfPolicyViolation);
            });

            it('should add taxOutOfPolicy violation when transaction has taxAmount', () => {
                transaction.taxAmount = 500;
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).toContainEqual(taxOutOfPolicyViolation);
            });

            it('should add taxOutOfPolicy violation when transaction has taxValue', () => {
                transaction.taxValue = '10%';
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).toContainEqual(taxOutOfPolicyViolation);
            });

            it('should not add taxOutOfPolicy violation when transaction has no tax data', () => {
                transaction.taxCode = undefined;
                transaction.taxAmount = undefined;
                transaction.taxValue = undefined;
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should not add taxOutOfPolicy violation when tax fields are falsy (empty string, 0)', () => {
                transaction.taxCode = '';
                transaction.taxAmount = 0;
                transaction.taxValue = '';
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should remove taxOutOfPolicy violation when tax data is cleared', () => {
                transaction.taxCode = undefined;
                transaction.taxAmount = undefined;
                transaction.taxValue = undefined;
                transactionViolations = [taxOutOfPolicyViolation];
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });
        });

        describe('time and per diem requests', () => {
            it('should not add taxOutOfPolicy violation for time requests even with tax data and tax tracking disabled', () => {
                policy.tax = {trackingEnabled: false};
                transaction.taxCode = 'SOME_TAX';
                transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.TIME;
                transaction.comment = {...transaction.comment, type: CONST.TRANSACTION.TYPE.TIME};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should not add taxOutOfPolicy violation for per diem requests even with tax data and tax tracking disabled', () => {
                policy.tax = {trackingEnabled: false};
                transaction.taxCode = 'SOME_TAX';
                transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
                transaction.comment = {...transaction.comment, type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT, customUnit: {name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });

            it('should not add taxOutOfPolicy violation for time requests even with invalid taxCode and tax tracking enabled', () => {
                policy.tax = {trackingEnabled: true};
                transaction.taxCode = 'UNKNOWN_TAX';
                transaction.iouRequestType = CONST.IOU.REQUEST_TYPE.TIME;
                transaction.comment = {...transaction.comment, type: CONST.TRANSACTION.TYPE.TIME};
                policy.taxRates = {name: 'Taxes', defaultExternalID: 'TAX_10', defaultValue: '10%', foreignTaxDefault: 'TAX_10', taxes: {TAX_10: {name: '10%', value: '10%'}}};
                const result = ViolationsUtils.getViolationsOnyxData({
                    updatedTransaction: transaction,
                    transactionViolations,
                    policy,
                    policyTagList: policyTags,
                    policyCategories,
                    hasDependentTags: false,
                    isInvoiceTransaction: false,
                });
                expect(result.value).not.toContainEqual(taxOutOfPolicyViolation);
            });
        });
    });

    describe('overTripLimit violation', () => {
        it('should add overTripLimit violation if the modified transaction amount is over the original transaction amount', () => {
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -400;
            transaction.modifiedAmount = -600;
            transaction.receipt = {
                reservationList: [
                    {
                        start: {date: '2023-07-24'},
                        end: {date: '2023-07-25'},
                        type: 'train',
                    },
                ],
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([overTripLimitViolation, ...transactionViolations]));
        });

        it('should not add overTripLimit violation if the modified transaction currency is different from the original transaction currency', () => {
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -400;
            transaction.modifiedAmount = -600;
            transaction.currency = CONST.CURRENCY.USD;
            transaction.modifiedCurrency = CONST.CURRENCY.GBP;
            transaction.receipt = {
                reservationList: [
                    {
                        start: {date: '2023-07-24'},
                        end: {date: '2023-07-25'},
                        type: 'train',
                    },
                ],
            };
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([]);
        });

        it('should remove overTripLimit violation if the modified transaction amount is not over the original transaction amount', () => {
            policy.outputCurrency = CONST.CURRENCY.USD;
            transaction.amount = -400;
            transaction.modifiedAmount = -300;
            transaction.receipt = {
                reservationList: [
                    {
                        start: {date: '2023-07-24'},
                        end: {date: '2023-07-25'},
                        type: 'train',
                    },
                ],
            };
            const modifiedTransactionViolations = [overTripLimitViolation, ...transactionViolations];
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: modifiedTransactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual([]);
        });
    });

    describe('inactiveVendor violation', () => {
        let isBetaEnabledSpy: jest.SpyInstance;

        // Pass a `vendors` array to control the synced list, or `null` to simulate the list still
        // hydrating (`data.vendors` absent, so `isMatchingVendorListLoaded` returns false).
        const policyWithQBOVendorFeature = (vendors: Array<{id: string; name: string; currency: string}> | null = [{id: 'v-active', name: 'Acme Co', currency: 'USD'}]) =>
            ({
                requiresTag: false,
                requiresCategory: false,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                        data: vendors ? {vendors} : {},
                    },
                },
            }) as unknown as Policy;

        beforeEach(async () => {
            // Default to beta-enabled so the four branches of the violation logic are reachable.
            // The "beta disabled" test overrides this below.
            isBetaEnabledSpy = jest.spyOn(Permissions, 'isBetaEnabled').mockImplementation((beta) => beta === CONST.BETAS.VENDOR_MATCHING);
            // Seed ONYXKEYS.BETAS so the module-level `allBetas` in ViolationsUtils transitions
            // from undefined (startup) to defined. The production code skips the reconcile block
            // entirely when `allBetas === undefined` to avoid stripping valid server-set violations
            // during the startup window; without seeding here the tests would never reach the
            // branches they're trying to exercise. The actual contents don't matter — the spy on
            // `Permissions.isBetaEnabled` decides the beta result — we just need `allBetas` defined.
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await waitForBatchedUpdates();
        });

        afterEach(() => {
            isBetaEnabledSpy.mockRestore();
        });

        it('adds the violation when the transaction vendor is not in the policy vendor list', () => {
            policy = policyWithQBOVendorFeature();
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-missing', isManuallySet: true}};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).toEqual(expect.arrayContaining([inactiveVendorViolation]));
        });

        it('does not duplicate the violation when one is already present and the vendor is still missing', () => {
            policy = policyWithQBOVendorFeature();
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-missing', isManuallySet: true}};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [inactiveVendorViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect((result.value as TransactionViolation[]).filter((v) => v.name === CONST.VIOLATIONS.INACTIVE_VENDOR)).toHaveLength(1);
        });

        it('removes an existing violation when the vendor is restored in the policy list', () => {
            policy = policyWithQBOVendorFeature();
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-active', isManuallySet: true}};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [inactiveVendorViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(inactiveVendorViolation);
        });

        it('removes an existing violation when the user clears the vendor while the feature is still active', () => {
            policy = policyWithQBOVendorFeature();
            // transaction.comment has no vendor key — represents a cleared selection
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [inactiveVendorViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(inactiveVendorViolation);
        });

        it('removes an existing violation when the vendor feature is disabled (QBO export type changed)', () => {
            policy = {
                requiresTag: false,
                requiresCategory: false,
                connections: {
                    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                        config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL},
                        data: {vendors: [{id: 'v-active', name: 'Acme Co', currency: 'USD'}]},
                    },
                },
            } as unknown as Policy;
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-active', isManuallySet: true}};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [inactiveVendorViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(inactiveVendorViolation);
        });

        it('does not add the violation when the feature is inactive (no QBO connection)', () => {
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-anything', isManuallySet: true}};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(inactiveVendorViolation);
        });

        it('does not add the violation when the vendorMatching beta is disabled, even with QBO configured', () => {
            isBetaEnabledSpy.mockImplementation(() => false);
            policy = policyWithQBOVendorFeature();
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-missing', isManuallySet: true}};
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            expect(result.value).not.toContainEqual(inactiveVendorViolation);
        });

        it('does not add the violation while the QBO vendor list is still hydrating (vendors undefined)', () => {
            // Given a QBO-configured workspace whose vendor list has not yet synced (data.vendors is undefined)
            policy = policyWithQBOVendorFeature(null);
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-anything', isManuallySet: true}};

            // When violations are recomputed
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations,
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            // Then no inactive-vendor violation is added — we can't know whether the assigned vendor is missing until the list loads
            expect(result.value).not.toContainEqual(inactiveVendorViolation);
        });

        it('preserves an existing violation while the QBO vendor list is still hydrating', () => {
            // Given the vendor list is still hydrating but an inactive-vendor violation already exists from a prior real check
            policy = policyWithQBOVendorFeature(null);
            transaction.comment = {...transaction.comment, vendor: {externalID: 'v-active', isManuallySet: true}};

            // When violations are recomputed
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [inactiveVendorViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });

            // Then the existing violation is not stripped — stripping it pre-hydration would briefly hide a legitimate violation
            expect(result.value).toContainEqual(inactiveVendorViolation);
        });
    });
    describe('shouldRemoveRejectedExpenseViolation (move transaction / explicit removal)', () => {
        const autoRejectedViolation: TransactionViolation = {
            name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
            type: CONST.VIOLATION_TYPES.VIOLATION,
            showInReview: true,
        };

        it('removes AUTO_REPORTED_REJECTED_EXPENSE from output when shouldRemoveRejectedExpenseViolation is true', () => {
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [autoRejectedViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
                shouldRemoveRejectedExpenseViolation: true,
            });
            const violations = (result.value ?? []) as TransactionViolation[];
            expect(violations.some((v) => v.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)).toBe(false);
        });

        it('keeps AUTO_REPORTED_REJECTED_EXPENSE when the 11th param is omitted and submitter-edit branch does not apply', () => {
            const result = ViolationsUtils.getViolationsOnyxData({
                updatedTransaction: transaction,
                transactionViolations: [autoRejectedViolation],
                policy,
                policyTagList: policyTags,
                policyCategories,
                hasDependentTags: false,
                isInvoiceTransaction: false,
            });
            const violations = (result.value ?? []) as TransactionViolation[];
            expect(violations.some((v) => v.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE)).toBe(true);
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
        const brokenCardConnectionViolationExpected = translateLocal('violations.rter', true, true, false, undefined, CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION, companyCardPageURL);
        expect(ViolationsUtils.getViolationTranslation({violation: brokenCardConnectionViolation, translate: translateLocal, convertToDisplayString})).toBe(
            brokenCardConnectionViolationExpected,
        );
        const brokenCardConnection530ViolationExpected = translateLocal(
            'violations.rter',
            true,
            false,
            false,
            undefined,
            CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530,
            companyCardPageURL,
        );
        expect(ViolationsUtils.getViolationTranslation({violation: brokenCardConnection530Violation, translate: translateLocal, convertToDisplayString})).toBe(
            brokenCardConnection530ViolationExpected,
        );
    });

    describe('increasedDistance violation', () => {
        const increasedDistanceViolation: TransactionViolation = {
            name: CONST.VIOLATIONS.INCREASED_DISTANCE,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        };

        const metersToKm = 0.001;
        const metersToMiles = 0.000621371;
        const routeDistanceMeters = 16840;
        const routeDistanceKm = `${(routeDistanceMeters * metersToKm).toFixed(2)} km`;
        const routeDistanceMi = `${(routeDistanceMeters * metersToMiles).toFixed(2)} mi`;

        beforeEach(() => {
            IntlStore.load(CONST.LOCALES.EN);
            return waitForBatchedUpdates();
        });

        it('should return formatted message with route distance in km', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: increasedDistanceViolation,
                translate: translateLocal,
                convertToDisplayString,
                canEdit: true,
                routeDistanceMeters,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            });
            expect(result).toBe(`Distance exceeds the calculated route of ${routeDistanceKm}`);
        });

        it('should return formatted message with route distance in miles', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: increasedDistanceViolation,
                translate: translateLocal,
                convertToDisplayString,
                canEdit: true,
                routeDistanceMeters,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            });
            expect(result).toBe(`Distance exceeds the calculated route of ${routeDistanceMi}`);
        });

        it('should return fallback message when routeDistanceMeters is zero', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: increasedDistanceViolation,
                translate: translateLocal,
                convertToDisplayString,
                canEdit: true,
                routeDistanceMeters: 0,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            });
            expect(result).toBe('Distance exceeds the calculated route');
        });

        it('should return fallback message when routeDistanceMeters is undefined', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: increasedDistanceViolation,
                translate: translateLocal,
                convertToDisplayString,
                canEdit: true,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            });
            expect(result).toBe('Distance exceeds the calculated route');
        });

        it('should return fallback message when distanceUnit is undefined', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: increasedDistanceViolation,
                translate: translateLocal,
                convertToDisplayString,
                canEdit: true,
                routeDistanceMeters,
            });
            expect(result).toBe('Distance exceeds the calculated route');
        });
    });

    describe('customUnitRateOutOfDateRange violation', () => {
        it('should return the formatted message when both start and end dates are present', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    },
                },
                translate: translateLocal,
                convertToDisplayString,
            });

            expect(result).toBe('Rate is only valid from January 1, 2025 to December 31, 2025');
        });

        it('should return the formatted message when only the start date is present', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        startDate: '2025-01-01',
                    },
                },
                translate: translateLocal,
                convertToDisplayString,
            });

            expect(result).toBe('Rate is only valid from January 1, 2025');
        });

        it('should return the formatted message when only the end date is present', () => {
            const result = ViolationsUtils.getViolationTranslation({
                violation: {
                    name: CONST.VIOLATIONS.CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        endDate: '2025-12-31',
                    },
                },
                translate: translateLocal,
                convertToDisplayString,
            });

            expect(result).toBe('Rate is only valid until December 31, 2025');
        });
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
        const result = ViolationsUtils.getRBRMessages({
            transaction: mockTransaction,
            transactionViolations: mockViolations,
            translate: translateLocal,
            convertToDisplayString,
            missingFieldError,
            transactionThreadActions: [],
        });
        const expectedResult = `Missing required field. ${translateLocal('violations.missingCategory')}. ${translateLocal('violations.missingTag')}.`;

        expect(result).toBe(expectedResult);
    });

    it('should filter out empty strings', () => {
        const result = ViolationsUtils.getRBRMessages({
            transaction: mockTransaction,
            transactionViolations: mockViolations,
            translate: translateLocal,
            convertToDisplayString,
            transactionThreadActions: [],
        });
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

        it('should return true when tag exists but no tags are enabled', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: 'Lunch',
                policyTagLists: createPolicyTagList('Lunch', false),
            });
            expect(result).toBe(true);
        });

        it('should return false when tag exists but is disabled while other tags are enabled', () => {
            const result = getIsViolationFixed('violations.tagOutOfPolicy', {
                ...defaultParams,
                tag: 'Lunch',
                policyTagLists: {
                    Meals: {
                        name: 'Meals',
                        required: true,
                        orderWeight: 1,
                        tags: {
                            Lunch: {name: 'Lunch', enabled: false},
                            Dinner: {name: 'Dinner', enabled: true},
                        },
                    },
                },
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

        it("should return false when taxCodes match but the taxValues doesn't", () => {
            const result = getIsViolationFixed('violations.taxOutOfPolicy', {
                ...defaultParams,
                taxCode: 'CUSTOM_TAX',
                taxValue: '15',
                policyTaxRates: {CUSTOM_TAX: {name: '10%', value: '10'}},
            });
            expect(result).toBe(false);
        });

        it('should return false when the taxCode exists but its rate is disabled', () => {
            const result = getIsViolationFixed('violations.taxOutOfPolicy', {
                ...defaultParams,
                taxCode: 'TAX_10',
                policyTaxRates: {TAX_10: {name: '10%', value: '10', isDisabled: true}},
            });
            expect(result).toBe(false);
        });
    });

    describe('violations.customUnitRateOutOfDateRange', () => {
        it('should return true when the expense date is within the rate bounds', () => {
            const result = getIsViolationFixed('violations.customUnitRateOutOfDateRange', {
                ...defaultParams,
                expenseDate: '2025-06-15',
                mileageRate: {unit: 'mi', startDate: '2025-01-01', endDate: '2025-12-31'},
            });
            expect(result).toBe(true);
        });

        it('should return false when the expense date is outside the rate bounds', () => {
            const result = getIsViolationFixed('violations.customUnitRateOutOfDateRange', {
                ...defaultParams,
                expenseDate: '2026-06-15',
                mileageRate: {unit: 'mi', startDate: '2025-01-01', endDate: '2025-12-31'},
            });
            expect(result).toBe(false);
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
                isControlPolicy: true,
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
                isControlPolicy: true,
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
                isControlPolicy: true,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: true}},
                iouAttendees: [createAttendee('user@example.com'), createAttendee('other@example.com')],
            });
            expect(result).toBe(true);
        });

        it('should return true (violation fixed) when policy is not Control type, even if category requires attendees', () => {
            // This covers the downgrade scenario: after downgrading from Control to Collect,
            // the category may still have areAttendeesRequired: true but we should not enforce it
            const result = getIsViolationFixed('violations.missingAttendees', {
                ...defaultParams,
                isAttendeeTrackingEnabled: true,
                isControlPolicy: false,
                category: 'Meals',
                policyCategories: {Meals: {name: 'Meals', enabled: true, areAttendeesRequired: true}},
                iouAttendees: [],
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
            amount: 7500,
            currency: CONST.CURRENCY.USD,
        },
    };

    const receiptRequiredViolationWithData: TransactionViolation = {
        name: CONST.VIOLATIONS.RECEIPT_REQUIRED,
        type: CONST.VIOLATION_TYPES.VIOLATION,
        showInReview: true,
        data: {
            amount: 2500,
            currency: CONST.CURRENCY.USD,
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
