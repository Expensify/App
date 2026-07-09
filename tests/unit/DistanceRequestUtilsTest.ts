import DistanceRequestUtils from '@libs/DistanceRequestUtils';

import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';
import type Policy from '@src/types/onyx/Policy';
import type Transaction from '@src/types/onyx/Transaction';

import createRandomTransaction from '../utils/collections/transaction';
import {translateLocal} from '../utils/TestHelper';

const customUnitRateIDWithTaxClaimablePercentage = 'FG515011039A4';
const rateWithTaxClaimablePercentage = 100;
const totalDistance = 1000;
const taxClaimablePercentage = 0.5;
const distanceUnit: Unit = CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
const customUnitRateIDWithOutTaxClaimablePercentage = 'EB515052039A4';
const distanceCustomUnitBase = {
    attributes: {
        taxEnabled: true,
        unit: distanceUnit,
    },
    customUnitID: 'C9031B6F4725D',
    defaultCategory: '',
    enabled: true,
    name: 'Distance',
};
const FAKE_POLICY: Policy = {
    id: 'CEEEDB0EC660F71A',
    name: 'Test',
    role: 'admin',
    type: 'corporate',
    owner: 'work.sa1206+travel@gmail.com',
    outputCurrency: 'USD',
    isPolicyExpenseChatEnabled: true,
    customUnits: {
        C9031B6F4725D: {
            ...distanceCustomUnitBase,
            rates: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '222AAF6B93BCB': {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: '222AAF6B93BCB',
                    enabled: true,
                    name: 'Default Rate',
                    rate: 67,
                    subRates: [],
                },
                EE75E6DBC6FF8: {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: 'EE75E6DBC6FF8',
                    enabled: true,
                    name: 'Default Rate 1',
                    rate: 100,
                    subRates: [],
                },
                B593F3FBBB0BD: {
                    currency: 'USD',
                    name: 'New Rate',
                    rate: 900,
                    customUnitRateID: 'B593F3FBBB0BD',
                    enabled: true,
                    attributes: {},
                    subRates: [],
                    pendingFields: {},
                },
                [customUnitRateIDWithOutTaxClaimablePercentage]: {
                    currency: 'USD',
                    customUnitRateID: `${customUnitRateIDWithOutTaxClaimablePercentage}`,
                    enabled: true,
                    name: 'Default Rate',
                    rate: 72.5,
                    subRates: [],
                    attributes: {
                        taxRateExternalID: 'id_TAX_RATE_1',
                    },
                    pendingFields: {},
                },
                [customUnitRateIDWithTaxClaimablePercentage]: {
                    currency: 'USD',
                    customUnitRateID: `${customUnitRateIDWithTaxClaimablePercentage}`,
                    enabled: true,
                    name: 'Default Rate',
                    rate: rateWithTaxClaimablePercentage,
                    subRates: [],
                    attributes: {
                        taxRateExternalID: 'id_TAX_RATE_1',
                        taxClaimablePercentage,
                    },
                    pendingFields: {},
                },
            },
        },
    },
};

const DATE_BOUND_POLICY: Policy = {
    ...FAKE_POLICY,
    customUnits: {
        C9031B6F4725D: {
            ...distanceCustomUnitBase,
            rates: {
                DEFAULT_RATE_ID: {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: 'DEFAULT_RATE_ID',
                    enabled: true,
                    name: 'Default Rate',
                    rate: 67,
                    subRates: [],
                    index: 0,
                },
                RATE_2025_ID: {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: 'RATE_2025_ID',
                    enabled: true,
                    name: '2025 Rate',
                    rate: 70,
                    subRates: [],
                    index: 1,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                },
                RATE_2026_ID: {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: 'RATE_2026_ID',
                    enabled: true,
                    name: '2026 Rate',
                    rate: 75,
                    subRates: [],
                    index: 2,
                    startDate: '2026-01-01',
                    endDate: '2026-12-31',
                },
                RATE_2026_H1_ID: {
                    attributes: {},
                    currency: 'USD',
                    customUnitRateID: 'RATE_2026_H1_ID',
                    enabled: true,
                    name: '2026 H1 Rate',
                    rate: 80,
                    subRates: [],
                    index: 3,
                    startDate: '2026-01-01',
                    endDate: '2026-06-30',
                },
            },
        },
    },
};

