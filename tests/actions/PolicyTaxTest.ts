import Onyx from 'react-native-onyx';
import {createPolicyTax, deletePolicyTaxes, renamePolicyTax, setPolicyTaxesEnabled, updatePolicyTaxValue} from '@libs/actions/TaxRate';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import * as Policy from '@src/libs/actions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy as PolicyType, TaxRate} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/PolicyTax', () => {
    const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear()
            .then(() => Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy))
            .then(waitForBatchedUpdates);
    });

    describe('SetPolicyCustomTaxName', () => {
        it('Set policy`s custom tax name', () => {
            const customTaxName = 'Custom tag name';
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Policy.setPolicyCustomTaxName(fakePolicy.id, customTaxName);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.taxRates?.name).toBe(customTaxName);
                                        expect(policy?.taxRates?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(policy?.taxRates?.errorFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.taxRates?.pendingFields?.name).toBeFalsy();
                                        expect(policy?.taxRates?.errorFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
        it('Reset policy`s custom tax name when API returns an error', () => {
            const customTaxName = 'Custom tag name';
            const originalCustomTaxName = fakePolicy?.taxRates?.name;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Policy.setPolicyCustomTaxName(fakePolicy.id, customTaxName);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    expect(policy?.taxRates?.name).toBe(customTaxName);
                                    expect(policy?.taxRates?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(policy?.taxRates?.errorFields).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    expect(policy?.taxRates?.name).toBe(originalCustomTaxName);
                                    expect(policy?.taxRates?.pendingFields?.name).toBeFalsy();
                                    expect(policy?.taxRates?.errorFields?.name).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('SetPolicyCurrencyDefaultTax', () => {
        it('Set policy`s currency default tax', () => {
            const taxCode = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Policy.setWorkspaceCurrencyDefault(fakePolicy.id, taxCode);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.taxRates?.defaultExternalID).toBe(taxCode);
                                        expect(policy?.taxRates?.pendingFields?.defaultExternalID).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(policy?.taxRates?.errorFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.taxRates?.pendingFields?.defaultExternalID).toBeFalsy();
                                        expect(policy?.taxRates?.errorFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
        it('Reset policy`s currency default tax when API returns an error', () => {
            const taxCode = 'id_TAX_RATE_1';
            const originalDefaultExternalID = fakePolicy?.taxRates?.defaultExternalID;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Policy.setWorkspaceCurrencyDefault(fakePolicy.id, taxCode);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    expect(policy?.taxRates?.defaultExternalID).toBe(taxCode);
                                    expect(policy?.taxRates?.pendingFields?.defaultExternalID).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(policy?.taxRates?.errorFields).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    expect(policy?.taxRates?.defaultExternalID).toBe(originalDefaultExternalID);
                                    expect(policy?.taxRates?.pendingFields?.defaultExternalID).toBeFalsy();
                                    expect(policy?.taxRates?.errorFields?.defaultExternalID).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
    describe('SetPolicyForeignCurrencyDefaultTax', () => {
        it('Set policy`s foreign currency default', () => {
            const taxCode = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Policy.setForeignCurrencyDefault(fakePolicy.id, taxCode);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        expect(policy?.taxRates?.foreignTaxDefault).toBe(taxCode);
                                        expect(policy?.taxRates?.pendingFields?.foreignTaxDefault).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(policy?.taxRates?.errorFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        // Check if the policy pendingFields was cleared
                                        expect(policy?.taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                        expect(policy?.taxRates?.errorFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });
        it('Reset policy`s foreign currency default when API returns an error', () => {
            const taxCode = 'id_TAX_RATE_1';
            const originalDefaultForeignCurrencyID = fakePolicy?.taxRates?.foreignTaxDefault;

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            Policy.setForeignCurrencyDefault(fakePolicy.id, taxCode);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    expect(policy?.taxRates?.foreignTaxDefault).toBe(taxCode);
                                    expect(policy?.taxRates?.pendingFields?.foreignTaxDefault).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(policy?.taxRates?.errorFields).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                )

                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    // Check if the policy pendingFields was cleared
                                    expect(policy?.taxRates?.foreignTaxDefault).toBe(originalDefaultForeignCurrencyID);
                                    expect(policy?.taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                    expect(policy?.taxRates?.errorFields?.foreignTaxDefault).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
    describe('CreatePolicyTax', () => {
        it('Create a new tax', () => {
            const newTaxRate: TaxRate = {
                name: 'Tax rate 2',
                value: '2%',
                code: 'id_TAX_RATE_2',
            };

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            createPolicyTax(fakePolicy.id, newTaxRate);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const createdTax = policy?.taxRates?.taxes?.[newTaxRate.code ?? ''];
                                        expect(createdTax?.code).toBe(newTaxRate.code);
                                        expect(createdTax?.name).toBe(newTaxRate.name);
                                        expect(createdTax?.value).toBe(newTaxRate.value);
                                        expect(createdTax?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const createdTax = policy?.taxRates?.taxes?.[newTaxRate.code ?? ''];
                                        expect(createdTax?.errors).toBeFalsy();
                                        expect(createdTax?.pendingFields).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('Remove the optimistic tax if the API returns an error', () => {
            const newTaxRate: TaxRate = {
                name: 'Tax rate 2',
                value: '2%',
                code: 'id_TAX_RATE_2',
            };

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            createPolicyTax(fakePolicy.id, newTaxRate);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const createdTax = policy?.taxRates?.taxes?.[newTaxRate.code ?? ''];
                                    expect(createdTax?.code).toBe(newTaxRate.code);
                                    expect(createdTax?.name).toBe(newTaxRate.name);
                                    expect(createdTax?.value).toBe(newTaxRate.value);
                                    expect(createdTax?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const createdTax = policy?.taxRates?.taxes?.[newTaxRate.code ?? ''];
                                    expect(createdTax?.errors).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
    describe('SetPolicyTaxesEnabled', () => {
        it('Disable policy`s taxes', () => {
            const disableTaxID = 'id_TAX_RATE_1';
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            setPolicyTaxesEnabled(fakePolicy.id, [disableTaxID], false);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const disabledTax = policy?.taxRates?.taxes?.[disableTaxID];
                                        expect(disabledTax?.isDisabled).toBeTruthy();
                                        expect(disabledTax?.pendingFields?.isDisabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(disabledTax?.errorFields?.isDisabled).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const disabledTax = policy?.taxRates?.taxes?.[disableTaxID];
                                        expect(disabledTax?.errorFields?.isDisabled).toBeFalsy();
                                        expect(disabledTax?.pendingFields?.isDisabled).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('Disable policy`s taxes but API returns an error, then enable policy`s taxes again', () => {
            const disableTaxID = 'id_TAX_RATE_1';
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            setPolicyTaxesEnabled(fakePolicy.id, [disableTaxID], false);
            const originalTaxes = {...fakePolicy?.taxRates?.taxes};
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const disabledTax = policy?.taxRates?.taxes?.[disableTaxID];
                                    expect(disabledTax?.isDisabled).toBeTruthy();
                                    expect(disabledTax?.pendingFields?.isDisabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(disabledTax?.errorFields?.isDisabled).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const disabledTax = policy?.taxRates?.taxes?.[disableTaxID];
                                    expect(disabledTax?.isDisabled).toBe(!!originalTaxes[disableTaxID].isDisabled);
                                    expect(disabledTax?.errorFields?.isDisabled).toBeTruthy();
                                    expect(disabledTax?.pendingFields?.isDisabled).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });

    describe('RenamePolicyTax', () => {
        it('Rename tax', () => {
            const taxID = 'id_TAX_RATE_1';
            const newTaxName = 'Tax rate 1 updated';
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            renamePolicyTax(fakePolicy.id, taxID, newTaxName);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                        expect(updatedTax?.name).toBe(newTaxName);
                                        expect(updatedTax?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(updatedTax?.errorFields?.name).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                        expect(updatedTax?.errorFields?.name).toBeFalsy();
                                        expect(updatedTax?.pendingFields?.name).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('Rename tax but API returns an error, then recover the original tax`s name', () => {
            const taxID = 'id_TAX_RATE_1';
            const newTaxName = 'Tax rate 1 updated';
            const originalTaxRate = {...fakePolicy?.taxRates?.taxes[taxID]};
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            renamePolicyTax(fakePolicy.id, taxID, newTaxName);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                    expect(updatedTax?.name).toBe(newTaxName);
                                    expect(updatedTax?.pendingFields?.name).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(updatedTax?.errorFields?.name).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                    expect(updatedTax?.name).toBe(originalTaxRate.name);
                                    expect(updatedTax?.errorFields?.name).toBeTruthy();
                                    expect(updatedTax?.pendingFields?.name).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
    describe('UpdatePolicyTaxValue', () => {
        it('Update tax`s value', () => {
            const taxID = 'id_TAX_RATE_1';
            const newTaxValue = 10;
            const stringTaxValue = `${newTaxValue}%`;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            updatePolicyTaxValue(fakePolicy.id, taxID, newTaxValue);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                        expect(updatedTax?.value).toBe(stringTaxValue);
                                        expect(updatedTax?.pendingFields?.value).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(updatedTax?.errorFields?.value).toBeFalsy();

                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                        expect(updatedTax?.errorFields?.value).toBeFalsy();
                                        expect(updatedTax?.pendingFields?.value).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('Update tax`s value but API returns an error, then recover the original tax`s value', () => {
            const taxID = 'id_TAX_RATE_1';
            const newTaxValue = 10;
            const originalTaxRate = {...fakePolicy?.taxRates?.taxes[taxID]};
            const stringTaxValue = `${newTaxValue}%`;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            updatePolicyTaxValue(fakePolicy.id, taxID, newTaxValue);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                    expect(updatedTax?.value).toBe(stringTaxValue);
                                    expect(updatedTax?.pendingFields?.value).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                    expect(updatedTax?.errorFields?.value).toBeFalsy();

                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const updatedTax = policy?.taxRates?.taxes?.[taxID];
                                    expect(updatedTax?.value).toBe(originalTaxRate.value);
                                    expect(updatedTax?.errorFields?.value).toBeTruthy();
                                    expect(updatedTax?.pendingFields?.value).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
    describe('DeletePolicyTaxes', () => {
        it('Delete tax that is not foreignTaxDefault', () => {
            const foreignTaxDefault = fakePolicy?.taxRates?.foreignTaxDefault;
            const taxID = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            deletePolicyTaxes(fakePolicy.id, [taxID]);
            return (
                waitForBatchedUpdates()
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const taxRates = policy?.taxRates;
                                        const deletedTax = taxRates?.taxes?.[taxID];
                                        expect(taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                        expect(taxRates?.foreignTaxDefault).toBe(foreignTaxDefault);
                                        expect(deletedTax?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                                        expect(deletedTax?.errors).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const taxRates = policy?.taxRates;
                                        const deletedTax = taxRates?.taxes?.[taxID];
                                        expect(taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                        expect(deletedTax).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('Delete tax that is foreignTaxDefault', () => {
            const taxID = 'id_TAX_RATE_1';
            const firstTaxID = 'id_TAX_EXEMPT';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {taxRates: {foreignTaxDefault: 'id_TAX_RATE_1'}})
                    .then(() => {
                        deletePolicyTaxes(fakePolicy.id, [taxID]);
                        return waitForBatchedUpdates();
                    })
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const taxRates = policy?.taxRates;
                                        const deletedTax = taxRates?.taxes?.[taxID];
                                        expect(taxRates?.pendingFields?.foreignTaxDefault).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                                        expect(taxRates?.foreignTaxDefault).toBe(firstTaxID);
                                        expect(deletedTax?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                                        expect(deletedTax?.errors).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    .then(fetch.resume)
                    .then(waitForBatchedUpdates)
                    .then(
                        () =>
                            new Promise<void>((resolve) => {
                                const connectionID = Onyx.connect({
                                    key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                    waitForCollectionCallback: false,
                                    callback: (policy) => {
                                        Onyx.disconnect(connectionID);
                                        const taxRates = policy?.taxRates;
                                        const deletedTax = taxRates?.taxes?.[taxID];
                                        expect(taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                        expect(deletedTax).toBeFalsy();
                                        resolve();
                                    },
                                });
                            }),
                    )
            );
        });

        it('Delete tax that is not foreignTaxDefault but API return an error, then recover the delated tax', () => {
            const foreignTaxDefault = fakePolicy?.taxRates?.foreignTaxDefault;
            const taxID = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            deletePolicyTaxes(fakePolicy.id, [taxID]);
            return waitForBatchedUpdates()
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const taxRates = policy?.taxRates;
                                    const deletedTax = taxRates?.taxes?.[taxID];
                                    expect(taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                    expect(taxRates?.foreignTaxDefault).toBe(foreignTaxDefault);
                                    expect(deletedTax?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                                    expect(deletedTax?.errors).toBeFalsy();
                                    resolve();
                                },
                            });
                        }),
                )
                .then(() => {
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    fetch.fail();
                    // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
                    return fetch.resume() as Promise<unknown>;
                })
                .then(waitForBatchedUpdates)
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            const connectionID = Onyx.connect({
                                key: `${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`,
                                waitForCollectionCallback: false,
                                callback: (policy) => {
                                    Onyx.disconnect(connectionID);
                                    const taxRates = policy?.taxRates;
                                    const deletedTax = taxRates?.taxes?.[taxID];
                                    expect(taxRates?.pendingFields?.foreignTaxDefault).toBeFalsy();
                                    expect(deletedTax?.pendingAction).toBeFalsy();
                                    expect(deletedTax?.errors).toBeTruthy();
                                    resolve();
                                },
                            });
                        }),
                );
        });
    });
});
