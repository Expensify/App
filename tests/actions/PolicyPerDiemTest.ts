/* eslint-disable rulesdir/no-multiple-api-calls -- Each test invokes one action; the rule's ancestor scan combines otherwise independent tests. */
import {clearPerDiemRateError, editPerDiemRateAmount, editPerDiemRateCurrency, editPerDiemRateDestination, editPerDiemRateSubrate} from '@libs/actions/Policy/PerDiem';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

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
});
