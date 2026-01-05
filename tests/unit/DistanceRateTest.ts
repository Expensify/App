import type {OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import {deletePolicyDistanceRates, enablePolicyDistanceRates} from '@libs/actions/Policy/DistanceRate';
import {pause, resetQueue} from '@libs/Network/SequentialQueue';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction, TransactionViolations} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction from '../utils/collections/transaction';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('DistanceRate', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

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
                    waitForCollectionCallback: true,
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
                Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}` as OnyxKey,
                    // eslint-disable-next-line rulesdir/prefer-early-return
                    callback: (value) => {
                        if (value !== undefined) {
                            resolve(value as Policy);
                        }
                    },
                });
            });

            if (!policy || !policy.customUnits) {
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
});
