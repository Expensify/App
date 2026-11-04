import {
    deletePolicyDistanceRates,
    enablePolicyDistanceRates,
    setEmployeeWorkArrangement,
    setPolicyDistanceRatesUnit,
    setWorkspaceDistanceAutoUpdate,
    updateEmployeeOfficeLocation,
} from '@libs/actions/Policy/DistanceRate';
import * as API from '@libs/API';
import {pause, resetQueue} from '@libs/Network/SequentialQueue';
import {isGovernmentRateUnmodified} from '@libs/PolicyDistanceRatesUtils';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GovernmentMileageRate, Policy, Report, ReportActions, Transaction, TransactionViolations} from '@src/types/onyx';
import type {CustomUnit, OfficeLocation, Rate, Unit} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('DistanceRate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    function getPolicyFromOnyx(policyID: string): Promise<Policy> {
        return new Promise<Policy>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}` as const,
                // eslint-disable-next-line rulesdir/prefer-early-return
                callback: (value) => {
                    if (value !== undefined) {
                        Onyx.disconnect(connection);
                        resolve(value);
                    }
                },
            });
        });
    }

    function getReportActionsFromOnyx(reportID: string) {
        return new Promise<ReportActions>((resolve) => {
            const connection = Onyx.connect({
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const,
                // eslint-disable-next-line rulesdir/prefer-early-return
                callback: (value) => {
                    if (value !== undefined) {
                        Onyx.disconnect(connection);
                        resolve(value);
                    }
                },
            });
        });
    }

    describe('deletePolicyDistanceRates', () => {
        it('should set customUnitOutOfPolicy violation only for transactions that have the deleted custom unit rate', async () => {
            const customUnitID = '5A55C2B68DDCB';
            const customUnitRateID1 = '7255CA72C7E7B';
            const customUnitRateID2 = '7255CA72C7E72';
            const transaction1: Transaction = {
                ...createRandomTransaction(1),
                comment: {
                    customUnit: {
                        customUnitID,
                        customUnitRateID: customUnitRateID1,
                    },
                },
            };
            const transaction2: Transaction = {
                ...createRandomTransaction(2),
                comment: {
                    customUnit: {
                        customUnitID,
                        customUnitRateID: customUnitRateID2,
                    },
                },
            };
            const policy: Policy = {
                ...createRandomPolicy(3),
                ...{
                    areDistanceRatesEnabled: true,
                    customUnits: {
                        [customUnitID]: {
                            attributes: {
                                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            },
                            customUnitID,
                            defaultCategory: 'Car',
                            enabled: true,
                            name: 'Distance',
                            rates: {
                                [customUnitRateID1]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID1,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 70,
                                    subRates: [],
                                },
                                [customUnitRateID2]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID2,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 71,
                                    subRates: [],
                                },
                            },
                        },
                    },
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction1.transactionID}`, transaction1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction2.transactionID}`, transaction2);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            if (policy.customUnits) {
                deletePolicyDistanceRates(policy.id, policy.customUnits[customUnitID], [customUnitRateID1], [transaction1.transactionID], undefined);
            }
            await waitForBatchedUpdates();
            const transactionViolations = await new Promise<Record<string, TransactionViolations | undefined>>((resolve) => {
                Onyx.connect({
                    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
                    callback: resolve,
                });
            });

            expect(transactionViolations).toEqual({
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction1.transactionID}`]: [
                    {name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY, showInReview: true, type: CONST.VIOLATION_TYPES.VIOLATION},
                ],
            });
        });
    });

    describe('enablePolicyDistanceRates', () => {
        it('should disable all rates except the default rate when the we disable the feature', async () => {
            const customUnitID = '5A55C2B68DDCB';
            const customUnitRateID1 = '7255CA72C7E7B';
            const customUnitRateID2 = '7255CA72C7E72';
            const policy: Policy = {
                ...createRandomPolicy(3),
                ...{
                    areDistanceRatesEnabled: true,
                    customUnits: {
                        [customUnitID]: {
                            attributes: {
                                unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                            },
                            customUnitID,
                            defaultCategory: 'Car',
                            enabled: true,
                            name: 'Distance',
                            rates: {
                                [customUnitRateID1]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID1,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 70,
                                    subRates: [],
                                },
                                [customUnitRateID2]: {
                                    currency: 'ETB',
                                    customUnitRateID: customUnitRateID2,
                                    enabled: true,
                                    name: 'Default Rate',
                                    rate: 71,
                                    subRates: [],
                                },
                            },
                        },
                    },
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            if (policy.customUnits) {
                pause();
                enablePolicyDistanceRates(policy.id, false, policy.customUnits[customUnitID]);
            }
            await waitForBatchedUpdates();
            const onyxPolicy = await new Promise<Policy>((resolve) => {
                const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
                Onyx.connect({
                    key: policyKey,
                    // eslint-disable-next-line rulesdir/prefer-early-return
                    callback: (value) => {
                        if (value !== undefined) {
                            resolve(value);
                        }
                    },
                });
            });

            if (!policy?.customUnits) {
                return;
            }

            expect(onyxPolicy).toEqual({
                ...policy,
                areDistanceRatesEnabled: false,
                pendingFields: {
                    areDistanceRatesEnabled: 'update',
                },
                customUnits: {
                    [customUnitID]: {
                        ...policy.customUnits[customUnitID],
                        rates: {
                            [customUnitRateID1]: {
                                ...policy.customUnits[customUnitID].rates[customUnitRateID1],
                                enabled: true,
                            },
                            [customUnitRateID2]: {
                                ...policy.customUnits[customUnitID].rates[customUnitRateID2],
                                enabled: false,
                            },
                        },
                    },
                },
            });

            resetQueue();
        });
    });

    describe('setWorkspaceDistanceAutoUpdate', () => {
        const customUnitID = '5A55C2B68DDCB';
        const existingRateID = '7255CA72C7E7B';

        const usGovernmentRates: GovernmentMileageRate[] = [
            {sourceRateID: 'US_2025-01-01', currency: 'USD', name: '2025 United States', rate: 70, startDate: '2025-01-01', endDate: '2025-12-31', enabled: true},
            {sourceRateID: 'US_2026-01-01', currency: 'USD', name: '2026 United States', rate: 72.5, startDate: '2026-01-01', enabled: true},
        ];

        function buildPolicy(policyOverrides: Partial<Policy> = {}, unit: Unit = CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, rates: CustomUnit['rates'] = {}): Policy {
            return {
                ...createRandomPolicy(4),
                areDistanceRatesEnabled: true,
                outputCurrency: 'USD',
                customUnits: {
                    [customUnitID]: {
                        attributes: {unit},
                        customUnitID,
                        enabled: true,
                        name: 'Distance',
                        rates,
                    },
                },
                ...policyOverrides,
            };
        }

        afterEach(() => {
            resetQueue();
            return Onyx.clear();
        });

        it('should copy every government rate for the policy currency with a snapshot that marks it auto-generated', async () => {
            const policy = buildPolicy();
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy, true, usGovernmentRates);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            const optimisticRates = Object.values(onyxPolicy.customUnits?.[customUnitID].rates ?? {});

            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
            expect(onyxPolicy.pendingFields?.shouldAutoUpdateGovernmentDistanceRates).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(optimisticRates).toHaveLength(2);

            const openEndedRate = optimisticRates.find((rate) => rate.attributes?.governmentRate?.sourceRateID === 'US_2026-01-01');
            expect(openEndedRate).toMatchObject({
                name: '2026 United States',
                rate: 72.5,
                currency: 'USD',
                enabled: true,
                startDate: '2026-01-01',
                attributes: {governmentRate: {sourceRateID: 'US_2026-01-01', rate: 72.5, startDate: '2026-01-01'}},
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });
            // An open-ended rate must omit the end date on both sides, or the lightning bolt icon treats the copy as edited
            expect(openEndedRate?.endDate).toBeUndefined();
            expect(openEndedRate?.attributes?.governmentRate?.endDate).toBeUndefined();
            expect(openEndedRate).toBeDefined();
            expect(openEndedRate && isGovernmentRateUnmodified(openEndedRate)).toBe(true);

            // Each copied rate is stored under the client-generated ID sent in optimisticRateIDs
            for (const rate of optimisticRates) {
                expect(onyxPolicy.customUnits?.[customUnitID].rates[rate.customUnitRateID]).toBeDefined();
            }
        });

        it('should skip government rates the policy already has and rates loaded for another currency', async () => {
            const policy = buildPolicy({}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, {
                [existingRateID]: {
                    customUnitRateID: existingRateID,
                    name: '2025 United States',
                    rate: 70,
                    currency: 'USD',
                    enabled: true,
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    attributes: {governmentRate: {sourceRateID: 'US_2025-01-01', rate: 70, startDate: '2025-01-01', endDate: '2025-12-31'}},
                },
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const canadianRate: GovernmentMileageRate = {sourceRateID: 'CA_2026-01-01', currency: 'CAD', name: '2026 Canada', rate: 73, startDate: '2026-01-01', enabled: true};

            pause();
            setWorkspaceDistanceAutoUpdate(policy, true, [...usGovernmentRates, canadianRate]);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            const sourceRateIDs = Object.values(onyxPolicy.customUnits?.[customUnitID].rates ?? {}).map((rate) => rate.attributes?.governmentRate?.sourceRateID);

            // US_2025-01-01 is already copied and CA_2026-01-01 is another currency, so only US_2026-01-01 is added
            expect(sourceRateIDs).toHaveLength(2);
            expect(sourceRateIDs).toContain('US_2025-01-01');
            expect(sourceRateIDs).toContain('US_2026-01-01');
            expect(sourceRateIDs).not.toContain('CA_2026-01-01');
        });

        it('should correct the distance unit when it does not match the unit the country publishes rates in', async () => {
            // A CAD policy tracking miles ends up on kilometers
            const policy = buildPolicy({outputCurrency: 'CAD'}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy, true, []);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.customUnits?.[customUnitID].attributes?.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            expect(onyxPolicy.customUnits?.[customUnitID].pendingFields?.attributes).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('should leave the distance unit alone when it already matches the country', async () => {
            const policy = buildPolicy({}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy, true, []);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.customUnits?.[customUnitID].attributes?.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            expect(onyxPolicy.customUnits?.[customUnitID].pendingFields?.attributes).toBeUndefined();
        });

        it('should clear the flag and keep existing government rates when disabling', async () => {
            const existingRate: Rate = {
                customUnitRateID: existingRateID,
                name: '2026 United States',
                rate: 72.5,
                currency: 'USD',
                enabled: true,
                startDate: '2026-01-01',
                attributes: {governmentRate: {sourceRateID: 'US_2026-01-01', rate: 72.5, startDate: '2026-01-01'}},
            };
            const policy = buildPolicy({shouldAutoUpdateGovernmentDistanceRates: true}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, {[existingRateID]: existingRate});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy, false, usGovernmentRates);
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBeUndefined();
            expect(onyxPolicy.pendingFields?.shouldAutoUpdateGovernmentDistanceRates).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            // Disabling only stops future propagation
            expect(onyxPolicy.customUnits?.[customUnitID].rates[existingRateID]).toMatchObject({rate: 72.5, startDate: '2026-01-01'});
        });

        it('should only copy the rates of the selected country when the currency is shared and correct the unit', async () => {
            const deRate: GovernmentMileageRate = {sourceRateID: 'DE_2026-01-01', currency: 'EUR', name: '2026 Germany', rate: 30, startDate: '2026-01-01', enabled: true};
            const frRate: GovernmentMileageRate = {sourceRateID: 'FR_2026-01-01', currency: 'EUR', name: '2026 France', rate: 32, startDate: '2026-01-01', enabled: true};
            const usRate: GovernmentMileageRate = {sourceRateID: 'US_2026-01-01', currency: 'USD', name: '2026 United States', rate: 72.5, startDate: '2026-01-01', enabled: true};

            // A EUR workspace on miles picks Germany, whose rates are published in kilometers
            const policy = buildPolicy({outputCurrency: 'EUR'}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate(policy, true, [deRate, frRate, usRate], 'DE');
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.autoUpdateGovernmentRateCountry).toBe('DE');
            const sourceRateIDs = Object.values(onyxPolicy.customUnits?.[customUnitID].rates ?? {}).map((rate) => rate.attributes?.governmentRate?.sourceRateID);
            expect(sourceRateIDs).toEqual(['DE_2026-01-01']);
            expect(onyxPolicy.customUnits?.[customUnitID].attributes?.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
        });

        it('should still write the flag and country when the custom unit is not loaded yet', async () => {
            const deRate: GovernmentMileageRate = {sourceRateID: 'DE_2026-01-01', currency: 'EUR', name: '2026 Germany', rate: 30, startDate: '2026-01-01', enabled: true};
            const policy = buildPolicy({outputCurrency: 'EUR'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setWorkspaceDistanceAutoUpdate({...policy, customUnits: undefined}, true, [deRate], 'DE');
            await waitForBatchedUpdates();

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
            expect(onyxPolicy.autoUpdateGovernmentRateCountry).toBe('DE');
            expect(onyxPolicy.pendingFields?.shouldAutoUpdateGovernmentDistanceRates).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            expect(onyxPolicy.customUnits?.[customUnitID].rates).toStrictEqual({});
        });

        it('should restore the previous country and keep the flag on when a country change fails', async () => {
            const deRate: GovernmentMileageRate = {sourceRateID: 'DE_2026-01-01', currency: 'EUR', name: '2026 Germany', rate: 30, startDate: '2026-01-01', enabled: true};
            const policy = buildPolicy(
                {outputCurrency: 'EUR', shouldAutoUpdateGovernmentDistanceRates: true, autoUpdateGovernmentRateCountry: 'DE'},
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            );
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const mockFetch = TestHelper.createGlobalFetchMock();
            const originalFetch = global.fetch;
            global.fetch = mockFetch;
            mockFetch.fail();
            setWorkspaceDistanceAutoUpdate(policy, true, [deRate], 'FR');
            await waitForBatchedUpdates();
            global.fetch = originalFetch;

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
            expect(onyxPolicy.autoUpdateGovernmentRateCountry).toBe('DE');
            expect(onyxPolicy.pendingFields?.shouldAutoUpdateGovernmentDistanceRates).toBeUndefined();
            expect(onyxPolicy.errorFields?.shouldAutoUpdateGovernmentDistanceRates).not.toBeUndefined();
        });

        it('should clear the flag and keep the stored country when enabling fails', async () => {
            const deRate: GovernmentMileageRate = {sourceRateID: 'DE_2026-01-01', currency: 'EUR', name: '2026 Germany', rate: 30, startDate: '2026-01-01', enabled: true};
            const policy = buildPolicy({outputCurrency: 'EUR', autoUpdateGovernmentRateCountry: 'DE'}, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const mockFetch = TestHelper.createGlobalFetchMock();
            const originalFetch = global.fetch;
            global.fetch = mockFetch;
            mockFetch.fail();
            setWorkspaceDistanceAutoUpdate(policy, true, [deRate], 'DE');
            await waitForBatchedUpdates();
            global.fetch = originalFetch;

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBeUndefined();
            expect(onyxPolicy.autoUpdateGovernmentRateCountry).toBe('DE');
        });

        it('should keep the flag on and the stored country when disabling fails', async () => {
            const policy = buildPolicy(
                {outputCurrency: 'EUR', shouldAutoUpdateGovernmentDistanceRates: true, autoUpdateGovernmentRateCountry: 'DE'},
                CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            );
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const mockFetch = TestHelper.createGlobalFetchMock();
            const originalFetch = global.fetch;
            global.fetch = mockFetch;
            mockFetch.fail();
            setWorkspaceDistanceAutoUpdate(policy, false, []);
            await waitForBatchedUpdates();
            global.fetch = originalFetch;

            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.shouldAutoUpdateGovernmentDistanceRates).toBe(true);
            expect(onyxPolicy.autoUpdateGovernmentRateCountry).toBe('DE');
        });

        describe('UK fuel-band rates', () => {
            const ukStandardRate: GovernmentMileageRate = {sourceRateID: 'GB_2011-04-06', currency: 'GBP', name: 'United Kingdom', rate: 45, startDate: '2011-04-06', enabled: true};
            const petrolBandJune: GovernmentMileageRate = {
                sourceRateID: 'GB_PETROL_UP_TO_1400_2026-06-01',
                currency: 'GBP',
                name: 'Cars & Vans (Petrol/Hybrid) - Up to 1400cc',
                rate: 45,
                startDate: '2026-06-01',
                endDate: '2026-08-31',
                enabled: true,
                taxClaimablePercentage: 12 / 45,
            };
            const petrolBandSeptember: GovernmentMileageRate = {
                ...petrolBandJune,
                sourceRateID: 'GB_PETROL_UP_TO_1400_2026-09-01',
                startDate: '2026-09-01',
                endDate: undefined,
                taxClaimablePercentage: 13 / 45,
            };
            const dieselBand: GovernmentMileageRate = {
                sourceRateID: 'GB_DIESEL_UP_TO_1600_2026-09-01',
                currency: 'GBP',
                name: 'Cars & Vans (Diesel) - Up to 1600cc',
                rate: 45,
                startDate: '2026-09-01',
                enabled: true,
                taxClaimablePercentage: 11 / 45,
            };
            const ukGovernmentRates = [ukStandardRate, petrolBandJune, petrolBandSeptember, dieselBand];

            function buildUKPolicy(isTrackingTax: boolean, isDistanceTaxEnabled: boolean, rates: CustomUnit['rates'] = {}): Policy {
                return buildPolicy({
                    outputCurrency: 'GBP',
                    tax: {trackingEnabled: isTrackingTax},
                    customUnits: {
                        [customUnitID]: {
                            attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, taxEnabled: isDistanceTaxEnabled},
                            customUnitID,
                            enabled: true,
                            name: 'Distance',
                            rates,
                        },
                    },
                });
            }

            async function enableAutoUpdate(policy: Policy, governmentMileageRates: GovernmentMileageRate[] = ukGovernmentRates): Promise<Rate[]> {
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
                pause();
                setWorkspaceDistanceAutoUpdate(policy, true, governmentMileageRates);
                await waitForBatchedUpdates();
                const onyxPolicy = await getPolicyFromOnyx(policy.id);
                return Object.values(onyxPolicy.customUnits?.[customUnitID].rates ?? {});
            }

            const getRateBySourceID = (rates: Rate[], sourceRateID: string) => rates.find((rate) => rate.attributes?.governmentRate?.sourceRateID === sourceRateID);

            it('should copy only the fuel bands, with their reclaimable fraction, when the workspace tracks distance tax', async () => {
                // Given a GBP workspace with tax tracking and distance tax on
                const policy = buildUKPolicy(true, true);

                // When auto-update is turned on
                const rates = await enableAutoUpdate(policy);

                // Then only the fuel bands are copied, since the server gives these workspaces the bands instead of the standard rate
                expect(rates.map((rate) => rate.attributes?.governmentRate?.sourceRateID).sort()).toEqual([
                    'GB_DIESEL_UP_TO_1600_2026-09-01',
                    'GB_PETROL_UP_TO_1400_2026-06-01',
                    'GB_PETROL_UP_TO_1400_2026-09-01',
                ]);

                // And each band keeps its reclaimable fraction on the rate and the snapshot, so it shows the lightning bolt
                const dieselRate = getRateBySourceID(rates, dieselBand.sourceRateID);
                expect(dieselRate?.attributes?.taxClaimablePercentage).toBe(11 / 45);
                expect(dieselRate?.attributes?.governmentRate?.taxClaimablePercentage).toBe(11 / 45);
                expect(dieselRate?.attributes?.taxRateExternalID).toBeUndefined();
                expect(dieselRate && isGovernmentRateUnmodified(dieselRate, CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES)).toBe(true);
            });

            it('should copy only the standard rate when the workspace does not track distance tax', async () => {
                // Given GBP workspaces where tax tracking or distance tax is off
                const distanceTaxOffPolicy = buildUKPolicy(true, false);
                const taxTrackingOffPolicy = buildUKPolicy(false, true);

                // When auto-update is turned on
                const distanceTaxOffRates = await enableAutoUpdate(distanceTaxOffPolicy);
                resetQueue();
                await Onyx.clear();
                const taxTrackingOffRates = await enableAutoUpdate(taxTrackingOffPolicy);

                // Then only the standard rate is copied, with no reclaimable fraction
                for (const rates of [distanceTaxOffRates, taxTrackingOffRates]) {
                    expect(rates.map((rate) => rate.attributes?.governmentRate?.sourceRateID)).toEqual(['GB_2011-04-06']);
                    expect(rates.at(0)?.attributes?.taxClaimablePercentage).toBeUndefined();
                }
            });

            it('should copy the standard rate when the workspace tracks distance tax but no fuel bands are published', async () => {
                // Given a GBP workspace with tax tracking and distance tax on, and reference rates with only the standard rate
                const policy = buildUKPolicy(true, true);

                // When auto-update is turned on
                const rates = await enableAutoUpdate(policy, [ukStandardRate]);

                // Then the standard rate is copied, since the server copies it to every workspace until it publishes fuel bands
                expect(rates.map((rate) => rate.attributes?.governmentRate?.sourceRateID)).toEqual(['GB_2011-04-06']);
                expect(rates.at(0)?.attributes?.taxClaimablePercentage).toBeUndefined();
            });

            it('should still copy the rates of other countries when the workspace tracks distance tax', async () => {
                // Given a USD workspace with tax tracking and distance tax on
                const usPolicy = {...buildUKPolicy(true, true), outputCurrency: 'USD'};

                // When auto-update is turned on
                const rates = await enableAutoUpdate(usPolicy, usGovernmentRates);

                // Then the US rates are copied as before, because only the UK publishes fuel bands
                expect(rates).toHaveLength(2);
            });

            it('should keep a disabled fuel band disabled for every later rate of its series in the same request', async () => {
                // Given an eligible GBP workspace whose earlier petrol band an admin disabled, and whose earlier diesel band an
                // admin edited to their own amount and disabled
                const editedDieselRateID = '5A1D3C8E9F0B2';
                const policy = buildUKPolicy(true, true, {
                    [existingRateID]: {
                        customUnitRateID: existingRateID,
                        name: 'Cars & Vans (Petrol/Hybrid) - Up to 1400cc',
                        rate: 45,
                        currency: 'GBP',
                        enabled: false,
                        startDate: '2026-03-01',
                        endDate: '2026-05-31',
                        attributes: {
                            taxClaimablePercentage: 12 / 45,
                            governmentRate: {sourceRateID: 'GB_PETROL_UP_TO_1400_2026-03-01', rate: 45, startDate: '2026-03-01', endDate: '2026-05-31', taxClaimablePercentage: 12 / 45},
                        },
                    },
                    [editedDieselRateID]: {
                        customUnitRateID: editedDieselRateID,
                        name: 'Cars & Vans (Diesel) - Up to 1600cc',
                        rate: 50,
                        currency: 'GBP',
                        enabled: false,
                        startDate: '2026-03-01',
                        endDate: '2026-08-31',
                        attributes: {
                            taxClaimablePercentage: 11 / 45,
                            governmentRate: {sourceRateID: 'GB_DIESEL_UP_TO_1600_2026-03-01', rate: 45, startDate: '2026-03-01', endDate: '2026-08-31', taxClaimablePercentage: 11 / 45},
                        },
                    },
                });

                // When auto-update copies two later petrol periods and a diesel band, listed out of date order
                const rates = await enableAutoUpdate(policy, [dieselBand, petrolBandSeptember, petrolBandJune]);

                // Then both petrol periods stay disabled, the later one inheriting from the earlier one copied in this request
                expect(getRateBySourceID(rates, petrolBandJune.sourceRateID)?.enabled).toBe(false);
                expect(getRateBySourceID(rates, petrolBandSeptember.sourceRateID)?.enabled).toBe(false);

                // And the September diesel band is enabled, because the earlier diesel rate was edited and is the admin's own,
                // so its disabled state doesn't opt the workspace out of the government rate
                expect(getRateBySourceID(rates, dieselBand.sourceRateID)?.enabled).toBe(true);
            });

            it('should enable a copied fuel band when its latest previous rate was edited, even if an older one was disabled', async () => {
                // Given an eligible GBP workspace whose March diesel band is unmodified and disabled, and whose June diesel band an
                // admin edited to their own amount
                const marchDieselRateID = '3B7E0A9C4D1F6';
                const juneDieselRateID = '8C2F5E1A7B3D0';
                const policy = buildUKPolicy(true, true, {
                    [marchDieselRateID]: {
                        customUnitRateID: marchDieselRateID,
                        name: 'Cars & Vans (Diesel) - Up to 1600cc',
                        rate: 45,
                        currency: 'GBP',
                        enabled: false,
                        startDate: '2026-03-01',
                        endDate: '2026-05-31',
                        attributes: {
                            taxClaimablePercentage: 11 / 45,
                            governmentRate: {sourceRateID: 'GB_DIESEL_UP_TO_1600_2026-03-01', rate: 45, startDate: '2026-03-01', endDate: '2026-05-31', taxClaimablePercentage: 11 / 45},
                        },
                    },
                    [juneDieselRateID]: {
                        customUnitRateID: juneDieselRateID,
                        name: 'Cars & Vans (Diesel) - Up to 1600cc',
                        rate: 50,
                        currency: 'GBP',
                        enabled: true,
                        startDate: '2026-06-01',
                        endDate: '2026-08-31',
                        attributes: {
                            taxClaimablePercentage: 11 / 45,
                            governmentRate: {sourceRateID: 'GB_DIESEL_UP_TO_1600_2026-06-01', rate: 45, startDate: '2026-06-01', endDate: '2026-08-31', taxClaimablePercentage: 11 / 45},
                        },
                    },
                });

                // When auto-update copies the September diesel band
                const rates = await enableAutoUpdate(policy, [dieselBand]);

                // Then the September band is enabled, because only the latest previous rate counts and the admin edited it, so the
                // disabled March rate further back doesn't opt the workspace out
                expect(getRateBySourceID(rates, dieselBand.sourceRateID)?.enabled).toBe(true);
            });

            it('should copy a reference rate listed twice only once', async () => {
                // Given an eligible GBP workspace and a reference list that contains the same fuel band twice
                const policy = buildUKPolicy(true, true);

                // When auto-update is turned on
                const rates = await enableAutoUpdate(policy, [dieselBand, dieselBand]);

                // Then the band is copied once, since the server de-dupes by sourceRateID and would leave a second copy orphaned
                expect(rates.filter((rate) => rate.attributes?.governmentRate?.sourceRateID === dieselBand.sourceRateID)).toHaveLength(1);
            });
        });
    });

    describe('setPolicyDistanceRatesUnit', () => {
        const customUnitID = '5A55C2B68DDCB';

        afterEach(() => {
            resetQueue();
            return Onyx.clear();
        });

        it('optimistically updates the commuter exclusion unit without converting its distance', async () => {
            // Given a fixed-distance commuter exclusion saved in miles
            const customUnit: CustomUnit = {
                customUnitID,
                name: 'Distance',
                enabled: true,
                rates: {},
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
            };
            const policy: Policy = {
                ...createRandomPolicy(5),
                customUnits: {[customUnitID]: customUnit},
                commuterExclusions: {
                    method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                    fixedDistance: 5,
                    fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            // When the workspace unit changes while the request is queued offline
            pause();
            setPolicyDistanceRatesUnit(policy.id, customUnit, {...customUnit, attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}}, policy.commuterExclusions);
            await waitForBatchedUpdates();

            // Then both displayed units update immediately while the configured distance stays unchanged
            const optimisticPolicy = await getPolicyFromOnyx(policy.id);
            expect(optimisticPolicy.customUnits?.[customUnitID].attributes?.unit).toBe(CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS);
            expect(optimisticPolicy.commuterExclusions).toMatchObject({
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                fixedDistance: 5,
                fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS,
            });
            expect(optimisticPolicy.pendingFields?.commuterExclusions).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('clears the commuter exclusion pending state when changing the unit succeeds', async () => {
            const customUnit: CustomUnit = {
                customUnitID,
                name: 'Distance',
                enabled: true,
                rates: {},
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
            };
            const commuterExclusions = {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                fixedDistance: 5,
                fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            };
            const policy: Policy = {...createRandomPolicy(5), customUnits: {[customUnitID]: customUnit}, commuterExclusions};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const mockFetch = TestHelper.createGlobalFetchMock();
            const originalFetch = global.fetch;
            global.fetch = mockFetch;
            try {
                setPolicyDistanceRatesUnit(policy.id, customUnit, {...customUnit, attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}}, commuterExclusions);
                await waitForBatchedUpdates();
            } finally {
                global.fetch = originalFetch;
            }

            const updatedPolicy = await getPolicyFromOnyx(policy.id);
            expect(updatedPolicy.commuterExclusions).toMatchObject({fixedDistance: 5, fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS});
            expect(updatedPolicy.pendingFields?.commuterExclusions).toBeUndefined();
            expect(updatedPolicy.errorFields?.commuterExclusions).toBeUndefined();
        });

        it('restores the commuter exclusion unit and sets an error when changing the unit fails', async () => {
            const customUnit: CustomUnit = {
                customUnitID,
                name: 'Distance',
                enabled: true,
                rates: {},
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
            };
            const commuterExclusions = {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                fixedDistance: 5,
                fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
            };
            const policy: Policy = {...createRandomPolicy(5), customUnits: {[customUnitID]: customUnit}, commuterExclusions};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const mockFetch = TestHelper.createGlobalFetchMock();
            const originalFetch = global.fetch;
            global.fetch = mockFetch;
            mockFetch.fail();
            try {
                setPolicyDistanceRatesUnit(policy.id, customUnit, {...customUnit, attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}}, commuterExclusions);
                await waitForBatchedUpdates();
            } finally {
                global.fetch = originalFetch;
            }

            const revertedPolicy = await getPolicyFromOnyx(policy.id);
            expect(revertedPolicy.commuterExclusions).toMatchObject({fixedDistance: 5, fixedDistanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES});
            expect(revertedPolicy.pendingFields?.commuterExclusions).toBeUndefined();
            expect(revertedPolicy.errorFields?.commuterExclusions).toBeDefined();
        });

        it('removes the optimistic commuter exclusion unit when the original unit was unset', async () => {
            const customUnit: CustomUnit = {
                customUnitID,
                name: 'Distance',
                enabled: true,
                rates: {},
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
            };
            const commuterExclusions = {
                method: CONST.POLICY.COMMUTER_EXCLUSION_METHOD.FIXED_DISTANCE,
                fixedDistance: 5,
            };
            const policy: Policy = {...createRandomPolicy(5), customUnits: {[customUnitID]: customUnit}, commuterExclusions};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            const mockFetch = TestHelper.createGlobalFetchMock();
            const originalFetch = global.fetch;
            global.fetch = mockFetch;
            mockFetch.fail();
            try {
                setPolicyDistanceRatesUnit(policy.id, customUnit, {...customUnit, attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}}, commuterExclusions);
                await waitForBatchedUpdates();
            } finally {
                global.fetch = originalFetch;
            }

            const revertedPolicy = await getPolicyFromOnyx(policy.id);
            expect(revertedPolicy.commuterExclusions).toMatchObject({fixedDistance: 5});
            expect(revertedPolicy.commuterExclusions?.fixedDistanceUnit).toBeUndefined();
            expect(revertedPolicy.errorFields?.commuterExclusions).toBeDefined();
        });

        it('does not update commuter exclusions when none are configured', async () => {
            const customUnit: CustomUnit = {
                customUnitID,
                name: 'Distance',
                enabled: true,
                rates: {},
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
            };
            const policy: Policy = {...createRandomPolicy(5), customUnits: {[customUnitID]: customUnit}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);

            pause();
            setPolicyDistanceRatesUnit(policy.id, customUnit, {...customUnit, attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}});
            await waitForBatchedUpdates();

            const updatedPolicy = await getPolicyFromOnyx(policy.id);
            expect(updatedPolicy.commuterExclusions).toBeUndefined();
            expect(updatedPolicy.pendingFields?.commuterExclusions).toBeUndefined();
        });
    });

    describe('setEmployeeWorkArrangement', () => {
        const member1AccountID = 11;
        const member2AccountID = 12;
        const member1Email = 'member1@test.com';
        const member2Email = 'member2@test.com';
        const personalDetails = {
            [member1AccountID]: {accountID: member1AccountID, login: member1Email, displayName: 'Member One'},
            [member2AccountID]: {accountID: member2AccountID, login: member2Email, displayName: 'Member Two'},
        };

        afterEach(() => {
            jest.restoreAllMocks();
        });

        async function seedWorkArrangementPolicy(policy: Policy) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1', policyID: policy.id, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS} as Report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, {});
            await waitForBatchedUpdates();
        }

        it('should optimistically update only the member that changes, without adding a change log', async () => {
            // Given two members in the policy and only one needs an arrangement change
            const policy: Policy = {
                ...createRandomPolicy(20),
                employeeList: {
                    [member1Email]: {email: member1Email},
                    [member2Email]: {email: member2Email, hasOfficeWorkArrangement: true},
                },
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When both members are assigned the office-based arrangement
            setEmployeeWorkArrangement(policy, [member1AccountID, member2AccountID], true, personalDetails);
            await waitForBatchedUpdates();

            // Then only the changed member is updated
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
            // Member2 already matches, so it is skipped without any optimistic footprint
            expect(onyxPolicy.employeeList?.[member2Email]).toEqual({email: member2Email, hasOfficeWorkArrangement: true});

            // And the admins room gets no optimistic change log, since the server can thread the real one
            expect(await getReportActionsFromOnyx('1')).toEqual({});

            resetQueue();
        });

        it('should preserve a pending invite when changing its work arrangement offline', async () => {
            // Given a newly invited member whose add action is still pending
            const policy: Policy = {
                ...createRandomPolicy(27),
                employeeList: {
                    [member1Email]: {
                        email: member1Email,
                        hasOfficeWorkArrangement: false,
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When the member's arrangement is changed before the invite finishes syncing
            setEmployeeWorkArrangement(policy, [member1AccountID], true, personalDetails);
            await waitForBatchedUpdates();

            // Then the arrangement updates while the invite remains visibly pending
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toMatchObject({
                hasOfficeWorkArrangement: true,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            });

            resetQueue();
        });

        it('should do nothing when every member already matches the requested arrangement', async () => {
            // Given all eligible members already have the requested arrangement
            const policy: Policy = {
                ...createRandomPolicy(21),
                employeeList: {[member1Email]: {email: member1Email, hasOfficeWorkArrangement: false}},
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When the matching member and an unknown account are passed
            setEmployeeWorkArrangement(policy, [member1AccountID, 999999001], false, personalDetails);
            await waitForBatchedUpdates();

            // Then no member data or changelog entry is changed
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: false});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });

        it('should clear pending states on success', async () => {
            // Given the member and admins room are in Onyx
            const policy: Policy = {
                ...createRandomPolicy(22),
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await seedWorkArrangementPolicy(policy);
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // When the work-arrangement change is queued with the temporary accountID assigned to an offline invite
            const temporaryAccountID = 999999003;
            const personalDetailsWithTemporaryAccountID = {
                ...personalDetails,
                [temporaryAccountID]: {accountID: temporaryAccountID, login: member1Email, displayName: 'Member One'},
            };
            setEmployeeWorkArrangement(policy, [temporaryAccountID], true, personalDetailsWithTemporaryAccountID);

            // Then the request carries the stable login with the temporary accountID so it still applies after an offline invite syncs
            expect(writeSpy.mock.calls.at(0)?.[1]).toMatchObject({employeeAccountIDList: String(temporaryAccountID), employeeLoginList: member1Email});

            // And success updates clear the member's pending state
            const onyxData = writeSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.successData).toEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                    value: {employeeList: {[member1Email]: {pendingAction: null}}},
                },
            ]);
        });

        it('should revert the member on failure', async () => {
            // Given the member and admins room are in Onyx
            const policy: Policy = {
                ...createRandomPolicy(23),
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await seedWorkArrangementPolicy(policy);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- The API spy captures the action updates without sending a request.
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // When the member's work arrangement is updated
            setEmployeeWorkArrangement(policy, [member1AccountID], true, personalDetails);

            // Then failure data restores the member value and retains UPDATE so dismissing the error preserves the member
            const onyxData = writeSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.failureData?.[0]).toMatchObject({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    employeeList: {
                        [member1Email]: {
                            hasOfficeWorkArrangement: null,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                    },
                },
            });
            const failureValue = onyxData?.failureData?.[0]?.value;
            const failureEmployeeList = typeof failureValue === 'object' && failureValue !== null && 'employeeList' in failureValue ? failureValue.employeeList : undefined;
            const failureMember =
                typeof failureEmployeeList === 'object' && failureEmployeeList !== null && member1Email in failureEmployeeList ? failureEmployeeList[member1Email] : undefined;
            expect(typeof failureMember === 'object' && failureMember !== null && 'errors' in failureMember && failureMember.errors).toBeTruthy();
            expect(failureMember).not.toHaveProperty('email');

            const failureArrangementPatch =
                typeof failureMember === 'object' && failureMember !== null && 'hasOfficeWorkArrangement' in failureMember ? failureMember.hasOfficeWorkArrangement : undefined;
            expect(failureArrangementPatch).toBeNull();
            if (failureArrangementPatch !== null) {
                throw new Error('Expected the failure update to clear the unset work arrangement');
            }

            // Given Onyx contains the optimistic value,
            // When applying the failure patch's explicit null,
            // Then the member-level override is removed so the workspace default applies again.
            const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as const;
            await Onyx.merge(policyKey, {employeeList: {[member1Email]: {hasOfficeWorkArrangement: true}}});
            await waitForBatchedUpdates();
            expect((await getPolicyFromOnyx(policy.id)).employeeList?.[member1Email]?.hasOfficeWorkArrangement).toBe(true);

            await Onyx.merge(policyKey, {employeeList: {[member1Email]: {hasOfficeWorkArrangement: failureArrangementPatch}}});
            await waitForBatchedUpdates();
            expect((await getPolicyFromOnyx(policy.id)).employeeList?.[member1Email]?.hasOfficeWorkArrangement).toBeUndefined();
            expect(getEffectiveWorkArrangement((await getPolicyFromOnyx(policy.id)).employeeList?.[member1Email]?.hasOfficeWorkArrangement, false)).toBe(false);
            expect(onyxData?.failureData).toHaveLength(1);
        });

        it('should update members without changelog actions when there is no admins room', async () => {
            // Given the member is in the policy but the admins room is unavailable
            const policy: Policy = {
                ...createRandomPolicy(24),
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [member1AccountID]: {accountID: member1AccountID, login: member1Email, displayName: 'Member One'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`, {});
            await waitForBatchedUpdates();

            pause();
            // When the member's work arrangement is updated
            setEmployeeWorkArrangement(policy, [member1AccountID], true, personalDetails);
            await waitForBatchedUpdates();

            // Then the member is updated without creating a changelog action
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toMatchObject({email: member1Email, hasOfficeWorkArrangement: true});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });

        it('should skip members missing from the employee list', async () => {
            // Given one account is missing from the policy employee list
            const missingMemberAccountID = 999999002;
            const policy: Policy = {
                ...createRandomPolicy(25),
                employeeList: {[member1Email]: {email: member1Email, hasOfficeWorkArrangement: false}},
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // The missing account has personal details but no employeeList entry
            const personalDetailsWithGhost = {
                ...personalDetails,
                [missingMemberAccountID]: {accountID: missingMemberAccountID, login: 'ghost@test.com', displayName: 'Ghost'},
            };
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetailsWithGhost);
            await waitForBatchedUpdates();
            // When the member missing from the policy employee list is passed
            setEmployeeWorkArrangement(policy, [missingMemberAccountID], true, personalDetailsWithGhost);
            await waitForBatchedUpdates();

            // Then no member data or changelog action is created
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: false});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });

        it('should do nothing without a policy ID', async () => {
            // Given a valid member and a policy without an ID
            const policy: Policy = {
                ...createRandomPolicy(26),
                employeeList: {[member1Email]: {email: member1Email, hasOfficeWorkArrangement: false}},
            };
            await seedWorkArrangementPolicy(policy);

            pause();
            // When the member is assigned an arrangement without a policy ID
            setEmployeeWorkArrangement({...policy, id: ''}, [member1AccountID], true, personalDetails);
            await waitForBatchedUpdates();

            // Then neither the policy nor the admins room changelog is changed
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, hasOfficeWorkArrangement: false});

            const reportActions = await getReportActionsFromOnyx('1');
            expect(reportActions).toEqual({});

            resetQueue();
        });
    });

    describe('updateEmployeeOfficeLocation', () => {
        const member1AccountID = 31;
        const member2AccountID = 32;
        const member1Email = 'office1@test.com';
        const member2Email = 'office2@test.com';
        const personalDetails = {
            [member1AccountID]: {accountID: member1AccountID, login: member1Email, displayName: 'Member One'},
            [member2AccountID]: {accountID: member2AccountID, login: member2Email, displayName: 'Member Two'},
        };
        const officeLocations: Record<string, OfficeLocation> = {
            OFFICE1: {name: 'Headquarters', address: {addressStreet: '88 Kearny St', city: 'San Francisco', state: 'CA', zipCode: '94108', country: 'US'}, isDefault: true},
            OFFICE2: {name: 'New Jersey Office', address: {addressStreet: '900 Asbury Ave', city: 'Ocean City', state: 'NJ', zipCode: '08226', country: 'US'}},
        };

        beforeAll(() => IntlStore.load(CONST.LOCALES.DEFAULT));

        afterEach(() => {
            jest.restoreAllMocks();
        });

        async function seedOfficeLocationPolicy(policy: Policy) {
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}2`, {reportID: '2', policyID: policy.id, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS} as Report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`, {});
            await waitForBatchedUpdates();
        }

        it('should optimistically assign only the member that changes, without adding a change log', async () => {
            // Given one member following the primary office and one already assigned to the New Jersey office
            const policy: Policy = {
                ...createRandomPolicy(30),
                officeLocations,
                employeeList: {
                    [member1Email]: {email: member1Email},
                    [member2Email]: {email: member2Email, officeID: 'OFFICE2'},
                },
            };
            await seedOfficeLocationPolicy(policy);

            pause();
            // When both members are assigned to the New Jersey office
            updateEmployeeOfficeLocation(policy, [member1AccountID, member2AccountID], 'OFFICE2', personalDetails);
            await waitForBatchedUpdates();

            // Then only the member who changed is updated
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toEqual({email: member1Email, officeID: 'OFFICE2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE});
            expect(onyxPolicy.employeeList?.[member2Email]).toEqual({email: member2Email, officeID: 'OFFICE2'});

            // And the admins room gets no optimistic change log, since the server can thread the real one
            expect(await getReportActionsFromOnyx('2')).toEqual({});

            resetQueue();
        });

        it('should preserve a pending invite when changing its office offline', async () => {
            // Given a newly invited member whose add action is still pending
            const policy: Policy = {
                ...createRandomPolicy(34),
                officeLocations,
                employeeList: {[member1Email]: {email: member1Email, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}},
            };
            await seedOfficeLocationPolicy(policy);

            pause();
            // When the member's office is changed before the invite finishes syncing
            updateEmployeeOfficeLocation(policy, [member1AccountID], 'OFFICE2', personalDetails);
            await waitForBatchedUpdates();

            // Then the office updates while the invite remains visibly pending
            const onyxPolicy = await getPolicyFromOnyx(policy.id);
            expect(onyxPolicy.employeeList?.[member1Email]).toMatchObject({officeID: 'OFFICE2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

            resetQueue();
        });

        it('should send every member that changed in one request, by login', async () => {
            // Given two members following the primary office
            const policy: Policy = {
                ...createRandomPolicy(31),
                officeLocations,
                employeeList: {[member1Email]: {email: member1Email}, [member2Email]: {email: member2Email}},
            };
            await seedOfficeLocationPolicy(policy);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- The API spy records the request, which the paused queue keeps from being sent.
            const writeSpy = jest.spyOn(API, 'write');

            pause();
            // When both are assigned to the company address
            updateEmployeeOfficeLocation(policy, [member1AccountID, member2AccountID], CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID, personalDetails);
            await waitForBatchedUpdates();

            // Then one request carries both members by login, which still matches them if an offline invite replaces their accountIDs
            expect(writeSpy).toHaveBeenCalledTimes(1);
            expect(writeSpy.mock.calls.at(0)?.[1]).toEqual({
                policyID: policy.id,
                employeeLoginList: `${member1Email},${member2Email}`,
                officeID: CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID,
            });

            resetQueue();
        });

        it('should clear pending states on success', async () => {
            // Given a member following the primary office
            const policy: Policy = {
                ...createRandomPolicy(32),
                officeLocations,
                employeeList: {[member1Email]: {email: member1Email}},
            };
            await seedOfficeLocationPolicy(policy);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- The API spy captures the action updates without sending a request.
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // When the member is assigned to an office
            updateEmployeeOfficeLocation(policy, [member1AccountID], 'OFFICE2', personalDetails);

            // Then success clears the member's pending state
            const onyxData = writeSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.successData).toEqual([
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                    value: {employeeList: {[member1Email]: {pendingAction: null}}},
                },
            ]);
        });

        it('should restore the previous office of each member on failure', async () => {
            // Given one member assigned to the New Jersey office and one following the primary office
            const policy: Policy = {
                ...createRandomPolicy(33),
                officeLocations,
                employeeList: {[member1Email]: {email: member1Email, officeID: 'OFFICE2'}, [member2Email]: {email: member2Email}},
            };
            await seedOfficeLocationPolicy(policy);
            // eslint-disable-next-line rulesdir/no-multiple-api-calls -- The API spy captures the action updates without sending a request.
            const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

            // When both are assigned to the company address
            updateEmployeeOfficeLocation(policy, [member1AccountID, member2AccountID], CONST.POLICY.COMPANY_ADDRESS_OFFICE_ID, personalDetails);

            // Then failure puts back the New Jersey office, removes the assignment the other member never had, and keeps
            // UPDATE so dismissing the error keeps the members
            const onyxData = writeSpy.mock.calls.at(0)?.[2];
            expect(onyxData?.failureData?.[0]).toMatchObject({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    employeeList: {
                        [member1Email]: {officeID: 'OFFICE2', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                        [member2Email]: {officeID: null, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                    },
                },
            });
            expect(onyxData?.failureData).toHaveLength(1);
        });
    });
});