describe('DistanceRequestUtils', () => {
    describe('getDistanceRequestAmount', () => {
        test.each([
            [350, 8605.146, 'mi', 65.5],
            [561, 8605.146, 'km', 65.1],
        ] as const)('Correctly calculates amount %s for %s%s at a rate of %s per unit', (expectedResult: number, distance: number, unit: Unit, rate: number) => {
            expect(DistanceRequestUtils.getDistanceRequestAmount(distance, unit, rate)).toBe(expectedResult);
        });
    });
    describe('getCustomUnitRateID', () => {
        it('returns Fake P2P custom unit rateID if reportID is undefined', () => {
            const reportID = undefined;
            const isPolicyExpenseChat = false;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: undefined,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });

        it('returns Fake P2P custom unit rateID if isPolicyExpenseChat is false', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = false;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: undefined,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });

        it('returns Fake P2P custom unit rateID if policy is undefined', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = true;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: undefined,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe(CONST.CUSTOM_UNITS.FAKE_P2P_ID);
        });

        it('returns policy default rateID custom unit rateID if lastSelectedDistanceRates is undefined', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = true;

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: FAKE_POLICY,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe('222AAF6B93BCB');
        });

        it('returns policy last selected rateID custom unit rateID if lastSelectedDistanceRates is defined', () => {
            const reportID = '1234';
            const isPolicyExpenseChat = true;

            const lastSelectedDistanceRates = {
                [FAKE_POLICY.id]: 'B593F3FBBB0BD',
            };

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat,
                policy: FAKE_POLICY,
                lastSelectedDistanceRates,
            });

            expect(result).toBe('B593F3FBBB0BD');
        });

        it('returns policy default rateID custom unit for isTrackDistanceExpense', () => {
            const reportID = '1234';

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID,
                isPolicyExpenseChat: false,
                policy: FAKE_POLICY,
                lastSelectedDistanceRates: undefined,
                isTrackDistanceExpense: true,
            });

            expect(result).toBe('222AAF6B93BCB');
        });

        it('returns last selected rate when no expense date is provided', () => {
            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: DATE_BOUND_POLICY,
                lastSelectedDistanceRates: {[DATE_BOUND_POLICY.id]: 'RATE_2025_ID'},
            });

            expect(result).toBe('RATE_2025_ID');
        });

        it('returns last selected rate when it is eligible for the expense date', () => {
            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: DATE_BOUND_POLICY,
                lastSelectedDistanceRates: {[DATE_BOUND_POLICY.id]: 'RATE_2026_ID'},
                expenseDate: '2026-03-15',
            });

            expect(result).toBe('RATE_2026_ID');
        });

        it('returns the best eligible rate when the last selected rate is not eligible for the expense date', () => {
            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: DATE_BOUND_POLICY,
                lastSelectedDistanceRates: {[DATE_BOUND_POLICY.id]: 'RATE_2025_ID'},
                expenseDate: '2026-03-15',
            });

            expect(result).toBe('RATE_2026_H1_ID');
        });

        it('returns the best eligible rate when no last selected rate is provided', () => {
            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: DATE_BOUND_POLICY,
                lastSelectedDistanceRates: undefined,
                expenseDate: '2025-06-01',
            });

            expect(result).toBe('RATE_2025_ID');
        });

        it('returns the unbounded default rate when no date-bound rates are eligible for the expense date', () => {
            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: DATE_BOUND_POLICY,
                lastSelectedDistanceRates: undefined,
                expenseDate: '2024-06-01',
            });

            expect(result).toBe('DEFAULT_RATE_ID');
        });

        it('returns the policy default rate when no expense date is provided and no last selected rate exists', () => {
            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: DATE_BOUND_POLICY,
                lastSelectedDistanceRates: undefined,
            });

            expect(result).toBe('DEFAULT_RATE_ID');
        });

        it('returns the policy default rate as a fallback when no rates are eligible for the expense date', () => {
            const boundedOnlyPolicy: Policy = {
                ...DATE_BOUND_POLICY,
                customUnits: {
                    C9031B6F4725D: {
                        ...distanceCustomUnitBase,
                        rates: {
                            DEFAULT_RATE_ID: {
                                attributes: {},
                                currency: 'USD',
                                customUnitRateID: 'DEFAULT_RATE_ID',
                                enabled: true,
                                name: 'Default Rate',
                                rate: 67,
                                subRates: [],
                                index: 0,
                                startDate: '2025-01-01',
                                endDate: '2025-12-31',
                            },
                            RATE_2026_ID: {
                                attributes: {},
                                currency: 'USD',
                                customUnitRateID: 'RATE_2026_ID',
                                enabled: true,
                                name: '2026 Rate',
                                rate: 75,
                                subRates: [],
                                index: 1,
                                startDate: '2026-01-01',
                                endDate: '2026-12-31',
                            },
                        },
                    },
                },
            };

            const result = DistanceRequestUtils.getCustomUnitRateID({
                reportID: '1234',
                isPolicyExpenseChat: true,
                policy: boundedOnlyPolicy,
                lastSelectedDistanceRates: undefined,
                expenseDate: '2024-06-01',
            });

            expect(result).toBe('DEFAULT_RATE_ID');
        });
    });

    describe('getDistanceForDisplay', () => {
        it('returns empty string when distance is 0 and isManualDistanceRequest is false', () => {
            const result = DistanceRequestUtils.getDistanceForDisplay(true, 0, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, 67, translateLocal, false, false);
            expect(result).toBe('');
        });

        it('formats zero distance when isManualDistanceRequest is true', () => {
            const result = DistanceRequestUtils.getDistanceForDisplay(true, 0, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, 67, translateLocal, false, true);
            expect(result).toBe(`0.00 ${translateLocal('common.miles')}`);
        });

        it('formats zero reimbursable commuter distance', () => {
            const commuterExclusionData = {
                commuterExclusion: 1,
                reimbursableDistance: 0,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            };

            const result = DistanceRequestUtils.getDistanceForDisplay(
                true,
                DistanceRequestUtils.convertToDistanceInMeters(1, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                67,
                translateLocal,
                false,
                false,
                commuterExclusionData,
            );

            expect(result).toBe(`0.00 ${translateLocal('common.miles')}`);
        });
    });

    describe('getCommuterExclusionDisplayData', () => {
        it('returns stored commuter display data from custom unit', () => {
            const result = DistanceRequestUtils.getCommuterExclusionDisplayData(
                {
                    quantity: 4,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                    commuterExclusion: 1,
                    reimbursableDistance: 3,
                },
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            );

            expect(result).toEqual({
                commuterExclusion: 1,
                reimbursableDistance: 3,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            });
        });
    });

    describe('getTransactionCommuterExclusionData', () => {
        it('builds optimistic commuter fields from route distance in meters', () => {
            const getCurrencySymbolMock = (currency: string): string | undefined => (currency === CONST.CURRENCY.USD ? '$' : undefined);
            const toLocaleDigitMock = (digit: string) => digit;
            const transaction = {
                ...createRandomTransaction(1),
                currency: CONST.CURRENCY.USD,
                comment: {
                    customUnit: {
                        customUnitRateID: '222AAF6B93BCB',
                        distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                        routeDistanceMeters: DistanceRequestUtils.convertToDistanceInMeters(4, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
                    },
                },
            } as Transaction;
            const policy = {
                ...FAKE_POLICY,
                commuterExclusions: {
                    method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                    fixedDistance: 1,
                    fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            };

            const result = DistanceRequestUtils.getTransactionCommuterExclusionData({
                transaction,
                policy,
                translate: translateLocal,
                toLocaleDigit: toLocaleDigitMock,
                getCurrencySymbol: getCurrencySymbolMock,
            });

            expect(result?.modifiedAmount).toBe(201);
            expect(result?.modifiedMerchant).toBe('3.00 mi @ $0.67 / mi');
            expect(result?.customUnit.quantity).toBe(4);
            expect(result?.customUnit.commuterExclusion).toBe(1);
            expect(result?.customUnit.reimbursableDistance).toBe(3);
        });
    });

    describe('getRate', () => {
        it('returns the rate from policyForMovingExpenses if an unreported transaction rate belongs to it', () => {
            const transaction = {...createRandomTransaction(1), reportID: '0', comment: {customUnit: {customUnitRateID: 'EE75E6DBC6FF8'}}};
            const result = DistanceRequestUtils.getRate({policyForMovingExpenses: FAKE_POLICY, transaction, policy: undefined});
            expect(result.customUnitRateID).toBe('EE75E6DBC6FF8');
        });

        it('does not return the default rate of the policy if the customUnitRateID of the tracked transaction does not exist', () => {
            const transaction = {...createRandomTransaction(1), reportID: '0', comment: {customUnit: {customUnitRateID: 'some-rate'}}};
            const result = DistanceRequestUtils.getRate({policy: FAKE_POLICY, transaction});
            expect(result.customUnitRateID).toBeUndefined();
        });

        describe('output currency resolution', () => {
            // getRate resolves the currency as `policy.outputCurrency ?? personalPolicyOutputCurrency ?? personal policy ?? USD`.
            // Every caller that threads personalPolicyOutputCurrency relies on this precedence, and it's what lets the
            // getPersonalPolicy() fallback be removed later: a caller that passes the currency must get the same result.
            // A non-P2P rate ID that doesn't resolve to any policy rate + `isMovingTransactionFromTrackExpense` forces the
            // mileage rate to be undefined, so the returned `currency` falls through to the resolved policy currency.
            const unresolvedRateTransaction = {
                ...createRandomTransaction(1),
                comment: {customUnit: {customUnitRateID: 'nonexistent-rate-id'}},
            } as Transaction;

            it('uses personalPolicyOutputCurrency when no policy currency is available', () => {
                const result = DistanceRequestUtils.getRate({
                    transaction: unresolvedRateTransaction,
                    policy: undefined,
                    isMovingTransactionFromTrackExpense: true,
                    personalPolicyOutputCurrency: 'EUR',
                });
                expect(result.currency).toBe('EUR');
            });

            it('prefers the policy outputCurrency over personalPolicyOutputCurrency', () => {
                const result = DistanceRequestUtils.getRate({
                    transaction: unresolvedRateTransaction,
                    policy: {...FAKE_POLICY, outputCurrency: 'GBP'},
                    isMovingTransactionFromTrackExpense: true,
                    personalPolicyOutputCurrency: 'EUR',
                });
                expect(result.currency).toBe('GBP');
            });

            it('falls back to USD when neither a policy currency nor personalPolicyOutputCurrency is provided', () => {
                const result = DistanceRequestUtils.getRate({
                    transaction: unresolvedRateTransaction,
                    policy: undefined,
                    isMovingTransactionFromTrackExpense: true,
                });
                expect(result.currency).toBe(CONST.CURRENCY.USD);
            });
        });
    });

    describe('getRateForP2P', () => {
        // These tests run with the default P2P mileage rate unloaded (it's fetched asynchronously when a
        // distance request starts), which is the case for flows that don't start a new distance request,
        // such as editing an existing distance expense.
        it('falls back to the existing transaction currency and unit when the default P2P rate is not loaded', () => {
            // Given an existing P2P distance expense in GBP measured in kilometers, with its own saved rate
            const transaction = {
                ...createRandomTransaction(1),
                currency: 'GBP',
                comment: {customUnit: {distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS, defaultP2PRate: 45}},
            } as Transaction;

            // When reading the P2P rate for that transaction's currency
            const result = DistanceRequestUtils.getRateForP2P('GBP', transaction);

            // Then it preserves the transaction's currency, unit, and saved rate instead of flipping to USD/miles
            expect(result.currency).toBe('GBP');
            expect(result.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            expect(result.rate).toBe(45);
        });

        it('falls back to USD and miles for a brand-new request with no transaction', () => {
            // Given a brand-new distance request that has no transaction yet
            // When reading the P2P rate
            const result = DistanceRequestUtils.getRateForP2P('GBP', undefined);

            // Then it falls back to the hardcoded USD/miles default
            expect(result.currency).toBe(CONST.CURRENCY.USD);
            expect(result.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            expect(result.rate).toBe(67);
        });
    });

    describe('getDistanceMerchant', () => {
        const toLocaleDigitMock = (dot: string): string => dot;
        const getCurrencySymbolMock = (currency: string): string | undefined => {
            if (currency === 'USD') {
                return '$';
            }
            return undefined;
        };

        it('formats zero distance when isManualDistanceRequest is true', () => {
            const result = DistanceRequestUtils.getDistanceMerchant(
                true,
                0,
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                67,
                'USD',
                translateLocal,
                toLocaleDigitMock,
                getCurrencySymbolMock,
                true,
            );
            expect(result).toBe('0.00 mi @ $0.67 / mi');
        });

        it('formats distance merchants with a currency amount', () => {
            const result = DistanceRequestUtils.getDistanceMerchant(
                true,
                DistanceRequestUtils.convertToDistanceInMeters(3.49, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                67,
                'USD',
                translateLocal,
                toLocaleDigitMock,
                getCurrencySymbolMock,
                true,
            );

            expect(result).toBe('3.49 mi @ $0.67 / mi');
        });

        it('formats zero reimbursable commuter distance', () => {
            const result = DistanceRequestUtils.getDistanceMerchant(
                true,
                DistanceRequestUtils.convertToDistanceInMeters(1, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES),
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                67,
                'USD',
                translateLocal,
                toLocaleDigitMock,
                getCurrencySymbolMock,
                false,
                {
                    commuterExclusion: 1,
                    reimbursableDistance: 0,
                    distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            );

            expect(result).toBe('0.00 mi @ $0.67 / mi');
        });
    });

    describe('getTaxableAmount', () => {
        it('should return 0 if tax reclaimable percentage is undefined', () => {
            const result = DistanceRequestUtils.getTaxableAmount(FAKE_POLICY, customUnitRateIDWithOutTaxClaimablePercentage, totalDistance);
            expect(result).toBe(0);
        });

        it('should return taxable amount that is greater than 0 if tax reclaimable percentage is greater than 0', () => {
            const result = DistanceRequestUtils.getTaxableAmount(FAKE_POLICY, customUnitRateIDWithTaxClaimablePercentage, totalDistance);
            const expectedTaxableAmount = taxClaimablePercentage * DistanceRequestUtils.getDistanceRequestAmount(totalDistance, distanceUnit, rateWithTaxClaimablePercentage);
            expect(result).toEqual(expectedTaxableAmount);
        });
    });

    describe('getRateForExpenseDisplay', () => {
        const toLocaleDigitMock = (dot: string): string => dot;
        const getCurrencySymbolMock = (currency: string): string | undefined => {
            if (currency === 'USD') {
                return '$';
            }
            return currency;
        };
        const rateParams = ['mi' as const, 67, 'USD', translateLocal, toLocaleDigitMock, getCurrencySymbolMock, false] as const;

        it('should return rate name for workspace expenses', () => {
            const result = DistanceRequestUtils.getRateForExpenseDisplay('Default Rate', false, ...rateParams);
            expect(result).toBe('Default Rate');
        });

        it('should return formatted rate value for P2P expenses (no rate name)', () => {
            const result = DistanceRequestUtils.getRateForExpenseDisplay(undefined, false, ...rateParams);
            expect(result).toBe(`$0.67 / ${translateLocal('common.mile')}`);
        });

        it('should return out-of-policy message for workspace expenses with invalid rate', () => {
            const result = DistanceRequestUtils.getRateForExpenseDisplay('Default Rate', true, ...rateParams);
            expect(result).toBe(translateLocal('common.rateOutOfPolicy'));
        });
    });

    describe('isRateEligibleForDate', () => {
        const boundedRate = {
            customUnitRateID: 'rate_1',
            rate: 65,
            unit: distanceUnit,
            startDate: '2025-01-01',
            endDate: '2025-12-31',
        };

        it('should treat a DB timestamp on the inclusive end date as eligible', () => {
            expect(DistanceRequestUtils.isRateEligibleForDate(boundedRate, '2025-12-31 10:00:00')).toBe(true);
        });

        it('should treat a DB timestamp on the inclusive start date as eligible', () => {
            expect(DistanceRequestUtils.isRateEligibleForDate(boundedRate, '2025-01-01 08:30:00')).toBe(true);
        });

        it('should treat a DB timestamp after the end date as ineligible', () => {
            expect(DistanceRequestUtils.isRateEligibleForDate(boundedRate, '2026-01-01 00:00:00')).toBe(false);
        });
    });
});
