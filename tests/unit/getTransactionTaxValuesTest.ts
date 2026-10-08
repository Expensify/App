import getTransactionTaxValues from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';
import type Transaction from '@src/types/onyx/Transaction';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';

const STANDARD_TAX_CODE = 'TAX_STANDARD';
const REDUCED_TAX_CODE = 'TAX_REDUCED';
const FOREIGN_TAX_CODE = 'TAX_FOREIGN';
const RENAMED_FROM_TAX_CODE = 'TAX_OLD_STANDARD';

const DISTANCE_UNIT_ID = 'distanceUnit';
const DISTANCE_RATE_ID = 'distanceRate';

function buildPolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
        outputCurrency: CONST.CURRENCY.USD,
        tax: {trackingEnabled: true},
        taxRates: {
            name: 'Tax',
            defaultExternalID: STANDARD_TAX_CODE,
            defaultValue: '10%',
            foreignTaxDefault: FOREIGN_TAX_CODE,
            taxes: {
                [STANDARD_TAX_CODE]: {name: 'Standard', value: '10%', previousTaxCode: RENAMED_FROM_TAX_CODE},
                [REDUCED_TAX_CODE]: {name: 'Reduced', value: '5%'},
                [FOREIGN_TAX_CODE]: {name: 'Foreign', value: '0%'},
            },
        },
        customUnits: {},
        ...overrides,
    };
}

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        ...createRandomTransaction(1),
        iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        currency: CONST.CURRENCY.USD,
        modifiedCurrency: '',
        ...overrides,
    };
}

const BASE_PARAMS = {
    isPolicyExpenseChat: true,
    isUnreported: false,
    isTrackExpense: false,
    isSelfDMDestination: false,
    isDistanceRequest: false,
    isPerDiemRequest: false,
    isTimeRequest: false,
};

