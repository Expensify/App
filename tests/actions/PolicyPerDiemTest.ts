/* eslint-disable rulesdir/no-multiple-api-calls -- Each test invokes one action; the rule's ancestor scan combines otherwise independent tests. */
import {
    clearPerDiemRateError,
    deleteWorkspacePerDiemRates,
    editPerDiemRateAmount,
    editPerDiemRateCurrency,
    editPerDiemRateDestination,
    editPerDiemRateSubrate,
} from '@libs/actions/Policy/PerDiem';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const customUnitID = 'custom-unit';
const rateID = 'destination-one';
const unchangedRateID = 'destination-two';
const currentRate: Rate = {
    customUnitRateID: rateID,
    name: 'Destination One',
    currency: 'USD',
    enabled: true,
    rate: 0,
    subRates: [
        {id: 'breakfast', name: 'Breakfast', rate: 1700},
        {id: 'lunch', name: 'Lunch', rate: 1904},
    ],
};
const customUnit: CustomUnit = {
    customUnitID,
    name: 'Per Diem International',
    enabled: true,
    rates: {
        [rateID]: currentRate,
        [unchangedRateID]: {
            customUnitRateID: unchangedRateID,
            name: 'Destination Two',
            currency: 'USD',
            enabled: true,
            rate: 0,
            subRates: [{id: 'breakfast-two', name: 'Breakfast', rate: 2000}],
        },
    },
};

