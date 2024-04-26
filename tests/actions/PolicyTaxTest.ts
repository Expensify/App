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
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('SetPolicyCustomTaxName', () => {
        it('Set policy`s custom tax name', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const customTaxName = 'Custom tag name';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Policy.setPolicyCustomTaxName(fakePolicy.id, customTaxName);
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
    });
    describe('SetPolicyCurrencyDefaultTax', () => {
        it('Set policy`s currency default tax', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const taxCode = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Policy.setWorkspaceCurrencyDefault(fakePolicy.id, taxCode);
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
    });
    describe('SetPolicyForeignCurrencyDefaultTax', () => {
        it('Set policy`s foreign currency default', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const taxCode = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        Policy.setForeignCurrencyDefault(fakePolicy.id, taxCode);
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
    });
    describe('CreatePolicyTax', () => {
        it('Create a new tax', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const newTaxRate: TaxRate = {
                name: 'Tax rate 2',
                value: '2%',
                code: 'id_TAX_RATE_2',
            };

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        createPolicyTax(fakePolicy.id, newTaxRate);
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
    });
    describe('SetPolicyTaxesEnabled', () => {
        it('Disable policy`s taxes', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const disableTaxID = 'id_TAX_RATE_1';
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        setPolicyTaxesEnabled(fakePolicy.id, [disableTaxID], false);
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
    });

    describe('RenamePolicyTax', () => {
        it('Rename tax', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const taxID = 'id_TAX_RATE_1';
            const newTaxName = 'Tax rate 1 updated';
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        renamePolicyTax(fakePolicy.id, taxID, newTaxName);
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
    });
    describe('UpdatePolicyTaxValue', () => {
        it('Update tax`s value', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const taxID = 'id_TAX_RATE_1';
            const newTaxValue = 10;
            const stringTaxValue = `${newTaxValue}%`;
            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
                    .then(() => {
                        updatePolicyTaxValue(fakePolicy.id, taxID, newTaxValue);
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
    });
    describe('DeletePolicyTaxes', () => {
        it('Delete tax that is not foreignTaxDefault', () => {
            const fakePolicy: PolicyType = {...createRandomPolicy(0), taxRates: CONST.DEFAULT_TAX};
            const foreignTaxDefault = fakePolicy?.taxRates?.foreignTaxDefault;
            const taxID = 'id_TAX_RATE_1';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
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
            const fakePolicy: PolicyType = {
                ...createRandomPolicy(0),
                taxRates: {
                    ...CONST.DEFAULT_TAX,
                    foreignTaxDefault: 'id_TAX_RATE_1',
                },
            };
            const taxID = 'id_TAX_RATE_1';
            const firstTaxID = 'id_TAX_EXEMPT';

            // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
            fetch.pause();
            return (
                Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy)
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
    });
});