describe('getTransactionTaxValues', () => {
    it('uses the policy default tax rate when the expense has no tax code yet', () => {
        // Given a workspace with tax tracking on and an expense in the workspace currency with no tax picked
        const policy = buildPolicy();
        const transaction = buildTransaction();

        // When the tax values are computed for a workspace chat
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy});

        // Then the workspace default rate is applied
        expect(result).toEqual({transactionTaxCode: STANDARD_TAX_CODE, transactionTaxAmount: 0, transactionTaxValue: '10%'});
    });

    it('uses the foreign tax default when the expense currency differs from the workspace currency', () => {
        // Given a workspace with tax tracking on and an expense in a foreign currency with no tax picked
        const policy = buildPolicy();
        const transaction = buildTransaction({currency: CONST.CURRENCY.EUR});

        // When the tax values are computed for a workspace chat
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy});

        // Then the foreign default rate is applied instead of the workspace default
        expect(result).toEqual({transactionTaxCode: FOREIGN_TAX_CODE, transactionTaxAmount: 0, transactionTaxValue: '0%'});
    });

    it('keeps the tax code picked on the expense over the default', () => {
        // Given an expense where the user picked the reduced rate
        const policy = buildPolicy();
        const transaction = buildTransaction({taxCode: REDUCED_TAX_CODE});

        // When the tax values are computed for a workspace chat
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy});

        // Then the picked rate is used
        expect(result).toEqual({transactionTaxCode: REDUCED_TAX_CODE, transactionTaxAmount: 0, transactionTaxValue: '5%'});
    });

    it('resolves a tax code that was renamed after it was picked', () => {
        // Given an expense that still holds a tax code the workspace has since renamed
        const policy = buildPolicy();
        const transaction = buildTransaction({taxCode: RENAMED_FROM_TAX_CODE});

        // When the tax values are computed for a workspace chat
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy});

        // Then the current code of that rate is submitted, so the back-end does not receive a stale code
        expect(result).toEqual({transactionTaxCode: STANDARD_TAX_CODE, transactionTaxAmount: 0, transactionTaxValue: '10%'});
    });

    it('returns the tax amount and value already stored on the expense', () => {
        // Given an expense with a stored tax amount, and a stored tax value that no longer matches the rate's current 5%
        const policy = buildPolicy();
        const transaction = buildTransaction({taxCode: REDUCED_TAX_CODE, taxAmount: 50, taxValue: '7%'});

        // When the tax values are computed for a workspace chat
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy});

        // Then the stored amount and value are kept rather than recomputed from the workspace rate
        expect(result).toEqual({transactionTaxCode: REDUCED_TAX_CODE, transactionTaxAmount: 50, transactionTaxValue: '7%'});
    });

    it('returns no tax code when the workspace has tax tracking off', () => {
        // Given a workspace with tax tracking turned off
        const policy = buildPolicy({tax: {trackingEnabled: false}});
        const transaction = buildTransaction();

        // When the tax values are computed for a workspace chat
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy});

        // Then no tax is applied
        expect(result).toEqual({transactionTaxCode: '', transactionTaxAmount: 0, transactionTaxValue: ''});
    });

    it('returns no tax code for an expense sent to another person', () => {
        // Given a workspace with tax tracking on
        const policy = buildPolicy();
        const transaction = buildTransaction();

        // When the tax values are computed for a destination that is not a workspace chat, unreported, tracked or self DM
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy, isPolicyExpenseChat: false});

        // Then no tax is applied, because only workspace-bound expenses track tax
        expect(result).toEqual({transactionTaxCode: '', transactionTaxAmount: 0, transactionTaxValue: ''});
    });

    it.each(['isUnreported', 'isTrackExpense', 'isSelfDMDestination'] as const)('applies tax when %s is the only destination flag set', (flag) => {
        // Given a workspace with tax tracking on
        const policy = buildPolicy();
        const transaction = buildTransaction();

        // When the tax values are computed for a destination that is not a workspace chat but still tracks tax
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy, isPolicyExpenseChat: false, [flag]: true});

        // Then the workspace default rate is applied
        expect(result.transactionTaxCode).toBe(STANDARD_TAX_CODE);
    });

    it.each(['isPerDiemRequest', 'isTimeRequest'] as const)('returns no tax code when %s is set', (flag) => {
        // Given a workspace with tax tracking on
        const policy = buildPolicy();
        const transaction = buildTransaction();

        // When the tax values are computed for a request type that never tracks tax
        const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy, [flag]: true});

        // Then no tax is applied
        expect(result.transactionTaxCode).toBe('');
    });

    describe('distance requests', () => {
        function buildDistancePolicy(isDistanceTaxEnabled: boolean): Policy {
            return buildPolicy({
                customUnits: {
                    [DISTANCE_UNIT_ID]: {
                        customUnitID: DISTANCE_UNIT_ID,
                        name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                        attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: isDistanceTaxEnabled},
                        rates: {
                            [DISTANCE_RATE_ID]: {customUnitRateID: DISTANCE_RATE_ID, attributes: {taxRateExternalID: REDUCED_TAX_CODE}},
                        },
                    },
                },
            });
        }

        function buildDistanceTransaction(): Transaction {
            const transaction = buildTransaction({iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE});
            return {
                ...transaction,
                comment: {...transaction.comment, customUnit: {name: CONST.CUSTOM_UNITS.NAME_DISTANCE, customUnitRateID: DISTANCE_RATE_ID}},
            };
        }

        it('uses the tax rate of the selected distance rate', () => {
            // Given a workspace whose distance unit tracks tax and whose rate is tied to the reduced tax rate
            const policy = buildDistancePolicy(true);
            const transaction = buildDistanceTransaction();

            // When the tax values are computed for a distance expense
            const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy, isDistanceRequest: true});

            // Then the distance rate's tax rate is applied instead of the workspace default
            expect(result).toEqual({transactionTaxCode: REDUCED_TAX_CODE, transactionTaxAmount: 0, transactionTaxValue: '5%'});
        });

        it('returns no tax code when the distance unit does not track tax', () => {
            // Given a workspace with tax tracking on but tax turned off for its distance unit
            const policy = buildDistancePolicy(false);
            const transaction = buildDistanceTransaction();

            // When the tax values are computed for a distance expense
            const result = getTransactionTaxValues({...BASE_PARAMS, transaction, policy, isDistanceRequest: true});

            // Then no tax is applied, because distance tax is controlled separately from workspace tax tracking
            expect(result.transactionTaxCode).toBe('');
        });
    });
});