OnyxUpdateManager();
describe('actions/Policy/PerDiem', () => {
    let mockFetch: MockFetch;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        mockFetch = TestHelper.getGlobalFetchMock();
        mockFetch.succeed();
        global.fetch = mockFetch;
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy`, {
            id: 'policy',
            customUnits: {[customUnitID]: customUnit},
        });
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('sends only the changed rate when editing a destination', () => {
        // Given a Per Diem custom unit with multiple destinations.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one destination is renamed.
        editPerDiemRateDestination('policy', rateID, customUnit, 'Updated Destination');

        // Then only that destination is sent and optimistically updated.
        expect(writeSpy).toHaveBeenCalledTimes(1);
        const updatedRate = {...currentRate, name: 'Updated Destination'};
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {
                policyID: 'policy',
                customUnitID,
                customUnitRate: JSON.stringify(updatedRate),
            },
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: expect.objectContaining({
                            customUnits: {
                                [customUnitID]: {
                                    rates: {
                                        [rateID]: expect.objectContaining({name: 'Updated Destination'}),
                                    },
                                },
                            },
                        }),
                    }),
                ],
            }),
        );
    });

    it('sends only the changed rate when editing a subrate name', () => {
        // Given a Per Diem custom unit with multiple destinations and subrates.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one subrate is renamed.
        editPerDiemRateSubrate('policy', rateID, 'breakfast', customUnit, 'Morning meal');

        // Then only its parent destination is sent.
        const updatedRate = {
            ...currentRate,
            subRates: [
                {id: 'breakfast', name: 'Morning meal', rate: 1700},
                {id: 'lunch', name: 'Lunch', rate: 1904},
            ],
        };
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRate: JSON.stringify(updatedRate)},
            expect.any(Object),
        );
    });

    it('sends only the changed rate when editing an amount', () => {
        // Given a Per Diem custom unit with multiple destinations and subrates.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one subrate amount is changed.
        editPerDiemRateAmount('policy', rateID, 'breakfast', customUnit, 1701);

        // Then only its parent destination is sent.
        const updatedRate = {
            ...currentRate,
            subRates: [
                {id: 'breakfast', name: 'Breakfast', rate: 1701},
                {id: 'lunch', name: 'Lunch', rate: 1904},
            ],
        };
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRate: JSON.stringify(updatedRate)},
            expect.any(Object),
        );
    });

    it('sends only the changed rate when editing a currency', () => {
        // Given a Per Diem custom unit with multiple destinations.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When one destination's currency is changed.
        editPerDiemRateCurrency('policy', rateID, customUnit, 'EUR');

        // Then only that destination is sent.
        const updatedRate = {...currentRate, currency: 'EUR'};
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRate: JSON.stringify(updatedRate)},
            expect.any(Object),
        );
    });

    it('restores the previous subrate and attaches the error to the edited row when an edit fails', async () => {
        // Given a Per Diem destination stored in Onyx and a paused API request.
        mockFetch.pause();

        // When the Breakfast amount is optimistically updated and the request fails.
        editPerDiemRateAmount('policy', rateID, 'breakfast', customUnit, 1701);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[rateID]?.subRates?.[0].rate).toBe(1701);

        mockFetch.fail();
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then the previous amount is restored and only the edited subrate receives the error.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const failedRate = policy?.customUnits?.[customUnitID]?.rates?.[rateID];
        expect(failedRate?.subRates?.[0].rate).toBe(currentRate.subRates?.[0].rate);
        expect(failedRate?.pendingAction).toBeFalsy();
        expect(failedRate?.errors).toBeFalsy();
        expect(failedRate?.errorFields?.breakfast).toBeTruthy();
        expect(failedRate?.errorFields?.lunch).toBeFalsy();

        clearPerDiemRateError('policy', customUnitID, rateID, 'breakfast');
        await waitForBatchedUpdates();
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[rateID]?.errorFields?.breakfast).toBeFalsy();
    });

    it('sends compact updates and IDs for a mixed Per Diem deletion', () => {
        // Given selected subrates that partially update one destination and remove another.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When the selected subrates are deleted.
        deleteWorkspacePerDiemRates('policy', customUnit, [
            {
                destination: 'Destination One',
                subRateName: 'Breakfast',
                rate: 1700,
                currency: 'USD',
                rateID,
                subRateID: 'breakfast',
            },
            {
                destination: 'Destination Two',
                subRateName: 'Breakfast',
                rate: 2000,
                currency: 'USD',
                rateID: unchangedRateID,
                subRateID: 'breakfast-two',
            },
        ]);

        // Then the request contains only the remaining parent and deleted destination ID.
        const updatedRate = {
            ...currentRate,
            subRates: [{id: 'lunch', name: 'Lunch', rate: 1904}],
        };
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {
                policyID: 'policy',
                customUnitID,
                customUnitRateIDs: JSON.stringify([unchangedRateID]),
                customUnitRateUpdates: JSON.stringify([updatedRate]),
            },
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: {
                            customUnits: {
                                [customUnitID]: {
                                    rates: {
                                        [rateID]: {
                                            subRates: [{...currentRate.subRates?.[0], pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}, currentRate.subRates?.[1]],
                                            errors: null,
                                            errorFields: null,
                                        },
                                        [unchangedRateID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null, errorFields: null},
                                    },
                                },
                            },
                        },
                    }),
                ],
            }),
        );
    });

    it('uses the compact clear-all mode when every Per Diem row is selected', () => {
        // Given every subrate in the custom unit is selected.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When all rows are deleted.
        deleteWorkspacePerDiemRates('policy', customUnit, [
            {
                destination: 'Destination One',
                subRateName: 'Breakfast',
                rate: 1700,
                currency: 'USD',
                rateID,
                subRateID: 'breakfast',
            },
            {
                destination: 'Destination One',
                subRateName: 'Lunch',
                rate: 1904,
                currency: 'USD',
                rateID,
                subRateID: 'lunch',
            },
            {
                destination: 'Destination Two',
                subRateName: 'Breakfast',
                rate: 2000,
                currency: 'USD',
                rateID: unchangedRateID,
                subRateID: 'breakfast-two',
            },
        ]);

        // Then the request uses the constant-size clear-all flag and omits rate data.
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, deleteAllRates: true},
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: {
                            customUnits: {
                                [customUnitID]: {
                                    rates: {
                                        [rateID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null, errorFields: null},
                                        [unchangedRateID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null, errorFields: null},
                                    },
                                },
                            },
                        },
                    }),
                ],
            }),
        );
    });

    it('deletes a fully selected destination by ID instead of clearing all rates when another destination remains', () => {
        // Given every subrate of one destination is selected while another destination stays unselected.
        const writeSpy = jest.spyOn(API, 'write').mockResolvedValue(undefined);

        // When the selected rows are deleted.
        deleteWorkspacePerDiemRates('policy', customUnit, [
            {
                destination: 'Destination One',
                subRateName: 'Breakfast',
                rate: 1700,
                currency: 'USD',
                rateID,
                subRateID: 'breakfast',
            },
            {
                destination: 'Destination One',
                subRateName: 'Lunch',
                rate: 1904,
                currency: 'USD',
                rateID,
                subRateID: 'lunch',
            },
        ]);

        // Then only that destination is removed by ID, because clearing all rates would also delete the unselected destination.
        expect(writeSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT,
            {policyID: 'policy', customUnitID, customUnitRateIDs: JSON.stringify([rateID])},
            expect.objectContaining({
                optimisticData: [
                    expect.objectContaining({
                        value: {
                            customUnits: {[customUnitID]: {rates: {[rateID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null, errorFields: null}}}},
                        },
                    }),
                ],
            }),
        );
    });

    it('keeps every destination pending deletion and restores them when clearing all rates fails', async () => {
        // Given multiple destinations and a paused request so the optimistic state can be checked.
        mockFetch.pause();
        const selectedSubRates = Object.values(customUnit.rates).flatMap((rate) =>
            (rate.subRates ?? []).map((subRate) => ({
                destination: rate.name ?? '',
                subRateName: subRate.name,
                rate: subRate.rate,
                currency: rate.currency ?? 'USD',
                rateID: rate.customUnitRateID,
                subRateID: subRate.id,
            })),
        );

        // When every row is deleted, every destination remains available for offline feedback.
        deleteWorkspacePerDiemRates('policy', customUnit, selectedSubRates);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[rateID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[unchangedRateID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[rateID]?.subRates).toEqual(currentRate.subRates);

        mockFetch.fail();
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then failure restores the original object and every subrate, with one dismissible row error.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const restoredRates = policy?.customUnits?.[customUnitID]?.rates;
        expect(Array.isArray(restoredRates)).toBe(false);
        expect(Object.keys(restoredRates ?? {})).toEqual(Object.keys(customUnit.rates));
        expect(restoredRates?.[rateID]?.subRates).toEqual(currentRate.subRates);
        expect(restoredRates?.[rateID]?.pendingAction).toBeFalsy();
        expect(restoredRates?.[unchangedRateID]).toEqual(customUnit.rates[unchangedRateID]);
        expect(restoredRates?.[rateID]?.errorFields?.breakfast).toBeTruthy();

        clearPerDiemRateError('policy', customUnitID, rateID, 'breakfast');
        await waitForBatchedUpdates();
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[rateID]?.errorFields?.breakfast).toBeFalsy();
    });

    it.each([
        ['partial destination', ['breakfast'], [rateID, unchangedRateID], ['lunch']],
        ['whole destination', ['breakfast', 'lunch'], [unchangedRateID], undefined],
        ['all destinations', ['breakfast', 'lunch', 'breakfast-two'], [], undefined],
    ])('removes the selected rows only after a successful deletion of %s', async (_description, selectedIDs, expectedRateIDs, remainingSubRateIDs) => {
        // Given a paused request, as when a deletion is queued offline.
        mockFetch.pause();
        const selectedRows = Object.values(customUnit.rates).flatMap((rate) =>
            (rate.subRates ?? [])
                .filter((subRate) => selectedIDs.includes(subRate.id))
                .map((subRate) => ({destination: rate.name ?? '', subRateName: subRate.name, rate: subRate.rate, currency: 'USD', rateID: rate.customUnitRateID, subRateID: subRate.id})),
        );

        // When deletion is requested, the original rows remain until the request succeeds.
        deleteWorkspacePerDiemRates('policy', customUnit, selectedRows);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[rateID]?.subRates?.map((subRate) => subRate.id)).toEqual(['breakfast', 'lunch']);
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then only the selected rows are removed, including the empty array expected for delete-all.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const rates = policy?.customUnits?.[customUnitID]?.rates;
        expect(Object.keys(rates ?? {})).toEqual(expectedRateIDs);
        expect(rates?.[rateID]?.subRates?.map((subRate) => subRate.id)).toEqual(remainingSubRateIDs);
        if (!expectedRateIDs.length) {
            expect(rates).toEqual([]);
        }
    });

    it('marks only the selected subrate and restores it with an error if deletion fails', async () => {
        // Given a destination with two subrates and a paused deletion request.
        mockFetch.pause();

        // When only Breakfast is deleted, Lunch must remain editable rather than being marked for deletion.
        deleteWorkspacePerDiemRates('policy', customUnit, [{destination: 'Destination One', subRateName: 'Breakfast', rate: 1700, currency: 'USD', rateID, subRateID: 'breakfast'}]);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const pendingRate = policy?.customUnits?.[customUnitID]?.rates?.[rateID];
        expect(pendingRate?.pendingAction).toBeFalsy();
        expect(pendingRate?.subRates?.[0].pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        expect(pendingRate?.subRates?.[1]).toEqual(currentRate.subRates?.[1]);
        mockFetch.fail();
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then failure restores both subrates without pending state and attaches the error only to Breakfast.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const restoredRate = policy?.customUnits?.[customUnitID]?.rates?.[rateID];
        expect(restoredRate?.subRates).toEqual(currentRate.subRates);
        expect(restoredRate?.errorFields?.breakfast).toBeTruthy();
        expect(restoredRate?.errorFields?.lunch).toBeFalsy();
    });

    it.each([true, false])('does not restore an earlier deleted subrate when the next deletion succeeds: %s', async (doesSecondDeletionSucceed) => {
        // Given three sibling subrates, so two deletions can be queued independently while offline.
        const unit = {...customUnit, rates: {...customUnit.rates, [rateID]: {...currentRate, subRates: [...(currentRate.subRates ?? []), {id: 'dinner', name: 'Dinner', rate: 2500}]}}};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy`, {customUnits: {[customUnitID]: unit}});
        let deletionCount = 0;
        mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, () => ({jsonCode: deletionCount++ === 0 || doesSecondDeletionSucceed ? 200 : 400}));
        mockFetch.pause();
        deleteWorkspacePerDiemRates('policy', unit, [{destination: 'Destination One', subRateName: 'Breakfast', rate: 1700, currency: 'USD', rateID, subRateID: 'breakfast'}]);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);

        // When Lunch is also deleted before Breakfast's deletion has completed.
        deleteWorkspacePerDiemRates('policy', policy?.customUnits?.[customUnitID], [
            {destination: 'Destination One', subRateName: 'Lunch', rate: 1904, currency: 'USD', rateID, subRateID: 'lunch'},
        ]);
        await waitForBatchedUpdates();
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then completing the later request cannot bring back Breakfast, even as a permanently pending row.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const rate = policy?.customUnits?.[customUnitID]?.rates?.[rateID];
        expect(rate?.subRates?.map((subRate) => subRate.id)).toEqual(doesSecondDeletionSucceed ? ['dinner'] : ['lunch', 'dinner']);
        expect(rate?.subRates?.some((subRate) => subRate.pendingAction)).toBe(false);
        expect(!!rate?.errorFields?.lunch).toBe(!doesSecondDeletionSucceed);
    });

    it.each([true, false])('preserves a completed deletion when a queued sibling edit succeeds: %s', async (doesEditSucceed) => {
        // Given a subrate deletion followed by a sibling amount edit, both queued offline.
        let requestCount = 0;
        mockFetch.mockAPICommand(WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, () => ({jsonCode: requestCount++ === 0 || doesEditSucceed ? 200 : 400}));
        mockFetch.pause();
        deleteWorkspacePerDiemRates('policy', customUnit, [{destination: 'Destination One', subRateName: 'Breakfast', rate: 1700, currency: 'USD', rateID, subRateID: 'breakfast'}]);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        editPerDiemRateAmount('policy', rateID, 'lunch', policy?.customUnits?.[customUnitID], 2200);
        await waitForBatchedUpdates();

        // When the deletion succeeds and the following edit completes.
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then Breakfast stays removed, and Lunch has either its confirmed amount or its restored amount and error.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const rate = policy?.customUnits?.[customUnitID]?.rates?.[rateID];
        expect(rate?.subRates).toEqual([{id: 'lunch', name: 'Lunch', rate: doesEditSucceed ? 2200 : 1904}]);
        expect(!!rate?.errorFields?.lunch).toBe(!doesEditSucceed);
    });

    it('restores deleted Per Diem rows with dismissible errors when deletion fails', async () => {
        // Given one complete destination selected for deletion and a paused API request.
        mockFetch.pause();

        // When the deletion is rejected.
        deleteWorkspacePerDiemRates('policy', customUnit, [
            {
                destination: 'Destination Two',
                subRateName: 'Breakfast',
                rate: 2000,
                currency: 'USD',
                rateID: unchangedRateID,
                subRateID: 'breakfast-two',
            },
        ]);
        await waitForBatchedUpdates();
        let policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[unchangedRateID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);

        mockFetch.fail();
        await mockFetch.resume();
        await waitForBatchedUpdates();

        // Then the original destination returns and its selected row owns the error.
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        const restoredRate = policy?.customUnits?.[customUnitID]?.rates?.[unchangedRateID];
        expect(restoredRate?.subRates).toEqual(customUnit.rates[unchangedRateID].subRates);
        expect(restoredRate?.pendingAction).toBeFalsy();
        expect(restoredRate?.errorFields?.['breakfast-two']).toBeTruthy();

        clearPerDiemRateError('policy', customUnitID, unchangedRateID, 'breakfast-two');
        await waitForBatchedUpdates();
        policy = await getOnyxValue(`${ONYXKEYS.COLLECTION.POLICY}policy`);
        expect(policy?.customUnits?.[customUnitID]?.rates?.[unchangedRateID]?.errorFields?.['breakfast-two']).toBeFalsy();
    });
});
